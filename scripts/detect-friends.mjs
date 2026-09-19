import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRIENDS_JSON_PATH = path.resolve(__dirname, '../src/content/pages/friends.json');

// 支持的并发限制
const CONCURRENCY = 10;
const TIMEOUT_MS = 6000;

function normalizeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
}

function detectDeploy(headers, domain, html) {
  const h = headers || {};
  const server = (h['server'] || '').toLowerCase();
  const lowerHtml = (html || '').toLowerCase();
  const lowerDomain = (domain || '').toLowerCase();

  // 1. 特征响应头判断
  if (h['cf-ray'] || h['cf-cache-status'] || server.includes('cloudflare')) {
    return 'cloudflare';
  }
  if (h['x-vercel-id'] || server.includes('vercel')) {
    return 'vercel';
  }
  if (h['x-nf-request-id'] || server.includes('netlify')) {
    return 'netlify';
  }
  if (h['x-github-request-id'] || server.includes('github.com')) {
    return 'github';
  }
  if (h['x-eo-request-id'] || h['eo-req-id'] || server.includes('edgeone') || server.includes('tencent')) {
    return 'tencent';
  }
  if (h['x-oss-request-id'] || h['ali-swift-global-savetime'] || server.includes('tengine') || server.includes('aliyun')) {
    return 'aliyun';
  }
  if (h['x-amz-cf-id'] || h['x-amz-request-id'] || server.includes('cloudfront') || server.includes('amazons3')) {
    return 'aws';
  }
  if (h['x-zeabur-request-id'] || server.includes('zeabur')) {
    return 'zeabur';
  }
  if (server.includes('render')) {
    return 'render';
  }
  if (server.includes('railway')) {
    return 'railway';
  }
  if (server.includes('caddy') || server.includes('nginx') || server.includes('openresty') || server.includes('apache')) {
    return 'vps';
  }

  // 2. 域名特征判断
  if (lowerDomain.includes('.pages.dev')) return 'cloudflare';
  if (lowerDomain.includes('.vercel.app')) return 'vercel';
  if (lowerDomain.includes('.netlify.app')) return 'netlify';
  if (lowerDomain.includes('.github.io')) return 'github';
  if (lowerDomain.includes('.gitlab.io')) return 'gitlab';
  if (lowerDomain.includes('.zeabur.app')) return 'zeabur';
  if (lowerDomain.includes('.onrender.com')) return 'render';
  if (lowerDomain.includes('.railway.app')) return 'railway';

  // 3. HTML 页面底部署名提示
  if (lowerHtml.includes('cloudflare pages') || lowerHtml.includes('hosted on cloudflare')) return 'cloudflare';
  if (lowerHtml.includes('hosted on vercel') || lowerHtml.includes('vercel.app')) return 'vercel';
  if (lowerHtml.includes('hosted on netlify') || lowerHtml.includes('netlify.app')) return 'netlify';
  if (lowerHtml.includes('hosted on github') || lowerHtml.includes('github pages')) return 'github';
  if (lowerHtml.includes('tencent cloud') || lowerHtml.includes('edgeone')) return 'tencent';
  if (lowerHtml.includes('aliyun') || lowerHtml.includes('阿里云')) return 'aliyun';

  return server ? 'vps' : '';
}

