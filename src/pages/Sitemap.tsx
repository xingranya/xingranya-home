import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { PageShell } from '../components/layout/PageShell';
import { Container } from '../components/layout/Container';
import { getAllDiaries, getAllFriends, getAllRecords } from '../content';
import { formatDateShort } from '../lib/date';
import {
  ExternalLink,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const Sitemap: React.FC = () => {
  const allDiaries = useMemo(() => getAllDiaries(), []);
  const allFriends = useMemo(() => getAllFriends(), []);
  const allRecords = useMemo(() => getAllRecords(), []);

  // 核心主册目次
  const sections = [
    { name: '首页', nameEn: 'Home', path: '/', desc: '星苒鸭个人主页、简介与动态', count: '1 页面' },
    { name: '时光归档', nameEn: 'Archives', path: '/archives', desc: '按年份逆序沉淀的全站时光时间轴脉络', count: `${allDiaries.length} 条` },
    { name: '动态手记', nameEn: 'Diaries', path: '/diaries', desc: '生活随笔、日暮微风与真实生活切片', count: `${allDiaries.length} 篇` },
    { name: '日常说说', nameEn: 'Says', path: '/says', desc: '碎片化的即时灵感、微型日志与正在发生的事情', count: `${allRecords.length} 则` },
    { name: '志同道合', nameEn: 'Friends', path: '/friends', desc: '优秀独立博客友人链接、技术专栏与灵感共振', count: `${allFriends.length} 位` },
  ];

  return (
    <PageShell>
      <Container size="wide">
        {/* 出版级温润纸板大单（宽版心大气舒展） */}
        <article className="paper-sheet-realistic p-6 sm:p-10 md:p-12 font-sans space-y-10 my-4 sm:my-8 text-slate-800 dark:text-slate-200">

          {/* 卷首题头 (Editorial Front Matter) */}
          <header className="text-center pb-8 border-b border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400">
              <BookOpen className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>TOPOGRAPHY &amp; COLOPHON</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-950 dark:text-slate-50 tracking-tight">
              全站索隐与架构导览
            </h1>

            <p className="font-serif italic text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              &ldquo;星苒鸭的个人主页。留下手记、日常和朋友，技术长文在 blog.xran.uk。&rdquo;
            </p>

            {/* 出版元数据摘要条 */}
            <div className="pt-2 flex items-center justify-center space-x-4 text-[11.5px] font-mono text-slate-400 dark:text-slate-500">
              <span>手记 {allDiaries.length} 篇</span>
              <span>&bull;</span>
              <span>说说 {allRecords.length} 则</span>
              <span>&bull;</span>
              <span>友人 {allFriends.length} 位</span>
            </div>
          </header>

          {/* 第一编：全站核心经纬目次 (Core Sections) */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                第一编 · 核心经纬目次
              </h2>
              <span className="font-mono text-[11px] text-slate-400">
                共 {sections.length} 个主要频道
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((sec) => (
                <Link
                  key={sec.path}
                  href={sec.path}
                  className="group block p-4 rounded bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-sky-300/80 dark:hover:border-sky-800/80 transition-all shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {sec.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {sec.nameEn}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                      {sec.count}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-serif">
                    {sec.desc}
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <span>访问该频道</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 第二编：日常手记 (Chronicles & Diaries - 宽屏三列排版) */}
          {allDiaries.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  第二编 · 散落日常与生活手记
                </h2>
                <span className="font-mono text-[11px] text-slate-400">
                  {allDiaries.length} 篇切片
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1.5">
                {allDiaries.map((diary) => (
                  <Link
                    key={diary.slug}
                    href={`/diaries/${diary.slug}`}
                    className="group flex items-baseline justify-between py-1.5 px-2 -mx-2 rounded-xs hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-serif text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate pr-3 group-hover:underline underline-offset-2">
                      {diary.title}
                    </span>
                    <span className="font-mono text-[10.5px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDateShort(diary.date)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 卷末附录：机器索引与订阅声明 (Colophon & Feeds) */}
          <footer className="pt-6 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="p-4 rounded-xs bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>机器可读规范与数据订阅</span>
                </div>
                <p className="text-[11px] font-serif text-slate-500 dark:text-slate-400">
                  支持符合 W3C / Sitemaps 0.9 协议的搜索引擎抓取，以及标准 RSS 2.0 聚合订阅。
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <span>sitemap.xml</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <a
                  href="/feed.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                >
                  <span>feed.xml</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </footer>

        </article>
      </Container>
    </PageShell>
  );
};
