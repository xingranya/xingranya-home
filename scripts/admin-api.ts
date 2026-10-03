import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import matter from 'gray-matter';

type AnyRecord = Record<string, unknown>;
type ResponseLike = { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void };
type RequestLike = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  on(event: string, handler: (...args: unknown[]) => void): void;
};
type Next = () => void;

const HOME_ROOT = process.cwd();
const BLOG_ROOT = path.resolve(process.env.XINGRANYA_BLOG_ROOT || path.join(HOME_ROOT, '../xingranya-blog'));
const SNAPSHOT_ROOT = path.join(HOME_ROOT, '.cache', 'admin-snapshots');
const HOME_CONTENT_ROOT = path.join(HOME_ROOT, 'src/content');
const BLOG_SOURCE_ROOT = path.join(BLOG_ROOT, 'source');
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const yamlEngine = (matter as unknown as { engines: { yaml: { parse: (raw: string) => unknown } } }).engines.yaml;
const JSON_PATHS: Record<string, string> = {
  siteConfig: 'src/content/config/site.config.json',
  friends: 'src/content/pages/friends.json',
  records: 'src/content/records/records.json',
  wallpapers: 'src/content/pages/wallpapers.json',
  projects: 'src/content/pages/projects.json',
};

function sendJson(res: ResponseLike, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function safeResolve(root: string, relativePath: string) {
  const normalized = relativePath.replace(/^[/\\]+/, '');
  const resolved = path.resolve(root, normalized);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error('拒绝访问工作区之外的文件。');
  }
  let existing = resolved;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  let rootExisting = root;
  while (!fs.existsSync(rootExisting)) rootExisting = path.dirname(rootExisting);
  const realRoot = fs.realpathSync(rootExisting);
  const realExisting = fs.realpathSync(existing);
  if (realExisting !== realRoot && !realExisting.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error('拒绝通过符号链接访问工作区之外的文件。');
  }
  return resolved;
}

function assertAllowedWorkspacePath(rootLabel: 'home' | 'blog', relativePath: string) {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized !== path.posix.normalize(normalized) || path.posix.isAbsolute(normalized)) {
    throw new Error('文件路径无效。');
  }
  const allowed = rootLabel === 'home'
    ? Object.values(JSON_PATHS).includes(normalized) || /^src\/content\/(posts|diaries)\/.+\.md$/.test(normalized)
    : /^source\/_(posts|drafts)\/.+\.md$/.test(normalized) ||
      /^source\/(about|projects|links|masonry|categories|tags)\/index\.md$/.test(normalized) ||
      ['source/_data/links.yml', 'source/_data/masonry.yml'].includes(normalized);
  if (!allowed) throw new Error('该文件不在后台允许编辑的内容范围内。');
}

function readJson(filePath: string, fallback: unknown = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  } catch {
    return fallback;
  }
}

function hashFile(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function atomicWrite(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.codex-${process.pid}-${Date.now()}.tmp`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, filePath);
}

function backupFile(rootLabel: string, root: string, relativePath: string) {
  const source = safeResolve(root, relativePath);
  if (!fs.existsSync(source)) return null;
  const backupRoot = path.join(SNAPSHOT_ROOT, new Date().toISOString().replace(/[:.]/g, '-'), rootLabel);
  const destination = safeResolve(backupRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return path.relative(HOME_ROOT, destination);
}

function listFiles(directory: string, extension?: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, extension).map((item) => path.join(entry.name, item));
    if (extension && !entry.name.endsWith(extension)) return [];
    return [entry.name];
  });
}

function parseMarkdownFile(filePath: string, relativePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as AnyRecord;
  const slug = path.basename(relativePath, path.extname(relativePath));
  return {
    ...data,
    path: relativePath,
    slug,
    title: String(data.title || slug),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || ''),
    summary: String(data.summary || parsed.content.replace(/[#*`_\n]/g, ' ').trim().slice(0, 150)),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    category: String(data.category || (Array.isArray(data.categories) ? data.categories[0] || '' : '')),
    draft: relativePath.startsWith('source/_drafts/') || Boolean(data.draft),
    indexable: data.indexable !== false,
    time: String(data.time ?? ''),
    weather: String(data.weather ?? ''),
    mood: String(data.mood ?? ''),
    location: String(data.location ?? ''),
    coverImage: String(data.coverImage || data.cover_image || `/covers/${slug}.svg`),
    recommend: Number(data.recommend) || 0,
    content: parsed.content.trim(),
    frontmatter: data,
    snapshot: hashFile(filePath),
  };
}

