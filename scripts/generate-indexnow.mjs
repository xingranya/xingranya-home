import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const sitemap = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
  throw new Error('sitemap.xml 没有可提交的公开 URL。');
}

fs.writeFileSync(
  path.join(publicDir, 'indexnow-urls.json'),
  `${JSON.stringify({ urls }, null, 2)}\n`,
);

console.log(`[indexnow] Generated ${urls.length} public URLs.`);
