import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import matter from 'gray-matter';

const require = createRequire(import.meta.url);
const { renderPage, getPageMeta } = require('../.ssg/ssg.cjs');
const site = JSON.parse(fs.readFileSync('src/content/config/site.config.json', 'utf8'));
const index = JSON.parse(fs.readFileSync('src/content/generated/public-index.json', 'utf8'));
const rawTemplate = fs.readFileSync('dist/index.html', 'utf8');
const now = Date.parse(index.generatedAt);
const routes = ['/', '/about', '/archives', '/diaries', '/says', '/friends', '/sitemap'];
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const serialize = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const write = (file, text) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const diaryBodies = new Map();

function deferClientScripts(html) {
  const sources = [];
  const documentWithoutScripts = html.replace(/<script defer src="([^"]+)"><\/script>/g, (_tag, source) => {
    sources.push(source);
    return '';
  });
  if (sources.length === 0) return html;

  const loader = `<script>(function(){var sources=${JSON.stringify(sources)};var started=false;function load(){if(started)return;started=true;sources.forEach(function(source){var script=document.createElement('script');script.src=source;script.async=false;document.head.appendChild(script);});}function schedule(){window.setTimeout(load,1500);}if(document.readyState==='complete'){schedule();}else{window.addEventListener('load',schedule,{once:true});}window.addEventListener('pointermove',load,{once:true,passive:true});window.addEventListener('pointerdown',load,{once:true,passive:true});window.addEventListener('keydown',load,{once:true});})();</script>`;
  return documentWithoutScripts.replace('</body>', `${loader}</body>`);
}

const template = deferClientScripts(rawTemplate);

for (const diary of index.diaries) {
  const { content } = matter(fs.readFileSync(`src/content/diaries/${diary.slug}.md`, 'utf8'));
  const full = { ...diary, content };
  diaryBodies.set(`/diaries/${diary.slug}`, full);
  routes.push(`/diaries/${diary.slug}`);
  write(`dist/content/diaries/${diary.slug}.json`, JSON.stringify({ content }));
  if (diary.indexable !== false) {
    const canonical = `${site.url}/diaries/${diary.slug}`;
    const body = content.replace(/^\s*#\s+[^\n]+\n/, '').trim();
    write(`dist/diaries/${diary.slug}/index.md`, `# ${diary.title}\n\n> ${diary.summary}\n\n作者：${site.author.name}  \n日期：${diary.date}  \n原文：[${diary.title}](${canonical})\n\n${body}\n`);
  }
}

for (const route of [...routes, '/404.html']) {
  const snapshot = { now, ...(diaryBodies.has(route) ? { diary: diaryBodies.get(route) } : {}) };
  const body = await renderPage(route, snapshot);
  const meta = getPageMeta(route);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, '')
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div><script id="page-snapshot" type="application/json">${serialize(snapshot)}</script>`);
  for (const [name, value] of Object.entries({ description: meta.description, robots: meta.robots, 'og:title': meta.title, 'og:description': meta.description, 'og:url': meta.canonical || '', 'twitter:title': meta.title, 'twitter:description': meta.description })) {
    const attr = name.startsWith('og:') ? 'property' : 'name';
    const pattern = new RegExp(`<meta\\s+${attr}="${name}"[^>]*>`, 'g');
    html = html.replace(pattern, () => `<meta ${attr}="${name}" content="${escape(value)}">`);
  }
  const extra = `${meta.canonical ? `<link rel="canonical" href="${escape(meta.canonical)}">` : ''}${meta.markdown ? `<link rel="alternate" type="text/markdown" href="${escape(meta.markdown)}">` : ''}<script data-page-schema type="application/ld+json">${serialize(meta.jsonLd)}</script>`;
  html = html.replace('</head>', `${extra}</head>`);
  write(route === '/404.html' ? 'dist/404.html' : `dist${route === '/' ? '' : route}/index.html`, html);
}

const confirmed = index.diaries.filter((diary) => diary.indexable !== false);
const llms = `# 星苒鸭个人主页\n\n> ${site.description}\n\n这里介绍星苒鸭（xingranya）、公开项目、日常动态和手记。技术长文发布在独立博客。公开内容允许搜索、引用与模型训练访问，请保留作者与原文出处。\n\n## 主要入口\n\n- [首页](${site.url}/)：身份介绍与博客入口\n- [关于](${site.url}/about)：个人介绍、奖项和精选项目\n- [动态](${site.url}/says)：日常近况\n- [友链](${site.url}/friends)：朋友的站点\n- [技术博客](https://blog.xran.uk/)：技术教程与实践文章\n\n## 公开手记\n\n${confirmed.map((diary) => `- [${diary.title}](${site.url}/diaries/${diary.slug}/index.md)：${diary.summary}`).join('\n') || '暂无已确认的公开手记。'}\n\n## 索引与订阅\n\n- [网站地图](${site.url}/sitemap.xml)\n- [RSS 订阅](${site.url}/feed.xml)\n- [博客智能体目录](https://blog.xran.uk/llms.txt)\n`;
write('dist/llms.txt', llms);
write('.ssg/indexnow-urls.json', JSON.stringify(routes.filter((route) => getPageMeta(route).robots === 'index,follow').map((route) => `${site.url}${route}`), null, 2));
console.log(`[ssg] 已输出 ${routes.length} 个页面、真实 404、${confirmed.length} 篇 Markdown 和智能体目录。`);
