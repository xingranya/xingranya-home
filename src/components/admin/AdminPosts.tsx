import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  CheckSquare,
  Square,
  RotateCcw,
  LayoutGrid,
  List,
  Star,
  FolderInput,
  ArrowUpDown,
  Archive,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import type { Post } from '../../types';

interface AdminPostsProps {
  onOpenEditor: (type: 'post' | 'diary', slug?: string) => void;
}

export const AdminPosts: React.FC<AdminPostsProps> = ({ onOpenEditor }) => {
  const {
    posts,
    categories,
    tags,
    togglePostDraft,
    deletePost,
    batchDeletePosts,
    batchSetPostsCategory,
    batchTogglePostsDraft,
    setPostRecommend,
  } = useAdminStore();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'words-desc'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [batchCategoryModal, setBatchCategoryModal] = useState(false);
  const [targetBatchCategory, setTargetBatchCategory] = useState('');

  // 过滤与排序后的文章
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = posts.filter((post) => {
      if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
      if (selectedStatus === 'published' && post.draft) return false;
      if (selectedStatus === 'draft' && !post.draft) return false;
      if (selectedTag && !post.tags.includes(selectedTag)) return false;

      if (!q) return true;

      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'words-desc') {
        return b.wordCount - a.wordCount;
      }
      return 0;
    });
  }, [posts, searchQuery, selectedCategory, selectedStatus, selectedTag, sortBy]);

  // 全选/反选
  const handleSelectAll = () => {
    if (selectedSlugs.length === filteredPosts.length) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(filteredPosts.map((p) => p.slug));
    }
  };

  const handleToggleSelect = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  // 复制前台链接
  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/posts/${slug}`;
    navigator.clipboard.writeText(url);
    success('文章前台访问链接已复制到剪贴板！');
  };

  // 批量发布/设为草稿
  const handleBatchPublish = (targetDraft: boolean) => {
    const count = batchTogglePostsDraft(selectedSlugs, targetDraft);
    success(`已批量将 ${count} 篇文章设为${targetDraft ? '草稿' : '已发布'}`);
    setSelectedSlugs([]);
  };

  // 批量删除（存入回收站）
  const handleBatchDelete = () => {
    if (selectedSlugs.length === 0) return;
    setBatchDeleteConfirmOpen(true);
  };

  const handleConfirmBatchDelete = () => {
    const count = batchDeletePosts(selectedSlugs);
    success(`已将 ${count} 篇文章移入回收站（可随时在顶栏回收站撤销恢复）`);
    setSelectedSlugs([]);
    setBatchDeleteConfirmOpen(false);
  };

  // 批量更改分类
  const handleConfirmBatchCategory = () => {
    if (!targetBatchCategory) return;
    const count = batchSetPostsCategory(selectedSlugs, targetBatchCategory);
    success(`已将 ${count} 篇文章分类批量修改为「${targetBatchCategory}」`);
    setSelectedSlugs([]);
    setBatchCategoryModal(false);
  };

  // 单篇确认删除
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deletePost(deleteTarget.slug);
    success(`文章《${deleteTarget.title}》已移入回收站`);
    setDeleteTarget(null);
  };

  return (
    <div className="admin-page-body space-y-5">
      {/* 页面头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <FileText className="w-6 h-6 text-sky-500" />
            <span>文章管理</span>
          </h1>
          <p>
            共收录 {posts.length} 篇文稿，已发布 {posts.filter((p) => !p.draft).length} 篇，草稿 {posts.filter((p) => p.draft).length} 篇。支持批量治理、推荐标记与回收站保护。
          </p>
        </div>

        <button
          onClick={() => onOpenEditor('post')}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>新建文章</span>
        </button>
      </div>

      {/* 搜索与多维度筛选栏 */}
      <div className="admin-card">
        <div className="p-4 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章标题、路径 Slug 或标签..."
                className="admin-input pl-9 text-xs"
              />
            </div>

            {/* 视图切换 + 排序 + 重置 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="admin-select !w-auto !py-1 !text-xs"
                >
                  <option value="date-desc">最新日期优先</option>
                  <option value="date-asc">最早日期优先</option>
                  <option value="words-desc">字数最多优先</option>
                </select>
              </div>

              {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSelectedTag(null);
                  }}
                  className="admin-btn admin-btn-secondary admin-btn-sm text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              )}

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="表格视图"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="网格卡片视图"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 筛选标签条 */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* 状态筛选 */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  selectedStatus === 'all'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-2xs font-semibold'
                    : 'text-slate-500'
                }`}
              >
                全部 ({posts.length})
              </button>
              <button
                onClick={() => setSelectedStatus('published')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  selectedStatus === 'published'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-2xs font-semibold'
                    : 'text-slate-500'
                }`}
              >
                已发布 ({posts.filter((p) => !p.draft).length})
              </button>
              <button
                onClick={() => setSelectedStatus('draft')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  selectedStatus === 'draft'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-2xs font-semibold'
                    : 'text-slate-500'
                }`}
              >
                草稿 ({posts.filter((p) => p.draft).length})
              </button>
            </div>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* 分类筛选 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select !w-auto !py-1 !text-xs"
            >
              <option value="all">所有分类 ({posts.length})</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>

            {/* 热门标签筛选 */}
            {tags.slice(0, 6).map((t) => {
              const active = selectedTag === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTag(active ? null : t.name)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors ${
                    active
                      ? 'bg-sky-500 text-white font-medium shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  #{t.name} ({t.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 批量操作条 (当有选中项时) */}
        {selectedSlugs.length > 0 && (
          <div className="p-3 px-4 bg-sky-50 dark:bg-sky-950/80 border-t border-sky-200 dark:border-sky-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-950 dark:text-sky-100 animate-in fade-in">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              已选择 {selectedSlugs.length} 篇文章
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBatchPublish(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm !text-xs"
              >
                批量发布
              </button>
              <button
                onClick={() => handleBatchPublish(true)}
                className="admin-btn admin-btn-secondary admin-btn-sm !text-xs"
              >
                批量转草稿
              </button>
              <button
                onClick={() => {
                  setTargetBatchCategory(categories[0]?.name || '');
                  setBatchCategoryModal(true);
                }}
                className="admin-btn admin-btn-secondary admin-btn-sm !text-xs flex items-center gap-1"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span>批量修改分类</span>
              </button>
              <button
                onClick={handleBatchDelete}
                className="admin-btn admin-btn-danger admin-btn-sm !text-xs flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>批量存入回收站</span>
              </button>
              <button
                onClick={() => setSelectedSlugs([])}
                className="text-xs text-slate-500 hover:underline px-2"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 内容展示区 */}
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
            <div>未找到匹配的文章内容</div>
            <button
              onClick={() => onOpenEditor('post')}
              className="text-sky-600 hover:underline font-sans"
            >
              新建一篇文章
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* 表格视图 */
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-10 text-center">
                    <button onClick={handleSelectAll} className="p-1">
                      {selectedSlugs.length === filteredPosts.length ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th>文章标题 & 标识</th>
                  <th>推荐</th>
                  <th>分类</th>
                  <th>标签</th>
                  <th>字数 & 时长</th>
                  <th>发布日期</th>
                  <th>状态</th>
                  <th className="text-right pr-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const isSelected = selectedSlugs.includes(post.slug);
                  const isRecommended = Boolean(post.recommend && post.recommend > 0);

                  return (
                    <tr key={post.slug} className={isSelected ? 'bg-sky-50/50 dark:bg-sky-950/40' : ''}>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggleSelect(post.slug)}
                          className="p-1 text-slate-400 hover:text-sky-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="space-y-0.5 max-w-sm">
                          <div
                            onClick={() => onOpenEditor('post', post.slug)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 cursor-pointer truncate"
                          >
                            {post.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate">
                            /{post.slug}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const next = isRecommended ? 0 : 1;
                            setPostRecommend(post.slug, next);
                            success(`已${next ? '推荐' : '取消推荐'}文章《${post.title}》`);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isRecommended
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
                          }`}
                          title={isRecommended ? '点击取消首页推荐' : '点击设为首页推荐文章'}
                        >
                          <Star className={`w-4 h-4 ${isRecommended ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {post.category}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="admin-badge tag text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {post.wordCount} 字 &bull; {post.readingTime}
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {post.date}
                      </td>
                      <td>
                        <button
                          onClick={() => togglePostDraft(post.slug)}
                          className={`admin-badge ${post.draft ? 'draft' : 'published'} cursor-pointer hover:opacity-80`}
                          title="点击切换草稿/发布状态"
                        >
                          {post.draft ? '草稿' : '已发布'}
                        </button>
                      </td>
                      <td className="text-right pr-4">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onOpenEditor('post', post.slug)}
                            className="admin-icon-btn !w-7 !h-7 text-sky-600 hover:bg-sky-50"
                            title="编辑"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyLink(post.slug)}
                            className="admin-icon-btn !w-7 !h-7 text-slate-500"
                            title="复制访问链接"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => window.open(`/posts/${post.slug}`, '_blank')}
                            className="admin-icon-btn !w-7 !h-7 text-slate-500"
                            title="前台预览"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="admin-icon-btn !w-7 !h-7 text-red-500 hover:bg-red-50"
                            title="删除文章（存入回收站）"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* 网格卡片视图 */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const isRecommended = Boolean(post.recommend && post.recommend > 0);

              return (
                <div
                  key={post.slug}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {isRecommended && (
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        )}
                        <button
                          onClick={() => togglePostDraft(post.slug)}
                          className={`admin-badge ${post.draft ? 'draft' : 'published'}`}
                        >
                          {post.draft ? '草稿' : '已发布'}
                        </button>
                      </div>
                    </div>

                    <h3
                      onClick={() => onOpenEditor('post', post.slug)}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-sky-600 cursor-pointer line-clamp-2"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{post.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditor('post', post.slug)}
                        className="admin-icon-btn !w-7 !h-7 text-sky-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="admin-icon-btn !w-7 !h-7 text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 批量修改分类模态框 */}
      {batchCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setBatchCategoryModal(false)}>
          <div
            className="admin-modal-dialog p-5 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              批量修改 {selectedSlugs.length} 篇文章分类
            </h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-500">选择目标分类：</label>
              <select
                value={targetBatchCategory}
                onChange={(e) => setTargetBatchCategory(e.target.value)}
                className="admin-select"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchCategoryModal(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmBatchCategory}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                确认应用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除二次确认模态框 */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="admin-modal-dialog p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                移入回收站确认
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                你确定要删除《<strong>{deleteTarget.title}</strong>》吗？该文章将被移入<strong>回收站</strong>，你可以在顶栏回收站随时一键找回或彻底清除。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                移入回收站
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量移入回收站二次确认模态框 */}
      {batchDeleteConfirmOpen && (
        <div className="admin-modal-overlay" onClick={() => setBatchDeleteConfirmOpen(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>批量移入回收站</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                确定将选中的 <strong>{selectedSlugs.length}</strong> 篇文章移入回收站吗？你可以随时在顶栏回收站中一键恢复或彻底粉碎。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setBatchDeleteConfirmOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认移入回收站
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
