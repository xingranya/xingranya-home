import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import collection from '../../content/pages/wallpapers.json';

// 预览面板按需加载，与同步脚本使用同一份片单，不维护第二份计数。
const latest = [...collection.items]
  .sort((a, b) => b.year - a.year || (b.publishDate || '').localeCompare(a.publishDate || ''))
  .slice(0, 3);

export const AnimeNavPreview: React.FC<{ onItemClick: () => void }> = ({ onItemClick }) => (
  <section aria-label="番剧墙预览">
    <div className="p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-100">
          番剧墙
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          正在追 {collection.counts.watching} · 已追完 {collection.counts.watched}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {latest.map((item) => (
          <figure key={item.id} className="min-w-0">
            <img
              src={item.image}
              alt={item.title}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              className="aspect-[2/3] w-full rounded-lg bg-slate-100 object-cover dark:bg-slate-800"
            />
            <figcaption className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">
              {item.title}
            </figcaption>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              {item.year} · {item.version}
            </p>
          </figure>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/80 px-4 py-1.5 text-xs dark:border-slate-800/60 dark:bg-slate-900/80">
      <Link
        href="/wallpapers"
        onClick={onItemClick}
        className="inline-flex min-h-10 items-center gap-1 font-medium text-slate-700 transition-colors hover:text-sakura-700 dark:text-slate-200 dark:hover:text-sakura-300"
      >
        查看全部番剧 <ChevronRight className="h-3.5 w-3.5" />
      </Link>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        共 {collection.items.length} 部
      </span>
    </div>
  </section>
);
