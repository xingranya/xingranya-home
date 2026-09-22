import React from 'react';
import { Link } from 'wouter';
import { Megaphone, ChevronRight } from 'lucide-react';
import { SocialLinks } from '../ui/SocialLinks';
import { getAllDiaries, getSnapshotTime, siteConfig } from '../../content';

const HeroText: React.FC<{
  text: string;
  className?: string;
  delay?: number;
}> = ({ text, className = '', delay = 0 }) => (
  <span className={`home-hero-split ${className}`} aria-label={text}>
    {Array.from(text).map((character, index) => (
      <span
        key={`${character}-${index}`}
        aria-hidden="true"
        className="home-hero-char"
        style={{ animationDelay: `${delay + Math.min(index, 18) * 16}ms` }}
      >
        {character === ' ' ? '\u00a0' : character}
      </span>
    ))}
  </span>
);

export const HomeHero: React.FC = () => {
  const diaries = getAllDiaries();
  const totalDiaries = diaries.length;

  const sinceDateStr =
    siteConfig.footer?.sinceDate ||
    (siteConfig.footer?.sinceYear ? `${siteConfig.footer.sinceYear}-01-01` : '2024-01-01');

  const runningDays = React.useMemo(() => {
    const start = new Date(sinceDateStr).getTime();
    const now = getSnapshotTime();
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
  const homeSocials = (siteConfig.author.socials || []).filter(
    (social) => !/^https:\/\/blog\.xran\.uk\/?$/i.test(social.url),
  );
  const onlineStatus = hero?.onlineStatus || 'online';
  const avatar = siteConfig.author.avatar || '/avatar.jpg';
  const isLocalAvatar = ['/avatar.jpg', '/avatar.png', '/avatar.webp'].includes(avatar);

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
      className="relative flex flex-col items-center justify-center py-2 sm:py-3 text-center overflow-visible w-full"
    >
      <div className="home-hero-avatar-enter mb-3 sm:mb-4 relative group">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-[4.85rem] lg:h-[4.85rem] rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-sakura-200 to-sakura-300/40 dark:from-sakura-400 dark:to-sakura-700/60 shadow-md">
          <svg className="hero-avatar-ring" viewBox="0 0 88 88" aria-hidden="true">
            <circle cx="44" cy="44" r="42" pathLength="1" />
          </svg>
          <img
            src={isLocalAvatar ? '/avatar-160.webp' : avatar}
            srcSet={isLocalAvatar ? '/avatar-160.webp 160w, /avatar-256.webp 256w' : undefined}
            sizes={isLocalAvatar ? '(min-width: 640px) 80px, 64px' : undefined}
            width={80}
            height={80}
            decoding="async"
            alt={siteConfig.author.name}
            className="w-full h-full rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          />
          <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 group/status">
            <span
              className={`block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${statusColorClass} border-2 border-white dark:border-slate-900 shadow-sm`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-sans whitespace-nowrap bg-slate-900/90 text-white dark:bg-slate-100/95 dark:text-slate-900 shadow-md pointer-events-none opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20">
              状态: {onlineStatus}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90 dark:border-t-slate-100/95" />
            </div>
          </div>
        </div>
      </div>

      <h1 className="font-sans text-xl sm:text-3xl lg:text-[2.2rem] font-normal leading-tight text-slate-900 dark:text-slate-100 tracking-tight">
        <span className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <HeroText text={greeting} delay={40} className="font-light opacity-85" />
          <HeroText
            text={siteConfig.author.name}
            delay={160}
            className="font-bold text-sakura-700 dark:text-[var(--sakura-accent)] tracking-tight"
          />
        </span>

        <span className="home-hero-role mt-1 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap italic">
          <HeroText text="I build" delay={100} className="font-light opacity-80" />
          <HeroText
            text={highlightRole}
            delay={180}
            className="font-semibold text-sakura-700 dark:text-[var(--sakura-accent)]"
          />
        </span>

        {skillsPills && (
          <span className="home-hero-soft-reveal home-hero-skills mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-light text-slate-600 dark:text-slate-300 text-sm">with</span>
            <code className="inline-flex items-center font-sans text-xs font-medium tracking-normal px-2.5 py-0.5 rounded-md text-sakura-800 dark:text-sakura-200 border border-sakura-200/60 dark:border-sakura-400/35 bg-sakura-50/50 dark:bg-[var(--sakura-wash)]">
              {skillsPills}
              <span className="home-skill-caret" aria-hidden="true" />
            </code>
          </span>
        )}
      </h1>

      <div className="mt-3 sm:mt-4 text-center">
        {quote && (
          <div className="home-hero-soft-reveal home-hero-quote max-w-[65ch] mx-auto font-serif text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            「{quote}」
          </div>
        )}
        {showMetrics && (
          <div className="home-hero-soft-reveal home-hero-metrics mt-1.5 sm:mt-2 flex items-center justify-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span>{totalDiaries} 篇手记</span>
            <span aria-hidden="true">&bull;</span>
            <span>运行 {runningDays} 天</span>
          </div>
        )}
      </div>

      {showSocials && homeSocials.length > 0 && (
        <div className="home-hero-soft-reveal home-hero-socials mt-3 sm:mt-4 w-full relative z-30">
          <SocialLinks items={homeSocials} variant="icon" />
        </div>
      )}

      {siteConfig.announcement?.enabled && (
        <div className="home-hero-soft-reveal home-hero-announcement mt-3 sm:mt-4 lg:mt-3 max-w-lg mx-auto w-full px-2">
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-white/75 dark:bg-[var(--card-paper)] border border-slate-200/70 dark:border-[var(--border-paper)] text-xs font-sans text-slate-700 dark:text-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0 text-left">
              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10.5px] font-mono font-medium bg-sakura-50 dark:bg-[var(--sakura-wash)] text-sakura-700 dark:text-sakura-300 border border-sakura-200/50 dark:border-sakura-400/35">
                <Megaphone className="w-3 h-3 text-sakura-600 dark:text-sakura-400" />
                <span>{siteConfig.announcement.badge || '公告'}</span>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 sm:line-clamp-none font-normal">
                {siteConfig.announcement.content}
              </span>
            </div>
            {siteConfig.announcement.linkUrl && (
              siteConfig.announcement.linkUrl.startsWith('http') ? (
                <a
                  href={siteConfig.announcement.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group shrink-0 min-h-8 inline-flex items-center gap-0.5 text-xs font-medium text-sakura-700 dark:text-sakura-300 hover:text-sakura-800 dark:hover:text-sakura-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-400"
                >
                  <span>{siteConfig.announcement.linkText || '去博客'}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                </a>
              ) : (
                <Link
                  href={siteConfig.announcement.linkUrl}
                  className="group shrink-0 min-h-8 inline-flex items-center gap-0.5 text-xs font-medium text-sakura-700 dark:text-sakura-300 hover:text-sakura-800 dark:hover:text-sakura-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-400"
                >
                  <span>{siteConfig.announcement.linkText || '去博客'}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
};
