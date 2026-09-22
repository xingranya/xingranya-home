import assert from 'node:assert/strict';
import fs from 'node:fs';
import { middleware } from '../middleware.js';

// 构建后运行，核对本次片单的完整性和部署路由，防止只接通客户端页面。
const { items, counts } = JSON.parse(fs.readFileSync('src/content/pages/wallpapers.json', 'utf8'));
assert.equal(items.length, counts.watching + counts.watched, '完整片单数量应与来源分类总数相同');
for (const status of ['watching', 'watched']) {
  assert.equal(
    items.filter((item) => item.status === status).length,
    counts[status],
    `${status} 数量与来源不一致`
  );
}
assert.equal(new Set(items.map((item) => item.id)).size, items.length, '片单不能重复');
for (const item of items) {
  assert.ok(
    item.title && typeof item.description === 'string' && item.width > 0 && item.height > 0
  );
  assert.ok(['watching', 'watched'].includes(item.status), '追番状态必须取自来源站');
  assert.match(new URL(item.image).hostname, /(^|\.)tucang\.cc$/, '封面必须使用图床地址');
  assert.equal(new URL(item.image).protocol, 'https:');
  assert.equal(new URL(item.sourceUrl).pathname, `/anime/${item.id}`);
}
const html = fs.readFileSync('dist/wallpapers/index.html', 'utf8');
assert.ok(html.includes('<title>番剧墙 · 星苒鸭</title>'));
assert.ok(html.includes('https://xran.uk/wallpapers'));
assert.equal((html.match(/class="wall-card"/g) || []).length, items.length);
const escape = (text) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[character]
  );
for (const item of items)
  assert.ok(html.includes(escape(item.title)), `静态页面缺少 ${item.title}`);
const renderedOrder = items
  .map((item) => ({ ...item, position: html.indexOf(`<h2>${escape(item.title)}</h2>`) }))
  .sort((a, b) => a.position - b.position);
for (let index = 1; index < renderedOrder.length; index++) {
  const previous = renderedOrder[index - 1];
  const current = renderedOrder[index];
  assert.ok(previous.position >= 0 && current.position >= 0, '静态正文缺少番剧标题');
  assert.ok(previous.year >= current.year, '番剧应按播出年份从新到旧排列');
  if (previous.year === current.year) {
    assert.ok(
      (previous.publishDate || '') >= (current.publishDate || ''),
      '同年番剧应按首播日期从新到旧排列'
    );
  }
}
const response = await middleware({
  request: new globalThis.Request('https://xran.uk/wallpapers'),
  next: () => new globalThis.Response('路由通过'),
});
assert.equal(await response.text(), '路由通过');
assert.ok(fs.readFileSync('dist/sitemap.xml', 'utf8').includes('https://xran.uk/wallpapers'));
console.log(
  `${items.length} 部片单、追番分类、年份排序、图床链接、静态正文、SEO 和生产路由检查通过。`
);
