import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { PageShell } from '../components/layout/PageShell';
import { Container } from '../components/layout/Container';
import { getAllDiaries, siteConfig } from '../content';
import { formatDate } from '../lib/date';
import {
  Feather,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const Diaries: React.FC = () => {
  const allDiaries = useMemo(() => getAllDiaries(), []);

  const diariesPage = siteConfig.diariesPage;
  const pageTitle = diariesPage?.title || '散落的日常与手记';
  const pageSubtitle = diariesPage?.subtitle || '捕捉那些代码之外的日暮微风、深夜随笔与生活切片。';

  return (
    <PageShell>
      <Container size="wide">
        {/* 顶部标题区 */}
        <div className="mb-4 pb-3 sm:mb-10 sm:pb-6 border-b border-slate-200/70 dark:border-slate-800/70 text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            <Feather className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>DIARIES</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 font-sans max-w-md mx-auto">
              {pageSubtitle}
            </p>
          )}
        </div>

        {/* 手记多列卡片网格布局 (2列/3列响应式纯净卡片) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDiaries.map((diary) => (
            <Link
              key={diary.slug}
              href={`/diaries/${diary.slug}`}
              className="p-3.5 sm:p-4 rounded border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_22px_-4px_rgba(15,23,42,0.08),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:border-sky-200/90 dark:hover:border-sky-800/80 hover:bg-white/95 dark:hover:bg-slate-900/85 transition-all duration-300 ease-out group flex flex-col justify-between block"
            >
              <div>
                {/* 顶部元数据头：天气、心情、时间与地点 */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2.5 border-b border-slate-100/80 dark:border-slate-800/60 mb-2.5">
                  <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <time dateTime={diary.date}>{formatDate(diary.date)}</time>
                    {diary.time && <span className="text-[11px] opacity-75 font-mono">· {diary.time}</span>}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[10.5px] shrink-0">
                    {diary.weather && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {diary.weather}
                      </span>
                    )}
                    {diary.mood && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40">
                        {diary.mood}
                      </span>
                    )}
                    {diary.location && (
                      <span className="hidden sm:inline-flex items-center space-x-0.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{diary.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 标题与摘要导言 */}
                <div className="space-y-1.5">
                  <h2 className="font-serif text-base sm:text-[17px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors leading-snug line-clamp-2">
                    {diary.title}
                  </h2>
                  {diary.summary && (
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans line-clamp-3">
                      {diary.summary}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {allDiaries.length === 0 && (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            暂无匹配手记
          </div>
        )}

        {/* 底部手札卷尾 · 纸上印记与感言 */}
        <div className="mt-14 relative overflow-hidden p-5 sm:p-6 rounded-sm border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-b from-white/90 via-slate-50/70 to-slate-100/40 dark:from-[#18181A]/95 dark:via-[#151518]/90 dark:to-[#101012]/80 shadow-xs">
          {/* 背景轻柔艺术双引号水印 */}
          <div className="absolute right-4 -bottom-4 text-slate-200/40 dark:text-slate-800/30 select-none pointer-events-none font-serif text-8xl leading-none">
            &rdquo;
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-3.5 max-w-xl mx-auto">
            {/* 顶栏徽标 */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-sky-50 dark:bg-sky-950/40 text-[11px] font-mono text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40">
              <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>落纸为念 &bull; 纸上温度</span>
            </div>

            {/* 核心金句排版 */}
            <blockquote className="font-serif text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic">
              &ldquo;日记是自己写给自己最好的情书，也是时间长河里唯一的停靠桩。&rdquo;
            </blockquote>

            {/* 底部签名与手记统计 */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50 w-full">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                &mdash; {siteConfig.author.name}
              </span>
              <span>&bull;</span>
              <span>共收录 {allDiaries.length} 篇心境篇章</span>
              <span>&bull;</span>
              <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px]">
                随笔手札
              </span>
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
};
