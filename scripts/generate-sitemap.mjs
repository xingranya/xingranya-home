import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SITE_CONFIG_PATH = path.resolve('src/content/config/site.config.json');
const POSTS_DIR = path.resolve('src/content/posts');
const DIARIES_DIR = path.resolve('src/content/diaries');
const PUBLIC_DIR = path.resolve('public');
const DIST_DIR = path.resolve('dist');

function getBaseUrl() {
  if (fs.existsSync(SITE_CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(SITE_CONFIG_PATH, 'utf-8'));
      if (config.url) {
        return config.url.replace(/\/+$/, '');
      }
    } catch {
      // ignore
    }
  }
  return 'https://xran.uk';
}

function formatDate(dateStr, fallbackDate) {
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
  }
  return (fallbackDate || new Date()).toISOString().split('T')[0];
}

function generateSitemap() {
  const baseUrl = getBaseUrl();
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: today },
    { loc: `${baseUrl}/archives`, priority: '0.8', changefreq: 'weekly', lastmod: today },
    { loc: `${baseUrl}/diaries`, priority: '0.8', changefreq: 'daily', lastmod: today },
    { loc: `${baseUrl}/says`, priority: '0.7', changefreq: 'daily', lastmod: today },
    { loc: `${baseUrl}/friends`, priority: '0.7', changefreq: 'weekly', lastmod: today },
    { loc: `${baseUrl}/sitemap`, priority: '0.8', changefreq: 'weekly', lastmod: today },
  ];

  // 1. 提取所有公开手记
  if (fs.existsSync(DIARIES_DIR)) {
    const diaryFiles = fs.readdirSync(DIARIES_DIR).filter((f) => f.endsWith('.md'));
    for (const file of diaryFiles) {
      const filePath = path.join(DIARIES_DIR, file);
      const fileStat = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);

      const slug = data.slug || file.replace(/\.md$/, '');
      const lastmod = formatDate(data.date, fileStat.mtime);

      urls.push({
        loc: `${baseUrl}/diaries/${slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod,
      });
    }
  }

  // 3. 构建 XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // 写入 public 目录
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const publicTarget = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(publicTarget, xml, 'utf-8');
  console.log(`[sitemap] Generated ${urls.length} URLs to public/sitemap.xml`);

  // 如果 dist 目录存在，同步写入 dist 目录
  if (fs.existsSync(DIST_DIR)) {
    const distTarget = path.join(DIST_DIR, 'sitemap.xml');
    fs.writeFileSync(distTarget, xml, 'utf-8');
    console.log(`[sitemap] Synced sitemap.xml to dist/sitemap.xml`);
  }
}

generateSitemap();
