import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  FileText,
  BookOpen,
  Activity,
  Link2,
  Tag,
  Settings2,
  Plus,
  Moon,
  Download,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import type { AdminViewType } from './AdminLayout';

interface CommandItem {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action: () => void;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AdminViewType) => void;
  onOpenEditor: (type: 'post' | 'diary', slug?: string) => void;
  onToggleTheme: () => void;
  onOpenTrash?: () => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenEditor,
  onToggleTheme,
  onOpenTrash,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { posts, diaries, exportAllData } = useAdminStore();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 构建可搜索命令项
  const items: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const staticCommands: CommandItem[] = [
      {
        id: 'nav-overview',
        group: '页面导航',
        title: '仪表盘总览 (Overview)',
        subtitle: '查看数据指标与全站概况',
        icon: Sparkles,
        action: () => { onNavigate('overview'); onClose(); },
      },
      {
        id: 'nav-posts',
        group: '页面导航',
        title: '文章管理 (Posts)',
        subtitle: '检索、筛选与管理公开文稿',
        icon: FileText,
        action: () => { onNavigate('posts'); onClose(); },
      },
      {
        id: 'nav-diaries',
        group: '页面导航',
        title: '手记随笔 (Diaries)',
        subtitle: '记录心境、生活与灵感',
        icon: BookOpen,
        action: () => { onNavigate('diaries'); onClose(); },
      },
      {
        id: 'nav-records',
        group: '页面导航',
        title: '说说动态 (Moments)',
        subtitle: '发布短动态与管理评论互动',
        icon: Activity,
        action: () => { onNavigate('records'); onClose(); },
      },
      {
        id: 'nav-friends',
        group: '页面导航',
        title: '友链管理 (Friends)',
        subtitle: '维护网络邻居伙伴与连通性检测',
        icon: Link2,
        action: () => { onNavigate('friends'); onClose(); },
      },
      {
        id: 'nav-taxonomy',
        group: '页面导航',
        title: '分类与标签 (Taxonomy)',
        subtitle: '管理全站分类体系与标签热度',
        icon: Tag,
        action: () => { onNavigate('taxonomy'); onClose(); },
      },
      {
        id: 'nav-settings',
        group: '页面导航',
        title: '全站与页面配置中心 (Site Settings)',
        subtitle: '可视化配置全站信息、首页 Hero、关于页、友链、导航与页脚',
        icon: Settings2,
        action: () => { onNavigate('settings'); onClose(); },
      },
      {
        id: 'nav-fileEditor',
        group: '页面导航',
        title: '底层数据文件中心 (Data & Source Center)',
        subtitle: '在线查看、校验与编辑 site.config.json 等配置文件并导出同步',
        icon: FileText,
        action: () => { onNavigate('fileEditor'); onClose(); },
      },
      {
        id: 'act-new-post',
        group: '快捷操作',
        title: '新建文章草稿',
        subtitle: '打开双栏 Markdown 编辑器',
        icon: Plus,
        action: () => { onOpenEditor('post'); onClose(); },
      },
      {
        id: 'act-new-diary',
        group: '快捷操作',
        title: '记录新手记',
        subtitle: '选择心境与天气写新手记',
        icon: Plus,
        action: () => { onOpenEditor('diary'); onClose(); },
      },
      {
        id: 'act-toggle-theme',
        group: '快捷操作',
        title: '切换后台外观模式 (Light / Dark)',
        subtitle: '切换深浅色主题',
        icon: Moon,
        action: () => { onToggleTheme(); onClose(); },
      },
      {
        id: 'act-export',
        group: '快捷操作',
        title: '导出全站本地备份 JSON',
        subtitle: '打包下载所有内容快照',
        icon: Download,
        action: () => {
          const data = exportAllData();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cot-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          onClose();
        },
      },
      {
        id: 'act-preview-frontend',
        group: '快捷操作',
        title: '在新标签页预览前台网站',
        subtitle: '打开前台博客主页',
        icon: ExternalLink,
        action: () => { window.open('/', '_blank'); onClose(); },
      },
      {
        id: 'act-open-trash',
        group: '快捷操作',
        title: '打开数据回收站 (Trash Bin)',
        subtitle: '查看、还原或彻底清除已删除的内容快照',
        icon: Trash2,
        action: () => {
          onClose();
          if (onOpenTrash) onOpenTrash();
        },
      },
    ];

    const postItems: CommandItem[] = posts.map((p) => ({
      id: `post-${p.slug}`,
      group: '文稿搜索',
      title: p.title,
      subtitle: `${p.category} · ${p.tags.join(', ')} · ${p.date}`,
      icon: FileText,
      action: () => { onOpenEditor('post', p.slug); onClose(); },
    }));

    const diaryItems: CommandItem[] = diaries.map((d) => ({
      id: `diary-${d.slug}`,
      group: '手记搜索',
      title: d.title,
      subtitle: `${d.weather} · ${d.mood} · ${d.date}`,
      icon: BookOpen,
      action: () => { onOpenEditor('diary', d.slug); onClose(); },
    }));

    const all = [...staticCommands, ...postItems, ...diaryItems];

    if (!q) return all.slice(0, 15);

    return all
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, posts, diaries, onNavigate, onOpenEditor, onToggleTheme, exportAllData, onClose, onOpenTrash]);

  // 键盘快捷键监听
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-dialog max-w-xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="快速跳转或搜索文章、手记、命令..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto p-2 max-h-[420px] space-y-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              未找到匹配的命令或内容
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sakura-50 dark:bg-sakura-950/70 text-sakura-900 dark:text-sakura-100'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected
                          ? 'bg-sakura-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {item.group}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-sakura-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部按键提示 */}
        <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ 导航</span>
            <span>↵ 确认选择</span>
            <span>ESC 关闭</span>
          </div>
          <div>COT Command Palette</div>
        </div>
      </div>
    </div>
  );
};
