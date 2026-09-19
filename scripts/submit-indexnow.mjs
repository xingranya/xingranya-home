import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const value = (name) => args[args.indexOf(name) + 1];
const root = process.cwd();
const distDir = path.join(root, 'dist');
const receiptPath = args.includes('--receipt') ? path.resolve(value('--receipt')) : null;
const hash = (body) => createHash('sha256').update(body).digest('hex');

function htmlFileForUrl(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, pathname.replace(/^\/+|\/+$/g, ''), 'index.html');
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(distDir, 'indexnow-urls.json'), 'utf8'));
  let previous = {};
  if (args.includes('--previous')) {
    previous = JSON.parse(await fs.readFile(path.resolve(value('--previous')), 'utf8')).urlHashes || {};
  }

  const urlHashes = {};
  for (const url of manifest.urls) {
    urlHashes[url] = hash(await fs.readFile(htmlFileForUrl(url)));
  }

  const changed = manifest.urls.filter((url) => urlHashes[url] !== previous[url]);
  const removed = Object.keys(previous).filter((url) => !Object.hasOwn(urlHashes, url));
  const urls = [...changed, ...removed];
  console.log(`本次公开 URL：${manifest.urls.length}，待提交变更：${urls.length}`);

  if (!args.includes('--submit')) {
    console.log('仅预检。正式发布后使用 --submit；--previous 可指定上次提交回执。');
    return;
  }
  if (!receiptPath) throw new Error('提交时须用 --receipt 指定本次回执路径。');

  const site = new URL(manifest.urls[0]);
  const keyFile = (await fs.readdir(distDir)).find((name) => /^[a-f0-9]{16,64}\.txt$/i.test(name));
  if (!keyFile) throw new Error('缺少公开的 IndexNow 验证文件。');
  const key = (await fs.readFile(path.join(distDir, keyFile), 'utf8')).trim();

  for (const url of changed) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200 || hash(Buffer.from(await response.arrayBuffer())) !== urlHashes[url]) {
      throw new Error(`线上内容尚未与本次构建一致：${url}`);
    }
  }

  for (const url of removed) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const body = await response.text();
    if (
      ![301, 308, 404, 410].includes(response.status) &&
      !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)
    ) {
      throw new Error(`已移出索引的页面仍可被收录：${url}`);
    }
  }

  if (urls.length > 0) {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        host: site.host,
        key,
        keyLocation: new URL(keyFile, site).href,
        urlList: urls,
      }),
    });
    if (![200, 202].includes(response.status)) throw new Error(`IndexNow 返回 ${response.status}`);
  }

  await fs.writeFile(
    receiptPath,
    `${JSON.stringify({ submittedAt: new Date().toISOString(), submittedUrls: urls, urlHashes }, null, 2)}\n`,
  );
  console.log(`线上内容已核对，已提交 ${urls.length} 个 URL；回执：${receiptPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
