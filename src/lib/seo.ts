import { getDiaryBySlug, siteConfig } from '../content';

export const sections = [
  { label: '归档', paths: ['/archives', '/timeline', '/archive'] },
  { label: '手记', paths: ['/diaries', '/journal', '/shouji'] },
  { label: '动态', paths: ['/says', '/record'] },
  { label: '友链', paths: ['/friends', '/friend'] },
  { label: '番剧墙', paths: ['/wallpapers'] },
  { label: '站点地图', paths: ['/sitemap'] },
  { label: '关于', paths: ['/about'] },
];

export function getPageMeta(pathname: string) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const section = sections.find((item) => item.paths.includes(normalized));
  const diaryMatch = normalized.match(/^\/(?:diaries|journal|shouji)\/([^/]+)$/);
  const diary = diaryMatch ? getDiaryBySlug(decodeURIComponent(diaryMatch[1])) : null;
  let title = siteConfig.title;
  let description = siteConfig.description;
  let canonicalPath = normalized;
  let indexable = true;
  let notFound = false;

  if (diary) {
    title = `${diary.title} · ${siteConfig.title}`;
    description = diary.summary || description;
    canonicalPath = `/diaries/${diary.slug}`;
    indexable = diary.indexable !== false && !diary.draft;
  } else if (section) {
    title = `${section.label} · ${siteConfig.title}`;
    canonicalPath = section.paths[0];
    const descriptions: Record<string, string> = {
      '/archives': siteConfig.archivesPage?.subtitle || '按时间查看星苒鸭的手记与近况。',
      '/diaries': siteConfig.diariesPage?.subtitle || '星苒鸭的手记与随笔。',
      '/says': siteConfig.saysPage?.subtitle || '星苒鸭的日常动态与近况。',
      '/friends': siteConfig.friendsPage?.subtitle || '星苒鸭的朋友与友链。',
      '/wallpapers': '星苒鸭的番剧墙。收藏喜欢的番剧封面、简介和故事，按片名、年份或类型慢慢浏览。',
      '/sitemap': '星苒鸭个人主页的栏目与公开手记索引。',
      '/about': `关于${siteConfig.author.name}：${siteConfig.author.description}`,
    };
    description = descriptions[canonicalPath] || description;
  } else if (normalized !== '/') {
    title = `页面未找到 · ${siteConfig.title}`;
    description = '请求的页面不存在或已归档。';
    indexable = false;
    notFound = true;
  }

  const canonical = notFound ? null : new URL(canonicalPath, siteConfig.url).href;
  const personId = `${siteConfig.url}/#person`;
  const graph: Record<string, unknown>[] = [
    { '@type': 'WebSite', '@id': `${siteConfig.url}/#website`, url: `${siteConfig.url}/`, name: siteConfig.title, description: siteConfig.description, inLanguage: 'zh-CN', publisher: { '@id': personId } },
    { '@type': 'Person', '@id': personId, name: siteConfig.author.name, alternateName: 'xingranya', url: `${siteConfig.url}/`, image: `${siteConfig.url}/avatar.webp`, sameAs: ['https://blog.xran.uk/', 'https://github.com/xingranya', 'https://x.com/xingranya', 'https://space.bilibili.com/357220647'] },
  ];
  if (diary && indexable) {
    graph.push({ '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: diary.title, description, datePublished: diary.date, dateModified: diary.date, author: { '@id': personId }, mainEntityOfPage: canonical, url: canonical, inLanguage: 'zh-CN' });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: `${siteConfig.url}/` },
      { '@type': 'ListItem', position: 2, name: '手记', item: `${siteConfig.url}/diaries` },
      { '@type': 'ListItem', position: 3, name: diary.title, item: canonical },
    ] });
  }
  return { title, description, canonical, robots: indexable ? 'index,follow' : 'noindex,follow', notFound, markdown: diary && indexable ? `${canonical}/index.md` : null, jsonLd: { '@context': 'https://schema.org', '@graph': graph } };
}

export function applyPageMeta(pathname: string) {
  const meta = getPageMeta(pathname);
  document.title = meta.title;
  for (const [selector, value] of Object.entries({
    'meta[name="description"]': meta.description,
    'meta[name="robots"]': meta.robots,
    'meta[property="og:title"]': meta.title,
    'meta[property="og:description"]': meta.description,
    'meta[property="og:url"]': meta.canonical || '',
    'meta[name="twitter:title"]': meta.title,
    'meta[name="twitter:description"]': meta.description,
  })) document.querySelector(selector)?.setAttribute('content', value);
  for (const [selector, rel, href, type] of [
    ['link[rel="canonical"]', 'canonical', meta.canonical, ''],
    ['link[type="text/markdown"]', 'alternate', meta.markdown, 'text/markdown'],
  ]) {
    const existing = document.querySelector<HTMLLinkElement>(selector!);
    if (!href) { existing?.remove(); continue; }
    const link = existing || document.createElement('link');
    link.rel = rel!;
    link.href = href;
    if (type) link.type = type;
    if (!existing) document.head.appendChild(link);
  }
  const structured = document.querySelector('script[data-page-schema]');
  if (structured) structured.textContent = JSON.stringify(meta.jsonLd);
}
