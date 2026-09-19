import type { Diary, FriendItem, Post, RecordComment, RecordItem, SiteConfig, TOCItem } from '../types';
import siteConfigInitial from '../content/config/site.config.json';
import friendsInitial from '../content/pages/friends.json';
import recordsInitial from '../content/records/records.json';
import contentIndex from '../content/generated/content-index.json';
import { postLoaders, diaryLoaders } from '../content/generated/content-loaders';
import { calculateReadingTime, extractTOC, parseDiaryFile, parseMarkdownFile } from './markdown';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  category: string;
  readingTime: string;
  wordCount: number;
  toc: TOCItem[];
  draft: boolean;
  coverImage?: string;
  recommend: number;
}

interface DiaryMeta {
  slug: string;
  title: string;
  date: string;
  time?: string;
  weather?: string;
  mood?: string;
  location?: string;
  tags: string[];
  summary: string;
  readingTime: string;
  wordCount: number;
}

// 构建期元数据索引：正文按需动态 import，避免全量 Markdown 打进主包
const defaultPosts: Post[] = (contentIndex.posts as PostMeta[]).map((meta) => ({
  slug: meta.slug,
  title: meta.title,
  date: meta.date,
  summary: meta.summary,
  tags: meta.tags,
  category: meta.category,
  readingTime: meta.readingTime,
  wordCount: meta.wordCount,
  toc: meta.toc,
  content: '',
  draft: meta.draft,
  coverImage: meta.coverImage,
  recommend: meta.recommend,
}));

const defaultDiaries: Diary[] = (contentIndex.diaries as DiaryMeta[]).map((meta) => ({
  slug: meta.slug,
  title: meta.title,
  date: meta.date,
  time: meta.time || '',
  weather: meta.weather || '晴',
  mood: meta.mood || '平静',
  location: meta.location || '书房',
  tags: meta.tags,
  summary: meta.summary,
  content: '',
  readingTime: meta.readingTime,
  wordCount: meta.wordCount,
}));

const contentLoadPromises = new Map<string, Promise<void>>();

function hasFullContent(content: string | undefined): boolean {
  return typeof content === 'string' && content.trim().length > 0;
}

const defaultFriends: FriendItem[] = (friendsInitial as unknown[]).map((item: any) => ({
  id: item.id || Math.random().toString(36).slice(2, 9),
  name: item.name || '',
  desc: item.desc || '',
  avatar: item.avatar || '',
  link: item.link || '',
  order: item.order || 999,
  framework: item.framework || '',
  deploy: item.deploy || '',
  tags: item.tags || [],
}));

const defaultRecords: RecordItem[] = recordsInitial as RecordItem[];
const defaultSiteConfig: SiteConfig = siteConfigInitial as SiteConfig;

export interface ActivityLog {
  id: string;
  type: 'post' | 'diary' | 'record' | 'friend' | 'system' | 'setting';
  action: 'create' | 'update' | 'delete' | 'backup' | 'restore';
  title: string;
  description: string;
  timestamp: number;
}

export interface TrashItem {
  id: string;
  type: 'post' | 'diary' | 'record' | 'friend';
  title: string;
  data: any;
  deletedAt: number;
}

export interface EditorDraft {
  id: string;
  type: 'post' | 'diary';
  slug?: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  recommend?: number;
  draft?: boolean;
  weather?: string;
  mood?: string;
  location?: string;
  time?: string;
  savedAt: number;
}

const STORAGE_KEYS = {
  POSTS: 'cot_posts_data_v2',
  DIARIES: 'cot_diaries_data_v2',
  RECORDS: 'cot_records_data_v2',
  FRIENDS: 'cot_friends_data_v3',
  CONFIG: 'cot_site_config_v3',
  LOGS: 'cot_activity_logs_v2',
  PREFERENCES: 'cot_admin_prefs_v2',
  TRASH: 'cot_trash_bin_v2',
  DRAFTS: 'cot_editor_drafts_v2',
};

export interface AdminPreferences {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'blue' | 'emerald' | 'violet' | 'amber';
  editorFontSize: number;
  sidebarCollapsed: boolean;
  autoSaveDraft: boolean;
}

const defaultPreferences: AdminPreferences = {
  theme: 'system',
  accentColor: 'blue',
  editorFontSize: 14,
  sidebarCollapsed: false,
  autoSaveDraft: true,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('[AdminStore] Listener execution error:', e);
    }
  });
}

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch (e) {
    console.error(`[AdminStore] Failed to load key: ${key}`, e);
    return fallback;
  }
}

