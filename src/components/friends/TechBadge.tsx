import React, { useState } from 'react';
import { Code2, Cloud } from 'lucide-react';

interface TechBadgeProps {
  type: 'framework' | 'deploy';
  name?: string;
  className?: string;
}

// 统一的 SVG 图标定义
const ICONS: Record<string, { label: string; svg: React.ReactNode }> = {
  // --- 技术栈 / Frameworks ---
  astro: {
    label: 'Astro',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4 19L11.5 3.5a1 1 0 0 1 1.8 0L20 19" />
        <path d="M7 14h10" />
        <path d="M12 11v3" />
      </svg>
    ),
  },
  hexo: {
    label: 'Hexo',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2.5L3.5 7.5v9L12 21.5l8.5-5v-9L12 2.5z" />
        <path d="M8.5 8.5v7" />
        <path d="M15.5 8.5v7" />
        <path d="M8.5 12h7" />
      </svg>
    ),
  },
  hugo: {
    label: 'Hugo',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 7v10" />
        <path d="M16 7v10" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  nextjs: {
    label: 'Next.js',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M9 8.5v7" />
        <path d="M15 15.5l-6-7" />
        <path d="M15 8.5v3" />
      </svg>
    ),
  },
  nuxtjs: {
    label: 'Nuxt',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M2.5 18.5L9.5 6.5l7 12h-14z" />
        <path d="M12.5 18.5l4.5-7.5 4.5 7.5h-9z" />
      </svg>
    ),
  },
  vuepress: {
    label: 'VuePress',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 4.5l9 15 9-15h-4.5L12 12 7.5 4.5H3z" />
      </svg>
    ),
  },
  vitepress: {
    label: 'VitePress',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M13 2.5L3.5 13.5h7L9 21.5l11.5-12h-7.5L13 2.5z" />
      </svg>
    ),
  },
  wordpress: {
    label: 'WordPress',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M4 12l5.5 8L12 13l2.5 7L20 12" />
        <path d="M7 6.5l5 13.5" />
        <path d="M17 6.5l-3.5 9.5" />
      </svg>
    ),
  },
  typecho: {
    label: 'Typecho',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
        <path d="M8 8.5h8" />
        <path d="M12 8.5v7" />
      </svg>
    ),
  },
  halo: {
    label: 'Halo',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    ),
  },
  react: {
    label: 'React',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <ellipse cx="12" cy="12" rx="3.5" ry="9" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="3.5" ry="9" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="3.5" ry="9" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  vue: {
    label: 'Vue',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 4.5l9 15 9-15h-4.5L12 12 7.5 4.5H3z" />
        <path d="M7 4.5L12 13l5-8.5" />
      </svg>
    ),
  },
  svelte: {
    label: 'Svelte',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M17.5 7.5c-1-1.5-3-2.5-5.5-2.5-3.3 0-6 2-6 4.5 0 3 2.5 4 5 5 2.5 1 5 2 5 4.5 0 2.5-2.7 4.5-6 4.5-2.5 0-4.5-1-5.5-2.5" />
      </svg>
    ),
  },
  jekyll: {
    label: 'Jekyll',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 3v9" />
        <path d="M8 8a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0" />
        <path d="M7 16a5 5 0 0 0 10 0v-4" />
      </svg>
    ),
  },
  gatsby: {
    label: 'Gatsby',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M16.5 8.5A6.5 6.5 0 1 0 18.5 12h-6.5" />
      </svg>
    ),
  },
  ghost: {
    label: 'Ghost',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v11l3-2 3 2 2-2 2 2 3-2 3 2V10a8 8 0 0 0-8-8z" />
      </svg>
    ),
  },
  docusaurus: {
    label: 'Docusaurus',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12c1.5-2 3.5-3 6-3v6c-2.5 0-4.5-1-6-3z" />
      </svg>
    ),
  },
  mixspace: {
    label: 'Mix Space',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="8" cy="6" r="1.5" fill="currentColor" />
        <circle cx="16" cy="12" r="1.5" fill="currentColor" />
        <circle cx="10" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },

  // --- 部署方式 / Deploy Platforms ---
  cloudflare: {
    label: 'Cloudflare',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M17.5 19H6.2a4.7 4.7 0 0 1-1.2-9.2A6 6 0 0 1 16.5 7a5 5 0 0 1 4.9 5.8 4.2 4.2 0 0 1-3.9 6.2z" />
        <path d="M14 16l3-3-3-3" />
      </svg>
    ),
  },
  vercel: {
    label: 'Vercel',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 3.5l9 16.5H3L12 3.5z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 3.5l9 16.5H3L12 3.5z" />
      </svg>
    ),
  },
  netlify: {
    label: 'Netlify',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 3l9 9-9 9-9-9 9-9z" />
        <path d="M12 8l4 4-4 4-4-4 4-4z" />
      </svg>
    ),
  },
  github: {
    label: 'GitHub Pages',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  tencent: {
    label: '腾讯云 (EdgeOne/COS)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 12a9 9 0 0 1 15.3-6.4M21 12a9 9 0 0 1-15.3 6.4" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  aliyun: {
    label: '阿里云 (OSS/CDN)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M7 6h10a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z" />
        <path d="M10 10l4 4M14 10l-4 4" />
      </svg>
    ),
  },
  zeabur: {
    label: 'Zeabur',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4 6h16L8 18h12" />
      </svg>
    ),
  },
  render: {
    label: 'Render',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M6 19V5h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6" />
        <path d="M12 13l5 6" />
      </svg>
    ),
  },
  railway: {
    label: 'Railway',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4 15l8-10 8 10H4z" />
        <path d="M9 15v4h6v-4" />
      </svg>
    ),
  },
  aws: {
    label: 'AWS (CloudFront/S3)',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M5 16c4 3 10 3 14 0" />
        <path d="M17 14l2 2-2 2" />
        <path d="M6 10l3-5 3 5M7.2 8h3.6" />
      </svg>
    ),
  },
  vps: {
    label: '独立服务器 / VPS / Nginx',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="18" height="6" rx="2" />
        <circle cx="6.5" cy="7" r="1" fill="currentColor" />
        <circle cx="6.5" cy="17" r="1" fill="currentColor" />
      </svg>
    ),
  },
  docker: {
    label: 'Docker 容器',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M4 14h16c.5 0 1-.5 1-1a6 6 0 0 0-11.5-2.2A4.5 4.5 0 0 0 4 13c0 .5.5 1 1 1z" />
        <path d="M7 10h2v2H7zM10 10h2v2h-2zM13 10h2v2h-2zM10 7h2v2h-2zM13 7h2v2h-2z" />
      </svg>
    ),
  },
};

