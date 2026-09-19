import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, BookOpen, FileCode2, ChevronRight } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { useLocation } from 'wouter';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { query, setQuery, results } = useSearch();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (slug: string) => {
    setLocation(slug);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-[18%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white/95 dark:bg-[#121B2A]/95 backdrop-blur-xl rounded border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 p-0 overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-150">
          <Dialog.Title className="sr-only">搜索博客文稿与笔记</Dialog.Title>
          <Dialog.Description className="sr-only">
            通过标题、标签或摘要快速检索全站文章与安全笔记
          </Dialog.Description>

          {/* 搜索输入框 */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-[#212126]/70">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章、安全速记、技术标签 (如 Pwn, ECC, React, CTF)..."
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-sans"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 搜索结果列表 */}
          <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
            {results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
                未检索到与 &quot;{query}&quot; 相关的文稿内容
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.slug)}
                  className="group flex items-start justify-between p-3 rounded-md hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-2">
                    <div className="mt-0.5 p-1.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors shrink-0">
                      {item.type === 'post' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <FileCode2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {item.summary}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-slate-400 dark:text-slate-500 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-2" />
                </div>
              ))
            )}
          </div>

          {/* 底部键盘快捷键提示 */}
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-[#18181A]/60 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <div className="flex items-center space-x-3">
              <span>
                <kbd className="px-1 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                  ESC
                </kbd>{' '}
                关闭
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                  ↵
                </kbd>{' '}
                跳转
              </span>
            </div>
            <span>全站静态索引</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
