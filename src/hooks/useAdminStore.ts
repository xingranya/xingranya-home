import { useEffect, useState } from 'react';
import { AdminStore, type AdminPreferences, type TrashItem, type EditorDraft } from '../lib/admin-store';
import type { SiteConfig } from '../types';

export type { TrashItem, EditorDraft, AdminPreferences };

export function useAdminStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = AdminStore.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    // 列表与实体
    posts: AdminStore.getPosts(true),
    publishedPosts: AdminStore.getPosts(false),
    diaries: AdminStore.getDiaries(),
    records: AdminStore.getRecords(),
    friends: AdminStore.getFriends(),
    categories: AdminStore.getCategories(),
    tags: AdminStore.getTags(),
    siteConfig: AdminStore.getSiteConfig(),
    logs: AdminStore.getLogs(),
    preferences: AdminStore.getPreferences(),
    storageUsage: AdminStore.getStorageUsage(),
    trash: AdminStore.getTrash(),
    drafts: AdminStore.getAllAutoDrafts(),

    // 文章操作方法
    savePost: (data: Parameters<typeof AdminStore.savePost>[0]) => AdminStore.savePost(data),
    deletePost: (slug: string) => AdminStore.deletePost(slug),
    batchDeletePosts: (slugs: string[]) => AdminStore.batchDeletePosts(slugs),
    batchSetPostsCategory: (slugs: string[], category: string) => AdminStore.batchSetPostsCategory(slugs, category),
    batchTogglePostsDraft: (slugs: string[], targetDraft?: boolean) => AdminStore.batchTogglePostsDraft(slugs, targetDraft),
    togglePostDraft: (slug: string) => AdminStore.togglePostDraft(slug),
    setPostRecommend: (slug: string, recommend: number) => AdminStore.setPostRecommend(slug, recommend),
    getPostBySlug: (slug: string) => AdminStore.getPostBySlug(slug),
    loadPostContent: (slug: string) => AdminStore.loadPostContent(slug),

    // 手记操作方法
    saveDiary: (data: Parameters<typeof AdminStore.saveDiary>[0]) => AdminStore.saveDiary(data),
    deleteDiary: (slug: string) => AdminStore.deleteDiary(slug),
    batchDeleteDiaries: (slugs: string[]) => AdminStore.batchDeleteDiaries(slugs),
    getDiaryBySlug: (slug: string) => AdminStore.getDiaryBySlug(slug),
    loadDiaryContent: (slug: string) => AdminStore.loadDiaryContent(slug),

    // 说说操作方法
    saveRecord: (record: Parameters<typeof AdminStore.saveRecord>[0]) => AdminStore.saveRecord(record),
    deleteRecord: (id: string | number) => AdminStore.deleteRecord(id),
    toggleRecordPin: (id: string | number) => AdminStore.toggleRecordPin(id),
    updateRecordLikes: (id: string | number, delta: number) => AdminStore.updateRecordLikes(id, delta),
    setRecordLikes: (id: string | number, likes: number) => AdminStore.setRecordLikes(id, likes),
    addRecordComment: (id: string | number, author: string, content: string) => AdminStore.addRecordComment(id, author, content),
    deleteRecordComment: (recordId: string | number, commentId: string) => AdminStore.deleteRecordComment(recordId, commentId),
    clearRecordComments: (recordId: string | number) => AdminStore.clearRecordComments(recordId),
    batchDeleteRecords: (ids: (string | number)[]) => AdminStore.batchDeleteRecords(ids),
    batchToggleRecordsPin: (ids: (string | number)[], pin: boolean) => AdminStore.batchToggleRecordsPin(ids, pin),

    // 友链操作方法
    saveFriend: (friend: Parameters<typeof AdminStore.saveFriend>[0]) => AdminStore.saveFriend(friend),
    deleteFriend: (id: string | number) => AdminStore.deleteFriend(id),
    moveFriend: (id: string | number, direction: 'up' | 'down') => AdminStore.moveFriend(id, direction),
    pinFriend: (id: string | number) => AdminStore.pinFriend(id),
    reorderFriends: (orderedIds: (string | number)[]) => AdminStore.reorderFriends(orderedIds),

    // 分类与标签高级方法
    addCategory: (name: string) => AdminStore.addCategory(name),
    renameCategory: (oldName: string, newName: string) => AdminStore.renameCategory(oldName, newName),
    mergeCategory: (sourceCategory: string, targetCategory: string) => AdminStore.mergeCategory(sourceCategory, targetCategory),
    mergeCategories: (sourceCategory: string, targetCategory: string) => AdminStore.mergeCategory(sourceCategory, targetCategory),
    renameTag: (oldTag: string, newTag: string) => AdminStore.renameTag(oldTag, newTag),
    mergeTags: (sourceTag: string, targetTag: string) => AdminStore.mergeTags(sourceTag, targetTag),
    pruneUnusedTags: () => AdminStore.pruneUnusedTags(),

    // 配置与偏好
    saveSiteConfig: (config: SiteConfig) => AdminStore.saveSiteConfig(config),
    resetConfigSection: (sectionKey: keyof SiteConfig) => AdminStore.resetConfigSection(sectionKey),
    savePreferences: (prefs: Partial<AdminPreferences>) => AdminStore.savePreferences(prefs),

    // 回收站
    restoreTrash: (trashId: string) => AdminStore.restoreTrash(trashId),
    deletePermanently: (trashId: string) => AdminStore.deletePermanently(trashId),
    clearTrash: () => AdminStore.clearTrash(),

    // 草稿自动暂存
    saveAutoDraft: (draft: Parameters<typeof AdminStore.saveAutoDraft>[0]) => AdminStore.saveAutoDraft(draft),
    getAutoDraft: (type: 'post' | 'diary', slug?: string) => AdminStore.getAutoDraft(type, slug),
    clearAutoDraft: (type: 'post' | 'diary', slug?: string) => AdminStore.clearAutoDraft(type, slug),

    // 底层配置文件与源码操作
    getSiteConfigFileContent: () => AdminStore.getSiteConfigFileContent(),
    getFriendsFileContent: () => AdminStore.getFriendsFileContent(),
    getRecordsFileContent: () => AdminStore.getRecordsFileContent(),
    saveSiteConfigFileContent: (rawJson: string) => AdminStore.saveSiteConfigFileContent(rawJson),
    saveFriendsFileContent: (rawJson: string) => AdminStore.saveFriendsFileContent(rawJson),
    saveRecordsFileContent: (rawJson: string) => AdminStore.saveRecordsFileContent(rawJson),
    downloadFile: (filename: string, content: string, mimeType?: string) => AdminStore.downloadFile(filename, content, mimeType),
    downloadProjectFile: (fileType: 'siteConfig' | 'friends' | 'records' | 'fullBackup') => AdminStore.downloadProjectFile(fileType),

    exportAllData: () => AdminStore.exportAllData(),
    importData: (json: string) => AdminStore.importData(json),
    resetToDefault: () => AdminStore.resetToDefault(),
    clearLogs: () => AdminStore.clearLogs(),
  };
}
