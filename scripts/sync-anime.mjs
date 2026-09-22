import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { imageSize } from 'image-size';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataPath = 'src/content/pages/wallpapers.json';
const cachePath = path.join(root, '.cache/anime-sync/uploads.json');
const statuses = ['watching', 'watched'];
const apiBase = 'https://www.cycani.org/api';
const expectedRemote = 'xingranya/xingranya-home';
const publishPaths = [
  dataPath,
  'public/sitemap.xml',
  'public/indexnow-urls.json',
  'src/content/generated/valid-routes.js',
];

async function ask(label, hidden = false) {
  if (!process.stdin.isTTY) throw new Error(`缺少${label}，请设置对应环境变量或在终端交互运行。`);
  const output = hidden
    ? new Writable({
        write(_chunk, _encoding, done) {
          done();
        },
      })
    : process.stdout;
  const terminal = createInterface({ input: process.stdin, output, terminal: true });
  process.stdout.write(`${label}：`);
  try {
    return (await terminal.question('')).trim();
  } finally {
    terminal.close();
    if (hidden) process.stdout.write('\n');
  }
}

function run(command, args, capture = false) {
  const env = { ...process.env };
  for (const key of ['CYC_PASSWORD', 'CYC_TOKEN', 'TUCANG_TOKEN']) delete env[key];
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    shell: process.platform === 'win32' && command === 'pnpm',
  });
  if (result.error || result.status !== 0)
    throw new Error(`${command} ${args[0]} 未完成，请检查终端输出。`);
  return result.stdout?.trim() || '';
}

async function writeJson(filename, data) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(`${filename}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
  await fs.rename(`${filename}.tmp`, filename);
}

async function readJson(filename, fallback) {
  try {
    return JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

async function requestApi(endpoint, token, body) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    signal: AbortSignal.timeout(30000),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-App-Name': 'cyc_web',
      'X-App-Version': 'cycweb',
      'X-Time-Zone': 'Asia/Shanghai',
      ...(token ? { Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok || result.code !== 0 || !result.data) {
    throw new Error(
      `次元城 ${endpoint.split('?')[0]} 请求失败（HTTP ${response.status} / 业务码 ${result.code ?? '未知'}）。请核对账号或稍后重试。`
    );
  }
  return result.data;
}

// 按来源分页数量核对完整性；账号切换、重复页或分类移动都不能静默生成部分片单。
export async function fetchCategory(api, status) {
  const rows = [];
  const ids = new Set();
  let expectedTotal;
  let counts;
  for (let page = 1; ; page++) {
    const result = await api(`/user/favorites?category=${status}&page=${page}&page_size=48`);
    const { list, pager } = result;
    if (
      !Array.isArray(list) ||
      !Number.isInteger(pager?.total) ||
      pager.total < 0 ||
      pager.page !== page
    ) {
      throw new Error(`${status} 返回结构变化，已停止同步。`);
    }
    expectedTotal ??= pager.total;
    counts ??= result.counts;
    if (
      pager.total !== expectedTotal ||
      !counts ||
      statuses.some(
        (key) =>
          !Number.isInteger(counts[key]) || counts[key] < 0 || result.counts?.[key] !== counts[key]
      )
    ) {
      throw new Error('同步过程中片单数量发生变化，请重新运行。');
    }
    for (const entry of list) {
      if (
        !Number.isInteger(entry.video_id) ||
        entry.video_id <= 0 ||
        entry.category !== status ||
        ids.has(entry.video_id)
      ) {
        throw new Error('片单存在重复、未知条目或分类变化，已停止同步。');
      }
      ids.add(entry.video_id);
      rows.push({ id: String(entry.video_id), status });
    }
    if (rows.length === expectedTotal) break;
    if (!list.length || rows.length > expectedTotal)
      throw new Error(`${status} 分页不完整，已停止同步。`);
  }
  if (rows.length !== counts[status]) throw new Error(`${status} 列表与来源计数不一致。`);
  return { rows, counts };
}

export function mergeCategories(watching, watched) {
  if (statuses.some((key) => watching.counts[key] !== watched.counts[key])) {
    throw new Error('两种分类的来源计数不一致，请重新运行。');
  }
  const rows = [...watching.rows, ...watched.rows];
  if (new Set(rows.map((item) => item.id)).size !== rows.length)
    throw new Error('同一番剧出现在两种分类中，请重新运行。');
  return { rows, counts: { watching: watching.rows.length, watched: watched.rows.length } };
}

export function normalizeVideo(video, entry) {
  if (
    String(video.id) !== entry.id ||
    !video.title?.trim() ||
    !video.cover_url ||
    !Number.isInteger(video.year) ||
    video.year <= 0
  ) {
    throw new Error(`番剧 ${entry.id} 的必需资料不完整，已停止同步。`);
  }
  if (new URL(video.cover_url).protocol !== 'https:') throw new Error('来源封面不是 HTTPS 地址。');
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const names = (value) =>
    Array.isArray(value)
      ? [
          ...new Set(
            value
              .filter((item) => typeof item === 'string')
              .map(text)
              .filter(Boolean)
          ),
        ]
      : [];
  return {
    id: entry.id,
    sourceUrl: `https://www.cycani.org/anime/${entry.id}`,
    title: video.title.trim(),
    description: text(video.description),
    subtitle: text(video.subtitle),
    englishTitle: text(video.english_title),
    publishDate: video.publish_date || null,
    year: video.year,
    version: text(video.version),
    score: Number(video.score) || 0,
    total: Number(video.total) || 0,
    completed: Boolean(video.completed),
    remarks: text(video.remarks),
    tags: names(video.tags),
    directors: names(video.director),
    actors: names(video.actor),
    writer: text(video.writer),
    area: text(video.area),
    language: text(video.language),
    coverSource: video.cover_url,
  };
}