function detectFramework(html, headers) {
  if (!html) return '';
  const lower = html.toLowerCase();

  // 1. Meta Generator 探测
  const metaMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i);
  if (metaMatch && metaMatch[1]) {
    const gen = metaMatch[1].toLowerCase();
    if (gen.includes('hexo')) return 'hexo';
    if (gen.includes('hugo')) return 'hugo';
    if (gen.includes('astro')) return 'astro';
    if (gen.includes('wordpress')) return 'wordpress';
    if (gen.includes('typecho')) return 'typecho';
    if (gen.includes('halo')) return 'halo';
    if (gen.includes('ghost')) return 'ghost';
    if (gen.includes('jekyll')) return 'jekyll';
    if (gen.includes('gatsby')) return 'gatsby';
    if (gen.includes('vuepress')) return 'vuepress';
    if (gen.includes('vitepress')) return 'vitepress';
    if (gen.includes('docusaurus')) return 'docusaurus';
    if (gen.includes('next.js') || gen.includes('nextjs')) return 'nextjs';
    if (gen.includes('nuxt')) return 'nuxtjs';
  }

  // 2. 特征路径与脚本探测
  if (lower.includes('/_astro/') || lower.includes('astro-island') || lower.includes('data-astro-')) return 'astro';
  if (lower.includes('/_next/') || lower.includes('__next')) return 'nextjs';
  if (lower.includes('/_nuxt/') || lower.includes('__nuxt')) return 'nuxtjs';
  if (lower.includes('/wp-content/') || lower.includes('/wp-includes/')) return 'wordpress';
  if (lower.includes('/usr/themes/') || lower.includes('/usr/plugins/')) return 'typecho';
  if (lower.includes('content/halo') || lower.includes('halo-theme') || lower.includes('/api/content/themes/')) return 'halo';
  if (lower.includes('vitepress') || lower.includes('/.vitepress/')) return 'vitepress';
  if (lower.includes('vuepress') || lower.includes('/.vuepress/')) return 'vuepress';
  if (lower.includes('docusaurus')) return 'docusaurus';
  if (lower.includes('mix space') || lower.includes('shiro') || lower.includes('kami')) return 'mixspace';

  // 3. Hexo 主题指纹
  if (
    lower.includes('theme-butterfly') ||
    lower.includes('theme-shoka') ||
    lower.includes('theme-fluid') ||
    lower.includes('theme-nexmoe') ||
    lower.includes('theme-volantis') ||
    lower.includes('theme-stellar') ||
    lower.includes('theme-acrylic') ||
    lower.includes('theme-anzhiyu') ||
    lower.includes('hexo-theme') ||
    lower.includes('hexo-generator')
  ) {
    return 'hexo';
  }

  // 4. Hugo 主题指纹
  if (
    lower.includes('papermod') ||
    lower.includes('hugo-theme') ||
    lower.includes('hugo-stack') ||
    lower.includes('theme-fixit') ||
    lower.includes('hugo-notice')
  ) {
    return 'hugo';
  }

  // 5. Powered by 签名指纹
  if (lower.includes('powered by hexo') || lower.includes('powered by <a href="https://hexo.io')) return 'hexo';
  if (lower.includes('powered by hugo') || lower.includes('powered by <a href="https://gohugo.io')) return 'hugo';
  if (lower.includes('powered by astro') || lower.includes('built with astro')) return 'astro';
  if (lower.includes('powered by typecho')) return 'typecho';
  if (lower.includes('powered by halo')) return 'halo';
  if (lower.includes('powered by wordpress')) return 'wordpress';

  // 6. 前端框架特征
  if (lower.includes('data-reactroot') || lower.includes('react-dom')) return 'react';
  if (lower.includes('data-v-') || lower.includes('vue.min.js')) return 'vue';
  if (lower.includes('svelte-')) return 'svelte';

  return '';
}

async function probeSite(friend) {
  const rawUrl = normalizeUrl(friend.link);
  let domain = '';
  try {
    domain = new URL(rawUrl).hostname;
  } catch {}

  const result = {
    id: friend.id,
    name: friend.name,
    framework: friend.framework || '',
    deploy: friend.deploy || '',
  };

  if (!rawUrl) return result;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    const headersObj = {};
    for (const [key, value] of response.headers.entries()) {
      headersObj[key.toLowerCase()] = value;
    }

    const text = await response.text();

    const detectedFramework = detectFramework(text, headersObj);
    const detectedDeploy = detectDeploy(headersObj, domain, text);

    if (detectedFramework) result.framework = detectedFramework;
    if (detectedDeploy) result.deploy = detectedDeploy;

    console.log(`✓ [${friend.id}] ${friend.name} -> 技术栈: ${result.framework || '未知'}, 部署: ${result.deploy || '未知'}`);
  } catch (err) {
    // 若网络超时或报错，使用已有或备选域名兜底
    if (!result.deploy) {
      result.deploy = detectDeploy({}, domain, '');
    }
    console.log(`⚠ [${friend.id}] ${friend.name} (${err.name || 'Error'}) -> 技术栈: ${result.framework || '未知'}, 部署: ${result.deploy || '未知'}`);
  }

  return result;
}

async function main() {
  console.log('🚀 开始自动化探测友链技术栈与部署方式...');
  if (!fs.existsSync(FRIENDS_JSON_PATH)) {
    console.error(`❌ 未找到文件: ${FRIENDS_JSON_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(FRIENDS_JSON_PATH, 'utf-8');
  const friends = JSON.parse(raw);
  console.log(`📋 共载入 ${friends.length} 条友链数据`);

  const results = [];
  const queue = [...friends];

  // 限制并发执行
  async function worker() {
    while (queue.length > 0) {
      const friend = queue.shift();
      if (!friend) break;
      const res = await probeSite(friend);
      results.push(res);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // 映射回原友链数组并保持原有顺序
  const resultMap = new Map(results.map(r => [r.id, r]));
  const updatedFriends = friends.map(f => {
    const probe = resultMap.get(f.id);
    return {
      ...f,
      framework: probe?.framework || f.framework || '',
      deploy: probe?.deploy || f.deploy || '',
    };
  });

  fs.writeFileSync(FRIENDS_JSON_PATH, JSON.stringify(updatedFriends, null, 2), 'utf-8');
  console.log(`\n🎉 探测完成！已成功回写 ${FRIENDS_JSON_PATH}`);

  // 输出探测统计
  const frameworkStats = {};
  const deployStats = {};
  for (const f of updatedFriends) {
    const fw = f.framework || '未知';
    frameworkStats[fw] = (frameworkStats[fw] || 0) + 1;
    const dp = f.deploy || '未知';
    deployStats[dp] = (deployStats[dp] || 0) + 1;
  }

  console.log('\n📊 技术栈分布统计:', frameworkStats);
  console.log('📊 部署方式分布统计:', deployStats);
}

main().catch(err => {
  console.error('探测执行异常:', err);
  process.exit(1);
});
