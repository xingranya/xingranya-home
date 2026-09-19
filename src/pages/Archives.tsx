import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { getAllDiaries, siteConfig } from '../content';
import { formatDateShort, getYear } from '../lib/date';
import {
  History,
  Feather,
} from 'lucide-react';

interface TimelineItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: 'diary';
  category?: string;
  readingTime?: string;
  summary?: string;
}

export const Archives: React.FC = () => {
  const allDiaries = useMemo(() => getAllDiaries(), []);

  // 聚合手记内容为统一时间轴数据源
  const timelineItems: TimelineItem[] = useMemo(() => {
    return allDiaries.map((d) => ({
      id: `diary-${d.slug}`,
      slug: `/diaries/${d.slug}`,
      title: d.title,
      date: d.date,
      type: 'diary' as const,
      category: '手记随笔',
      readingTime: '2 min',
      summary: d.summary,
    })).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [allDiaries]);

  // 按年份分组
  const itemsByYear = useMemo(() => {
    const grouped: Record<string, TimelineItem[]> = {};
    timelineItems.forEach((item) => {
      const year = getYear(item.date);
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(item);
    });
    return grouped;
  }, [timelineItems]);

  const years = Object.keys(itemsByYear).sort((a, b) => Number(b) - Number(a));

  const archivesPage = siteConfig.archivesPage;
  const pageTitle = archivesPage?.title || '时光归档';
  const pageSubtitle = archivesPage?.subtitle || `共收录 ${timelineItems.length} 篇生活随笔与手记，依时间轨迹沉淀与梳理。`;

  return (
    <PageShell>
      <Container size="narrow">
        {/* 顶部标题区 (手记同款居中规范) */}
        <div className="mb-4 pb-3.5 sm:mb-10 sm:pb-6 border-b border-slate-200/70 dark:border-slate-800/70 font-sans text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            <History className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>ARCHIVES</span>
          </div>

          <h1 className="font-sans text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 font-sans max-w-md mx-auto">
              {pageSubtitle}
            </p>
          )}

          {/* 状态指示胶囊 */}
          <div className="mt-3.5 sm:mt-5 flex items-center justify-center gap-2">
            <div className="px-3 py-1.5 rounded-sm text-xs font-sans flex items-center space-x-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-300/80 dark:border-sky-700/80 shadow-2xs">
              <Feather className="w-3 h-3" />
              <span>手记随笔</span>
              <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded-sm bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-medium">
                {timelineItems.length} 篇
              </span>
            </div>
          </div>
        </div>

        {/* 垂直时间轴内容流（紧凑年谱排版） */}
        <div className="space-y-8 pb-16 font-sans">
          {years.map((year) => (
            <div key={year} className="relative">
              {/* 年份标题与数量统计 */}
              <div className="flex items-center space-x-3 mb-3.5">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                  {year}
                </span>
                <div className="flex-1 h-px bg-slate-200/70 dark:bg-slate-800/70" />
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {itemsByYear[year].length} 篇
                </span>
              </div>

              {/* 时间轴树状条目 (精确轴线与单行流线排版) */}
              <div className="relative pl-6 sm:pl-7 space-y-0.5 before:content-[''] before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200/80 dark:before:bg-slate-800/80">
                {itemsByYear[year].map((item) => (
                  <div key={item.id} className="relative group">
                    {/* 时间轴微节点圆点 (移动端对准首行文字，桌面端居中) */}
                    <div className="absolute -left-[19px] sm:-left-[21px] top-3 sm:top-1/2 sm:-translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-sky-500 transition-colors" />

                    {/* 归档行卡片 (桌面端优雅单行，移动端自适应展示完整标题) */}
                    <Link
                      href={item.slug}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-1.5 px-2 -mx-1.5 rounded-sm hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors group gap-1 sm:gap-2"
                    >
                      <div className="flex items-start sm:items-center space-x-2 sm:space-x-2.5 min-w-0 pr-1 sm:pr-2">
                        {/* 发布日期 (MM-DD) */}
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 shrink-0 select-none mt-0.5 sm:mt-0">
                          {formatDateShort(item.date)}
                        </span>

                        {/* 标题 */}
                        <span className="text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium transition-colors sm:truncate leading-snug">
                          {item.title}
                        </span>

                        {/* 分类微标签 (桌面端展示) */}
                        {item.category && (
                          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* 类型标 (手记标签) */}
                      {item.type === 'diary' && (
                        <div className="flex items-center pl-10 sm:pl-0 shrink-0">
                          <span className="px-1.5 py-0.5 rounded-sm bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10.5px] font-mono leading-none">
                            手记
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {years.length === 0 && (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
              暂无匹配的内容记录
            </div>
          )}
        </div>
      </Container>
    </PageShell>
  );
};