export async function uploadCover(source, token, folderId) {
  const form = new globalThis.FormData();
  form.set('token', token);
  form.set('folderId', String(folderId));
  form.set('url', source);
  form.set('referer', 'https://www.cycani.org/');
  const response = await fetch('https://api.tucang.cc/api/v1/upload', {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  if (!response.ok || !result.success || !result.data?.url)
    throw new Error(`图仓上传失败（${result.code ?? response.status}），没有覆盖片单。`);
  const url = new URL(result.data.url);
  if (url.protocol !== 'https:' || !/(^|\.)tucang\.cc$/.test(url.hostname))
    throw new Error('图仓返回了非预期的图片地址。');
  return url.href;
}

export async function inspectImage(url) {
  // 新上传图片曾短暂返回 420，等待图床就绪后再验证；不会重复上传。
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const size = imageSize(new globalThis.Uint8Array(await response.arrayBuffer()));
      if (!size.width || !size.height) throw new Error('无效图片');
      return { width: size.width, height: size.height };
    } catch {
      if (attempt === 2)
        throw new Error('新增图床图片暂时无法读取，上传进度已保存；稍后重运行即可。');
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

export function summarizeChanges(previous, next) {
  const before = new Map(previous.map((item) => [item.id, item]));
  const after = new Set(next.map((item) => item.id));
  return {
    added: next.filter((item) => !before.has(item.id)).length,
    removed: previous.filter((item) => !after.has(item.id)).length,
    moved: next.filter((item) => before.has(item.id) && before.get(item.id).status !== item.status)
      .length,
  };
}

function checkPushTarget() {
  if (run('git', ['status', '--porcelain'], true))
    throw new Error('自动推送前请先提交或保存现有改动；脚本不会打包其他工作。');
  const branch = run('git', ['branch', '--show-current'], true);
  const remote = run('git', ['remote', 'get-url', 'origin'], true);
  if (
    branch !== 'main' ||
    ![`https://github.com/${expectedRemote}.git`, `git@github.com:${expectedRemote}.git`].includes(
      remote
    )
  ) {
    throw new Error('自动推送仅支持本仓库 origin/main，请核对分支和远端。');
  }
  run('git', ['fetch', 'origin', 'main']);
  if (
    run('git', ['rev-list', '--left-right', '--count', 'HEAD...origin/main'], true)
      .split(/\s+/)
      .some((count) => count !== '0')
  ) {
    throw new Error('本地与 origin/main 不一致，请先完成同步后重运行。');
  }
}

export async function main() {
  const { values } = parseArgs({
    options: {
      push: { type: 'boolean', default: false },
      check: { type: 'boolean', default: false },
      username: { type: 'string' },
      folder: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });
  if (values.help) {
    console.log(
      '用法：pnpm sync:anime [--check | --push] [--username 账号] [--folder 4249]\n--check 只核对，不上传图片、不修改文件\n--push 同步、构建验证、提交并推送 origin/main\n环境变量：CYC_USERNAME、CYC_PASSWORD、CYC_TOKEN（可代替密码）、TUCANG_TOKEN、TUCANG_FOLDER_ID\n未设置时交互询问；密码与 Token 隐藏输入，仅保存在本次进程内。'
    );
    return;
  }
  if (values.check && values.push) throw new Error('--check 和 --push 不能同时使用。');
  process.chdir(root);
  if (values.push) checkPushTarget();
  const previous = await readJson(path.join(root, dataPath));
  let token = process.env.CYC_TOKEN;
  if (!token) {
    const username = values.username || process.env.CYC_USERNAME || (await ask('次元城账号'));
    const password = process.env.CYC_PASSWORD || (await ask('次元城密码', true));
    const login = await requestApi('/auth/login', null, { username, password });
    if (typeof login.token !== 'string' || !login.token) throw new Error('登录未返回有效会话。');
    token = login.token;
  }
  const api = (endpoint) => requestApi(endpoint, token);
  const watching = await fetchCategory(api, 'watching');
  const watched = await fetchCategory(api, 'watched');
  const { rows, counts } = mergeCategories(watching, watched);
  console.log(`来源片单：正在追 ${counts.watching} 部，已追完 ${counts.watched} 部。`);
  const changes = summarizeChanges(previous.items, rows);
  console.log(
    `新增 ${changes.added} 部，移除 ${changes.removed} 部，状态变化 ${changes.moved} 部。`
  );
  if (values.check) return;
  const oldItems = new Map(previous.items.map((item) => [item.id, item]));
  const uploads = await readJson(cachePath, {});
  const folderId = Number(values.folder || process.env.TUCANG_FOLDER_ID || 4249);
  if (!Number.isInteger(folderId) || folderId <= 0) throw new Error('图仓文件夹 ID 无效。');
  let uploadToken = process.env.TUCANG_TOKEN;
  const items = [];
  for (const entry of rows) {
    const video = normalizeVideo(await api(`/videos/${entry.id}`), entry);
    const old = oldItems.get(entry.id);
    let cover;
    if (old?.image && (!old.coverSource || old.coverSource === video.coverSource)) {
      cover = { image: old.image, width: old.width, height: old.height };
    } else {
      const cacheKey = `${folderId}:${video.coverSource}`;
      let cached = uploads[cacheKey];
      if (!cached) {
        uploadToken ||= await ask('图仓 Token', true);
        cached = { image: await uploadCover(video.coverSource, uploadToken, folderId) };
        uploads[cacheKey] = cached;
        await writeJson(cachePath, uploads);
      }
      if (!cached.width || !cached.height) {
        Object.assign(cached, await inspectImage(cached.image));
        await writeJson(cachePath, uploads);
      }
      cover = cached;
    }
    items.push({ ...video, ...cover, status: entry.status });
    if (items.length % 10 === 0 || items.length === rows.length)
      console.log(`已读取 ${items.length}/${rows.length} 部资料。`);
  }
  items.sort((a, b) => b.year - a.year || (b.publishDate || '').localeCompare(a.publishDate || ''));
  if (
    JSON.stringify(items) === JSON.stringify(previous.items) &&
    JSON.stringify(counts) === JSON.stringify(previous.counts)
  ) {
    console.log('片单没有变化，无需构建或提交。');
    return;
  }
  const updatedAt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(
    new Date()
  );
  const next = { updatedAt, source: 'https://www.cycani.org/tracking', items, counts };
  await writeJson(path.join(root, '.cache/anime-sync/previous.json'), previous);
  await writeJson(path.join(root, dataPath), next);
  run('pnpm', ['run', 'build']);
  run(process.execPath, ['scripts/check-wallpapers.mjs']);
  if (!values.push) {
    console.log('本地片单已更新并通过构建；本次未提交或推送。');
    return;
  }
  const changed = run('git', ['diff', '--name-only'], true).split('\n').filter(Boolean);
  if (changed.some((file) => !publishPaths.includes(file)))
    throw new Error('出现片单之外的改动，已停止自动提交。');
  if (run('git', ['diff', '--cached', '--name-only'], true))
    throw new Error('同步期间暂存区出现其他改动，已停止自动提交。');
  run('git', ['add', '--', ...publishPaths]);
  run('git', ['diff', '--cached', '--check']);
  const messageFile = path.join(root, '.cache/anime-sync/commit-message.txt');
  await fs.writeFile(
    messageFile,
    `chore(anime): 同步次元城追番片单\n\n同步正在追 ${counts.watching} 部、已追完 ${counts.watched} 部及新增图床封面\n片单为本次来源快照，已通过生产构建和完整性检查\n`
  );
  run('git', ['commit', '--file', messageFile]);
  run('git', ['push', 'origin', 'main']);
  const head = run('git', ['rev-parse', 'HEAD'], true);
  const remoteHead = run('git', ['ls-remote', 'origin', 'refs/heads/main'], true).split(/\s+/)[0];
  if (head !== remoteHead) throw new Error('推送后远端版本发生变化，请检查 GitHub 提交记录。');
  console.log(`已推送 GitHub：${head.slice(0, 7)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`同步未完成：${error.message}`);
    process.exitCode = 1;
  });
}
