import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home as HomeIcon,
  FileText,
  History,
  Feather,
  MessageSquareQuote,
  Users,
  User,
  Sparkles,
  Link2,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import { SearchModal } from '../search/SearchModal';
import { NavHoverPopover } from './NavHoverPopover';
import { siteConfig } from '../../content';
import type { NavLinkItem } from '../../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  HomeIcon,
  FileText,
  History,
  Feather,
  MessageSquareQuote,
  Users,
  User,
  Sparkles,
  Link2,
  Globe,
};

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 'nav-home', href: '/', label: '首页', icon: 'HomeIcon', enabled: true },
  { id: 'nav-archives', href: '/archives', label: '归档', icon: 'History', enabled: true },
  { id: 'nav-diaries', href: '/diaries', label: '手记', icon: 'Feather', enabled: true },
  { id: 'nav-says', href: '/says', label: '动态', icon: 'MessageSquareQuote', enabled: true },
  { id: 'nav-friends', href: '/friends', label: '朋友', icon: 'Users', enabled: true },
];

export const Header: React.FC = () => {
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // 判断当前页面是否属于手记详情页
  const isDetailPage = useMemo(() => {
    return /^\/(diaries|journal|shouji)\/[^/]+$/.test(location);
  }, [location]);

  // 控制详情页向下滚动时导航栏收起，向上滚动时呼出
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    if (!isDetailPage) {
      setIsNavVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY <= 60) {
            setIsNavVisible(true);
          } else if (currentScrollY > lastScrollY + 8) {
            setIsNavVisible(false);
            setHoveredNav(null);
          } else if (currentScrollY < lastScrollY - 8) {
            setIsNavVisible(true);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDetailPage]);

  const headerConfig = siteConfig.header;
  const enableMegaMenu = headerConfig?.enableMegaMenu ?? true;
  const enableSearch = headerConfig?.enableSearch ?? true;

  // 过滤出启用的导航项
  const navLinks = (headerConfig?.navLinks || DEFAULT_NAV_LINKS).filter((l) => l.enabled !== false);

  // 全局快捷键 ⌘K / Ctrl+K 唤起搜索
  useEffect(() => {
    if (!enableSearch) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableSearch]);

  // 导航项 Hover 悬浮联动状态
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [navPosition, setNavPosition] = useState<{
    centerX: number;
    viewportCenterX: number;
    itemWidth: number;
    navWidth: number;
    navLeft: number;
  } | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const handleNavMouseEnter = (href: string, e: React.MouseEvent<HTMLElement>) => {
    if (!enableMegaMenu || href === '/' || href.startsWith('http')) {
      setHoveredNav(null);
      return;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (navRef.current) {
      const containerRect = navRef.current.getBoundingClientRect();
      const targetRect = e.currentTarget.getBoundingClientRect();
      const relativeCenter = targetRect.left + targetRect.width / 2 - containerRect.left;
      const viewportCenter = targetRect.left + targetRect.width / 2;

      setNavPosition({
        centerX: relativeCenter,
        viewportCenterX: viewportCenter,
        itemWidth: targetRect.width,
        navWidth: containerRect.width,
        navLeft: containerRect.left,
      });
    }
    setHoveredNav(href);
  };

  const handleNavMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredNav(null);
    }, 180);
  };

  const handlePopoverMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredNav(null);
    }, 180);
  };

  const handleItemClick = () => {
    setHoveredNav(null);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full px-4 sm:px-6 pt-2 pb-1 sm:pt-3 sm:pb-1.5 lg:pt-2.5 lg:pb-1 pointer-events-none font-sans transition-all duration-300 ease-in-out ${
          !isNavVisible && isDetailPage
            ? '-translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {/* 正中心纯粹居中导航栏 */}
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[2.4rem]">
          <div
            className="pointer-events-auto flex items-center justify-center relative"
            onMouseLeave={handleNavMouseLeave}
          >
              <nav
                ref={navRef}
                className="flex items-center p-1 rounded bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/75 dark:border-slate-800/75 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06)] gap-0.5 text-xs max-w-full overflow-x-auto"
              >
                {navLinks.map((link) => {
                  const isExt = link.isExternal || link.href.startsWith('http');
                  const active = !isExt && isActive(link.href);
                  const IconComponent = ICON_MAP[link.icon] || FileText;

                  if (isExt) {
                    return (
                      <a
                        key={link.id || link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="relative px-2.5 py-1 rounded-sm transition-colors duration-150 select-none flex items-center justify-center gap-1.5 shrink-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                      >
                        <span className="leading-none translate-y-[0.5px]">{link.label}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60 ml-[-2px]" />
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.id || link.href}
                      href={link.href}
                      onMouseEnter={(e) => handleNavMouseEnter(link.href, e)}
                      onClick={handleItemClick}
                      className={`relative px-2.5 py-1 rounded-sm transition-colors duration-150 select-none flex items-center justify-center gap-1.5 shrink-0 ${
                        active
                          ? 'text-slate-950 dark:text-slate-50 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 静态的选中项小矩形卡片 */}
                      {active && (
                        <span
                          className="absolute inset-0 rounded-sm bg-white/95 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] pointer-events-none -z-10 transition-all duration-300"
                        />
                      )}
                      {/* 选中项专属图标 */}
                      {active && (
                        <IconComponent className="w-3.5 h-3.5 opacity-90 text-slate-800 dark:text-slate-200 flex-shrink-0" />
                      )}
                      <span className="leading-none translate-y-[0.5px]">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

            {/* 导航悬浮预览卡片 MegaMenu Popover */}
            {enableMegaMenu && (
              <NavHoverPopover
                activeKey={hoveredNav}
                position={navPosition}
                onMouseEnter={handlePopoverMouseEnter}
                onMouseLeave={handlePopoverMouseLeave}
                onItemClick={handleItemClick}
              />
            )}
          </div>
        </div>
      </header>

      {/* 搜索弹窗 */}
      {enableSearch && (
        <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </>
  );
};
