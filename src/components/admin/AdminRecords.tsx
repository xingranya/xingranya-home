import React, { useState, useMemo } from 'react';
import {
  Activity,
  Send,
  Heart,
  MessageCircle,
  Pin,
  Trash2,
  Edit2,
  MapPin,
  Smile,
  Image as ImageIcon,
  Sparkles,
  X,
  Calendar,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import type { RecordItem } from '../../types';

const MOOD_OPTIONS = [
  { label: '全部心境', value: 'ALL' },
  { label: '灵感与光芒', value: '灵感' },
  { label: '悠闲随笔', value: '随笔' },
  { label: '沉浸编码', value: '编码' },
  { label: '平和宁静', value: '平静' },
  { label: '热烈充实', value: '充实' },
  { label: '夜深人静', value: '夜读' },
];

export const AdminRecords: React.FC = () => {
  const {
    records,
    saveRecord,
    deleteRecord,
    toggleRecordPin,
    updateRecordLikes,
    setRecordLikes,
    addRecordComment,
    deleteRecordComment,
    clearRecordComments,
    batchDeleteRecords,
    batchToggleRecordsPin,
    siteConfig,
  } = useAdminStore();
  const { success, warning } = useToast();

  // 发布 / 编辑表单状态
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('灵感');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // 搜索与筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('ALL');
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // 评论管理抽屉
  const [activeRecordForComments, setActiveRecordForComments] = useState<RecordItem | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 单项删除确认
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);

  // 点赞数修改弹窗
  const [editingLikesId, setEditingLikesId] = useState<string | number | null>(null);
  const [customLikesValue, setCustomLikesValue] = useState<number>(0);

  // 过滤后的说说列表
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 搜索关键词
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchContent = rec.content.toLowerCase().includes(q);
        const matchLocation = rec.location?.toLowerCase().includes(q);
        const matchMood = rec.mood?.toLowerCase().includes(q);
        if (!matchContent && !matchLocation && !matchMood) return false;
      }
      // 心境筛选
      if (selectedMood !== 'ALL' && rec.mood !== selectedMood) {
        return false;
      }
      // 置顶筛选
      if (filterPinnedOnly && !rec.pinned) {
        return false;
      }
      return true;
    });
  }, [records, searchQuery, selectedMood, filterPinnedOnly]);

  // 批量全选 / 反选
  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const count = batchDeleteRecords(selectedIds);
    success(`已将 ${count} 条说说移入回收站（可随时在回收站撤回恢复）`);
    setSelectedIds([]);
  };

  // 批量置顶 / 取消置顶
  const handleBatchPin = (pin: boolean) => {
    if (selectedIds.length === 0) return;
    const count = batchToggleRecordsPin(selectedIds, pin);
    success(`已批量将 ${count} 条说说${pin ? '设为置顶' : '取消置顶'}`);
    setSelectedIds([]);
  };

  // 提交发布或更新
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      warning('请输入说说动态正文');
      return;
    }

    const media = imageUrl.trim()
      ? [{ type: 'image' as const, url: imageUrl.trim() }]
      : [];

    if (editingId) {
      saveRecord({
        id: editingId,
        content: content.trim(),
        mood,
        location: location.trim(),
        pinned: isPinned,
        media: media.length > 0 ? media : undefined,
      });
      success('说说动态已更新保存！');
      setEditingId(null);
    } else {
      saveRecord({
        content: content.trim(),
        mood,
        location: location.trim(),
        pinned: isPinned,
        media: media.length > 0 ? media : undefined,
        likes: 0,
      });
      success('新说说动态已成功发布！');
    }

    // 重置表单
    setContent('');
    setLocation('');
    setImageUrl('');
    setIsPinned(false);
    setMood('灵感');
  };

  // 开始编辑现有说说
  const handleStartEdit = (rec: RecordItem) => {
    setEditingId(rec.id);
    setContent(rec.content);
    setMood(rec.mood || '灵感');
    setLocation(rec.location || '');
    setIsPinned(Boolean(rec.pinned));
    const imgMedia = rec.media?.find((m) => m.type === 'image');
    setImageUrl(imgMedia && 'url' in imgMedia ? imgMedia.url : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setContent('');
    setLocation('');
    setImageUrl('');
    setIsPinned(false);
    setMood('灵感');
  };

  // 发表博主回复
  const handleAddReply = () => {
    if (!activeRecordForComments || !replyContent.trim()) return;
    addRecordComment(activeRecordForComments.id, siteConfig.author.name || '博主', replyContent.trim());
    setReplyContent('');
    // 同步更新模态框内数据
    const updated = records.find((r) => r.id === activeRecordForComments.id);
    if (updated) setActiveRecordForComments(updated);
    success('回复发表成功');
  };

  // 保存点赞数
  const handleSaveLikes = () => {
    if (editingLikesId === null) return;
    setRecordLikes(editingLikesId, customLikesValue);
    success(`点赞数已更新为 ${customLikesValue}`);
    setEditingLikesId(null);
  };

  return (
    <div className="admin-page-body space-y-6">
      {/* 页面头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <Activity className="w-6 h-6 text-amber-500" />
            <span>说说动态管理</span>
          </h1>
          <p>
            记录生活灵感与简短切片，当前共收录 {records.length} 条动态。支持全选批量管理、置顶控制、图片预览、互动评论与点赞调节。
          </p>
        </div>
      </div>

      {/* 发布 / 编辑动态卡片 */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{editingId ? '编辑说说动态' : '发布新的日常说说'}</span>
          </h3>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              取消编辑
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="这一刻在想什么？支持普通文本或 Markdown 语法..."
            className="admin-textarea text-xs sm:text-sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 心境选择 */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <Smile className="w-4 h-4 text-amber-500 shrink-0" />
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-700 dark:text-slate-300"
              >
                <option value="灵感">灵感与光芒</option>
                <option value="随笔">悠闲随笔</option>
                <option value="编码">沉浸编码</option>
                <option value="平静">平和宁静</option>
                <option value="充实">热烈充实</option>
                <option value="夜读">夜深人静</option>
              </select>
            </div>

            {/* 定位地点 */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="地点 (如: 杭州 · 书房)"
                className="bg-transparent outline-none w-full text-slate-700 dark:text-slate-300 placeholder-slate-400"
              />
            </div>

            {/* 附图 URL */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <ImageIcon className="w-4 h-4 text-sakura-500 shrink-0" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="图片链接 URL (可选)"
                className="bg-transparent outline-none w-full text-slate-700 dark:text-slate-300 placeholder-slate-400 font-mono text-[11px]"
              />
              {imageUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-slate-400 hover:text-slate-600"
                  title="清除图片"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 图片即时预览区域 */}
          {imageUrl.trim() && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                <img
                  src={imageUrl.trim()}
                  alt="预览"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 min-w-0">
                <p className="font-medium text-slate-700 dark:text-slate-300">附图实时预览</p>
                <p className="truncate font-mono text-[11px] text-slate-400">{imageUrl.trim()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="flex items-center gap-1 font-medium">
                <Pin className="w-3.5 h-3.5 text-amber-500" /> 置顶这条说说
              </span>
            </label>

            <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
              <Send className="w-3.5 h-3.5" />
              <span>{editingId ? '保存修改' : '立即发布'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 搜索、心境过滤与批量控制条 */}
      <div className="admin-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索说说正文、心境或地点..."
              className="admin-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* 置顶过滤开关 */}
            <button
              onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
              className={`admin-btn admin-btn-sm ${
                filterPinnedOnly
                  ? 'admin-btn-primary !bg-amber-500 !border-amber-500 text-white'
                  : 'admin-btn-secondary'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>只看置顶</span>
            </button>

            {/* 全选 / 取消全选 */}
            <button
              onClick={handleSelectAll}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="全选当前过滤出的所有说说"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredRecords.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-sakura-500" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>
                {selectedIds.length === filteredRecords.length && filteredRecords.length > 0
                  ? '取消全选'
                  : '全选'}
              </span>
            </button>
          </div>
        </div>

        {/* 心境胶囊筛选 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedMood(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedMood === opt.value
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 浮动批量操作条 (选中时呈现) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-4 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="font-semibold text-amber-400 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" />
            已选择 {selectedIds.length} 条动态
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchPin(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>设为置顶</span>
            </button>
            <button
              onClick={() => handleBatchPin(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium flex items-center gap-1 transition-colors"
            >
              <span>取消置顶</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>移入回收站</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 说说时间线列表 */}
      <div className="space-y-4">
        <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>动态时间线</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              (共 {records.length} 条，当前匹配 {filteredRecords.length} 条)
            </span>
          </div>
        </h2>

        {filteredRecords.length === 0 ? (
          <div className="admin-card py-16 text-center text-xs font-mono text-slate-400 space-y-2">
            <div>暂无匹配的说说动态</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMood('ALL');
                setFilterPinnedOnly(false);
              }}
              className="text-sakura-600 hover:underline font-sans"
            >
              重置所有过滤条件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((rec) => {
              const isSelected = selectedIds.includes(rec.id);
              const hasImg = rec.media?.find((m) => m.type === 'image');
              return (
                <div
                  key={rec.id}
                  className={`admin-card p-4 flex flex-col justify-between space-y-3 relative transition-all ${
                    isSelected ? 'ring-2 ring-sakura-500/60 bg-sakura-50/10' : ''
                  }`}
                >
                  {/* 顶栏：复选框 + 发布时间 + 心境 + 置顶标识 + 操作按钮 */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSelect(rec.id)}
                        className="p-0.5 text-slate-400 hover:text-sakura-500 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sakura-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(Number(rec.createTime)).toLocaleDateString('zh-CN')}
                      </span>

                      {rec.mood && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans text-[11px]">
                          {rec.mood}
                        </span>
                      )}

                      {rec.pinned && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold font-sans">
                          <Pin className="w-2.5 h-2.5" /> 置顶
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRecordPin(rec.id)}
                        className={`admin-icon-btn !w-6 !h-6 ${rec.pinned ? '!text-amber-500' : 'text-slate-400'}`}
                        title={rec.pinned ? '取消置顶' : '设为置顶'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="admin-icon-btn !w-6 !h-6 text-sakura-600"
                        title="编辑"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(rec.id)}
                        className="admin-icon-btn !w-6 !h-6 text-red-500"
                        title="删除并移入回收站"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 正文 */}
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {rec.content}
                  </div>

                  {/* 附图展示 */}
                  {hasImg && 'url' in hasImg && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 bg-slate-100 dark:bg-slate-900">
                      <img
                        src={hasImg.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* 底栏：点赞调节 + 评论入口 + 定位 */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      {/* 点赞计数与自定义数值 */}
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                        <button
                          onClick={() => {
                            setEditingLikesId(rec.id);
                            setCustomLikesValue(rec.likes || 0);
                          }}
                          className="font-mono hover:text-rose-600 hover:underline"
                          title="点击手动修改点赞数"
                        >
                          {rec.likes || 0}
                        </button>
                        <button
                          onClick={() => updateRecordLikes(rec.id, 1)}
                          className="text-[10px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-mono"
                          title="点赞 +1"
                        >
                          +1
                        </button>
                      </div>

                      {/* 评论管理 */}
                      <button
                        onClick={() => setActiveRecordForComments(rec)}
                        className="flex items-center gap-1 hover:text-sakura-600 transition-colors"
                        title="查看与管理该动态的互动评论"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{rec.comments?.length || 0} 条评论</span>
                      </button>
                    </div>

                    {rec.location && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {rec.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 评论管理抽屉 / 模态框 */}
      {activeRecordForComments && (
        <div className="admin-modal-overlay" onClick={() => setActiveRecordForComments(null)}>
          <div
            className="admin-modal-dialog p-5 max-w-lg space-y-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sakura-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  说说互动评论管理 ({activeRecordForComments.comments?.length || 0})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeRecordForComments.comments && activeRecordForComments.comments.length > 0 && (
                  <button
                    onClick={() => {
                      clearRecordComments(activeRecordForComments.id);
                      setActiveRecordForComments({ ...activeRecordForComments, comments: [] });
                      success('已清空该说说的所有评论');
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    清空评论
                  </button>
                )}
                <button
                  onClick={() => setActiveRecordForComments(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-64">
              {(!activeRecordForComments.comments || activeRecordForComments.comments.length === 0) ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400">
                  暂无评论互动
                </div>
              ) : (
                activeRecordForComments.comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {cmt.author}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(cmt.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {cmt.content}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        deleteRecordComment(activeRecordForComments.id, cmt.id);
                        setActiveRecordForComments({
                          ...activeRecordForComments,
                          comments: activeRecordForComments.comments?.filter((c) => c.id !== cmt.id),
                        });
                        success('评论已删除');
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="删除评论"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 追加博主回复输入 */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="以博主身份发表回复..."
                className="admin-input text-xs flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddReply()}
              />
              <button
                onClick={handleAddReply}
                className="admin-btn admin-btn-primary admin-btn-sm text-xs"
              >
                发送回复
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 点赞数值精确修改模态框 */}
      {editingLikesId !== null && (
        <div className="admin-modal-overlay" onClick={() => setEditingLikesId(null)}>
          <div
            className="admin-modal-dialog p-5 max-w-xs space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>设置点赞数值</span>
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">点赞总计：</label>
              <input
                type="number"
                min={0}
                value={customLikesValue}
                onChange={(e) => setCustomLikesValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="admin-input font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setEditingLikesId(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleSaveLikes}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                保存点赞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除说说二次确认（回收站保护提示） */}
      {deleteTargetId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>确认移入回收站</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                删除后该条说说将自动暂存至<strong>数据回收站</strong>，若误删可随时在侧边栏或顶栏回收站一键撤销恢复。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deleteRecord(deleteTargetId);
                  success('说说已移入回收站');
                  setDeleteTargetId(null);
                }}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
