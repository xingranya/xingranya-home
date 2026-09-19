import fs from 'node:fs';
import path from 'node:path';

const distIndex = path.resolve('dist/index.html');
const dist404 = path.resolve('dist/404.html');

if (fs.existsSync(distIndex)) {
  const html = fs.readFileSync(distIndex, 'utf-8');
  const notFoundHtml = html
    .replace(/<title>.*?<\/title>/, '<title>页面未找到 · 星苒鸭</title>')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,follow">');
  fs.writeFileSync(dist404, notFoundHtml);
  console.log('[post-build] Generated dist/404.html for SPA static hosting fallback.');
}
