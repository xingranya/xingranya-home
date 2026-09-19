import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SITE_CONFIG_PATH = path.resolve('src/content/config/site.config.json');
const DIARIES_DIR = path.resolve('src/content/diaries');
const PUBLIC_DIR = path.resolve('public');
const DIST_DIR = path.resolve('dist');

function getSiteInfo() {
  let title = 'chent';
  let description =
    'Chent 的个人网站，记录随笔、日记、项目与生活，分享个人的思考、经历与正在做的事情，也保存那些值得留下来的时刻。';
  let baseUrl = 'https://chent.co';
  let authorName = 'chent';

  if (fs.existsSync(SITE_CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(SITE_CONFIG_PATH, 'utf-8'));
      if (config.title) title = config.title;
      if (config.description) description = config.description;
      if (config.url) baseUrl = config.url.replace(/\/+$/, '');
      if (config.author?.name) authorName = config.author.name;
    } catch {
      // ignore
    }
  }

  return { title, description, baseUrl, authorName };
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRss() {
  const { title, description, baseUrl, authorName } = getSiteInfo();
  const now = new Date().toUTCString();

  const items = [];

  if (fs.existsSync(DIARIES_DIR)) {
    const diaryFiles = fs.readdirSync(DIARIES_DIR).filter((f) => f.endsWith('.md'));

    for (const file of diaryFiles) {
      const filePath = path.join(DIARIES_DIR, file);
      const fileStat = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      if (data.draft === true) continue;

      const slug = data.slug || file.replace(/\.md$/, '');
      const diaryTitle = data.title || slug;
      const diarySummary = data.summary || content.slice(0, 200).replace(/[#*`\n]/g, ' ').trim();
      const diaryDate = data.date ? new Date(data.date).toUTCString() : fileStat.mtime.toUTCString();
      const diaryCategory = data.category || '手记随笔';
      const link = `${baseUrl}/diaries/${slug}`;

      items.push({
        title: diaryTitle,
        link,
        guid: link,
        pubDate: diaryDate,
        description: diarySummary,
        category: diaryCategory,
        timestamp: new Date(data.date || fileStat.mtime).getTime(),
      });
    }
  }

  // 逆序排序（最新文章置顶）
  items.sort((a, b) => b.timestamp - a.timestamp);

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${baseUrl}/</link>
    <description>${escapeXml(description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <managingEditor>${authorName}</managingEditor>
    <webMaster>${authorName}</webMaster>
${items
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <category><![CDATA[${item.category}]]></category>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // 同时输出 feed.xml 与 rss.xml
  const publicFeed = path.join(PUBLIC_DIR, 'feed.xml');
  const publicRss = path.join(PUBLIC_DIR, 'rss.xml');
  fs.writeFileSync(publicFeed, rssXml, 'utf-8');
  fs.writeFileSync(publicRss, rssXml, 'utf-8');
  console.log(`[rss] Generated ${items.length} articles to public/feed.xml and public/rss.xml`);

  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), rssXml, 'utf-8');
    fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), rssXml, 'utf-8');
    console.log(`[rss] Synced feed.xml to dist/`);
  }
}

generateRss();