function safeSave<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[AdminStore] Failed to save key: ${key}`, e);
  }
}

function deepMerge<T>(defaultObj: T, loadedObj: any): T {
  if (!loadedObj || typeof loadedObj !== 'object') return defaultObj;
  if (!defaultObj || typeof defaultObj !== 'object') return loadedObj;

  const result: any = Array.isArray(defaultObj) ? [...defaultObj] : { ...defaultObj };

  for (const key of Object.keys(loadedObj)) {
    const srcVal = loadedObj[key];
    const defVal = (defaultObj as any)[key];

    if (srcVal !== undefined && srcVal !== null) {
      if (Array.isArray(srcVal)) {
        result[key] = srcVal;
      } else if (typeof srcVal === 'object' && typeof defVal === 'object' && defVal !== null && !Array.isArray(defVal)) {
        result[key] = deepMerge(defVal, srcVal);
      } else {
        result[key] = srcVal;
      }
    }
  }

  // 保证默认对象中新增的顶层或嵌套字段不会因 loadedObj 缺失而丢失
  for (const key of Object.keys(defaultObj as any)) {
    if (result[key] === undefined) {
      result[key] = (defaultObj as any)[key];
    }
  }

  return result as T;
}

// 内存中活跃数据：对 posts 自动确保封面有效
const loadedPosts = safeLoad<Post[]>(STORAGE_KEYS.POSTS, defaultPosts);
const sanitizedPosts = loadedPosts.map((p) => ({
  ...p,
  coverImage: p.coverImage?.startsWith('/covers/') ? p.coverImage : `/covers/${p.slug}.svg`,
}));

let currentPosts: Post[] = sanitizedPosts;
let currentDiaries: Diary[] = safeLoad<Diary[]>(STORAGE_KEYS.DIARIES, defaultDiaries);
let currentRecords: RecordItem[] = safeLoad<RecordItem[]>(STORAGE_KEYS.RECORDS, defaultRecords);
let currentFriends: FriendItem[] = safeLoad<FriendItem[]>(STORAGE_KEYS.FRIENDS, defaultFriends);
let currentSiteConfig: SiteConfig = deepMerge<SiteConfig>(
  defaultSiteConfig,
  safeLoad<Partial<SiteConfig>>(STORAGE_KEYS.CONFIG, {})
);
let currentLogs: ActivityLog[] = safeLoad<ActivityLog[]>(STORAGE_KEYS.LOGS, [
  {
    id: 'log-init',
    type: 'system',
    action: 'update',
    title: '系统就绪',
    description: '管理控制台已初始化本地存储。',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
]);
let currentPreferences: AdminPreferences = safeLoad<AdminPreferences>(STORAGE_KEYS.PREFERENCES, defaultPreferences);
let currentTrash: TrashItem[] = safeLoad<TrashItem[]>(STORAGE_KEYS.TRASH, []);
let currentDrafts: Record<string, EditorDraft> = safeLoad<Record<string, EditorDraft>>(STORAGE_KEYS.DRAFTS, {});

function pushToTrash(type: TrashItem['type'], title: string, data: any) {
  const item: TrashItem = {
    id: `trash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    data,
    deletedAt: Date.now(),
  };
  currentTrash = [item, ...currentTrash.slice(0, 49)];
  safeSave(STORAGE_KEYS.TRASH, currentTrash);
}

