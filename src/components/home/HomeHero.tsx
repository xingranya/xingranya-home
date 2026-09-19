import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'wouter';
import { Megaphone, ChevronRight } from 'lucide-react';
import { SocialLinks } from '../ui/SocialLinks';
import { getAllDiaries, siteConfig } from '../../content';

export const HomeHero: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power3.out' } });
    tl.from('.gsap-hero-avatar', { opacity: 0, y: 12 })
      .from('.gsap-hero-title', { opacity: 0, y: 10 }, 0.08)
      .from('.gsap-hero-metrics', { opacity: 0, y: 10 }, 0.22)
      .from('.gsap-hero-socials', { opacity: 0, y: 10 }, 0.3)
      .from('.gsap-hero-announcement', { opacity: 0, y: 8 }, 0.36);
  }, { scope: containerRef });

  const diaries = getAllDiaries();
  const totalDiaries = diaries.length;

  const sinceDateStr =
    siteConfig.footer?.sinceDate ||
    (siteConfig.footer?.sinceYear ? `${siteConfig.footer.sinceYear}-01-01` : '2024-01-01');

  const runningDays = React.useMemo(() => {
    const start = new Date(sinceDateStr).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [sinceDateStr]);

  const hero = siteConfig.home?.hero;
  const greeting = hero?.greeting || "Hi, I'm";
  const highlightRole = hero?.highlightRole || 'full-stack things';
  const skillsPills = hero?.skillsPills || 'Java • Vue3 • Node.js • React';
  const quote = hero?.quote || siteConfig.subtitle;
  const showMetrics = hero?.showMetrics ?? true;
  const showSocials = hero?.showSocials ?? true;
  const onlineStatus = hero?.onlineStatus || 'online';

  const statusColorClass =
    onlineStatus === 'online'
      ? 'bg-emerald-500'
      : onlineStatus === 'busy'
        ? 'bg-rose-500'
        : onlineStatus === 'away'
          ? 'bg-amber-500'
          : 'bg-slate-400';

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center py-4 sm:py-6 text-center overflow-visible w-full"
    >
      <div className="gsap-hero-avatar mb-3 sm:mb-4 relative group">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-[4.85rem] lg:h-[4.85rem] rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-sakura-200 to-sakura-300/40 dark:from-slate-800 dark:to-sakura-900/60 shadow-md">
          <img
            src={siteConfig.author.avatar || '/avatar.jpg'}
            alt={siteConfig.author.name}
            className="w-full h-full rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          />
          <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 group/status">
            <span
              className={`block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${statusColorClass} border-2 border-white dark:border-slate-900 shadow-sm`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-sans whitespace-nowrap bg-slate-900/90 text-white dark:bg-slate-100/95 dark:text-slate-900 shadow-md pointer-events-none opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20">
              状态: {onlineStatus}
            </div>
          </div>
        </div>
      </div>

      <h1 className="gsap-hero-title font-sans text-xl sm:text-3xl lg:text-[2.2rem] font-normal leading-tight text-slate-900 dark:text-slate-100 tracking-tight">
        <div className="font-light opacity-85">
          {greeting}{' '}
          <span className="font-bold text-sakura-700 dark:text-sakura-400 tracking-tight">
            {siteConfig.author.name}
          </span>
        </div>

        <div className="mt-1 font-light opacity-80">
          <span>I build </span>
          <span className="font-semibold text-sakura-700 dark:text-sakura-400">
            {highlightRole}
          </span>
        </div>

        {skillsPills && (
          <div className="mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-light text-slate-600 dark:text-slate-300 text-sm">with</span>
            <code className="inline-flex items-center font-sans text-xs font-medium tracking-normal px-2.5 py-0.5 rounded-md text-sakura-800 dark:text-sakura-200 border border-sakura-200/60 dark:border-sakura-900/40 bg-sakura-50/50 dark:bg-sakura-950/30">
              {skillsPills}
            </code>
          </div>
        )}
      </h1>

      <div className="gsap-hero-metrics mt-3 sm:mt-4 text-center">
        {quote && (
          <div className="max-w-[65ch] mx-auto font-sans text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            「{quote}」
          </div>
        )}
        {showMetrics && (
          <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span>{totalDiaries} 篇手记</span>
            <span aria-hidden="true">&bull;</span>
            <span>运行 {runningDays} 天</span>
          </div>
        )}
      </div>

      {showSocials && siteConfig.author.socials && siteConfig.author.socials.length > 0 && (
        <div className="gsap-hero-socials mt-3 sm:mt-4 w-full relative z-30">
          <SocialLinks items={siteConfig.author.socials} variant="icon" />
        </div>
      )}

      {siteConfig.announcement?.enabled && (
        <div className="gsap-hero-announcement mt-4 sm:mt-5 max-w-lg mx-auto w-full px-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-md bg-white/75 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/60 text-sm font-sans text-slate-700 dark:text-slate-200">
            <div className="flex items-start gap-2 min-w-0 text-left">
              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-xs font-sans font-medium bg-sakura-50 dark:bg-sakura-950/40 text-sakura-700 dark:text-sakura-300 border border-sakura-200/50 dark:border-sakura-800/40">
                <Megaphone className="w-3.5 h-3.5 text-sakura-600 dark:text-sakura-400" />
                <span>{siteConfig.announcement.badge || '公告'}</span>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                {siteConfig.announcement.content}
              </span>
            </div>
            {siteConfig.announcement.linkUrl && (
              siteConfig.announcement.linkUrl.startsWith('http') ? (
                <a
                  href={siteConfig.announcement.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 min-h-11 px-2 inline-flex items-center justify-center text-sm font-medium text-sakura-700 dark:text-sakura-300 hover:text-sakura-800 gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-400"
                >
                  <span>{siteConfig.announcement.linkText || '去博客'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  href={siteConfig.announcement.linkUrl}
                  className="shrink-0 min-h-11 px-2 inline-flex items-center justify-center text-sm font-medium text-sakura-700 dark:text-sakura-300 hover:text-sakura-800 gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-400"
                >
                  <span>{siteConfig.announcement.linkText || '去博客'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
};