function collectMarkdown(root: string, directory: string) {
  const base = path.join(root, directory);
  return listFiles(base, '.md').map((relativePath) => parseMarkdownFile(path.join(base, relativePath), path.join(directory, relativePath)));
}

function storeSnapshot(key: string) {
  if (JSON_PATHS[key]) return hashFile(path.join(HOME_ROOT, JSON_PATHS[key]));
  const root = path.join(HOME_CONTENT_ROOT, key);
  return crypto.createHash('sha256').update(JSON.stringify(listFiles(root, '.md').sort().map((file) => [file, hashFile(path.join(root, file))]))).digest('hex');
}

function gitStatus(root: string) {
  const status = spawnSync('git', ['status', '--short', '--branch'], { cwd: root, encoding: 'utf8' });
  const branch = spawnSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' });
  const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' });
  return {
    available: status.status === 0,
    branch: (branch.stdout || '').trim(),
    origin: (remote.stdout || '').trim(),
    status: (status.stdout || '').trim(),
    dirty: Boolean((status.stdout || '').trim().split('\n').filter(Boolean).slice(1).length),
  };
}

function unexpectedChanges(root: string, allowedPrefixes: string[]) {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  return (result.stdout || '')
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .filter((filePath) => !allowedPrefixes.some((prefix) => filePath === prefix || filePath.startsWith(`${prefix}/`)));
}

function workspaceStatus() {
  const files = [
    ...Object.values(JSON_PATHS).map((relativePath) => ({ root: 'home', relativePath, hash: hashFile(path.join(HOME_ROOT, relativePath)) })),
    ...collectMarkdown(HOME_CONTENT_ROOT, 'posts').map((item) => ({ root: 'home', relativePath: item.path, hash: hashFile(path.join(HOME_CONTENT_ROOT, item.path)) })),
    ...collectMarkdown(HOME_CONTENT_ROOT, 'diaries').map((item) => ({ root: 'home', relativePath: item.path, hash: hashFile(path.join(HOME_CONTENT_ROOT, item.path)) })),
    ...collectMarkdown(BLOG_ROOT, 'source/_posts').map((item) => ({ root: 'blog', relativePath: item.path, hash: hashFile(path.join(BLOG_ROOT, item.path)) })),
  ];
  return {
    home: { root: HOME_ROOT, git: gitStatus(HOME_ROOT) },
    blog: { root: BLOG_ROOT, exists: fs.existsSync(BLOG_ROOT), git: gitStatus(BLOG_ROOT) },
    files,
    snapshots: files.reduce<Record<string, string | null>>((result, file) => {
      result[`${file.root}:${file.relativePath}`] = file.hash;
      return result;
    }, {}),
  };
}

