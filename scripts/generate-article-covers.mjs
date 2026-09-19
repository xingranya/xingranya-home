import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.resolve('src/content/posts');
const COVERS_DIR = path.resolve('public/covers');

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

// 预定义技术主题配色系统
const THEMES = {
  react: {
    bg1: '#0B132B',
    bg2: '#1C2541',
    accent1: '#00D8FF',
    accent2: '#38BDF8',
    glow: 'rgba(0, 216, 255, 0.25)',
    category: 'FRONTEND ARCHITECTURE',
    badge: 'React 19 & Next.js',
    shape: 'react',
  },
  rust: {
    bg1: '#1A0B05',
    bg2: '#2D1409',
    accent1: '#F97316',
    accent2: '#FBBF24',
    glow: 'rgba(249, 115, 22, 0.25)',
    category: 'SYSTEM PROGRAMMING',
    badge: 'Rust Ecosystem',
    shape: 'rust',
  },
  golang: {
    bg1: '#0A192F',
    bg2: '#0F2C4C',
    accent1: '#00ADD8',
    accent2: '#67E8F9',
    glow: 'rgba(0, 173, 216, 0.25)',
    category: 'BACKEND ARCHITECTURE',
    badge: 'Go Systems',
    shape: 'golang',
  },
  k8s: {
    bg1: '#071330',
    bg2: '#0C2340',
    accent1: '#326CE5',
    accent2: '#60A5FA',
    glow: 'rgba(50, 108, 229, 0.3)',
    category: 'CLOUD NATIVE & DEVOPS',
    badge: 'Kubernetes Platform',
    shape: 'k8s',
  },
  ai: {
    bg1: '#150A2A',
    bg2: '#26114A',
    accent1: '#A855F7',
    accent2: '#EC4899',
    glow: 'rgba(168, 85, 247, 0.3)',
    category: 'AI & MACHINE LEARNING',
    badge: 'Neural Systems',
    shape: 'neural',
  },
  database: {
    bg1: '#061C18',
    bg2: '#0C352E',
    accent1: '#10B981',
    accent2: '#34D399',
    glow: 'rgba(16, 185, 129, 0.28)',
    category: 'DATABASE & STORAGE',
    badge: 'High Performance DB',
    shape: 'database',
  },
  security: {
    bg1: '#180B15',
    bg2: '#2B1224',
    accent1: '#F43F5E',
    accent2: '#FB7185',
    glow: 'rgba(244, 63, 94, 0.28)',
    category: 'SECURITY & NETWORK',
    badge: 'Zero Trust & Infosec',
    shape: 'security',
  },
  distributed: {
    bg1: '#0F172A',
    bg2: '#1E293B',
    accent1: '#6366F1',
    accent2: '#818CF8',
    glow: 'rgba(99, 102, 241, 0.28)',
    category: 'DISTRIBUTED SYSTEMS',
    badge: 'Consensus & Scale',
    shape: 'distributed',
  },
  web: {
    bg1: '#0B1528',
    bg2: '#162846',
    accent1: '#0284C7',
    accent2: '#38BDF8',
    glow: 'rgba(2, 132, 199, 0.28)',
    category: 'WEB ENGINEERING',
    badge: 'Modern Web Spec',
    shape: 'web',
  },
};

// 根据文章 slug、标签、分类匹配最契合的设计主题
function matchTheme(post) {
  const text = `${post.slug} ${post.title} ${(post.tags || []).join(' ')} ${post.category}`.toLowerCase();
  if (text.includes('react') || text.includes('next.js') || text.includes('solidjs') || text.includes('tailwind') || text.includes('css')) return THEMES.react;
  if (text.includes('rust') || text.includes('actix') || text.includes('axum')) return THEMES.rust;
  if (text.includes('go') || text.includes('golang') || text.includes('grpc')) return THEMES.golang;
  if (text.includes('k8s') || text.includes('kubernetes') || text.includes('istio') || text.includes('gitops') || text.includes('nginx') || text.includes('serverless') || text.includes('opentelemetry') || text.includes('jaeger')) return THEMES.k8s;
  if (text.includes('ai') || text.includes('llm') || text.includes('pytorch') || text.includes('deep-learning') || text.includes('rag')) return THEMES.ai;
  if (text.includes('postgres') || text.includes('mongo') || text.includes('clickhouse') || text.includes('redis') || text.includes('shard') || text.includes('sql') || text.includes('database')) return THEMES.database;
  if (text.includes('security') || text.includes('oauth') || text.includes('zero-trust') || text.includes('ebpf') || text.includes('xss') || text.includes('injection')) return THEMES.security;
  if (text.includes('distributed') || text.includes('raft') || text.includes('transaction') || text.includes('kafka') || text.includes('microservice') || text.includes('cache')) return THEMES.distributed;
  return THEMES.web;
}