export const AdminStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  addLog(type: ActivityLog['type'], action: ActivityLog['action'], title: string, description: string) {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      action,
      title,
      description,
      timestamp: Date.now(),
    };
    currentLogs = [newLog, ...currentLogs.slice(0, 99)];
    safeSave(STORAGE_KEYS.LOGS, currentLogs);
    notify();
  },

  getLogs(): ActivityLog[] {
    return currentLogs;
  },

  clearLogs() {
    currentLogs = [];
    safeSave(STORAGE_KEYS.LOGS, currentLogs);
    notify();
  },

  // ===== 文章 Posts =====
  getPosts(includeDrafts = true): Post[] {
    return includeDrafts ? currentPosts : currentPosts.filter((p) => !p.draft);
  },

  getPostBySlug(slug: string): Post | null {
    return currentPosts.find((p) => p.slug === slug) ?? null;
  },

  /** 按需加载文章正文（列表页仅有元数据时使用） */
  async loadPostContent(slug: string): Promise<Post | null> {
    const index = currentPosts.findIndex((p) => p.slug === slug);
    if (index === -1) return null;
    const post = currentPosts[index];
    if (hasFullContent(post.content)) return post;

    const existing = contentLoadPromises.get(`post:${slug}`);
    if (existing) {
      await existing;
      return currentPosts.find((p) => p.slug === slug) ?? null;
    }

    const loader = postLoaders[slug];
    if (!loader) return post;

    const promise = (async () => {
      const raw = await loader();
      const parsed = parseMarkdownFile(slug, raw);
      const idx = currentPosts.findIndex((p) => p.slug === slug);
      if (idx === -1) return;
      currentPosts[idx] = {
        ...currentPosts[idx],
        content: parsed.content,
        toc: parsed.toc,
        readingTime: parsed.readingTime,
        wordCount: parsed.wordCount,
      };
      // 正文不写回 localStorage，避免把全量内容再次塞满存储
      notify();
    })();

    contentLoadPromises.set(`post:${slug}`, promise);
    try {
      await promise;
    } finally {
      contentLoadPromises.delete(`post:${slug}`);
    }
    return currentPosts.find((p) => p.slug === slug) ?? null;
  },

  savePost(postData: Partial<Post> & { title: string; slug: string; content: string }): Post {
    const { readingTime, wordCount } = calculateReadingTime(postData.content);
    const toc = extractTOC(postData.content);

    const existingIndex = currentPosts.findIndex((p) => p.slug === postData.slug);
    const updatedPost: Post = {
      slug: postData.slug.trim(),
      title: postData.title.trim(),
      date: postData.date || new Date().toISOString().split('T')[0],
      summary: postData.summary || postData.content.slice(0, 150).replace(/[#*`_\n]/g, ' ').trim() + '...',
      tags: Array.isArray(postData.tags) ? postData.tags.map((t) => t.trim()).filter(Boolean) : [],
      category: postData.category?.trim() || '技术文章',
      readingTime,
      wordCount,
      content: postData.content,
      toc,
      draft: Boolean(postData.draft),
      coverImage: postData.coverImage || undefined,
      recommend: typeof postData.recommend === 'number' ? postData.recommend : 0,
    };

    if (existingIndex >= 0) {
      currentPosts[existingIndex] = updatedPost;
      this.addLog('post', 'update', '更新文章', `更新了《${updatedPost.title}》`);
    } else {
      currentPosts = [updatedPost, ...currentPosts];
      this.addLog('post', 'create', '新建文章', `发布了新文章《${updatedPost.title}》`);
    }

    currentPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    safeSave(STORAGE_KEYS.POSTS, currentPosts);
    notify();
    return updatedPost;
  },

  deletePost(slug: string): boolean {
    const target = currentPosts.find((p) => p.slug === slug);
    if (!target) return false;
    pushToTrash('post', target.title, { ...target });
    currentPosts = currentPosts.filter((p) => p.slug !== slug);
    safeSave(STORAGE_KEYS.POSTS, currentPosts);
    this.addLog('post', 'delete', '删除文章', `删除了文章《${target.title}》（已存入回收站）`);
    notify();
    return true;
  },

  batchDeletePosts(slugs: string[]): number {
    let count = 0;
    slugs.forEach((slug) => {
      const target = currentPosts.find((p) => p.slug === slug);
      if (target) {
        pushToTrash('post', target.title, { ...target });
        count++;
      }
    });
    if (count > 0) {
      currentPosts = currentPosts.filter((p) => !slugs.includes(p.slug));
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('post', 'delete', '批量删除文章', `批量删除了 ${count} 篇文章（已存入回收站）`);
      notify();
    }
    return count;
  },

  batchSetPostsCategory(slugs: string[], category: string): number {
    let count = 0;
    currentPosts.forEach((post) => {
      if (slugs.includes(post.slug)) {
        post.category = category.trim();
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('post', 'update', '批量修改分类', `将 ${count} 篇文章调整至分类「${category}」`);
      notify();
    }
    return count;
  },

  batchTogglePostsDraft(slugs: string[], targetDraft?: boolean): number {
    let count = 0;
    currentPosts.forEach((post) => {
      if (slugs.includes(post.slug)) {
        post.draft = targetDraft !== undefined ? targetDraft : !post.draft;
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('post', 'update', '批量切换状态', `批量更新了 ${count} 篇文稿的发布/草稿状态`);
      notify();
    }
    return count;
  },

  togglePostDraft(slug: string): boolean {
    const post = currentPosts.find((p) => p.slug === slug);
    if (!post) return false;
    post.draft = !post.draft;
    safeSave(STORAGE_KEYS.POSTS, currentPosts);
    this.addLog('post', 'update', '切换状态', `将《${post.title}》设为 ${post.draft ? '草稿' : '已发布'}`);
    notify();
    return true;
  },

  setPostRecommend(slug: string, recommend: number): boolean {
    const post = currentPosts.find((p) => p.slug === slug);
    if (!post) return false;
    post.recommend = recommend;
    safeSave(STORAGE_KEYS.POSTS, currentPosts);
    this.addLog('post', 'update', '设置置顶权重', `将《${post.title}》推荐权重调整为 ${recommend}`);
    notify();
    return true;
  },

  // ===== 手记 Diaries =====
  getDiaries(): Diary[] {
    return currentDiaries;
  },

  getDiaryBySlug(slug: string): Diary | null {
    return currentDiaries.find((d) => d.slug === slug) ?? null;
  },

  /** 按需加载手记正文 */
  async loadDiaryContent(slug: string): Promise<Diary | null> {
    const diary = currentDiaries.find((d) => d.slug === slug);
    if (!diary) return null;
    if (hasFullContent(diary.content)) return diary;

    const existing = contentLoadPromises.get(`diary:${slug}`);
    if (existing) {
      await existing;
      return currentDiaries.find((d) => d.slug === slug) ?? null;
    }

    const loader = diaryLoaders[slug];
    if (!loader) return diary;

    const promise = (async () => {
      const raw = await loader();
      const parsed = parseDiaryFile(slug, raw);
      const idx = currentDiaries.findIndex((d) => d.slug === slug);
      if (idx === -1) return;
      currentDiaries[idx] = {
        ...currentDiaries[idx],
        content: parsed.content,
        readingTime: parsed.readingTime,
        wordCount: parsed.wordCount,
      };
      notify();
    })();

    contentLoadPromises.set(`diary:${slug}`, promise);
    try {
      await promise;
    } finally {
      contentLoadPromises.delete(`diary:${slug}`);
    }
    return currentDiaries.find((d) => d.slug === slug) ?? null;
  },

  saveDiary(diaryData: Partial<Diary> & { title: string; slug: string; content: string }): Diary {
    const { readingTime, wordCount } = calculateReadingTime(diaryData.content);
    const existingIndex = currentDiaries.findIndex((d) => d.slug === diaryData.slug);

    const updatedDiary: Diary = {
      slug: diaryData.slug.trim(),
      title: diaryData.title.trim(),
      date: diaryData.date || new Date().toISOString().split('T')[0],
      time: diaryData.time || new Date().toTimeString().slice(0, 5),
      weather: diaryData.weather || '晴',
      mood: diaryData.mood || '平静',
      location: diaryData.location || '书房',
      tags: Array.isArray(diaryData.tags) && diaryData.tags.length > 0 ? diaryData.tags : ['手记'],
      summary: diaryData.summary || diaryData.content.slice(0, 120).replace(/[#*`_\n]/g, ' ').trim() + '...',
      content: diaryData.content,
      readingTime,
      wordCount,
    };

    if (existingIndex >= 0) {
      currentDiaries[existingIndex] = updatedDiary;
      this.addLog('diary', 'update', '更新手记', `更新了手记《${updatedDiary.title}》`);
    } else {
      currentDiaries = [updatedDiary, ...currentDiaries];
      this.addLog('diary', 'create', '新建手记', `记录了新手记《${updatedDiary.title}》`);
    }

    currentDiaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
    notify();
    return updatedDiary;
  },

  deleteDiary(slug: string): boolean {
    const target = currentDiaries.find((d) => d.slug === slug);
    if (!target) return false;
    pushToTrash('diary', target.title, { ...target });
    currentDiaries = currentDiaries.filter((d) => d.slug !== slug);
    safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
    this.addLog('diary', 'delete', '删除手记', `删除了手记《${target.title}》（已存入回收站）`);
    notify();
    return true;
  },

  batchDeleteDiaries(slugs: string[]): number {
    let count = 0;
    slugs.forEach((slug) => {
      const target = currentDiaries.find((d) => d.slug === slug);
      if (target) {
        pushToTrash('diary', target.title, { ...target });
        count++;
      }
    });
    if (count > 0) {
      currentDiaries = currentDiaries.filter((d) => !slugs.includes(d.slug));
      safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
      this.addLog('diary', 'delete', '批量删除手记', `批量删除了 ${count} 篇手记（已存入回收站）`);
      notify();
    }
    return count;
  },

  // ===== 说说动态 Records =====
  getRecords(): RecordItem[] {
    return currentRecords;
  },

  saveRecord(record: Partial<RecordItem> & { content: string }): RecordItem {
    const isEdit = Boolean(record.id && currentRecords.some((r) => String(r.id) === String(record.id)));
    let savedItem: RecordItem;

    if (isEdit) {
      currentRecords = currentRecords.map((item) => {
        if (String(item.id) === String(record.id)) {
          savedItem = {
            ...item,
            ...record,
            content: record.content,
          };
          return savedItem;
        }
        return item;
      });
      this.addLog('record', 'update', '编辑说说', `更新了一条说说动态`);
    } else {
      savedItem = {
        id: `rec-${Date.now()}`,
        content: record.content,
        createTime: record.createTime || Date.now(),
        likes: record.likes || 0,
        mood: record.mood || '随笔',
        location: record.location || '',
        author: record.author || currentSiteConfig.author.name,
        contentType: record.contentType || 'markdown',
        media: record.media || [],
        comments: record.comments || [],
        pinned: Boolean(record.pinned),
      };
      currentRecords = [savedItem, ...currentRecords];
      this.addLog('record', 'create', '发布说说', `发布了一条新动态`);
    }

    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    notify();
    return savedItem!;
  },

  deleteRecord(id: string | number): boolean {
    const target = currentRecords.find((r) => String(r.id) === String(id));
    if (!target) return false;
    pushToTrash('record', target.content.slice(0, 30) || '说说动态', { ...target });
    currentRecords = currentRecords.filter((r) => String(r.id) !== String(id));
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'delete', '删除说说', `删除了一条说说（已存入回收站）`);
    notify();
    return true;
  },

  toggleRecordPin(id: string | number): boolean {
    const item = currentRecords.find((r) => String(r.id) === String(id));
    if (!item) return false;
    item.pinned = !item.pinned;
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'update', '置顶切换', `${item.pinned ? '置顶' : '取消置顶'}了一条说说`);
    notify();
    return true;
  },

  updateRecordLikes(id: string | number, delta: number): number {
    const item = currentRecords.find((r) => String(r.id) === String(id));
    if (!item) return 0;
    item.likes = Math.max(0, (item.likes || 0) + delta);
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    notify();
    return item.likes;
  },

  addRecordComment(recordId: string | number, author: string, content: string): RecordComment | null {
    const item = currentRecords.find((r) => String(r.id) === String(recordId));
    if (!item) return null;
    const newComment: RecordComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: author.trim() || '博主回复',
      content: content.trim(),
      createdAt: Date.now(),
      local: true,
    };
    item.comments = [...(item.comments || []), newComment];
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'update', '发表评论', `在说说中回复：${content.slice(0, 20)}...`);
    notify();
    return newComment;
  },

  deleteRecordComment(recordId: string | number, commentId: string): boolean {
    const item = currentRecords.find((r) => String(r.id) === String(recordId));
    if (!item || !item.comments) return false;
    item.comments = item.comments.filter((c) => c.id !== commentId);
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'delete', '删除评论', `删除了一条评论互动`);
    notify();
    return true;
  },

  clearRecordComments(recordId: string | number): boolean {
    const item = currentRecords.find((r) => String(r.id) === String(recordId));
    if (!item) return false;
    const count = item.comments?.length || 0;
    item.comments = [];
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'delete', '清空评论', `清空了说说下的 ${count} 条评论互动`);
    notify();
    return true;
  },

  setRecordLikes(id: string | number, likes: number): number {
    const item = currentRecords.find((r) => String(r.id) === String(id));
    if (!item) return 0;
    item.likes = Math.max(0, Math.floor(likes));
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    notify();
    return item.likes;
  },

  batchDeleteRecords(ids: (string | number)[]): number {
    const idSet = new Set(ids.map(String));
    const targets = currentRecords.filter((r) => idSet.has(String(r.id)));
    if (targets.length === 0) return 0;

    targets.forEach((target) => {
      pushToTrash('record', target.content.slice(0, 30) || '说说动态', { ...target });
    });

    currentRecords = currentRecords.filter((r) => !idSet.has(String(r.id)));
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    this.addLog('record', 'delete', '批量删除说说', `批量删除了 ${targets.length} 条说说（已移入回收站）`);
    notify();
    return targets.length;
  },

  batchToggleRecordsPin(ids: (string | number)[], pin: boolean): number {
    const idSet = new Set(ids.map(String));
    let changed = 0;
    currentRecords.forEach((r) => {
      if (idSet.has(String(r.id))) {
        r.pinned = pin;
        changed++;
      }
    });
    if (changed > 0) {
      safeSave(STORAGE_KEYS.RECORDS, currentRecords);
      this.addLog('record', 'update', '批量设置置顶', `批量将 ${changed} 条说说${pin ? '设为置顶' : '取消置顶'}`);
      notify();
    }
    return changed;
  },

  // ===== 友链 Friends =====
  getFriends(): FriendItem[] {
    return currentFriends.slice().sort((a, b) => (a.order || 999) - (b.order || 999));
  },

  saveFriend(friend: Partial<FriendItem> & { name: string; link: string }): FriendItem {
    const isEdit = Boolean(friend.id && currentFriends.some((f) => String(f.id) === String(friend.id)));
    let savedFriend: FriendItem;

    if (isEdit) {
      currentFriends = currentFriends.map((f) => {
        if (String(f.id) === String(friend.id)) {
          savedFriend = {
            ...f,
            ...friend,
            name: friend.name.trim(),
            link: friend.link.trim(),
            order: Number(friend.order ?? f.order ?? 999),
          };
          return savedFriend;
        }
        return f;
      });
      this.addLog('friend', 'update', '更新友链', `更新了友链《${friend.name}》`);
    } else {
      savedFriend = {
        id: friend.id || `fr-${Date.now()}`,
        name: friend.name.trim(),
        desc: (friend.desc || '').trim(),
        avatar: (friend.avatar || '').trim(),
        link: friend.link.trim(),
        order: Number(friend.order ?? (currentFriends.length + 1)),
        framework: (friend.framework || '').trim(),
        deploy: (friend.deploy || '').trim(),
        tags: friend.tags || [],
      };
      currentFriends = [...currentFriends, savedFriend];
      this.addLog('friend', 'create', '添加友链', `添加了新伙伴《${savedFriend.name}》`);
    }

    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    notify();
    return savedFriend!;
  },

  deleteFriend(id: string | number): boolean {
    const target = currentFriends.find((f) => String(f.id) === String(id));
    if (!target) return false;
    pushToTrash('friend', target.name, { ...target });
    currentFriends = currentFriends.filter((f) => String(f.id) !== String(id));
    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    this.addLog('friend', 'delete', '删除友链', `删除了友链《${target.name}》（已存入回收站）`);
    notify();
    return true;
  },

  moveFriend(id: string | number, direction: 'up' | 'down'): boolean {
    const sorted = [...currentFriends].sort((a, b) => (a.order || 999) - (b.order || 999));
    const index = sorted.findIndex((f) => String(f.id) === String(id));
    if (index === -1) return false;
    if (direction === 'up' && index === 0) return false;
    if (direction === 'down' && index === sorted.length - 1) return false;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    // 重新规整 order 序号从 1 开始
    sorted.forEach((f, idx) => {
      f.order = idx + 1;
    });

    currentFriends = sorted;
    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    this.addLog('friend', 'update', '重排友链', `调整了友链顺序`);
    notify();
    return true;
  },

  pinFriend(id: string | number): boolean {
    const sorted = [...currentFriends].sort((a, b) => (a.order || 999) - (b.order || 999));
    const target = sorted.find((f) => String(f.id) === String(id));
    if (!target) return false;
    const rest = sorted.filter((f) => String(f.id) !== String(id));
    const newOrdered = [target, ...rest];
    newOrdered.forEach((f, idx) => {
      f.order = idx + 1;
    });
    currentFriends = newOrdered;
    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    this.addLog('friend', 'update', '置顶友链', `将友链《${target.name}》置顶`);
    notify();
    return true;
  },

  reorderFriends(orderedIds: (string | number)[]): void {
    const idMap = new Map(currentFriends.map((f) => [String(f.id), f]));
    const newOrdered: FriendItem[] = [];
    orderedIds.forEach((id, idx) => {
      const f = idMap.get(String(id));
      if (f) {
        f.order = idx + 1;
        newOrdered.push(f);
        idMap.delete(String(id));
      }
    });
    // 放入剩余的
    idMap.forEach((f) => {
      f.order = newOrdered.length + 1;
      newOrdered.push(f);
    });
    currentFriends = newOrdered;
    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    notify();
  },

  // ===== 分类与标签 Taxonomy =====
  getCategories(): { name: string; count: number }[] {
    const map: Record<string, number> = {};
    currentPosts.forEach((post) => {
      if (post.category) {
        map[post.category] = (map[post.category] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  renameCategory(oldName: string, newName: string): boolean {
    if (!oldName || !newName || oldName === newName) return false;
    let count = 0;
    currentPosts.forEach((post) => {
      if (post.category === oldName) {
        post.category = newName.trim();
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('system', 'update', '重命名分类', `将分类「${oldName}」修改为「${newName}」（影响 ${count} 篇文章）`);
      notify();
      return true;
    }
    return false;
  },

  getTags(): { name: string; count: number }[] {
    const map: Record<string, number> = {};
    currentPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },

  renameTag(oldTag: string, newTag: string): boolean {
    if (!oldTag || !newTag || oldTag === newTag) return false;
    let count = 0;
    currentPosts.forEach((post) => {
      if (post.tags.includes(oldTag)) {
        post.tags = post.tags.map((t) => (t === oldTag ? newTag.trim() : t));
        count++;
      }
    });
    currentDiaries.forEach((diary) => {
      if (diary.tags.includes(oldTag)) {
        diary.tags = diary.tags.map((t) => (t === oldTag ? newTag.trim() : t));
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
      this.addLog('system', 'update', '重命名标签', `将标签「${oldTag}」重命名为「${newTag}」`);
      notify();
      return true;
    }
    return false;
  },

  addCategory(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = currentPosts.some((p) => p.category === trimmed);
    if (exists) return false;
    // 触发更新日志
    this.addLog('system', 'create', '新建分类体系', `预创建了分类「${trimmed}」`);
    notify();
    return true;
  },

  mergeCategory(sourceCategory: string, targetCategory: string): { success: boolean; count: number } {
    const src = sourceCategory.trim();
    const tgt = targetCategory.trim();
    if (!src || !tgt || src === tgt) return { success: false, count: 0 };
    let count = 0;
    currentPosts.forEach((post) => {
      if (post.category === src) {
        post.category = tgt;
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('system', 'update', '合并分类', `将分类「${src}」下的 ${count} 篇文章批量迁移至「${tgt}」`);
      notify();
    }
    return { success: true, count };
  },

  mergeTags(sourceTag: string, targetTag: string): { success: boolean; count: number } {
    const src = sourceTag.trim();
    const tgt = targetTag.trim();
    if (!src || !tgt || src === tgt) return { success: false, count: 0 };
    let count = 0;
    currentPosts.forEach((post) => {
      if (post.tags.includes(src)) {
        post.tags = Array.from(new Set(post.tags.map((t) => (t === src ? tgt : t))));
        count++;
      }
    });
    currentDiaries.forEach((diary) => {
      if (diary.tags.includes(src)) {
        diary.tags = Array.from(new Set(diary.tags.map((t) => (t === src ? tgt : t))));
        count++;
      }
    });
    if (count > 0) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
      this.addLog('system', 'update', '合并标签', `将标签「${src}」合并入「${tgt}」（影响 ${count} 项内容）`);
      notify();
    }
    return { success: true, count };
  },

  pruneUnusedTags(): { success: boolean; prunedTags: string[] } {
    // 找出所有有效标签
    const usedTags = new Set<string>();
    currentPosts.forEach((p) => p.tags.forEach((t) => usedTags.add(t.trim())));
    currentDiaries.forEach((d) => d.tags.forEach((t) => usedTags.add(t.trim())));
    // 清理空标签与空格
    let changed = false;
    currentPosts.forEach((p) => {
      const origLen = p.tags.length;
      p.tags = p.tags.map((t) => t.trim()).filter(Boolean);
      if (p.tags.length !== origLen) changed = true;
    });
    currentDiaries.forEach((d) => {
      const origLen = d.tags.length;
      d.tags = d.tags.map((t) => t.trim()).filter(Boolean);
      if (d.tags.length !== origLen) changed = true;
    });
    if (changed) {
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
      notify();
    }
    this.addLog('system', 'update', '整理标签索引', `已扫描并整理全站标签索引，当前有效标签数：${usedTags.size}`);
    return { success: true, prunedTags: [] };
  },

  // ===== 站点配置 SiteConfig =====
  getSiteConfig(): SiteConfig {
    return currentSiteConfig;
  },

  saveSiteConfig(newConfig: SiteConfig): SiteConfig {
    currentSiteConfig = { ...newConfig };
    safeSave(STORAGE_KEYS.CONFIG, currentSiteConfig);
    this.addLog('setting', 'update', '更新站点设置', '更新了全站基本信息与页面配置');
    notify();
    return currentSiteConfig;
  },

  resetConfigSection(sectionKey: keyof SiteConfig): SiteConfig {
    const defaultVal = defaultSiteConfig[sectionKey];
    (currentSiteConfig as any)[sectionKey] = JSON.parse(JSON.stringify(defaultVal));
    safeSave(STORAGE_KEYS.CONFIG, currentSiteConfig);
    this.addLog('setting', 'restore', '重置板块配置', `将「${String(sectionKey)}」配置恢复为出厂预设值`);
    notify();
    return currentSiteConfig;
  },

  // ===== 回收站 TrashBin =====
  getTrash(): TrashItem[] {
    return currentTrash;
  },

  restoreTrash(trashId: string): boolean {
    const index = currentTrash.findIndex((t) => t.id === trashId);
    if (index === -1) return false;
    const item = currentTrash[index];

    if (item.type === 'post') {
      const post = item.data as Post;
      // 避免 slug 冲突
      const exists = currentPosts.some((p) => p.slug === post.slug);
      const restoreSlug = exists ? `${post.slug}-restored-${Date.now().toString().slice(-4)}` : post.slug;
      currentPosts = [{ ...post, slug: restoreSlug }, ...currentPosts];
      safeSave(STORAGE_KEYS.POSTS, currentPosts);
      this.addLog('post', 'restore', '恢复文章', `从回收站恢复了《${post.title}》`);
    } else if (item.type === 'diary') {
      const diary = item.data as Diary;
      const exists = currentDiaries.some((d) => d.slug === diary.slug);
      const restoreSlug = exists ? `${diary.slug}-restored-${Date.now().toString().slice(-4)}` : diary.slug;
      currentDiaries = [{ ...diary, slug: restoreSlug }, ...currentDiaries];
      safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
      this.addLog('diary', 'restore', '恢复手记', `从回收站恢复了手记《${diary.title}》`);
    } else if (item.type === 'record') {
      const record = item.data as RecordItem;
      currentRecords = [{ ...record, id: `rec-restored-${Date.now()}` }, ...currentRecords];
      safeSave(STORAGE_KEYS.RECORDS, currentRecords);
      this.addLog('record', 'restore', '恢复说说', `从回收站恢复了一条说说`);
    } else if (item.type === 'friend') {
      const friend = item.data as FriendItem;
      currentFriends = [{ ...friend, id: `fr-restored-${Date.now()}` }, ...currentFriends];
      safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
      this.addLog('friend', 'restore', '恢复友链', `从回收站恢复了友链《${friend.name}》`);
    }

    currentTrash = currentTrash.filter((t) => t.id !== trashId);
    safeSave(STORAGE_KEYS.TRASH, currentTrash);
    notify();
    return true;
  },

  deletePermanently(trashId: string): boolean {
    const target = currentTrash.find((t) => t.id === trashId);
    if (!target) return false;
    currentTrash = currentTrash.filter((t) => t.id !== trashId);
    safeSave(STORAGE_KEYS.TRASH, currentTrash);
    this.addLog('system', 'delete', '彻底粉碎数据', `彻底清除了回收站中的《${target.title}》`);
    notify();
    return true;
  },

  clearTrash(): void {
    const count = currentTrash.length;
    currentTrash = [];
    safeSave(STORAGE_KEYS.TRASH, currentTrash);
    this.addLog('system', 'delete', '清空回收站', `清空了回收站中的 ${count} 条记录`);
    notify();
  },

  // ===== 编辑器草稿自动暂存 Editor Drafts =====
  saveAutoDraft(draft: Omit<EditorDraft, 'id' | 'savedAt'>): void {
    const key = `${draft.type}_${draft.slug || 'new'}`;
    const entry: EditorDraft = {
      ...draft,
      id: key,
      savedAt: Date.now(),
    };
    currentDrafts[key] = entry;
    safeSave(STORAGE_KEYS.DRAFTS, currentDrafts);
  },

  getAutoDraft(type: 'post' | 'diary', slug?: string): EditorDraft | null {
    const key = `${type}_${slug || 'new'}`;
    return currentDrafts[key] || null;
  },

  clearAutoDraft(type: 'post' | 'diary', slug?: string): void {
    const key = `${type}_${slug || 'new'}`;
    if (currentDrafts[key]) {
      delete currentDrafts[key];
      safeSave(STORAGE_KEYS.DRAFTS, currentDrafts);
    }
  },

  getAllAutoDrafts(): EditorDraft[] {
    return Object.values(currentDrafts);
  },

  // ===== 控制台偏好 Preferences =====
  getPreferences(): AdminPreferences {
    return currentPreferences;
  },

  savePreferences(prefs: Partial<AdminPreferences>): AdminPreferences {
    currentPreferences = { ...currentPreferences, ...prefs };
    safeSave(STORAGE_KEYS.PREFERENCES, currentPreferences);
    notify();
    return currentPreferences;
  },

  // ===== 底层配置文件与源码操作 (Underlying Configuration & Source) =====
  getSiteConfigFileContent(): string {
    return JSON.stringify(currentSiteConfig, null, 2);
  },

  getFriendsFileContent(): string {
    return JSON.stringify(currentFriends, null, 2);
  },

  getRecordsFileContent(): string {
    return JSON.stringify(currentRecords, null, 2);
  },

  saveSiteConfigFileContent(rawJson: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { success: false, message: 'site.config.json 必须是 JSON 对象格式' };
      }
      currentSiteConfig = deepMerge<SiteConfig>(defaultSiteConfig, parsed);
      safeSave(STORAGE_KEYS.CONFIG, currentSiteConfig);
      this.addLog('setting', 'update', '直接更新配置文件', '通过源码编辑器更新了 site.config.json');
      notify();
      return { success: true, message: 'site.config.json 配置已成功应用并持久化！' };
    } catch (e) {
      return { success: false, message: `JSON 语法错误: ${(e as Error).message}` };
    }
  },

  saveFriendsFileContent(rawJson: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        return { success: false, message: 'friends.json 必须是 JSON 数组格式' };
      }
      currentFriends = parsed;
      safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
      this.addLog('friend', 'update', '直接更新友链文件', `通过源码编辑器更新了 friends.json（共 ${parsed.length} 项）`);
      notify();
      return { success: true, message: `friends.json 已更新并保存（共 ${parsed.length} 条友链）！` };
    } catch (e) {
      return { success: false, message: `JSON 语法错误: ${(e as Error).message}` };
    }
  },

  saveRecordsFileContent(rawJson: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) {
        return { success: false, message: 'records.json 必须是 JSON 数组格式' };
      }
      currentRecords = parsed;
      safeSave(STORAGE_KEYS.RECORDS, currentRecords);
      this.addLog('record', 'update', '直接更新动态文件', `通过源码编辑器更新了 records.json（共 ${parsed.length} 条）`);
      notify();
      return { success: true, message: `records.json 已更新并保存（共 ${parsed.length} 条动态）！` };
    } catch (e) {
      return { success: false, message: `JSON 语法错误: ${(e as Error).message}` };
    }
  },

  downloadFile(filename: string, content: string, mimeType = 'application/json'): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  downloadProjectFile(fileType: 'siteConfig' | 'friends' | 'records' | 'fullBackup'): void {
    if (fileType === 'siteConfig') {
      this.downloadFile('site.config.json', this.getSiteConfigFileContent());
    } else if (fileType === 'friends') {
      this.downloadFile('friends.json', this.getFriendsFileContent());
    } else if (fileType === 'records') {
      this.downloadFile('records.json', this.getRecordsFileContent());
    } else if (fileType === 'fullBackup') {
      const backup = this.exportAllData();
      this.downloadFile(
        `cot-full-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2)
      );
    }
  },

  // ===== 数据备份、恢复与统计 =====
  exportAllData() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      siteConfig: currentSiteConfig,
      posts: currentPosts,
      diaries: currentDiaries,
      records: currentRecords,
      friends: currentFriends,
      logs: currentLogs,
      preferences: currentPreferences,
    };
  },

  importData(jsonContent: string): { success: boolean; message: string; details?: Record<string, number> } {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || typeof data !== 'object') {
        return { success: false, message: '无效的 JSON 格式数据' };
      }

      let postsImported = 0;
      let diariesImported = 0;
      let recordsImported = 0;
      let friendsImported = 0;

      if (Array.isArray(data.posts)) {
        currentPosts = data.posts;
        safeSave(STORAGE_KEYS.POSTS, currentPosts);
        postsImported = currentPosts.length;
      }
      if (Array.isArray(data.diaries)) {
        currentDiaries = data.diaries;
        safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
        diariesImported = currentDiaries.length;
      }
      if (Array.isArray(data.records)) {
        currentRecords = data.records;
        safeSave(STORAGE_KEYS.RECORDS, currentRecords);
        recordsImported = currentRecords.length;
      }
      if (Array.isArray(data.friends)) {
        currentFriends = data.friends;
        safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
        friendsImported = currentFriends.length;
      }
      if (data.siteConfig && typeof data.siteConfig === 'object') {
        currentSiteConfig = data.siteConfig;
        safeSave(STORAGE_KEYS.CONFIG, currentSiteConfig);
      }

      this.addLog('system', 'restore', '数据恢复导入', `成功恢复 ${postsImported} 篇文章, ${diariesImported} 篇手记, ${recordsImported} 条说说, ${friendsImported} 位友链`);
      notify();
      return {
        success: true,
        message: '数据恢复导入成功！',
        details: {
          posts: postsImported,
          diaries: diariesImported,
          records: recordsImported,
          friends: friendsImported,
        },
      };
    } catch (e) {
      console.error('[AdminStore] Import error:', e);
      return { success: false, message: `导入解析失败：${(e as Error).message}` };
    }
  },

  resetToDefault() {
    currentPosts = [...defaultPosts];
    currentDiaries = [...defaultDiaries];
    currentRecords = [...defaultRecords];
    currentFriends = [...defaultFriends];
    currentSiteConfig = { ...defaultSiteConfig };
    currentLogs = [
      {
        id: `log-reset-${Date.now()}`,
        type: 'system',
        action: 'restore',
        title: '重置出厂数据',
        description: '全站数据已重置为初始演示状态。',
        timestamp: Date.now(),
      },
    ];
    currentPreferences = { ...defaultPreferences };
    currentTrash = [];
    currentDrafts = {};

    safeSave(STORAGE_KEYS.POSTS, currentPosts);
    safeSave(STORAGE_KEYS.DIARIES, currentDiaries);
    safeSave(STORAGE_KEYS.RECORDS, currentRecords);
    safeSave(STORAGE_KEYS.FRIENDS, currentFriends);
    safeSave(STORAGE_KEYS.CONFIG, currentSiteConfig);
    safeSave(STORAGE_KEYS.LOGS, currentLogs);
    safeSave(STORAGE_KEYS.PREFERENCES, currentPreferences);
    safeSave(STORAGE_KEYS.TRASH, currentTrash);
    safeSave(STORAGE_KEYS.DRAFTS, currentDrafts);

    notify();
  },

  getStorageUsage(): { usedBytes: number; usedKb: number; itemsCount: Record<string, number> } {
    let totalBytes = 0;
    if (typeof window !== 'undefined') {
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key) || '';
        totalBytes += key.length + item.length * 2;
      }
    }
    return {
      usedBytes: totalBytes,
      usedKb: Math.round((totalBytes / 1024) * 100) / 100,
      itemsCount: {
        posts: currentPosts.length,
        diaries: currentDiaries.length,
        records: currentRecords.length,
        friends: currentFriends.length,
        logs: currentLogs.length,
        trash: currentTrash.length,
        drafts: Object.keys(currentDrafts).length,
      },
    };
  },
};
