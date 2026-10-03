import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/hooks/useTheme.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const stored = new Map([['perimsx-theme', 'light']]);
const classes = new Set();
const mediaListeners = new Set();
const storageListeners = new Set();
const media = {
  matches: false,
  addEventListener: (_name, listener) => mediaListeners.add(listener),
  removeEventListener: (_name, listener) => mediaListeners.delete(listener),
};
const localStorage = { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
let currentConsumer;
let useTheme;
const react = {
  useSyncExternalStore(subscribe, getSnapshot) {
    const consumer = currentConsumer;
    if (!consumer.unsubscribe) {
      consumer.unsubscribe = () => {};
      consumer.unsubscribe = subscribe(() => {
        const previous = currentConsumer;
        currentConsumer = consumer;
        consumer.value = useTheme();
        currentConsumer = previous;
      });
    }
    return getSnapshot();
  },
};
const context = vm.createContext({
  exports: {},
  require: (name) => { assert.equal(name, 'react'); return react; },
  localStorage,
  window: {
    matchMedia: () => media,
    addEventListener: (_name, listener) => storageListeners.add(listener),
    removeEventListener: (_name, listener) => storageListeners.delete(listener),
  },
  document: { documentElement: { classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) } } },
});
vm.runInContext(code, context);
useTheme = context.exports.useTheme;
function mount() {
  const consumer = {};
  currentConsumer = consumer;
  consumer.value = useTheme();
  currentConsumer = undefined;
  return consumer;
}
function changeSystem(dark) {
  media.matches = dark;
  mediaListeners.forEach((listener) => listener());
}
const footer = mount();
const codeBlock = mount();
assert.equal(mediaListeners.size, 1);
assert.equal(storageListeners.size, 1);
footer.value.setTheme('dark');
assert.equal(footer.value.isDark, true);
assert.equal(codeBlock.value.isDark, true);
changeSystem(false);
assert.equal(classes.has('dark'), true);
footer.value.setTheme('light');
changeSystem(true);
assert.equal(codeBlock.value.isDark, false);
assert.equal(classes.has('dark'), false);
footer.value.setTheme('system');
assert.equal(codeBlock.value.isDark, true);
changeSystem(false);
assert.equal(footer.value.isDark, false);
const previousStored = stored.get('perimsx-theme');
storageListeners.forEach((listener) => listener({ key: 'perimsx-theme', newValue: 'dark' }));
assert.equal(codeBlock.value.theme, 'dark');
assert.equal(footer.value.isDark, true);
assert.equal(stored.get('perimsx-theme'), previousStored);
footer.value.toggleTheme();
assert.equal(codeBlock.value.theme, 'light');
footer.unsubscribe();
assert.equal(mediaListeners.size, 1);
codeBlock.unsubscribe();
assert.equal(mediaListeners.size, 0);
assert.equal(storageListeners.size, 0);

const server = vm.createContext({
  exports: {},
  require: () => ({ useSyncExternalStore: (_subscribe, _getSnapshot, getServerSnapshot) => getServerSnapshot() }),
});
vm.runInContext(code, server);
const ssr = server.exports.useTheme();
assert.equal(ssr.theme, 'system');
assert.equal(ssr.isDark, false);
console.log('主题回归通过：多组件同步、显式选择、跟随系统、跨标签同步、监听清理和 SSR 快照。');
