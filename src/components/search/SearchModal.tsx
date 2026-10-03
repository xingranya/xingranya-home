import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, BookOpen, FileCode2, ChevronRight } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { Link } from 'wouter';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { query, setQuery, results } = useSearch();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-150" />
        <Dialog.Content className="home-search-dialog fixed top-[min(18%,100px)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[var(--card-paper)] backdrop-blur-xl rounded border border-[var(--border-paper)] shadow-2xl z-50 p-0 overflow-hidden outline-none" onCloseAutoFocus={(event) => { event.preventDefault(); document.querySelector<HTMLButtonElement>('.site-search-trigger')?.focus(); }} onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
          const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('.home-search-result')];
          const current = links.indexOf(document.activeElement as HTMLAnchorElement);
          if (event.key === 'Enter' && document.activeElement?.tagName === 'INPUT' && links[0]) { event.preventDefault(); links[0].click(); }
          if (event.key !== 'Enter' && links.length) { event.preventDefault(); links[event.key === 'ArrowDown' ? (current + 1) % links.length : (current <= 0 ? links.length - 1 : current - 1)].focus(); }
        }}>
          <Dialog.Title className="sr-only">搜索手记</Dialog.Title>
          <Dialog.Description className="sr-only">
            通过标题、标签或摘要查找本站手记，技术长文请前往博客。
          </Dialog.Description>

          {/* 搜索输入框 */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-[#212126]/70">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索手记"
              placeholder="搜索手记标题、标签或摘要…"
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-sans"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="清空搜索"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Dialog.Close className="ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-slate-500 dark:text-slate-300" aria-label="关闭搜索"><X className="h-4 w-4" /></Dialog.Close>
          </div>

          {/* 搜索结果列表 */}
          <div className="max-h-[min(55svh,360px)] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40" aria-live="polite">
            {results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
                没有找到相关手记，请试试其他关键词。
              </div>
            ) : (
              results.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug}
                  onClick={() => { onOpenChange(false); setQuery(''); }}
                  className="home-search-result group flex items-start justify-between p-3 rounded-md hover:bg-[var(--sakura-wash)] focus-visible:bg-[var(--sakura-wash)] cursor-pointer transition-colors"
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
                        {item.tags.slice(0, 3).map((tag) => (
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
                </Link>
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
            <span>手记 · 标题 / 标签 / 摘要</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
