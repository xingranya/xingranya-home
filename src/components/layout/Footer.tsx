import React from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { siteConfig } from '../../content';

const DEFAULT_NAV_COLUMNS = [
  {
    title: '关于',
    links: [
      { label: '关于此项目', href: 'https://github.com/xingranya/xingranya-home', isExternal: true },
      { label: '博客', href: 'https://blog.xran.uk', isExternal: true },
      { label: '关于我', href: '/about' },
    ],
  },
  {
    title: '更多',
    links: [
      { label: '动态手记', href: '/diaries' },
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

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const footer = siteConfig.footer;
  const sinceYear = footer?.sinceYear || 2024;
  const motto = footer?.motto || 'Stay hungry. Stay foolish.';
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-3.5">
        
        {/* 上层: 左侧站名标语与版权，右侧多列导航 */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 md:gap-8">
          {/* 左侧区域 */}
          <div className="space-y-1 max-w-sm">
            <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
              {siteConfig.author.name || siteConfig.title}
            </h3>
            {motto && (
              <p className="italic text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
                {motto}
              </p>
            )}
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono leading-relaxed pt-0.5">
              <span>&copy; {sinceYear}-{currentYear} Powered by </span>
              <a
                href="https://rsbuild.dev"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 transition-colors"
              >
                Rsbuild
              </a>
              <span> &amp; </span>
              <a
                href="https://react.dev"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 transition-colors"
              >
                React 19
              </a>
              <span>.</span>
            </div>
          </div>

          {/* 右侧导航列：移动端与大屏保持 3 列对齐 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-10 pt-0.5">
            {navColumns.map((col, idx) => (
              <div key={col.title || idx} className="space-y-1.5">
                <div className="font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {col.title}
                </div>
                <ul className="space-y-1 text-xs">
                  {col.links.map((link, lIdx) => {
                    const isExt = link.isExternal || link.href.startsWith('http') || link.href.startsWith('mailto:');
                    return (
                      <li key={link.label || lIdx}>
                        {isExt ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="w-3 h-3 ml-0.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                          >
                            {link.label}
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
        <div className="pt-2.5 sm:pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500 text-center sm:text-left">
          {/* 左侧: RSS 订阅 · 站点地图 · 主题切换器 */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
            {showRss && (
              <a
                href="/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                站点地图
              </Link>
            )}
            {(showRss || showSitemap) && showThemeToggle && (
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            )}

            {/* 主题切换器 */}
            {showThemeToggle && (
              <div className="inline-flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'font-semibold text-slate-800 dark:text-slate-200 underline underline-offset-4 decoration-sky-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Light
                </button>
                <span className="text-slate-300 dark:text-slate-700 text-[9px]">&bull;</span>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer ${
                    theme === 'system'
                      ? 'font-semibold text-slate-800 dark:text-slate-200 underline underline-offset-4 decoration-sky-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  System
                </button>
                <span className="text-slate-300 dark:text-slate-700 text-[9px]">&bull;</span>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'font-semibold text-slate-800 dark:text-slate-200 underline underline-offset-4 decoration-sky-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            )}
          </div>

          {/* 右侧: 自定义标语与备案号 */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 gap-y-1">
            {footer?.customText && (
              <span>{footer.customText}</span>
            )}
            {footer?.customText && footer?.icp && (
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