function bootstrap() {
  return {
    storeSnapshots: Object.fromEntries([...Object.keys(JSON_PATHS), 'posts', 'diaries'].map((key) => [key, storeSnapshot(key)])),
    workspace: workspaceStatus(),
    home: {
      posts: collectMarkdown(HOME_CONTENT_ROOT, 'posts'),
      diaries: collectMarkdown(HOME_CONTENT_ROOT, 'diaries'),
      records: readJson(path.join(HOME_ROOT, JSON_PATHS.records), []),
      friends: readJson(path.join(HOME_ROOT, JSON_PATHS.friends), []),
      siteConfig: readJson(path.join(HOME_ROOT, JSON_PATHS.siteConfig), {}),
      wallpapers: readJson(path.join(HOME_ROOT, JSON_PATHS.wallpapers), {}),
      projects: readJson(path.join(HOME_ROOT, JSON_PATHS.projects), []),
    },
    blog: {
      posts: fs.existsSync(BLOG_ROOT) ? collectMarkdown(BLOG_ROOT, 'source/_posts') : [],
      drafts: fs.existsSync(BLOG_ROOT) ? collectMarkdown(BLOG_ROOT, 'source/_drafts') : [],
      pages: fs.existsSync(BLOG_ROOT)
        ? ['source/about/index.md', 'source/projects/index.md', 'source/links/index.md', 'source/masonry/index.md', 'source/categories/index.md', 'source/tags/index.md']
            .filter((relativePath) => fs.existsSync(path.join(BLOG_ROOT, relativePath)))
            .map((relativePath) => parseMarkdownFile(path.join(BLOG_ROOT, relativePath), relativePath))
        : [],
      links: fs.existsSync(path.join(BLOG_SOURCE_ROOT, '_data/links.yml'))
        ? yamlEngine.parse(fs.readFileSync(path.join(BLOG_SOURCE_ROOT, '_data/links.yml'), 'utf8'))
        : [],
      masonry: fs.existsSync(path.join(BLOG_SOURCE_ROOT, '_data/masonry.yml'))
        ? yamlEngine.parse(fs.readFileSync(path.join(BLOG_SOURCE_ROOT, '_data/masonry.yml'), 'utf8'))
        : [],
    },
  };
}

function validatePayload(payload: AnyRecord) {
  const extension = path.extname(String(payload.path));
  const kind = extension === '.json' ? 'json' : extension === '.md' ? 'markdown' : 'yaml';
  if (payload.kind !== kind) throw new Error('文件类型与路径不一致。');
  if (kind === 'json') {
    if (!payload.content || typeof payload.content !== 'string') throw new Error('JSON 内容不能为空。');
    const value = JSON.parse(payload.content);
    if (String(payload.path).endsWith('site.config.json')) {
      if (!value || typeof value !== 'object' || !value.author?.name) throw new Error('站点配置需要填写 author.name。');
    } else if (String(payload.path).endsWith('wallpapers.json')) {
      if (!value || !Array.isArray(value.items)) throw new Error('番剧墙配置需要 items 数组。');
    } else if (!Array.isArray(value)) throw new Error('该数据文件必须是 JSON 数组。');
  }
  if (kind === 'yaml') {
    if (!payload.content || typeof payload.content !== 'string') throw new Error('YAML 内容不能为空。');
    if (!Array.isArray(yamlEngine.parse(payload.content))) throw new Error('博客友链与图库数据必须是 YAML 列表。');
  }
  if (kind === 'markdown') {
    if (!payload.content || typeof payload.content !== 'string') throw new Error('Markdown 内容不能为空。');
    matter(String(payload.content));
  }
}

async function readRequestBody(req: RequestLike): Promise<AnyRecord> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let length = 0;
    req.on('data', (rawChunk: unknown) => {
      const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(String(rawChunk));
      length += chunk.length;
      if (length > MAX_BODY_BYTES) {
        reject(new Error('请求超过 12MB 限制。'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) as AnyRecord : {});
      } catch (error) {
        reject(new Error(`请求 JSON 无效：${String(error)}`));
      }
    });
    req.on('error', reject);
  });
}

function command(commandName: string, args: string[], cwd: string, timeoutMs = 15 * 60 * 1000) {
  return new Promise<{ success: boolean; code: number | null; output: string }>((resolve) => {
    const child = spawn(commandName, args, { cwd, env: process.env, shell: false });
    const output: string[] = [];
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs);
    child.stdout.on('data', (chunk) => output.push(String(chunk)));
    child.stderr.on('data', (chunk) => output.push(String(chunk)));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ success: code === 0, code, output: output.join('').slice(-20000) });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ success: false, code: null, output: String(error) });
    });
  });
}

