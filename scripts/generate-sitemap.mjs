import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SITE_CONFIG_PATH = path.resolve('src/content/config/site.config.json');
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

  const urls = [
    { loc: `${baseUrl}/` },
    { loc: `${baseUrl}/about` },
    { loc: `${baseUrl}/archives` },
    { loc: `${baseUrl}/diaries` },
    { loc: `${baseUrl}/says` },
    { loc: `${baseUrl}/friends` },
    { loc: `${baseUrl}/sitemap` },
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
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>`
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
