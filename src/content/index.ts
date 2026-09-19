import '../lib/buffer-polyfill';
import { AdminStore } from '../lib/admin-store';
import type { Diary, FriendItem, Post, RecordItem, SearchItem, SiteConfig } from '../types';
import siteConfigJson from './config/site.config.json';

export const siteConfig: SiteConfig = new Proxy(siteConfigJson as SiteConfig, {
  get(target, prop: keyof SiteConfig) {
    const dynamicConfig = AdminStore.getSiteConfig();
    return (dynamicConfig as any)[prop] ?? (target as any)[prop];
  },
});

export function getAllPosts(includeDrafts = false): Post[] {
  return AdminStore.getPosts(includeDrafts);
}

export function getFeaturedPosts(limit = 4): Post[] {
  return AdminStore.getPosts(false)
    .slice()
    .sort((a: Post, b: Post) => {
      const recA = a.recommend || 0;
      const recB = b.recommend || 0;
      if (recB !== recA) return recB - recA;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

export function getPostBySlug(slug: string): Post | null {
  return AdminStore.getPostBySlug(slug);
}

export function loadPostContent(slug: string): Promise<Post | null> {
  return AdminStore.loadPostContent(slug);
}

export function getAllDiaries(): Diary[] {
  return AdminStore.getDiaries();
}

export function getDiaryBySlug(slug: string): Diary | null {
  return AdminStore.getDiaryBySlug(slug);
}

export function loadDiaryContent(slug: string): Promise<Diary | null> {
  return AdminStore.loadDiaryContent(slug);
}

export function getAllFriends(): FriendItem[] {
  return AdminStore.getFriends();
}

export function getAllRecords(): RecordItem[] {
  return AdminStore.getRecords();
}

export function getAllTags(): { name: string; count: number }[] {
  return AdminStore.getTags();
}

export function getAllCategories(): { name: string; count: number }[] {
  return AdminStore.getCategories();
}

export function getSearchIndex(): SearchItem[] {
  const diaries = AdminStore.getDiaries().map((d: Diary) => ({
    id: `diary-${d.slug}`,
    title: d.title,
    summary: d.summary,
    category: '手记随笔',
    tags: d.tags,
    slug: `/diaries/${d.slug}`,
    type: 'diary' as const,
    date: d.date,
  }));

  return diaries;
}
