import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  fetchCategory,
  mergeCategories,
  normalizeVideo,
  summarizeChanges,
  uploadCover,
  inspectImage,
} from './sync-anime.mjs';

const counts = { watching: 3, watched: 1 };
const page = (index, ids, status = 'watching', total = 3) => ({
  list: ids.map((video_id) => ({ video_id, category: status })),
  pager: { page: index, total },
  counts,
});
let calls = 0;
const watching = await fetchCategory(
  async () => (++calls === 1 ? page(1, [1, 2]) : page(2, [3])),
  'watching'
);
assert.equal(calls, 2);
assert.deepEqual(
  watching.rows.map((item) => item.id),
  ['1', '2', '3']
);
const watched = await fetchCategory(async () => page(1, [4], 'watched', 1), 'watched');
assert.equal(mergeCategories(watching, watched).rows.length, 4);
await assert.rejects(
  fetchCategory(async () => page(1, [1, 1, 2]), 'watching'),
  /重复/
);
await assert.rejects(
  fetchCategory(async () => page(1, []), 'watching'),
  /分页不完整/
);
assert.throws(
  () => mergeCategories(watching, { rows: [{ id: '1', status: 'watched' }], counts }),
  /两种分类/
);
let changing = 0;
await assert.rejects(
  fetchCategory(
    async () =>
      ++changing === 1 ? page(1, [1]) : { ...page(2, [2]), counts: { watching: 4, watched: 1 } },
    'watching'
  ),
  /发生变化/
);
assert.deepEqual(
  summarizeChanges(
    [
      { id: '1', status: 'watching' },
      { id: '2', status: 'watched' },
    ],
    [
      { id: '1', status: 'watched' },
      { id: '3', status: 'watching' },
    ]
  ),
  { added: 1, removed: 1, moved: 1 }
);
const normalized = normalizeVideo(
  {
    id: 1,
    title: ' 番剧 ',
    year: 2026,
    cover_url: 'https://example.com/cover.jpg',
    tags: [' 日常 ', '日常'],
    token: '不可发布',
    password: '不可发布',
  },
  { id: '1', status: 'watching' }
);
assert.equal(normalized.title, '番剧');
assert.deepEqual(normalized.tags, ['日常']);
assert.ok(!('token' in normalized) && !('password' in normalized));
assert.throws(() => normalizeVideo({ id: 1, title: '', year: 2026 }, { id: '1' }), /资料不完整/);
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.tucang.cc/api/v1/upload');
    assert.equal(options.body.get('folderId'), '4249');
    assert.equal(options.body.get('token'), 'test-token');
    assert.equal(options.body.get('url'), 'https://example.com/cover.jpg');
    return new globalThis.Response(
      JSON.stringify({
        success: true,
        code: '200',
        data: { url: 'https://img1.tucang.cc/api/image/show/test-image' },
      })
    );
  };
  assert.equal(
    await uploadCover('https://example.com/cover.jpg', 'test-token', 4249),
    'https://img1.tucang.cc/api/image/show/test-image'
  );
  globalThis.fetch = async () =>
    new globalThis.Response(JSON.stringify({ success: false, code: '400' }));
  await assert.rejects(
    uploadCover('https://example.com/cover.jpg', 'test-token', 4249),
    /上传失败/
  );
  const image = await fs.readFile(new URL('../public/avatar.webp', import.meta.url));
  globalThis.fetch = async () => new globalThis.Response(image);
  const dimensions = await inspectImage('https://img1.tucang.cc/api/image/show/test-image');
  assert.ok(dimensions.width > 0 && dimensions.height > 0);
} finally {
  globalThis.fetch = originalFetch;
}
console.log('同步脚本：分页完整性、分类合并、异常阻断、公开字段、图床请求及图片解码检查通过。');
