import type { AboutProject, Diary, FriendItem, Post, RecordItem, SearchItem, SiteConfig } from '../types';
import siteConfigJson from './config/site.config.json';
import projectsJson from './pages/projects.json';
import friendsJson from './pages/friends.json';
import recordsJson from './records/records.json';
import publicIndex from './generated/public-index.json';

export interface ContentSnapshot {
  now: number;
  diary?: Diary;
}

let snapshot: ContentSnapshot = { now: Date.parse(publicIndex.generatedAt) };
let localStore: typeof import('../lib/admin-store').AdminStore | undefined;
const diaryCache = new Map<string, Diary>();

export function setContentSnapshot(value: ContentSnapshot) {
  snapshot = value;
  diaryCache.clear();
  if (value.diary) diaryCache.set(value.diary.slug, value.diary);
}

export function getSnapshotTime() { return snapshot.now; }

// 仅本地开发或后台入口注入编辑能力；公开页面使用构建数据。
export function setLocalContentStore(store: NonNullable<typeof localStore>) { localStore = store; }

export const siteConfig: SiteConfig = new Proxy(siteConfigJson as SiteConfig, {
  get(target, prop: keyof SiteConfig) {
    return localStore ? localStore.getSiteConfig()[prop] : target[prop];
  },
});

export function getAllPosts(includeDrafts = false): Post[] { return localStore?.getPosts(includeDrafts) ?? []; }
export function getFeaturedPosts(limit = 4): Post[] { return getAllPosts().slice(0, limit); }
export function getPostBySlug(slug: string): Post | null { return localStore?.getPostBySlug(slug) ?? null; }
export async function loadPostContent(slug: string): Promise<Post | null> { return localStore?.loadPostContent(slug) ?? null; }

export function getAllDiaries(): Diary[] {
  const diaries = localStore?.getDiaries() ?? publicIndex.diaries.map((meta) => ({ ...meta, content: '' }));
  return diaries.filter((diary) => !diary.draft);
}

export function getDiaryBySlug(slug: string): Diary | null {
  return diaryCache.get(slug) ?? getAllDiaries().find((diary) => diary.slug === slug) ?? null;
}

export async function loadDiaryContent(slug: string): Promise<Diary | null> {
  if (localStore) return localStore.loadDiaryContent(slug);
  const diary = getDiaryBySlug(slug);
  if (!diary || diary.content) return diary;
  const response = await fetch(`/content/diaries/${encodeURIComponent(slug)}.json`);
  if (!response.ok) throw new Error('手记暂时无法加载，请稍后重试。');
  const body = await response.json() as { content: string };
  const full: Diary = { ...diary, content: body.content };
  diaryCache.set(slug, full);
  return full;
}

export function getAllFriends(): FriendItem[] { return localStore?.getFriends() ?? friendsJson as FriendItem[]; }
export function getProjects(): AboutProject[] { return projectsJson as AboutProject[]; }
export function getAllRecords(): RecordItem[] { return localStore?.getRecords() ?? recordsJson as RecordItem[]; }

export function getAllTags(): { name: string; count: number }[] {
  const tags = new Map<string, number>();
  for (const diary of getAllDiaries()) for (const tag of diary.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  return [...tags].map(([name, count]) => ({ name, count }));
}

export function getAllCategories(): { name: string; count: number }[] {
  return localStore?.getCategories() ?? [];
}

export function getSearchIndex(): SearchItem[] {
  return getAllDiaries().filter((diary) => diary.indexable !== false).map((diary) => ({
    id: `diary-${diary.slug}`, title: diary.title, summary: diary.summary,
    category: '手记随笔', tags: diary.tags, slug: `/diaries/${diary.slug}`,
    type: 'diary', date: diary.date,
  }));
}