async function publish(message: string, checkOnly = false) {
  const steps: Array<{ name: string; result?: { success: boolean; code: number | null; output: string } }> = [];
  const homeGit = gitStatus(HOME_ROOT);
  const blogGit = gitStatus(BLOG_ROOT);
  if (!checkOnly && (homeGit.branch !== 'main' || blogGit.branch !== 'main')) {
    return { success: false, partial: false, steps, error: '两个仓库都必须位于 main 分支。', homeGit, blogGit };
  }
  const unexpectedHome = unexpectedChanges(HOME_ROOT, ['src/content', 'public']);
  const unexpectedBlog = unexpectedChanges(BLOG_ROOT, ['source']);
  if (!checkOnly && (unexpectedHome.length || unexpectedBlog.length)) {
    return {
      success: false,
      partial: false,
      steps,
      error: '检测到管理范围外的本地变更，已停止发布。',
      unexpectedHome,
      unexpectedBlog,
    };
  }

  if (!checkOnly && [HOME_ROOT, BLOG_ROOT].some((root) => spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: root }).status !== 0)) {
    return { success: false, partial: false, steps, error: '存在已暂存变更，请先处理暂存区再发布。' };
  }

  const homeBuild = await command('pnpm', ['build'], HOME_ROOT);
  steps.push({ name: '主页构建', result: homeBuild });
  if (!homeBuild.success) return { success: false, partial: false, steps, error: '主页构建失败。' };

  const blogCheck = await command('npm', ['run', 'post:check'], BLOG_ROOT);
  steps.push({ name: '博客内容检查', result: blogCheck });
  if (!blogCheck.success) return { success: false, partial: false, steps, error: '博客内容检查失败。' };

  const blogBuild = await command('npm', ['run', 'build'], BLOG_ROOT);
  steps.push({ name: '博客构建', result: blogBuild });
  if (!blogBuild.success) return { success: false, partial: false, steps, error: '博客构建失败。' };

  if (checkOnly) return { success: true, partial: false, mode: 'check', steps };

  for (const target of [
    { name: '主页', root: HOME_ROOT, paths: ['src/content', 'public'] },
    { name: '博客', root: BLOG_ROOT, paths: ['source'] },
  ]) {
    const add = await command('git', ['add', '--', ...target.paths], target.root);
    steps.push({ name: `${target.name}暂存`, result: add });
    if (!add.success) return { success: false, partial: target.name === '博客', steps, error: `${target.name}暂存失败。` };
    const staged = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: target.root });
    if (staged.status === 0) {
      steps.push({ name: `${target.name}提交`, result: { success: true, code: 0, output: '没有需要提交的内容。' } });
    } else {
      const commit = await command('git', ['commit', '-m', message || `chore(content): 更新站点内容\n\n保存后台确认的源文件，触发站点构建。`], target.root);
      steps.push({ name: `${target.name}提交`, result: commit });
      if (!commit.success) return { success: false, partial: target.name === '博客', steps, error: `${target.name}提交失败。` };
    }
    const push = await command('git', ['push', 'origin', 'main'], target.root);
    steps.push({ name: `${target.name}推送`, result: push });
    if (!push.success) return { success: false, partial: target.name === '博客' || target.name === '主页', steps, error: `${target.name}推送失败。` };
  }

  return { success: true, partial: false, mode: 'publish', steps, homeGit: gitStatus(HOME_ROOT), blogGit: gitStatus(BLOG_ROOT) };
}

async function previewStatus(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(1800) });
    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return { url, ok: false, status: 0, error: String(error) };
  }
}

