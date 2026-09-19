import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Activity,
  Link2,
  Tag,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Plus,
  ExternalLink,
  Sun,
  Moon,
  Database,
  FileCode2,
  Trash2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { AdminCommandPalette } from './AdminCommandPalette';

export type AdminViewType =
  | 'overview'
  | 'posts'
  | 'diaries'
  | 'records'
  | 'friends'
  | 'taxonomy'
  | 'settings'
  | 'fileEditor'
  | 'editor';

interface AdminLayoutProps {
  currentView: AdminViewType;
  onNavigate: (view: AdminViewType) => void;
  onOpenEditor: (type: 'post' | 'diary', slug?: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenEditor,
  children,
}) => {
  const {
    posts,
    diaries,
    records,
    friends,
    categories,
    siteConfig,
    preferences,
    savePreferences,
    storageUsage,
    trash,
    restoreTrash,
    deletePermanently,
    clearTrash,
  } = useAdminStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebarCollapsed || false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [trashDrawerOpen, setTrashDrawerOpen] = useState(false);
  const [confirmClearTrashOpen, setConfirmClearTrashOpen] = useState(false);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDark, setIsDark] = useState(false);

  // 主题与暗黑模式同步
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      savePreferences({ theme: 'dark' });
    } else {
      document.documentElement.classList.remove('dark');
      savePreferences({ theme: 'light' });
    }
  };

  // 全局快捷键 Ctrl+K / Cmd+K 唤起命令面板
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups = [
    {
      title: '工作台',
      items: [
        { id: 'overview' as const, label: '控制台总览', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: '内容创作',
      items: [
        { id: 'posts' as const, label: '文章管理', icon: FileText, badge: posts.length },
        { id: 'diaries' as const, label: '手记随笔', icon: BookOpen, badge: diaries.length },
        { id: 'records' as const, label: '说说动态', icon: Activity, badge: records.length },
      ],
    },
    {
      title: '分类网络',
      items: [
        { id: 'taxonomy' as const, label: '分类与标签', icon: Tag, badge: categories.length },
        { id: 'friends' as const, label: '友情链接', icon: Link2, badge: friends.length },
      ],
    },
    {
      title: '系统配置',
      items: [
        { id: 'settings' as const, label: '全站与页面配置', icon: Settings2, badge: null },
        { id: 'fileEditor' as const, label: '底层数据中心', icon: FileCode2, badge: null },
      ],
    },
  ];

  const viewTitles: Record<AdminViewType, string> = {
    overview: '仪表盘总览',
    posts: '文章管理',
    diaries: '手记随笔',
    records: '说说动态',
    friends: '友情链接',
    taxonomy: '分类与标签',
    settings: '全站与页面配置中心',
    fileEditor: '底层数据与源码中心',
    editor: '内容编辑器',
  };

  const handleSidebarToggle = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    savePreferences({ sidebarCollapsed: next });
  };

  return (
    <div
      className={`admin-app ${isDark ? 'admin-dark dark' : ''}`}
      data-accent={preferences.accentColor || 'blue'}
    >
      {/* 移动端侧边栏遮罩 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 独立后台侧边栏 */}
      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileMenuOpen ? 'translate-x-0 !fixed inset-y-0 left-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 顶部 Brand */}
        <div className="admin-brand">
          <div className="admin-brand-icon">C</div>
          {!sidebarCollapsed && (
            <div className="admin-brand-text">
              <strong>COT Console</strong>
              <span>Local Content OS</span>
            </div>
          )}
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 导航菜单列表 */}
        <div className="admin-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="admin-nav-section-title">{group.title}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge !== null && (
                          <span className="admin-nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 侧边栏底部状态与工具 */}
        <div className="admin-sidebar-footer">
          {!sidebarCollapsed && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-sakura-500" /> 本地存储
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {storageUsage.usedKb} KB
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-sakura-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, (storageUsage.usedKb / 5120) * 100))}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => window.open('/', '_blank')}
              title="打开前台博客页面"
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-sakura-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>前台预览</span>}
            </button>

            <button
              onClick={handleSidebarToggle}
              title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
              className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 主工作区 */}
      <div className="admin-main">
        {/* 专属管理后台顶部栏 */}
        <header className="admin-topbar">
          {/* 左侧：手机汉堡菜单 + 面包屑 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="admin-breadcrumb">
              <span>控制台</span>
              <span>/</span>
              <strong>{viewTitles[currentView] || '管理中心'}</strong>
            </div>
          </div>

          {/* 右侧：状态指示灯、全局搜索、新建操作、回收站、主题切换 */}
          <div className="admin-topbar-actions">
            {/* 本地状态呼吸胶囊 */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
              title="本地数据已安全保存在浏览器 LocalStorage"
            >
              <span className="admin-pulse-dot bg-emerald-500" />
              <span>本地已就绪</span>
            </div>

            {/* Ctrl+K 搜索按钮 */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="admin-search-btn"
              title="唤起全局命令面板 (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">快捷搜索...</span>
              <kbd className="admin-search-kbd">⌘K</kbd>
            </button>

            {/* 快速新建下拉按钮 */}
            <div className="relative">
              <button
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">新建</span>
              </button>

              {quickCreateOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setQuickCreateOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        onOpenEditor('post');
                        setQuickCreateOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/60 hover:text-sakura-600 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-sakura-500" />
                      <span>写文章</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenEditor('diary');
                        setQuickCreateOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/60 hover:text-sakura-600 flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                      <span>写手记</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('records');
                        setQuickCreateOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/60 hover:text-sakura-600 flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span>发说说动态</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('friends');
                        setQuickCreateOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-sakura-50 dark:hover:bg-sakura-950/60 hover:text-sakura-600 flex items-center gap-2"
                    >
                      <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>添加友链</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 回收站按钮 */}
            <button
              onClick={() => setTrashDrawerOpen(true)}
              className="admin-icon-btn relative"
              title="回收站（可恢复最近删除的内容）"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              {trash.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {trash.length > 9 ? '9+' : trash.length}
                </span>
              )}
            </button>

            {/* 暗黑/明亮主题切换 */}
            <button
              onClick={toggleTheme}
              className="admin-icon-btn"
              title={isDark ? '切换至浅色模式' : '切换至深色模式'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* 站长头像与信息 */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <img
                src={siteConfig.author.avatar}
                alt={siteConfig.author.name}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                {siteConfig.author.name}
              </span>
            </div>
          </div>
        </header>

        {/* 主视口视图 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Palette 弹窗 */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onNavigate}
        onOpenEditor={onOpenEditor}
        onToggleTheme={toggleTheme}
        onOpenTrash={() => setTrashDrawerOpen(true)}
      />

      {/* 回收站抽屉模态框 */}
      {trashDrawerOpen && (
        <div className="admin-modal-overlay" onClick={() => setTrashDrawerOpen(false)}>
          <div
            className="admin-modal-dialog max-w-xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  数据回收站 ({trash.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {trash.length > 0 && (
                  <button
                    onClick={() => setConfirmClearTrashOpen(true)}
                    className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    清空回收站
                  </button>
                )}
                <button
                  onClick={() => setTrashDrawerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[480px]">
              {trash.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs">回收站空空如也，暂无已删除内容</p>
                </div>
              ) : (
                trash.map((item) => {
                  const typeLabel = {
                    post: '文章',
                    diary: '手记',
                    record: '说说',
                    friend: '友链',
                  }[item.type];

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                            {typeLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          删除时间：{new Date(item.deletedAt).toLocaleString('zh-CN', { hour12: false })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            restoreTrash(item.id);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-sakura-600 hover:bg-sakura-50 dark:hover:bg-sakura-950/50 font-medium"
                          title="一键撤销并恢复"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>恢复</span>
                        </button>
                        <button
                          onClick={() => {
                            setPermanentDeleteTarget({ id: item.id, title: item.title });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="彻底清除"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>回收站自动保留最近 50 条删除快照</span>
              <button
                onClick={() => setTrashDrawerOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm !py-1 text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 清空回收站确认模态框 */}
      {confirmClearTrashOpen && (
        <div className="admin-modal-overlay" onClick={() => setConfirmClearTrashOpen(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>确认清空整个回收站？</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                当前回收站共有 <strong>{trash.length}</strong> 条历史记录。清空后将彻底永久删除，无法再次还原，请确认是否继续？
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmClearTrashOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearTrash();
                  setConfirmClearTrashOpen(false);
                }}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认彻底清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 彻底粉碎单条记录模态框 */}
      {permanentDeleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setPermanentDeleteTarget(null)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>确认彻底粉碎删除？</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                确认从底层彻底永久删除《{permanentDeleteTarget.title}》？此操作不可逆！
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deletePermanently(permanentDeleteTarget.id);
                  setPermanentDeleteTarget(null);
                }}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                彻底删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
