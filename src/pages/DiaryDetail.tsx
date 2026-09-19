import React, { useMemo } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { PageShell } from '../components/layout/PageShell';
import { Container } from '../components/layout/Container';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { ReadingProgressBar } from '../components/post/ReadingProgressBar';
import { getDiaryBySlug, getAllDiaries, loadDiaryContent, siteConfig } from '../content';
import { formatDate } from '../lib/date';
import { stripDuplicateHeading } from '../lib/markdown';
import {
  Calendar,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  Feather,
  Sparkles,
} from 'lucide-react';

export const DiaryDetail: React.FC = () => {
  const [, params] = useRoute('/diaries/:slug');
  const [, journalParams] = useRoute('/journal/:slug');
  const [, shoujiParams] = useRoute('/shouji/:slug');
  const [, setLocation] = useLocation();

  const slug = params?.slug || journalParams?.slug || shoujiParams?.slug;

  const allDiaries = useMemo(() => getAllDiaries(), []);
  const diaryMeta = useMemo(() => (slug ? getDiaryBySlug(slug) : null), [slug]);
  const [diary, setDiary] = React.useState(() => diaryMeta);
  const [contentLoading, setContentLoading] = React.useState(false);

  React.useEffect(() => {
    if (!slug) {
      setDiary(null);
      return;
    }
    let cancelled = false;
    const meta = getDiaryBySlug(slug);
    if (!meta) {
      setDiary(null);
      return;
    }
    setDiary(meta);
    if (meta.content && meta.content.trim().length > 0) {
      setContentLoading(false);
      return;
    }
    setContentLoading(true);
    loadDiaryContent(slug)
      .then((full) => {
        if (!cancelled) {
          setDiary(full ?? meta);
          setContentLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setContentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  React.useEffect(() => {
    if (diary?.title) {
      document.title = `${diary.title} · ${siteConfig.title}`;
    }
  }, [diary?.title]);

  // 上一篇与下一篇手记导航
  const { prevDiary, nextDiary } = useMemo(() => {
    if (!slug) return { prevDiary: null, nextDiary: null };
    const currentIndex = allDiaries.findIndex((d) => d.slug === slug);
    if (currentIndex === -1) return { prevDiary: null, nextDiary: null };
    return {
      prevDiary: currentIndex > 0 ? allDiaries[currentIndex - 1] : null,
      nextDiary: currentIndex < allDiaries.length - 1 ? allDiaries[currentIndex + 1] : null,
    };
  }, [allDiaries, slug]);

  // 过滤掉 Markdown 正文开头与标题重复的首行 # 标题
  const cleanContent = useMemo(() => {
    return stripDuplicateHeading(diary?.content || '', diary?.title);
  }, [diary?.content, diary?.title]);

  if (!diary) {
    return (
      <PageShell>
        <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-sm bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-4">
              <Feather className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="font-sans text-2xl font-semibold text-slate-800 dark:text-slate-200">
              手记未找到
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-mono">
              请求的手记篇章不存在或已归档
            </p>
            <button
              onClick={() => setLocation('/diaries')}
              className="mt-6 px-4 py-2 rounded-sm bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 text-xs font-medium"
            >
              返回手记列表
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <>
      <ReadingProgressBar />

      <PageShell>
        <Container size="diary">
          <div className="pt-2 sm:pt-4 pb-16">
            {/* 手记纸张大卡片（单栏居中，温润自然） */}
            <article className="p-4 sm:p-7 md:p-8 paper-sheet-realistic space-y-5 text-slate-800 dark:text-slate-200">
              {/* 头部元数据栏 */}
              <header className="pb-4 border-b border-slate-200/70 dark:border-slate-800/70 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center space-x-1 font-semibold text-slate-800 dark:text-slate-200 font-serif">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <time dateTime={diary.date}>{formatDate(diary.date)}</time>
                      {diary.time && <span className="font-mono text-xs opacity-75">{diary.time}</span>}
                    </span>

                    {diary.weather && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[10.5px] font-sans">
                        {diary.weather}
                      </span>
                    )}

                    {diary.mood && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 text-[10.5px] font-sans border border-sky-200/40 dark:border-sky-800/30">
                        {diary.mood}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[10.5px]">
                    {diary.location && (
                      <span className="flex items-center space-x-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{diary.location}</span>
                      </span>
                    )}
                    {diary.wordCount > 0 && (
                      <>
                        {diary.location && <span>&bull;</span>}
                        <span>约 {diary.wordCount} 字</span>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 dark:text-slate-50 tracking-tight leading-snug">
                  {diary.title}
                </h1>

                {/* 摘要与心境引言 */}
                {diary.summary && (
                  <div className="p-3.5 rounded-r-md rounded-l-none bg-slate-100/60 dark:bg-slate-900/50 border-l-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                    {diary.summary}
                  </div>
                )}

                {/* 标签 */}
                {diary.tags && diary.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {diary.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center space-x-0.5 text-[10.5px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-50" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* 手记正文渲染 */}
              <div className="min-h-[260px] leading-relaxed font-sans text-sm sm:text-base">
                {contentLoading && !cleanContent ? (
                  <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="正文加载中">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-9/12" />
                  </div>
                ) : (
                  <MarkdownRenderer content={cleanContent} />
                )}
              </div>

              {/* 底部作者寄语 */}
              <footer className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800/70 space-y-4">
                <div className="p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-sans">
                    <strong>落纸为念：</strong>
                    生活由散落的切片构成。撰于 <strong>{siteConfig.author.name}</strong> 的生活手记簿，记录当下真实的心境与思考。
                  </div>
                </div>

                {/* 上一篇 / 下一篇手记极简轻量导航（无框纯净排版） */}
                <nav aria-label="手记上下篇导航" className="pt-4 sm:pt-5 mt-2 sm:mt-3 border-t border-slate-200/70 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  {prevDiary ? (
                    <Link
                      href={`/diaries/${prevDiary.slug}`}
                      className="group flex items-center gap-2.5 sm:gap-3 text-left transition-opacity duration-200 hover:opacity-75"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {prevDiary.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(prevDiary.date).replace(/^20(\d{2}年)/, '$1')}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextDiary ? (
                    <Link
                      href={`/diaries/${nextDiary.slug}`}
                      className="group flex items-center justify-end gap-2.5 sm:gap-3 text-right sm:ml-auto w-full transition-opacity duration-200 hover:opacity-75"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {nextDiary.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(nextDiary.date).replace(/^20(\d{2}年)/, '$1')}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              </footer>
            </article>
          </div>
        </Container>
      </PageShell>
    </>
  );
};
