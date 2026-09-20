import React from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Network } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { siteConfig } from '../../content';
import { TechIcon } from '../ui/TechIcon';

const DEFAULT_NAV_COLUMNS = [
  {
    title: '关于',
    links: [
      { label: '关于本站', href: 'https://github.com/xingranya/xingranya-home', isExternal: true },
      { label: '博客', href: 'https://blog.xran.uk', isExternal: true },
      { label: '关于我', href: '/about' },
    ],
  },
  {
    title: '更多',
    links: [
      { label: '手记', href: '/diaries' },
      { label: '全站归档', href: '/archives' },
      { label: '志同道合', href: '/friends' },
    ],
  },
  {
    title: '联系',
    links: [
      { label: '发邮件', href: 'mailto:xingranya@outlook.jp', isExternal: true },
      { label: 'GitHub', href: 'https://github.com/xingranya', isExternal: true },
      { label: '日常说说', href: '/says' },
    ],
  },
];

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', title: '使用亮色主题' },
  { value: 'system' as const, label: 'System', title: '跟随系统主题' },
  { value: 'dark' as const, label: 'Dark', title: '使用暗色主题' },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const footer = siteConfig.footer;
  const sinceYear = footer?.sinceYear || 2024;
  const motto = footer?.motto || 'The only way to do great work is to love what you do.';
  const navColumns = footer?.navColumns && footer.navColumns.length > 0 ? footer.navColumns : DEFAULT_NAV_COLUMNS;
  const showThemeToggle = footer?.showThemeToggle ?? true;
  const showRss = footer?.showRss ?? true;
  const showSitemap = footer?.showSitemap ?? true;
  const icpUrl = footer?.icpUrl || (footer?.icp ? `https://icp.gov.moe/?keyword=${footer.icp.replace(/[^0-9]/g, '')}` : '#');
  const { theme, setTheme } = useTheme();

  return (
    <footer
      data-external-bypass="true"
      className="relative z-10 mt-auto border-t border-slate-200/60 dark:border-slate-800/60 pt-3 pb-3 sm:pt-4 sm:pb-4 lg:pt-3.5 lg:pb-3.5 text-xs font-sans text-slate-600 dark:text-slate-400 select-none shrink-0"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* 上层: 左侧站名标语与版权，右侧多列导航 */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
          {/* 左侧区域 */}
          <div className="max-w-md space-y-1.5">
            <h2 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
              {siteConfig.author.name || siteConfig.title}
            </h2>
            {motto && (
              <p className="italic text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
                {motto}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-0.5 text-[11px] font-mono leading-relaxed text-slate-400 dark:text-slate-500">
              <span>&copy; {sinceYear}-{currentYear}</span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span>Powered by</span>
              <a
                href="https://rsbuild.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-6 items-center gap-1 rounded-md bg-slate-100/70 px-1.5 text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100"
              >
                <TechIcon name="Rsbuild" className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>Rsbuild</span>
              </a>
              <span>&amp;</span>
              <a
                href="https://react.dev"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-6 items-center gap-1 rounded-md bg-slate-100/70 px-1.5 text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100"
              >
                <TechIcon name="React" className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>React 19</span>
              </a>
            </div>
          </div>

          {/* 右侧导航列：移动端与大屏保持 3 列对齐 */}
          <div className="grid w-full grid-cols-3 gap-x-4 pt-0.5 sm:gap-x-8 md:w-auto md:min-w-[22rem] md:gap-x-12">
            {navColumns.map((col, idx) => (
              <div key={col.title || idx} className="min-w-0 space-y-1">
                <div className="font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {col.title}
                </div>
                <ul className="space-y-0.5 text-xs">
                  {col.links.map((link, lIdx) => {
                    const isExt = link.isExternal || link.href.startsWith('http') || link.href.startsWith('mailto:');
                    return (
                      <li key={link.label || lIdx}>
                        {isExt ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex min-h-9 max-w-full items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          >
                            <span className="truncate">{link.label}</span>
                            <ArrowUpRight className="w-3 h-3 ml-0.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="inline-flex min-h-9 max-w-full items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          >
                            <span className="truncate">{link.label}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 下层: 底部信息与操作栏 */}
        <div className="grid grid-cols-1 items-center gap-2.5 border-t border-slate-200/50 pt-2.5 text-center text-[11px] font-mono text-slate-600 dark:border-slate-800/50 dark:text-slate-400 md:grid-cols-[minmax(0,1fr)_auto] md:text-left">
          {/* 左侧: RSS 订阅 · 站点地图 · 主题切换器 */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
            {showRss && (
              <a
                href="/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                title="RSS 2.0 订阅源 (可直接导入阅读器)"
              >
                RSS 订阅
              </a>
            )}
            {showRss && showSitemap && (
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            )}
            {showSitemap && (
              <Link
                href="/sitemap"
                className="inline-flex min-h-9 items-center hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                站点地图
              </Link>
            )}
            {(showRss || showSitemap) && showThemeToggle && (
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            )}

            {/* 主题切换器 */}
            {showThemeToggle && (
              <div className="inline-flex h-8 items-center gap-0.5 rounded-md border border-slate-200/70 bg-white/55 p-0.5 shadow-2xs dark:border-slate-700/70 dark:bg-slate-900/55">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={theme === option.value}
                    title={option.title}
                    onClick={() => setTheme(option.value)}
                    className={`h-7 rounded-sm px-2 transition-colors ${
                      theme === option.value
                        ? 'bg-white font-semibold text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-slate-100'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧: 自定义标语与备案号 */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-end">
            {footer?.customText && (
              <span>{footer.customText}</span>
            )}
            {footer?.customText && (
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            )}
            <a
              href="https://ipv6test.wcode.net/?q=xran.uk"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label="查看 xran.uk 的 IPv6 支持状态"
              title="IPv6 已启用"
              className="group inline-flex min-h-9 items-center"
            >
              <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/55 px-2 text-[10.5px] font-medium text-slate-600 transition-colors group-hover:border-sakura-300 group-hover:text-sakura-700 dark:border-slate-700/80 dark:bg-slate-900/55 dark:text-slate-300 dark:group-hover:border-sakura-800 dark:group-hover:text-sakura-300">
                <Network className="h-3.5 w-3.5" aria-hidden="true" />
                <span>IPv6</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]" aria-hidden="true" />
              </span>
            </a>
            {footer?.icp && (
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            )}
            {footer?.icp && (
              <a
                href={icpUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline underline-offset-2 transition-colors"
              >
                {footer.icp}
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
