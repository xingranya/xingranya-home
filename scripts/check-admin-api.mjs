import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

// 只在临时目录中写入，验证保存、冲突、索引和文章生命周期。
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'xran-admin-check-'));
const home = path.join(fixture, 'home');
const blog = path.join(fixture, 'blog');
const originalCwd = process.cwd();
const write = (root, relative, value) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
write(home, 'package.json', '{"type":"module"}');
write(home, 'src/content/config/site.config.json', '{"title":"测试","author":{"name":"测试作者"}}');
for (const file of ['pages/friends.json', 'pages/projects.json', 'records/records.json']) write(home, `src/content/${file}`, '[]');
write(home, 'src/content/pages/wallpapers.json', '{"items":[]}');
write(home, 'src/content/diaries/first.md', '---\ntitle: 第一篇\ndate: 2026-10-03\nindexable: false\n---\n\n原始正文\n');
write(home, 'scripts/generate-content-index.mjs', fs.readFileSync(path.join(project, 'scripts/generate-content-index.mjs')));
fs.symlinkSync(path.join(project, 'node_modules'), path.join(home, 'node_modules'), 'dir');
write(blog, 'source/_data/links.yml', '[]');
write(blog, 'source/_data/masonry.yml', '[]');
write(blog, 'source/about/index.md', '---\ntitle: 关于\n---\n简介');
process.chdir(home);
process.env.XINGRANYA_BLOG_ROOT = blog;
const { createAdminApiMiddleware } = await import('./admin-api.ts');
const middleware = createAdminApiMiddleware();
const server = http.createServer((req, res) => { void middleware(req, res, () => { res.statusCode = 404; res.end(); }); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const request = async (url, body, headers = {}) => {
  const res = await fetch(base + url, body === undefined ? { headers } : { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: res.status, ...(await res.json()) };
};
try {
  const bootstrap = await request('/admin/api/bootstrap');
  assert.equal(bootstrap.data.home.diaries[0].content, '原始正文');
  assert.equal(bootstrap.data.home.diaries[0].indexable, false);
  assert.equal(bootstrap.data.home.diaries[0].weather, '');
  const firstOriginal = fs.readFileSync(path.join(home, 'src/content/diaries/first.md'), 'utf8');
  assert.equal((await request('/admin/api/store', { key: 'friends', value: [], snapshot: bootstrap.data.storeSnapshots.friends }, { Origin: 'https://example.org' })).status, 403);
  assert.equal((await request('/admin/api/file?root=home&path=src/content/../../package.json')).status, 400);
  write(fixture, 'secret.md', '仅供测试');
  fs.symlinkSync(path.join(fixture, 'secret.md'), path.join(home, 'src/content/diaries/escape.md'));
  assert.equal((await request('/admin/api/file?root=home&path=src/content/diaries/escape.md')).status, 400);
  fs.unlinkSync(path.join(home, 'src/content/diaries/escape.md'));

  const saved = await request('/admin/api/store', { key: 'friends', value: [{ id: 'fixture', name: '测试友链', link: 'https://example.org' }], snapshot: bootstrap.data.storeSnapshots.friends });
  assert.equal(saved.status, 200);
  assert.equal(JSON.parse(fs.readFileSync(path.join(home, 'src/content/pages/friends.json')))[0].name, '测试友链');
  assert.equal((await request('/admin/api/store', { key: 'friends', value: [], snapshot: bootstrap.data.storeSnapshots.friends })).status, 409);
  assert.equal((await request('/admin/api/store', { key: 'friends', value: {}, snapshot: saved.data.snapshot })).status, 400);

  const current = await request('/admin/api/bootstrap');
  const bad = await request('/admin/api/store', { key: 'diaries', value: [{ slug: '../bad', title: '错误' }], snapshot: current.data.storeSnapshots.diaries });
  assert.equal(bad.status, 400);
  assert.match(fs.readFileSync(path.join(home, 'src/content/diaries/first.md'), 'utf8'), /原始正文/);
  const diaries = [...current.data.home.diaries, { slug: 'new-diary', title: '新手记', date: '2026-10-03', content: '新的正文', tags: ['测试'] }];
  const added = await request('/admin/api/store', { key: 'diaries', value: diaries, snapshot: current.data.storeSnapshots.diaries });
  assert.equal(added.status, 200);
  assert.equal(fs.readFileSync(path.join(home, 'src/content/diaries/first.md'), 'utf8'), firstOriginal);
  const index = JSON.parse(fs.readFileSync(path.join(home, 'src/content/generated/public-index.json')));
  assert.ok(index.diaries.some((item) => item.slug === 'new-diary'));
  const duplicate = await request('/admin/api/store', { key: 'diaries', value: [diaries[0], diaries[0]], snapshot: added.data.snapshot });
  assert.equal(duplicate.status, 400);
  assert.match(fs.readFileSync(path.join(home, 'src/content/diaries/new-diary.md'), 'utf8'), /新的正文/);

  const newPost = { root: 'blog', path: 'source/_drafts/new-post.md', kind: 'markdown', content: '---\ntitle: 新草稿\ndate: 2026-10-03\n---\n正文', snapshot: null };
  const created = await request('/admin/api/file', newPost);
  assert.equal(created.status, 200);
  assert.equal((await request('/admin/api/file', newPost)).status, 409);
  const published = await request('/admin/api/file/move', { path: newPost.path, snapshot: created.data.snapshot });
  assert.equal(published.status, 200);
  assert.equal(published.data.path, 'source/_posts/new-post.md');
  assert.ok(!fs.existsSync(path.join(blog, newPost.path)));
  assert.equal((await request('/admin/api/bootstrap')).data.blog.posts[0].draft, false);
  assert.equal((await request('/admin/api/file/delete', { path: published.data.path, snapshot: 'stale' })).status, 409);
  const deleted = await request('/admin/api/file/delete', { path: published.data.path, snapshot: published.data.snapshot });
  assert.equal(deleted.status, 200);
  assert.ok(fs.existsSync(path.join(home, deleted.data.backup)));
  assert.ok(!fs.existsSync(path.join(blog, published.data.path)));
  assert.equal((await request('/admin/api/file', { root: 'home', path: 'src/content/pages/wallpapers.json', content: '[]', kind: 'json', snapshot: current.data.storeSnapshots.wallpapers })).status, 400);
  assert.equal((await request('/admin/api/media/usage', { url: '' })).status, 400);
  const usage = await request('/admin/api/media/usage', { url: 'https://example.org' });
  assert.ok(usage.data.matches.includes('主页：src/content/pages/friends.json'));
  const mediaServer = http.createServer((req, res) => {
    req.resume();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, url: 'https://example.org/image.png', purpose: 'cover' }));
  });
  await new Promise((resolve) => mediaServer.listen(0, '127.0.0.1', resolve));
  process.env.XINGRANYA_BLOG_PREVIEW_URL = `http://127.0.0.1:${mediaServer.address().port}`;
  try {
    const uploaded = await request('/admin/api/media/upload', { url: 'https://example.org/source.png', purpose: 'cover' });
    assert.equal(uploaded.status, 200);
    assert.equal(uploaded.data.url, 'https://example.org/image.png');
    assert.equal(uploaded.data.purpose, 'cover');
  } finally { await new Promise((resolve) => mediaServer.close(resolve)); }
  console.log('后台隔离检查通过：源文件保存、快照冲突、类型校验、索引更新、草稿转换、备份删除、媒体引用、上传回执桥接和本机访问边界。');
} finally {
  await new Promise((resolve) => server.close(resolve));
  process.chdir(originalCwd);
  fs.rmSync(fixture, { recursive: true, force: true });
}
