import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const siteUrl = 'https://xran.uk';
const siteTitle = '星苒鸭';
const siteDescription = '星苒鸭的个人主页。计算机科学与技术本科生，全栈开发爱好者。技术长文在 blog.xran.uk。';
const socialImage = `${siteUrl}/avatar.jpg`;

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
    title: siteTitle,
    meta: {
      description: siteDescription,
      viewport: 'width=device-width, initial-scale=1.0',
      robots: 'index,follow',
      'twitter:card': 'summary_large_image',
      'twitter:title': siteTitle,
      'twitter:description': siteDescription,
      'twitter:image': socialImage,
    },
    favicon: './public/favicon-32x32.png',
    tags: [
      {
        tag: 'meta',
        attrs: {
          property: 'og:title',
          content: siteTitle,
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:description',
          content: siteDescription,
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:type',
          content: 'website',
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:url',
          content: `${siteUrl}/`,
        },
      },
      {
        tag: 'meta',
        attrs: {
          property: 'og:image',
          content: socialImage,
        },
      },
      {
        tag: 'script',
        attrs: {
          type: 'application/ld+json',
        },
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              url: `${siteUrl}/`,
              name: siteTitle,
              description: siteDescription,
              inLanguage: 'zh-CN',
              publisher: { '@id': `${siteUrl}/#person` },
            },
            {
              '@type': 'Person',
              '@id': `${siteUrl}/#person`,
              name: siteTitle,
              url: `${siteUrl}/`,
              image: socialImage,
              sameAs: [
                'https://blog.xran.uk/',
                'https://github.com/xingranya',
                'https://x.com/xingranya',
                'https://t.me/xingranya',
                'https://space.bilibili.com/357220647',
              ],
            },
          ],
        }),
      },
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
          rel: 'stylesheet',
          href: '/fonts/misans/misans-optimized.css',
          media: 'print',
          onload: "this.media='all'",
        },
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
    // 主页只有一份约 18 KiB gzip 的关键样式，直接内联可省去首屏阻塞请求。
    inlineStyles: true,
    distPath: {
      root: 'dist',
    },
  },
});
