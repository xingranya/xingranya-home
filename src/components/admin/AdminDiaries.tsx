import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CloudSun,
  Smile,
  MapPin,
  Calendar,
  CheckSquare,
  Square,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import type { Diary } from '../../types';

interface AdminDiariesProps {
  onOpenEditor: (type: 'post' | 'diary', slug?: string) => void;
}

export const AdminDiaries: React.FC<AdminDiariesProps> = ({ onOpenEditor }) => {
  const { diaries, deleteDiary, batchDeleteDiaries } = useAdminStore();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeather, setSelectedWeather] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Diary | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  const filteredDiaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return diaries.filter((d) => {
      if (selectedWeather !== 'all' && d.weather !== selectedWeather) return false;
      if (selectedMood !== 'all' && d.mood !== selectedMood) return false;

      if (!q) return true;

      return (
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [diaries, searchQuery, selectedWeather, selectedMood]);

  // 全选/反选
  const handleSelectAll = () => {
    if (selectedSlugs.length === filteredDiaries.length) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(filteredDiaries.map((d) => d.slug));
    }
  };

  const handleToggleSelect = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedSlugs.length === 0) return;
    setBatchDeleteConfirmOpen(true);
  };

  const handleConfirmBatchDelete = () => {
    const count = batchDeleteDiaries(selectedSlugs);
    success(`已将 ${count} 篇手记移入回收站`);
    setSelectedSlugs([]);
    setBatchDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteDiary(deleteTarget.slug);
    success(`手记《${deleteTarget.title}》已移入回收站`);
    setDeleteTarget(null);
  };

  return (
    <div className="admin-page-body space-y-5">
      {/* 头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <BookOpen className="w-6 h-6 text-violet-500" />
            <span>手记随笔管理</span>
          </h1>
          <p>
            共记录 {diaries.length} 篇心境与生活片段，支持按天气、心境与关键词筛选，享有回收站防误删保障。
          </p>
        </div>

        <button
          onClick={() => onOpenEditor('diary')}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>写手记</span>
        </button>
      </div>

      {/* 搜索与过滤 */}
      <div className="admin-card">
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索手记标题、心境或正文摘要..."
                className="admin-input pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              {(searchQuery || selectedWeather !== 'all' || selectedMood !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedWeather('all');
                    setSelectedMood('all');
                  }}
                  className="admin-btn admin-btn-secondary admin-btn-sm text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              )}

              <select
                value={selectedWeather}
                onChange={(e) => setSelectedWeather(e.target.value)}
                className="admin-select !w-auto !py-1 !text-xs"
              >
                <option value="all">所有天气</option>
                <option value="晴">晴</option>
                <option value="多云">多云</option>
                <option value="阴">阴</option>
                <option value="雨">雨</option>
              </select>

              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="admin-select !w-auto !py-1 !text-xs"
              >
                <option value="all">所有心境</option>
                <option value="平静">平静</option>
                <option value="喜悦">喜悦</option>
                <option value="思考">思考</option>
                <option value="专注">专注</option>
              </select>
            </div>
          </div>
        </div>

        {/* 批量操作条 */}
        {selectedSlugs.length > 0 && (
          <div className="p-3 px-4 bg-violet-50 dark:bg-violet-950/80 border-t border-violet-200 dark:border-violet-800/80 flex items-center justify-between text-xs text-violet-900 dark:text-violet-100">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-violet-600" />
              已选中 {selectedSlugs.length} 篇手记
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchDelete}
                className="admin-btn admin-btn-danger admin-btn-sm !text-xs flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>移入回收站</span>
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

        {/* 手记列表 */}
        {filteredDiaries.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
            <div>暂无匹配的手记随笔</div>
            <button
              onClick={() => onOpenEditor('diary')}
              className="text-sakura-600 hover:underline font-sans"
            >
              写一篇新手记
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3 text-xs text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <button onClick={handleSelectAll} className="p-0.5">
                {selectedSlugs.length === filteredDiaries.length && filteredDiaries.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-sakura-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span>全选手记</span>
            </div>

            {filteredDiaries.map((diary) => {
              const isSelected = selectedSlugs.includes(diary.slug);

              return (
                <div
                  key={diary.slug}
                  className={`p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected ? 'bg-violet-50/40 dark:bg-violet-950/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleSelect(diary.slug)}
                      className="p-1 mt-0.5 text-slate-400 hover:text-violet-600 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-sakura-600 cursor-pointer"
                          onClick={() => onOpenEditor('diary', diary.slug)}
                        >
                          {diary.title}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                          <CloudSun className="w-3 h-3" /> {diary.weather}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-sakura-50 dark:bg-sakura-950/60 text-sakura-600 dark:text-sakura-400 border border-sakura-200 dark:border-sakura-800">
                          <Smile className="w-3 h-3" /> {diary.mood}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {diary.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {diary.date} {diary.time}
                        </span>
                        {diary.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" /> {diary.location}
                          </span>
                        )}
                        <span>{diary.wordCount} 字</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                    <button
                      onClick={() => onOpenEditor('diary', diary.slug)}
                      className="admin-icon-btn !w-8 !h-8 text-sakura-600 hover:bg-sakura-50"
                      title="编辑手记"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => window.open(`/diaries/${diary.slug}`, '_blank')}
                      className="admin-icon-btn !w-8 !h-8 text-slate-500"
                      title="前台查看"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(diary)}
                      className="admin-icon-btn !w-8 !h-8 text-red-500 hover:bg-red-50"
                      title="移入回收站"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 删除二次确认模态框 */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="admin-modal-dialog p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                确认移入回收站
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                你确定要删除《<strong>{deleteTarget.title}</strong>》吗？该手记将安全存入<strong>回收站</strong>，你可以在顶栏随时撤销恢复。
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
                确定将选中的 <strong>{selectedSlugs.length}</strong> 篇手记移入回收站吗？你可以在顶栏回收站随时一键恢复。
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
