import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import matter from 'gray-matter';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 执行实际模块，浏览器存储和请求在内存中隔离，不写项目源文件。
function loadModule(relative, modules, globals = {}) {
  const filename = path.join(project, relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      assert.ok(name in modules, `未提供隔离依赖：${name}`);
      return modules[name];
    },
    process: { env: { NODE_ENV: 'test' } },
    console,
    ...globals,
  }, { filename });
  return exports;
}

const sourceData = {
  posts: [{ slug: 'new-post', title: '新增文章', date: '2026-10-03', content: '文章正文必须保留', draft: true, tags: [], toc: [] }],
  diaries: [{ slug: 'new-diary', title: '新增手记', date: '2026-10-03', content: '手记正文必须保留', tags: [] }],
  records: [{ id: 'record', content: '保留动态' }],
  friends: [{ id: 'friend', name: '保留友链' }],
  siteConfig: { title: '保留源配置' },
};
const initialStorage = {
  cot_admin_prefs_v2: { theme: 'dark', accentColor: 'sakura', editorFontSize: 20, sidebarCollapsed: true, autoSaveDraft: false },
  cot_editor_drafts_v2: { post_new: { id: 'post_new', type: 'post', title: '未保存的草稿', content: '暂存正文', savedAt: 1 } },
  cot_trash_bin_v2: [{ id: 'trash', type: 'post', title: '回收站文章', data: { content: '回收站正文' }, deletedAt: 1 }],
  cot_activity_logs_v2: [{ id: 'log', type: 'post', action: 'create', title: '原始日志', timestamp: 1 }],
};
const storage = new Map(Object.entries(initialStorage).map(([key, value]) => [key, JSON.stringify(value)]));
const requests = [];
const markdown = loadModule('src/lib/markdown.ts', { 'gray-matter': matter });
const { AdminStore } = loadModule('src/lib/admin-store.ts', {
  '../content/config/site.config.json': {},
  '../content/pages/friends.json': [],
  '../content/records/records.json': [],
  '../content/generated/content-index.json': { posts: [], diaries: [] },
  '../content/generated/content-loaders': { postLoaders: {}, diaryLoaders: {} },
  './markdown': markdown,
}, {
  window: { location: { pathname: '/admin' } },
  localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  async fetch(url, options) {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ success: true, data: { home: JSON.parse(JSON.stringify(sourceData)), storeSnapshots: {} } }) };
  },
});

assert.equal(await AdminStore.hydrateFromServer(), true);
const before = JSON.stringify({ data: AdminStore.exportAllData(), drafts: AdminStore.getAllAutoDrafts(), trash: AdminStore.getTrash() });
const storedBefore = new Map(storage);
requests.length = 0;
const restored = AdminStore.resetPreferences();
await AdminStore.flushServerSaves();
assert.equal(requests.length, 0, '恢复后台偏好不能发起源文件请求');
assert.equal(JSON.stringify(restored), JSON.stringify({ theme: 'system', accentColor: 'sakura', editorFontSize: 14, sidebarCollapsed: false, autoSaveDraft: true }));
const after = { data: AdminStore.exportAllData(), drafts: AdminStore.getAllAutoDrafts(), trash: AdminStore.getTrash() };
const expected = JSON.parse(before);
expected.data.preferences = JSON.parse(JSON.stringify(restored));
after.data.exportedAt = expected.data.exportedAt;
assert.equal(JSON.stringify(after), JSON.stringify(expected), '恢复偏好必须保留正文、新稿、草稿、回收站和源配置');
for (const [key, value] of storedBefore) {
  if (key !== 'cot_admin_prefs_v2') assert.equal(storage.get(key), value, `${key} 不应被修改`);
}

// 在上海凌晨点击实际的新建草稿按钮，验证写入的 YAML 日期保持正确时刻。
const instant = Date.parse('2026-10-02T16:15:00.000Z');
class FixedDate extends Date {
  constructor(value = instant) { super(value); }
  static now() { return instant; }
}
let stateIndex = 0;
let createdEditor;
const react = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState(initial) {
    const index = stateIndex++;
    return [index === 3 ? false : initial, (value) => { if (index === 5) createdEditor = value; }];
  },
  useEffect: () => {},
  useMemo: (compute) => compute(),
  useCallback: (callback) => callback,
};
const { AdminWorkspace } = loadModule('src/components/admin/AdminWorkspace.tsx', {
  react,
  '@radix-ui/react-dialog': {},
  'lucide-react': {},
  '../../lib/admin-store': { AdminStore },
}, { Date: FixedDate });
function findNewDraftButton(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'button' && node.props.children.includes('新建草稿')) return node;
  for (const child of (Array.isArray(node) ? node : node.props?.children || [])) {
    const found = findNewDraftButton(child);
    if (found) return found;
  }
  return null;
}
const button = findNewDraftButton(AdminWorkspace({ mode: 'blogPosts' }));
assert.ok(button, '博客文章列表应有新建草稿按钮');
button.props.onClick();
const { data } = matter(createdEditor.content);
assert.equal(new Date(data.date).getTime(), instant, '草稿日期不能丢失时区后偏移 8 小时');
assert.equal(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(new Date(data.date)), '2026-10-03 00:15');
console.log('后台状态回归通过：恢复偏好不写源文件并保留全部内容；新建草稿在上海凌晨保留正确日期和时刻。');