// 规范化名称匹配
function normalizeKey(key?: string): string {
  if (!key) return '';
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('astro')) return 'astro';
  if (clean.includes('hexo')) return 'hexo';
  if (clean.includes('hugo')) return 'hugo';
  if (clean.includes('next')) return 'nextjs';
  if (clean.includes('nuxt')) return 'nuxtjs';
  if (clean.includes('vitepress')) return 'vitepress';
  if (clean.includes('vuepress')) return 'vuepress';
  if (clean.includes('wordpress') || clean.includes('wp')) return 'wordpress';
  if (clean.includes('typecho')) return 'typecho';
  if (clean.includes('halo')) return 'halo';
  if (clean.includes('react')) return 'react';
  if (clean.includes('vue')) return 'vue';
  if (clean.includes('svelte')) return 'svelte';
  if (clean.includes('jekyll')) return 'jekyll';
  if (clean.includes('gatsby')) return 'gatsby';
  if (clean.includes('ghost')) return 'ghost';
  if (clean.includes('docusaurus')) return 'docusaurus';
  if (clean.includes('mixspace') || clean.includes('shiro')) return 'mixspace';

  if (clean.includes('cloudflare') || clean.includes('cf')) return 'cloudflare';
  if (clean.includes('vercel')) return 'vercel';
  if (clean.includes('netlify')) return 'netlify';
  if (clean.includes('github') || clean.includes('ghpages')) return 'github';
  if (clean.includes('tencent') || clean.includes('edgeone') || clean.includes('cos') || clean.includes('eo')) return 'tencent';
  if (clean.includes('aliyun') || clean.includes('oss') || clean.includes('alibaba')) return 'aliyun';
  if (clean.includes('zeabur')) return 'zeabur';
  if (clean.includes('render')) return 'render';
  if (clean.includes('railway')) return 'railway';
  if (clean.includes('aws') || clean.includes('cloudfront') || clean.includes('s3')) return 'aws';
  if (clean.includes('vps') || clean.includes('nginx') || clean.includes('server') || clean.includes('selfhosted')) return 'vps';
  if (clean.includes('docker')) return 'docker';

  return clean;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ type, name, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const normalized = normalizeKey(name);
  const match = ICONS[normalized];

  const prefix = type === 'framework' ? '技术栈' : '部署';
  const label = match ? `${prefix}: ${match.label}` : name ? `${prefix}: ${name}` : `${prefix}: 未知`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center p-0.5 rounded-sm"
        aria-label={label}
      >
        {match ? (
          match.svg
        ) : type === 'framework' ? (
          <Code2 className="w-3.5 h-3.5" />
        ) : (
          <Cloud className="w-3.5 h-3.5" />
        )}
      </div>

      {/* 精致 Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap bg-slate-900/90 text-white dark:bg-slate-100/95 dark:text-slate-900 shadow-md backdrop-blur-sm pointer-events-none z-30 transition-all">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-900/90 dark:border-t-slate-100/95" />
        </div>
      )}
    </div>
  );
};
