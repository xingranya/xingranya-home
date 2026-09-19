import React, { useState } from 'react';
import {
  Tag as TagIcon,
  FolderOpen,
  Edit2,
  Check,
  X,
  Search,
  Merge,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';

export const AdminTaxonomy: React.FC = () => {
  const {
    categories,
    tags,
    renameCategory,
    renameTag,
    mergeCategories,
    mergeTags,
    pruneUnusedTags,
  } = useAdminStore();
  const { success, warning, info } = useToast();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const [searchTagQuery, setSearchTagQuery] = useState('');

  // 分类合并弹窗状态
  const [mergeCategoryModal, setMergeCategoryModal] = useState<string | null>(null);
  const [targetCategory, setTargetCategory] = useState('');

  // 标签合并弹窗状态
  const [mergeTagModal, setMergeTagModal] = useState<string | null>(null);
  const [targetTag, setTargetTag] = useState('');

  // 处理分类重命名
  const handleSaveCategory = (oldName: string) => {
    if (!newCategoryName.trim() || newCategoryName.trim() === oldName) {
      setEditingCategory(null);
      return;
    }
    const ok = renameCategory(oldName, newCategoryName.trim());
    if (ok) {
      success(`分类「${oldName}」已重命名为「${newCategoryName.trim()}」`);
    }
    setEditingCategory(null);
  };

  // 处理分类合并
  const handleConfirmMergeCategory = () => {
    if (!mergeCategoryModal || !targetCategory || mergeCategoryModal === targetCategory) {
      warning('请选择一个不同的目标分类进行合并');
      return;
    }
    const count = mergeCategories(mergeCategoryModal, targetCategory);
    success(`已成功将分类「${mergeCategoryModal}」的 ${count} 篇文章合并至「${targetCategory}」`);
    setMergeCategoryModal(null);
  };

  // 处理标签重命名
  const handleSaveTag = (oldName: string) => {
    if (!newTagName.trim() || newTagName.trim() === oldName) {
      setEditingTag(null);
      return;
    }
    const ok = renameTag(oldName, newTagName.trim());
    if (ok) {
      success(`标签「${oldName}」已重命名为「${newTagName.trim()}」`);
    }
    setEditingTag(null);
  };

  // 处理标签合并
  const handleConfirmMergeTag = () => {
    if (!mergeTagModal || !targetTag || mergeTagModal === targetTag) {
      warning('请选择一个不同的目标标签进行合并');
      return;
    }
    const count = mergeTags(mergeTagModal, targetTag);
    success(`已成功将标签「${mergeTagModal}」关联的 ${count} 篇文章/手记合并至「${targetTag}」`);
    setMergeTagModal(null);
  };

  // 一键清理孤立标签
  const handlePruneTags = () => {
    const result = pruneUnusedTags();
    const count = result.prunedTags.length;
    if (count > 0) {
      success(`已清理 ${count} 个零引用的冗余标签（${result.prunedTags.join(', ')}）`);
    } else {
      info('当前标签库结构健康，暂无零引用的冗余标签');
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchTagQuery.trim().toLowerCase())
  );

  return (
    <div className="admin-page-body space-y-6">
      {/* 头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <TagIcon className="w-6 h-6 text-sakura-500" />
            <span>分类与标签管理</span>
          </h1>
          <p>
            统一维护全站文稿的分类拓扑体系与标签元数据，支持无缝重命名、跨分类/标签合并及孤立元数据清理。
          </p>
        </div>

        <button
          onClick={handlePruneTags}
          className="admin-btn admin-btn-secondary admin-btn-sm"
          title="清理无任何内容引用的孤立标签"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>清理孤立标签</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：文章分类体系 */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>
              <FolderOpen className="w-4 h-4 text-sakura-500" />
              <span>文稿分类体系 ({categories.length})</span>
            </h3>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat) => {
              const isEditing = editingCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="admin-input !py-1 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCategory(cat.name);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveCategory(cat.name)}
                          className="admin-icon-btn !w-7 !h-7 text-emerald-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="admin-icon-btn !w-7 !h-7 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {cat.name}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          收录 {cat.count} 篇文章
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMergeCategoryModal(cat.name);
                          const other = categories.find((c) => c.name !== cat.name);
                          setTargetCategory(other ? other.name : '');
                        }}
                        className="admin-icon-btn !w-7 !h-7 text-slate-400 hover:text-sakura-600"
                        title="合并至其他分类"
                      >
                        <Merge className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(cat.name);
                          setNewCategoryName(cat.name);
                        }}
                        className="admin-icon-btn !w-7 !h-7 text-slate-400 hover:text-sakura-600"
                        title="重命名分类"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：标签元数据管理 */}
        <div className="admin-card flex flex-col">
          <div className="admin-card-header">
            <h3>
              <TagIcon className="w-4 h-4 text-violet-500" />
              <span>全站标签拓扑 ({tags.length})</span>
            </h3>

            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTagQuery}
                onChange={(e) => setSearchTagQuery(e.target.value)}
                placeholder="搜索标签..."
                className="admin-input !pl-7 !py-1 text-xs"
              />
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap gap-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredTags.map((tag) => {
                const isEditing = editingTag === tag.name;
                if (isEditing) {
                  return (
                    <div key={tag.name} className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-sakura-500 p-1 rounded-lg">
                      <input
                        autoFocus
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="text-xs px-1 outline-none bg-transparent w-20 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTag(tag.name);
                          if (e.key === 'Escape') setEditingTag(null);
                        }}
                      />
                      <button onClick={() => handleSaveTag(tag.name)} className="text-emerald-500 p-0.5">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditingTag(null)} className="text-slate-400 p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-sakura-500 hover:text-sakura-600 border border-slate-200 dark:border-slate-700 text-xs font-mono transition-colors group"
                  >
                    <span>#{tag.name}</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      ({tag.count})
                    </span>
                    <button
                      onClick={() => {
                        setEditingTag(tag.name);
                        setNewTagName(tag.name);
                      }}
                      className="text-slate-400 hover:text-sakura-500 ml-0.5"
                      title="重命名标签"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMergeTagModal(tag.name);
                        const other = tags.find((t) => t.name !== tag.name);
                        setTargetTag(other ? other.name : '');
                      }}
                      className="text-slate-400 hover:text-violet-500"
                      title="合并标签"
                    >
                      <Merge className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed font-mono">
              提示：重命名或合并标签将原子化更新所有关联文章与手记的前置元数据，保持全站索引一致。
            </div>
          </div>
        </div>
      </div>

      {/* 分类合并模态框 */}
      {mergeCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setMergeCategoryModal(null)}>
          <div
            className="admin-modal-dialog p-5 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sakura-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                合并分类「{mergeCategoryModal}」
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              该分类下的所有文章将被自动归并到目标分类中，原分类将被安全移除。
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">选择目标归并分类：</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="admin-select"
              >
                {categories
                  .filter((c) => c.name !== mergeCategoryModal)
                  .map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count} 篇)
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMergeCategoryModal(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmMergeCategory}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                确认合并
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 标签合并模态框 */}
      {mergeTagModal && (
        <div className="admin-modal-overlay" onClick={() => setMergeTagModal(null)}>
          <div
            className="admin-modal-dialog p-5 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Merge className="w-5 h-5 text-violet-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                合并标签 #{mergeTagModal}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              所有引用了 #{mergeTagModal} 的文章与手记将替换为目标标签，原标签将自动清理。
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">选择目标标签：</label>
              <select
                value={targetTag}
                onChange={(e) => setTargetTag(e.target.value)}
                className="admin-select"
              >
                {tags
                  .filter((t) => t.name !== mergeTagModal)
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      #{t.name} ({t.count} 次引用)
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMergeTagModal(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmMergeTag}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                确认合并
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