// 针对不同技术形状生成高精度 SVG 艺术徽标
function generateArtShape(shapeType, accent1, accent2) {
  switch (shapeType) {
    case 'react':
      return `
        <g transform="translate(1180, 450)">
          <!-- React 环形多维轨道 -->
          <ellipse rx="220" ry="85" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.85" transform="rotate(30)"/>
          <ellipse rx="220" ry="85" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.85" transform="rotate(90)"/>
          <ellipse rx="220" ry="85" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.85" transform="rotate(150)"/>
          <circle r="26" fill="${accent1}" opacity="0.95" filter="url(#glowFilter)"/>
          <circle r="14" fill="#FFFFFF"/>
          <!-- 外层光晕环 -->
          <circle r="270" fill="none" stroke="${accent2}" stroke-width="1" stroke-dasharray="4 8" opacity="0.4"/>
        </g>
      `;
    case 'rust':
      return `
        <g transform="translate(1180, 450)">
          <!-- Rust 科技齿轮与晶格 -->
          <circle r="180" fill="none" stroke="${accent1}" stroke-width="3" opacity="0.75"/>
          <circle r="130" fill="none" stroke="${accent2}" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.6"/>
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
            <rect x="-18" y="-210" width="36" height="40" rx="6" fill="${accent1}" opacity="0.85" transform="rotate(${deg})" />
          `).join('')}
          <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" fill="none" stroke="${accent2}" stroke-width="3"/>
          <circle r="28" fill="${accent1}" opacity="0.9" filter="url(#glowFilter)"/>
        </g>
      `;
    case 'k8s':
      return `
        <g transform="translate(1180, 450)">
          <!-- Kubernetes 舵轮与集群蜂窝拓扑 -->
          <circle r="210" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.8"/>
          <circle r="140" fill="none" stroke="${accent2}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>
          ${[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map(deg => `
            <line x1="0" y1="0" x2="0" y2="-210" stroke="${accent1}" stroke-width="3.5" transform="rotate(${deg})" />
            <circle cx="0" cy="-210" r="14" fill="${accent2}" transform="rotate(${deg})" filter="url(#glowFilter)"/>
          `).join('')}
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="${accent1}" opacity="0.85"/>
          <circle r="16" fill="#FFFFFF"/>
        </g>
      `;
    case 'ai':
      return `
        <g transform="translate(1180, 450)">
          <!-- AI 神经网络与张量晶体 -->
          <circle r="230" fill="none" stroke="${accent1}" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.4"/>
          <!-- 多层神经元互联 -->
          <polygon points="0,-160 140,-80 140,80 0,160 -140,80 -140,-80" fill="none" stroke="${accent2}" stroke-width="2" opacity="0.75"/>
          <polygon points="0,-100 90,-50 90,50 0,100 -90,50 -90,-50" fill="none" stroke="${accent1}" stroke-width="2.5" opacity="0.9"/>
          ${[
            [0, -160], [140, -80], [140, 80], [0, 160], [-140, 80], [-140, -80],
            [0, -100], [90, -50], [90, 50], [0, 100], [-90, 50], [-90, -50], [0, 0]
          ].map(([x, y]) => `
            <circle cx="${x}" cy="${y}" r="8" fill="${accent1}" filter="url(#glowFilter)"/>
            <circle cx="${x}" cy="${y}" r="4" fill="#FFFFFF"/>
          `).join('')}
        </g>
      `;
    case 'database':
      return `
        <g transform="translate(1180, 450)">
          <!-- 数据库层叠列式柱与存储磁盘 -->
          ${[
            { y: -100, rx: 170, ry: 45 },
            { y: -30, rx: 170, ry: 45 },
            { y: 40, rx: 170, ry: 45 },
            { y: 110, rx: 170, ry: 45 },
          ].map((d, idx) => `
            <g transform="translate(0, ${d.y})">
              <ellipse rx="${d.rx}" ry="${d.ry}" fill="${idx === 0 ? accent1 : 'none'}" fill-opacity="0.25" stroke="${accent1}" stroke-width="3" opacity="0.9"/>
              <line x1="-${d.rx}" y1="0" x2="-${d.rx}" y2="35" stroke="${accent1}" stroke-width="3"/>
              <line x1="${d.rx}" y1="0" x2="${d.rx}" y2="35" stroke="${accent1}" stroke-width="3"/>
              <ellipse cy="35" rx="${d.rx}" ry="${d.ry}" fill="none" stroke="${accent1}" stroke-width="3"/>
            </g>
          `).join('')}
          <circle cx="0" cy="-100" r="14" fill="${accent2}" filter="url(#glowFilter)"/>
        </g>
      `;
    case 'security':
      return `
        <g transform="translate(1180, 450)">
          <!-- 零信任密码盾牌与防御环 -->
          <circle r="230" fill="none" stroke="${accent2}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.4"/>
          <!-- 盾牌外轮廓 -->
          <path d="M0,-170 L140,-100 L140,50 C140,140 0,200 0,200 C0,200 -140,140 -140,50 L-140,-100 Z" fill="none" stroke="${accent1}" stroke-width="3.5" opacity="0.85"/>
          <path d="M0,-120 L95,-70 L95,35 C95,100 0,145 0,145 C0,145 -95,100 -95,35 L-95,-70 Z" fill="${accent1}" fill-opacity="0.18" stroke="${accent2}" stroke-width="2"/>
          <circle cx="0" cy="0" r="32" fill="${accent1}" opacity="0.9" filter="url(#glowFilter)"/>
          <circle cx="0" cy="0" r="12" fill="#FFFFFF"/>
        </g>
      `;
    case 'distributed':
    default:
      return `
        <g transform="translate(1180, 450)">
          <!-- 分布式系统共识拓扑网格 -->
          <circle r="210" fill="none" stroke="${accent1}" stroke-width="1.5" stroke-dasharray="10 6" opacity="0.5"/>
          <polygon points="0,-160 160,0 0,160 -160,0" fill="none" stroke="${accent2}" stroke-width="2.5" opacity="0.8"/>
          <polygon points="0,-90 90,0 0,90 -90,0" fill="${accent1}" fill-opacity="0.2" stroke="${accent1}" stroke-width="2"/>
          ${[
            [0, -160], [160, 0], [0, 160], [-160, 0],
            [0, -90], [90, 0], [0, 90], [-90, 0], [0, 0]
          ].map(([x, y]) => `
            <circle cx="${x}" cy="${y}" r="9" fill="${accent1}" filter="url(#glowFilter)"/>
            <circle cx="${x}" cy="${y}" r="4" fill="#FFFFFF"/>
          `).join('')}
        </g>
      `;
  }
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 生成单篇 16:9 出版级矢量封面 SVG
function generateCoverSvg(post) {
  const theme = matchTheme(post);
  const rawTagsStr = (post.tags || []).slice(0, 3).join('  ·  ');
  const tagsStr = escapeXml(rawTagsStr || post.category);
  const categoryStr = escapeXml(theme.category);
  const safeTitle = escapeXml(post.title);

  // 分割标题为双行（如果过长）
  let titleLine1 = safeTitle;
  let titleLine2 = '';
  if (post.title.length > 18) {
    const mid = Math.ceil(post.title.length / 2);
    const splitIndex = post.title.indexOf(' ', mid - 5) !== -1 
      ? post.title.indexOf(' ', mid - 5) 
      : post.title.indexOf('：', 6) !== -1 
        ? post.title.indexOf('：', 6) + 1 
        : mid;
    titleLine1 = escapeXml(post.title.slice(0, splitIndex).trim());
    titleLine2 = escapeXml(post.title.slice(splitIndex).trim());
  }

  const artShape = generateArtShape(theme.shape, theme.accent1, theme.accent2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" style="background:${theme.bg1};">
  <defs>
    <!-- 背景流光与径向渐变 -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="60%" stop-color="${theme.bg2}" />
      <stop offset="100%" stop-color="${theme.bg1}" />
    </linearGradient>

    <radialGradient id="glowRadial" cx="75%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.accent1}" stop-opacity="0.35" />
      <stop offset="60%" stop-color="${theme.accent2}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${theme.accent1}" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="cornerGlow" cx="15%" cy="20%" r="40%">
      <stop offset="0%" stop-color="${theme.accent2}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${theme.accent2}" stop-opacity="0" />
    </radialGradient>

    <!-- 粒子光晕滤镜 -->
    <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- 32px 科技网格纹理图案 -->
    <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1"/>
      <circle cx="40" cy="0" r="1.5" fill="rgba(255, 255, 255, 0.08)"/>
    </pattern>
  </defs>

  <!-- 1. 背景层 -->
  <rect width="1600" height="900" fill="url(#bgGrad)"/>
  <rect width="1600" height="900" fill="url(#techGrid)"/>
  <rect width="1600" height="900" fill="url(#glowRadial)"/>
  <rect width="1600" height="900" fill="url(#cornerGlow)"/>

  <!-- 2. 精致极简边框与刻度装饰 -->
  <rect x="50" y="50" width="1500" height="800" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5"/>
  <rect x="65" y="65" width="1470" height="770" rx="10" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" stroke-dasharray="8 8"/>

  <!-- 四角标尺十字线 -->
  <g stroke="${theme.accent1}" stroke-width="2" opacity="0.65">
    <path d="M 40 60 L 60 60 M 60 40 L 60 60" />
    <path d="M 1560 60 L 1540 60 M 1540 40 L 1540 60" />
    <path d="M 40 840 L 60 840 M 60 860 L 60 840" />
    <path d="M 1560 840 L 1540 840 M 1540 860 L 1540 840" />
  </g>

  <!-- 3. 右侧核心科技矢量艺术插画 -->
  ${artShape}

  <!-- 4. 左侧文章出版级信息与标题排版 -->
  <g transform="translate(120, 150)">
    <!-- 顶部徽章胶囊与分类 -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="220" height="38" rx="6" fill="${theme.accent1}" fill-opacity="0.15" stroke="${theme.accent1}" stroke-width="1.5" stroke-opacity="0.7"/>
      <circle cx="20" cy="19" r="4.5" fill="${theme.accent1}"/>
      <text x="36" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${theme.accent1}" letter-spacing="1.5">${categoryStr}</text>
    </g>

    <text x="240" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="rgba(255,255,255,0.45)" letter-spacing="2">XRAN.UK ARCHITECTURE SERIES</text>

    <!-- 中文主标题 -->
    <g transform="translate(0, 160)">
      ${titleLine2 ? `
        <text x="0" y="0" font-family="'MiSans', 'PingFang SC', -apple-system, sans-serif" font-size="54" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">${titleLine1}</text>
        <text x="0" y="76" font-family="'MiSans', 'PingFang SC', -apple-system, sans-serif" font-size="54" font-weight="800" fill="#F1F5F9" letter-spacing="-0.5">${titleLine2}</text>
      ` : `
        <text x="0" y="30" font-family="'MiSans', 'PingFang SC', -apple-system, sans-serif" font-size="56" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">${titleLine1}</text>
      `}
    </g>

    <!-- 装饰分隔标尺 -->
    <g transform="translate(0, 360)">
      <line x1="0" y1="0" x2="160" y2="0" stroke="${theme.accent1}" stroke-width="3" opacity="0.9"/>
      <line x1="170" y1="0" x2="680" y2="0" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    </g>

    <!-- 标签与技术栈标记 -->
    <g transform="translate(0, 420)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="${theme.accent2}" opacity="0.95" letter-spacing="1">TAGS: ${tagsStr}</text>
      <text x="0" y="36" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.4)" letter-spacing="1.2">SYSTEM / ARCHITECTURE / CLOUD-NATIVE / ENGINEERING</text>
    </g>

    <!-- 底部品牌与作者水印 -->
    <g transform="translate(0, 540)">
      <circle cx="12" cy="12" r="10" fill="none" stroke="${theme.accent1}" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="${theme.accent1}"/>
      <text x="32" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#FFFFFF" letter-spacing="2">XRAN.UK</text>
      <text x="140" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="rgba(255,255,255,0.4)">· 星苒 深度工程技术文稿</text>
    </g>
  </g>
</svg>`;
}

// 主执行函数：为所有 50 篇文章生成专属封面并更新 markdown frontmatter
function run() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} posts. Generating covers...`);

  let count = 0;
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    const slug = file.replace(/\.md$/, '');
    const post = {
      file,
      slug,
      title: data.title || slug,
      category: data.category || (Array.isArray(data.categories) ? data.categories[0] : '技术文章'),
      tags: data.tags || [],
    };

    // 1. 生成高精矢量 SVG 封面文件
    const coverSvg = generateCoverSvg(post);
    const coverFileName = `${slug}.svg`;
    const coverFilePath = path.join(COVERS_DIR, coverFileName);
    fs.writeFileSync(coverFilePath, coverSvg, 'utf-8');

    // 2. 更新 Markdown frontmatter 中的 cover / coverImage / images 链接
    const newCoverUrl = `/covers/${coverFileName}`;
    data.cover = newCoverUrl;
    data.coverImage = newCoverUrl;
    data.images = [newCoverUrl];

    const updatedRaw = matter.stringify(content, data);
    fs.writeFileSync(filePath, updatedRaw, 'utf-8');
    count++;
  }

  console.log(`Successfully generated ${count} bespoke modern vector covers and updated frontmatters!`);
}

run();
