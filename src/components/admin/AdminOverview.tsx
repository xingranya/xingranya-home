import React, { useMemo, useState } from 'react';
import {
  FileText,
  BookOpen,
  Activity,
  Users,
  PenTool,
  Clock,
  Sparkles,
  TrendingUp,
  Plus,
  ExternalLink,
  Tag,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  Layers,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import type { AdminViewType } from './AdminLayout';

interface AdminOverviewProps {
  onNavigate: (view: AdminViewType) => void;
  onOpenEditor: (type: 'post' | 'diary', slug?: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigate,
  onOpenEditor,
}) => {
  const { posts, diaries, records, friends, categories, tags, logs, siteConfig, storageUsage, clearLogs } = useAdminStore();
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [confirmClearLogsOpen, setConfirmClearLogsOpen] = useState(false);

  const publishedCount = useMemo(() => posts.filter((p) => !p.draft).length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.draft).length, [posts]);

  // 全站字数统计
  const totalWords = useMemo(() => {
    const postsWords = posts.reduce((sum, p) => sum + (p.wordCount || 0), 0);
    const diariesWords = diaries.reduce((sum, d) => sum + (d.wordCount || 0), 0);
    return postsWords + diariesWords;
  }, [posts, diaries]);

  // 预估全站总阅读时间（分钟）
  const totalReadingMinutes = Math.max(1, Math.ceil(totalWords / 300));

  // 最近文章 (5篇)
  const recentPosts = useMemo(() => {
    return [...posts].slice(0, 5);
  }, [posts]);

  // 最近动态
  const displayedLogs = useMemo(() => {
    return showAllLogs ? logs.slice(0, 30) : logs.slice(0, 6);
  }, [logs, showAllLogs]);

  return (
    <div className="admin-page-body space-y-6">
      {/* 顶部欢迎卡片 */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-200/60 dark:border-sky-800/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono">
            <Sparkles className="w-3 h-3" /> COT CONSOLE &bull; 创作总览
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            你好，{siteConfig.author.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            本地数据就绪，全站共收录了 {posts.length} 篇文稿与 {diaries.length} 篇手记。保持专注与创造力。
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={() => onOpenEditor('post')}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>新建文稿</span>
          </button>
          <button
            onClick={() => onNavigate('records')}
            className="admin-btn admin-btn-secondary"
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span>发说说</span>
          </button>
        </div>
      </div>

      {/* 全局配置与底层数据快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('settings')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>全站与页面配置中心</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  8 大模块
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                可视化配置首页 Hero 标语、关于页技术栈、友链指南、导航与页脚
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div
          onClick={() => onNavigate('fileEditor')}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>底层数据与源码中心</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  源码热重载
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                在线维护 site.config.json 等底层配置文件，支持语法校验与增量导出同步
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* 核心指标矩阵 */}
      <div className="admin-metric-grid">
        {/* 公开文章 */}
        <div
          onClick={() => onNavigate('posts')}
          className="admin-stat-card cursor-pointer"
        >
          <div className="admin-stat-top">
            <div className="admin-stat-icon-wrap">
              <FileText className="w-5 h-5" />
            </div>
            {draftCount > 0 && (
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                {draftCount} 篇草稿
              </span>
            )}
          </div>
          <div className="admin-stat-val">{publishedCount}</div>
          <div className="admin-stat-label">公开文稿篇数</div>
        </div>

        {/* 手记随笔 */}
        <div
          onClick={() => onNavigate('diaries')}
          className="admin-stat-card cursor-pointer"
        >
          <div className="admin-stat-top">
            <div className="admin-stat-icon-wrap violet">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800">
              心境手记
            </span>
          </div>
          <div className="admin-stat-val">{diaries.length}</div>
          <div className="admin-stat-label">生活与灵感随笔</div>
        </div>

        {/* 说说动态 */}
        <div
          onClick={() => onNavigate('records')}
          className="admin-stat-card cursor-pointer"
        >
          <div className="admin-stat-top">
            <div className="admin-stat-icon-wrap amber">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 实时记录
            </span>
          </div>
          <div className="admin-stat-val">{records.length}</div>
          <div className="admin-stat-label">说说动态记录</div>
        </div>

        {/* 友链数量 */}
        <div
          onClick={() => onNavigate('friends')}
          className="admin-stat-card cursor-pointer"
        >
          <div className="admin-stat-top">
            <div className="admin-stat-icon-wrap emerald">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              互联邻居
            </span>
          </div>
          <div className="admin-stat-val">{friends.length}</div>
          <div className="admin-stat-label">友链伙伴站点</div>
        </div>

        {/* 全站文字体量 */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon-wrap">
              <PenTool className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              约 {totalReadingMinutes} 分钟
            </span>
          </div>
          <div className="admin-stat-val">{(totalWords / 1000).toFixed(1)}k</div>
          <div className="admin-stat-label">全站累计字数</div>
        </div>
      </div>

      {/* 中部双栏：最近编辑 + 分类占比 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 2 栏：最近编辑内容 */}
        <div className="lg:col-span-2 admin-card">
          <div className="admin-card-header">
            <h3>
              <FileText className="w-4 h-4 text-sky-500" />
              <span>最近编辑文稿</span>
            </h3>
            <button
              onClick={() => onNavigate('posts')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>查看全部文章</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPosts.map((post) => (
              <div
                key={post.slug}
                onClick={() => onOpenEditor('post', post.slug)}
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 cursor-pointer flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                      {post.title}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-2">
                      <span className="text-sky-600 dark:text-sky-400 font-sans">
                        {post.category}
                      </span>
                      <span>&bull;</span>
                      <span>{post.wordCount} 字</span>
                      <span>&bull;</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`admin-badge ${post.draft ? 'draft' : 'published'}`}>
                    {post.draft ? '草稿' : '已发布'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/posts/${post.slug}`, '_blank');
                    }}
                    title="在前台预览该文稿"
                    className="admin-icon-btn !w-7 !h-7 text-slate-400 hover:text-sky-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧 1 栏：分类分布 */}
        <div className="admin-card flex flex-col">
          <div className="admin-card-header">
            <h3>
              <Layers className="w-4 h-4 text-violet-500" />
              <span>文章分类分布</span>
            </h3>
            <button
              onClick={() => onNavigate('taxonomy')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono"
            >
              管理
            </button>
          </div>

          <div className="admin-card-body flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {categories.slice(0, 6).map((cat) => {
                const percentage = Math.round((cat.count / (posts.length || 1)) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        {cat.count} 篇 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('taxonomy')}
              className="w-full py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:border-sky-500 hover:text-sky-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>查看全部 {tags.length} 个标签与分类</span>
            </button>
          </div>
        </div>
      </div>

      {/* 底部双栏：系统状态 + 活动动态日志 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 系统与本地状态 */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <span>本地运行与存储</span>
            </h3>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 正常
            </span>
          </div>

          <div className="admin-card-body space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  本地存储空间 (LocalStorage)
                </div>
                <div className="text-[11px] text-slate-400">
                  已用 {storageUsage.usedKb} KB / 上限约 5MB
                </div>
              </div>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {storageUsage.usedKb} KB
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  数据安全与持久化
                </div>
                <div className="text-[11px] text-slate-400">
                  数据本地保存在当前浏览器中
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>

            <button
              onClick={() => onNavigate('settings')}
              className="admin-btn admin-btn-secondary w-full text-xs"
            >
              进入备份与数据恢复中心
            </button>
          </div>
        </div>

        {/* 操作动态日志 */}
        <div className="lg:col-span-2 admin-card flex flex-col justify-between">
          <div>
            <div className="admin-card-header">
              <h3>
                <Clock className="w-4 h-4 text-amber-500" />
                <span>操作审计日志</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  共 {logs.length} 条记录
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={() => setConfirmClearLogsOpen(true)}
                    className="p-1 rounded text-slate-400 hover:text-red-500"
                    title="清空日志"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {displayedLogs.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-slate-400">
                  暂无操作日志记录
                </div>
              ) : (
                displayedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-xs pb-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {log.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 truncate">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {logs.length > 6 && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-xs text-sky-600 hover:underline font-medium"
              >
                {showAllLogs ? '收起至 6 条' : `查看更多记录 (共 ${logs.length} 条)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 清空日志确认模态框 */}
      {confirmClearLogsOpen && (
        <div className="admin-modal-overlay" onClick={() => setConfirmClearLogsOpen(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>清空操作审计日志</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                确定清空所有本地保存的 <strong>{logs.length}</strong> 条操作日志吗？此操作不可撤销。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmClearLogsOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearLogs();
                  setConfirmClearLogsOpen(false);
                }}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
