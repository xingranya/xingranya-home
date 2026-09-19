import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: '星苒鸭',
    meta: {
      description: '星苒鸭的个人主页。计算机科学与技术本科生，全栈开发爱好者。技术长文在 blog.xran.uk。',
      viewport: 'width=device-width, initial-scale=1.0',
      'og:image': 'https://xran.uk/avatar.jpg',
      'og:type': 'website',
      'twitter:image': 'https://xran.uk/avatar.jpg',
      'twitter:card': 'summary_large_image',
    },
    favicon: './public/favicon.ico',
    tags: [
      {
        tag: 'link',
        attrs: {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'manifest',
          href: '/site.webmanifest',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://cdn.jsdelivr.net',
          crossorigin: true,
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/misans-webfont/misans-style.css',
          // 非阻塞加载，避免字体 CSS 卡住首屏
          media: 'print',
          onload: "this.media='all'",
        },
      },
      {
        tag: 'noscript',
        children:
          '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/misans-webfont/misans-style.css">',
        append: true,
      },
      {
        tag: 'link',
        attrs: {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: '星苒鸭 - RSS 订阅源',
          href: '/feed.xml',
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            test: /\.md$/,
            type: 'asset/source',
          },
        ],
      },
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});
