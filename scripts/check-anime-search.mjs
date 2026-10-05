import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { getAnimeSynopsis, searchAnime } from '../src/lib/anime.ts';

const read = async (name) => JSON.parse(await fs.readFile(new URL(name, import.meta.url), 'utf8'));
const collection = await read('../src/content/pages/wallpapers.json');
const translations = await read('../src/content/pages/anime-descriptions.zh.json');
const { items } = collection;

const flowers = searchAnime(items, '花');
const titleMatches = flowers.filter(({ item }) => item.title.includes('花'));
assert.ok(titleMatches.length > 0);
assert.deepEqual(flowers.slice(0, titleMatches.length), titleMatches, '片名匹配应排在别名匹配前面');
assert.ok(!flowers.some(({ item }) => item.id === '3831'), '单字不应命中工作人员姓名标签');
assert.ok(searchAnime(items, '花田十辉').some(({ item }) => item.id === '3831'), '完整姓名仍可用标签查找');
assert.ok(flowers.filter(({ matchLabel }) => matchLabel).every(({ matchLabel }) => matchLabel.startsWith('别名：')));

const combined = searchAnime(items, '  2025　恋爱  ');
assert.ok(combined.length > 0);
assert.ok(combined.every(({ item }) => item.year === 2025 && item.tags.some((tag) => tag.includes('恋爱'))));
const romance = items.find((item) => item.id === '3892');
assert.deepEqual(searchAnime(items, 'Ｒｅ：从零开始').map(({ item }) => item.id), searchAnime(items, 're 从零开始').map(({ item }) => item.id));
assert.equal(searchAnime(items, romance.title)[0].item.id, romance.id, '完整片名应优先找到对应作品');
assert.ok(searchAnime(items, '未闻花名').some(({ item }) => item.id === '35'));
assert.equal(searchAnime(items, '五等分的新娘')[0].item.id, '366', '完整片名应优先于名称相近的续作');
assert.equal(searchAnime(items, '五等分的新娘∬')[0].item.id, '362', '完整片名中的季数符号应保留');
assert.equal(searchAnime(items, '不存在的番剧 abcxyz').length, 0);
assert.equal(searchAnime(items, '2025 1999').length, 0, '组合关键词必须同时满足');
assert.equal(searchAnime(items.filter((item) => item.status === 'watched'), '2025').every(({ item }) => item.status === 'watched'), true);
const all = searchAnime(items, '');
assert.equal(all.length, items.length);
for (let index = 1; index < all.length; index++) {
  const a = all[index - 1].item;
  const b = all[index].item;
  assert.ok(a.year > b.year || (a.year === b.year && (a.publishDate || '') >= (b.publishDate || '')), '浏览时应保持首播时间倒序');
}

for (const [id, description] of Object.entries(translations)) {
  const item = items.find((item) => item.id === id);
  assert.ok(item, `译文 ${id} 应对应现有番剧`);
  const result = getAnimeSynopsis(item, translations);
  assert.equal(result.description, description);
  assert.equal(result.original, item.description.replace(/\r\n/g, '\n').trim());
  assert.ok(!/[ぁ-ゖァ-ヺ]/u.test(description), '新增简介应为中文');
  assert.equal(getAnimeSynopsis({ ...item, description: '来源站更新后的中文简介。' }, translations).description, '来源站更新后的中文简介。');
}
assert.ok(getAnimeSynopsis(items.find((item) => item.id === '3498'), translations).description.startsWith('唯有'));
assert.ok(getAnimeSynopsis(items.find((item) => item.id === '3565'), translations).description.startsWith('思春期'));
assert.equal(getAnimeSynopsis({ id: 'test', description: '中文\r\n[简介原文]\r\n日本語' }, {}).description, '中文');
console.log(`搜索相关度、单字误命中、组合条件、全半角、筛选、首播排序与 ${Object.keys(translations).length} 部中文简介及原文保留检查通过。`);
