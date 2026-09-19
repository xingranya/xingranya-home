import React, { useRef } from 'react';
import { AlignLeft, ArrowUp } from 'lucide-react';
import type { TOCItem } from '../../types';
import { useTOC } from '../../hooks/useTOC';

interface TOCProps {
  toc: TOCItem[];
  onItemClick?: () => void;
  hideHeader?: boolean;
}

export const TOC: React.FC<TOCProps> = ({ toc, onItemClick, hideHeader = false }) => {
  const activeId = useTOC(toc);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  if (!toc || toc.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <nav className="w-full text-[11.5px] font-sans select-none">
      {/* 顶部极简标题与快捷返回顶部 */}
      {!hideHeader && (
        <div className="flex items-center justify-between font-sans font-medium text-slate-700 dark:text-slate-300 mb-2 pb-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center space-x-1.5 text-[11.5px] font-semibold text-slate-800 dark:text-slate-200">
            <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
            <span>目录大纲</span>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="text-[10.5px] font-mono text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center space-x-0.5 transition-colors cursor-pointer"
            title="回到文章顶部"
          >
            <ArrowUp className="w-3 h-3" />
            <span>顶部</span>
          </button>
        </div>
      )}

      {/* 纯净垂直流线导轨列表（紧凑字号与舒缓间距） */}
      <div className="relative border-l border-slate-200/80 dark:border-slate-800/80 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
        <ul className="space-y-0.5">
          {toc.map((item) => {
            const isActive = activeId === item.id;
            
            // 紧凑层级微缩进与精致字阶
            const indentClass =
              item.level === 1
                ? 'pl-2.5 font-medium text-slate-800 dark:text-slate-200 text-[11.5px]'
                : item.level === 2
                ? 'pl-3.5 font-normal text-slate-700 dark:text-slate-300 text-[11px]'
                : 'pl-5 font-normal text-slate-500 dark:text-slate-400 text-[10.5px]';

            return (
              <li key={item.id} className="relative">
                <a
                  ref={isActive ? activeItemRef : null}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block py-1 pr-1.5 transition-colors duration-150 leading-snug break-words line-clamp-2 ${indentClass} ${
                    isActive
                      ? '!text-sky-600 dark:!text-sky-400 !font-semibold -ml-[1px] border-l-[1.5px] border-sky-600 dark:border-sky-400'
                      : 'hover:text-slate-900 dark:hover:text-slate-100 hover:border-l hover:border-slate-300 dark:hover:border-slate-600 -ml-[1px]'
                  }`}
                  title={item.text}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