export function createAdminApiMiddleware() {
  let building = false;
  return async (req: RequestLike, res: ResponseLike, next: Next) => {
    const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
    if (!requestUrl.pathname.startsWith('/admin/api/')) return next();

    try {
      const host = new URL(`http://${req.headers.host || 'invalid'}`);
      const address = req.socket?.remoteAddress;
      if (!['localhost', '127.0.0.1', '[::1]'].includes(host.hostname) || (address && !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address))) {
        return sendJson(res, 403, { success: false, error: '后台接口仅允许本机访问。' });
      }
      if (req.headers.origin && new URL(String(req.headers.origin)).host !== host.host) {
        return sendJson(res, 403, { success: false, error: '拒绝跨站后台请求。' });
      }
      if (req.method === 'POST' && building) return sendJson(res, 409, { success: false, error: '正在校验或发布，请完成后再保存。' });
      if (req.method === 'GET' && requestUrl.pathname === '/admin/api/bootstrap') {
        return sendJson(res, 200, { success: true, data: bootstrap() });
      }
      if (req.method === 'GET' && requestUrl.pathname === '/admin/api/workspace') {
        return sendJson(res, 200, { success: true, data: workspaceStatus() });
      }
      if (req.method === 'GET' && requestUrl.pathname === '/admin/api/preview') {
        const home = await previewStatus(`${host.origin}/`);
        const blog = await previewStatus(process.env.XINGRANYA_BLOG_PREVIEW_URL || 'http://127.0.0.1:4000/');
        return sendJson(res, 200, { success: true, data: { home, blog } });
      }
      if (req.method === 'GET' && requestUrl.pathname === '/admin/api/file') {
        const rootLabel = requestUrl.searchParams.get('root') === 'blog' ? 'blog' : 'home';
        const root = rootLabel === 'blog' ? BLOG_ROOT : HOME_ROOT;
        const relativePath = String(requestUrl.searchParams.get('path') || '');
        assertAllowedWorkspacePath(rootLabel, relativePath);
        const filePath = safeResolve(root, relativePath);
        if (!fs.existsSync(filePath)) return sendJson(res, 404, { success: false, error: '文件不存在。' });
        return sendJson(res, 200, {
          success: true,
          data: { root: rootLabel, path: relativePath, content: fs.readFileSync(filePath, 'utf8'), snapshot: hashFile(filePath) },
        });
      }
      if (req.method === 'POST' && requestUrl.pathname === '/admin/api/file') {
        const body = await readRequestBody(req);
        const root = body.root === 'blog' ? BLOG_ROOT : HOME_ROOT;
        const rootLabel = body.root === 'blog' ? 'blog' : 'home';
        const relativePath = String(body.path || '');
        assertAllowedWorkspacePath(rootLabel, relativePath);
        const filePath = safeResolve(root, relativePath);
        const currentHash = hashFile(filePath);
        if (body.snapshot !== currentHash) {
          return sendJson(res, 409, { success: false, error: '文件已被外部修改，请重新加载后再保存。', currentHash });
        }
        validatePayload(body);
        backupFile(rootLabel, root, relativePath);
        atomicWrite(filePath, String(body.content));
        return sendJson(res, 200, { success: true, data: { path: relativePath, snapshot: hashFile(filePath) } });
      }
      if (req.method === 'POST' && ['/admin/api/file/delete', '/admin/api/file/move'].includes(requestUrl.pathname)) {
        const body = await readRequestBody(req);
        const relativePath = String(body.path || '');
        if (!/^source\/_(posts|drafts)\/.+\.md$/.test(relativePath)) throw new Error('只允许移动或删除博客文章与草稿。');
        assertAllowedWorkspacePath('blog', relativePath);
        const source = safeResolve(BLOG_ROOT, relativePath);
        if (!fs.existsSync(source)) throw new Error('文章已不存在，请刷新列表。');
        if (body.snapshot !== hashFile(source)) return sendJson(res, 409, { success: false, error: '文章已被外部修改，请重新加载。' });
        const backup = backupFile('blog', BLOG_ROOT, relativePath);
        if (requestUrl.pathname.endsWith('/move')) {
          const destinationPath = relativePath.startsWith('source/_drafts/') ? relativePath.replace('source/_drafts/', 'source/_posts/') : relativePath.replace('source/_posts/', 'source/_drafts/');
          const destination = safeResolve(BLOG_ROOT, destinationPath);
          if (fs.existsSync(destination)) throw new Error('目标目录存在同名文章，请先处理重名文件。');
          const parsed = matter(fs.readFileSync(source, 'utf8'));
          parsed.data.draft = destinationPath.startsWith('source/_drafts/');
          atomicWrite(destination, matter.stringify(parsed.content, parsed.data));
          fs.unlinkSync(source);
          return sendJson(res, 200, { success: true, data: { path: destinationPath, snapshot: hashFile(destination), backup } });
        }
        fs.unlinkSync(source);
        return sendJson(res, 200, { success: true, data: { backup } });
      }
      if (req.method === 'POST' && (requestUrl.pathname === '/admin/api/publish' || requestUrl.pathname === '/admin/api/check')) {
        const body = await readRequestBody(req);
        if (building) return sendJson(res, 409, { success: false, error: '正在校验或发布。' });
        building = true;
        try {
          return sendJson(res, 200, { success: true, data: await publish(String(body.message || ''), requestUrl.pathname.endsWith('/check')) });
        } finally { building = false; }
      }
      if (req.method === 'POST' && requestUrl.pathname === '/admin/api/media/usage') {
        const body = await readRequestBody(req);
        const needle = String(body.url || '');
        if (!needle.trim()) throw new Error('请填写媒体地址。');
        const matches: string[] = [];
        for (const root of [HOME_ROOT, BLOG_ROOT]) {
          if (!fs.existsSync(root)) continue;
          const candidates = root === HOME_ROOT
            ? [...listFiles(path.join(root, 'src/content')).filter((item) => /\.(md|json)$/.test(item)).map((item) => path.join('src/content', item))]
            : [...listFiles(path.join(root, 'source')).filter((item) => /\.(md|yml|yaml)$/.test(item)).map((item) => path.join('source', item))];
          for (const relativePath of candidates) {
            const filePath = path.join(root, relativePath);
            if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').includes(needle)) matches.push(`${root === HOME_ROOT ? '主页' : '博客'}：${path.relative(root, filePath)}`);
          }
        }
        return sendJson(res, 200, { success: true, data: { url: needle, matches } });
      }
      if (req.method === 'POST' && requestUrl.pathname === '/admin/api/media/upload') {
        const body = await readRequestBody(req);
        const blogUrl = String(process.env.XINGRANYA_BLOG_PREVIEW_URL || 'http://127.0.0.1:4000');
        let response;
        try {
          response = await fetch(`${blogUrl.replace(/\/$/, '')}/admin/api/tucang/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120000),
          });
        } catch { throw new Error('无法连接博客上传服务，请使用 pnpm admin 启动两个后台。'); }
        const payload = await response.text();
        let result;
        try { result = JSON.parse(payload) as AnyRecord; }
        catch { throw new Error('博客上传服务未就绪，请使用 pnpm admin 启动两个后台。'); }
        if (!response.ok || !result.success) return sendJson(res, response.ok ? 400 : response.status, { success: false, error: String(result.error || '图片上传失败。') });
        if (!result.url) throw new Error('上传服务未返回图片地址。');
        return sendJson(res, 200, { success: true, data: { url: result.url, filename: result.filename, purpose: result.purpose } });
      }
      if (req.method === 'POST' && requestUrl.pathname === '/admin/api/store') {
        const body = await readRequestBody(req);
        if (!body.key) throw new Error('缺少存储键。');
        const key = String(body.key);
        if (![...Object.keys(JSON_PATHS), 'posts', 'diaries'].includes(key)) throw new Error('未知存储键。');
        if (body.snapshot !== storeSnapshot(key)) return sendJson(res, 409, { success: false, error: '源文件已被外部修改，请重新读取后再保存。' });
        if (JSON_PATHS[key]) {
          validatePayload({ path: JSON_PATHS[key], kind: 'json', content: JSON.stringify(body.value) });
          const filePath = path.join(HOME_ROOT, JSON_PATHS[key]);
          backupFile('home', HOME_ROOT, JSON_PATHS[key]);
          atomicWrite(filePath, JSON.stringify(body.value, null, 2) + '\n');
          return sendJson(res, 200, { success: true, data: { key, snapshot: hashFile(filePath) } });
        }
        if (key === 'posts' || key === 'diaries') {
          const directory = key === 'posts' ? 'posts' : 'diaries';
          const root = path.join(HOME_CONTENT_ROOT, directory);
          if (!Array.isArray(body.value)) throw new Error('文章数据必须是数组。');
          const values = body.value as AnyRecord[];
          const existing = listFiles(root, '.md');
          const next = new Set<string>();
          for (const item of values) {
            if (!item || typeof item !== 'object' || typeof item.slug !== 'string' || !/^[\p{L}\p{N}_-]+$/u.test(item.slug) || !String(item.title || '').trim()) throw new Error('文章标题或文件名无效。');
            if (next.has(`${item.slug}.md`)) throw new Error('存在重复的文章文件名。');
            next.add(`${item.slug}.md`);
          }
          const ignoredFields = new Set(['content', 'readingTime', 'wordCount', 'toc', 'path', 'snapshot', 'frontmatter']);
          for (const item of values as AnyRecord[]) {
            const slug = String(item.slug || '').trim();
            if (!slug) continue;
            const relative = `${slug}.md`;
            next.add(relative);
            const filePath = safeResolve(root, relative);
            const current = fs.existsSync(filePath) ? matter(fs.readFileSync(filePath, 'utf8')) : null;
            const previous = current ? parseMarkdownFile(filePath, path.join(directory, relative)) : null;
            if (current && previous && String(item.content ?? '').trim() === current.content.trim() && Object.keys(item).filter((field) => !ignoredFields.has(field)).every((field) => JSON.stringify(item[field]) === JSON.stringify((previous as AnyRecord)[field]))) continue;
            const frontmatter = { ...(current?.data || {}), ...item };
            if (current && item.date === previous?.date) frontmatter.date = current.data.date;
            delete frontmatter.content;
            delete frontmatter.readingTime;
            delete frontmatter.wordCount;
            delete frontmatter.toc;
            delete frontmatter.path;
            delete frontmatter.snapshot;
            delete frontmatter.frontmatter;
            backupFile('home', HOME_ROOT, path.join('src/content', directory, relative));
            atomicWrite(filePath, matter.stringify(typeof item.content === 'string' ? item.content : current?.content || '', frontmatter));
          }
          for (const relative of existing) {
            if (!next.has(relative)) {
              backupFile('home', HOME_ROOT, path.join('src/content', directory, relative));
              fs.unlinkSync(path.join(root, relative));
            }
          }
          const indexResult = await command('node', ['scripts/generate-content-index.mjs'], HOME_ROOT);
          if (!indexResult.success) throw new Error('源文件已保存，但索引更新失败，请运行 pnpm generate:content-index。');
          return sendJson(res, 200, { success: true, data: { key, count: values.length, snapshot: storeSnapshot(key) } });
        }
        return sendJson(res, 200, { success: true, data: { key, persisted: false } });
      }
      return sendJson(res, 404, { success: false, error: '后台接口不存在。' });
    } catch (error) {
      return sendJson(res, 400, { success: false, error: error instanceof Error ? error.message : String(error) });
    }
  };
}
