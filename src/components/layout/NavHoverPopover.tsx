import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAllDiaries,
  getAllRecords,
  getAllFriends,
} from '../../content';
import { formatRelativeTime, formatDateShort } from '../../lib/date';

export interface NavPositionData {
  centerX: number;
  viewportCenterX: number;
  itemWidth: number;
  navWidth: number;
  navLeft: number;
}

interface NavHoverPopoverProps {
  activeKey: string | null;
  position: NavPositionData | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick: () => void;
}

const PANEL_WIDTHS: Record<string, number> = {
  '/archives': 460,
  '/diaries': 490,
  '/says': 390,
  '/friends': 450,
};

export const NavHoverPopover: React.FC<NavHoverPopoverProps> = ({
  activeKey,
  position,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}) => {
  const allDiaries = useMemo(() => getAllDiaries(), []);
  const allRecords = useMemo(() => getAllRecords(), []);
  const allFriends = useMemo(() => getAllFriends(), []);

  const isValidTab = Boolean(
    activeKey &&
      ['/archives', '/diaries', '/says', '/friends'].includes(
        activeKey
      )
  );
  const panelWidth = (activeKey && PANEL_WIDTHS[activeKey]) || 480;

  // 动态计算 Popover 相对于导航栏容器的 X 坐标偏移（带视口边界溢出防护）
  const targetLeft = useMemo(() => {
    if (!position) return 0;

    // 默认让 Popover 中心对准当前悬浮的导航项中心
    const rawLeft = position.centerX - panelWidth / 2;

    if (typeof window === 'undefined') return rawLeft;

    const safeMargin = 16;
    const viewportWidth = window.innerWidth;
    const popoverVpLeft = position.navLeft + rawLeft;
    const popoverVpRight = popoverVpLeft + panelWidth;

    let adjustment = 0;
    if (popoverVpLeft < safeMargin) {
      adjustment = safeMargin - popoverVpLeft;
    } else if (popoverVpRight > viewportWidth - safeMargin) {
      adjustment = viewportWidth - safeMargin - popoverVpRight;
    }

    return rawLeft + adjustment;
  }, [position, panelWidth]);

  // 计算顶部小指示箭头在 Popover 内部的相对 X 偏移量
  const arrowOffset = useMemo(() => {
    if (!position) return panelWidth / 2;
    const rawArrowX = position.centerX - targetLeft;
    return Math.max(28, Math.min(panelWidth - 28, rawArrowX));
  }, [position, targetLeft, panelWidth]);

  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isValidTab) {
      setIsRendered(true);
    }
  }, [isValidTab]);

  useGSAP(() => {
    if (isValidTab && isRendered) {
      // 首次出现或切换
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        x: targetLeft,
        width: panelWidth,
        duration: 0.2,
        ease: 'power3.out'
      });
      gsap.to(arrowRef.current, {
        left: arrowOffset,
        duration: 0.2,
        ease: 'power3.out'
      });
    } else if (!isValidTab && isRendered) {
      // 退场
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 6,
        scale: 0.96,
        duration: 0.15,
        ease: 'power3.in',
        onComplete: () => setIsRendered(false)
      });
    }
  }, [isValidTab, isRendered, targetLeft, panelWidth, arrowOffset]);

  return (
    <>
      {isRendered && (
        <div
          ref={containerRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="absolute top-full mt-2.5 left-0 pointer-events-auto z-50 select-none font-sans before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:bg-transparent"
          style={{ opacity: 0, transform: 'translateY(8px) scale(0.96)' }}
        >
          {/* 顶部指示微型三角箭头 (跟随激活项平滑滑动) */}
          <div
            ref={arrowRef}
            className="absolute -top-1.5 w-3 h-3 rotate-45 bg-white/95 dark:bg-[#0E1624]/95 border-t border-l border-slate-200/80 dark:border-slate-800/80 -translate-x-1/2 z-10 pointer-events-none shadow-[-2px_-2px_4px_rgba(0,0,0,0.02)]"
          />

          {/* 弹窗核心卡片容器 */}
          <div className="w-full rounded bg-white/95 dark:bg-[#0E1624]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.12),0_6px_20px_-3px_rgba(0,0,0,0.06)] overflow-hidden text-slate-800 dark:text-slate-200">
            
            {/* 1. 归档 (Archives) 悬浮面板 */}
            {activeKey === '/archives' && (
              <div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1">
                    <span>手记时光 &bull; 聚合归档</span>
                    <span>共 {allDiaries.length} 篇</span>
                  </div>

                  {/* 最近 3 篇手记时光速览 */}
                  <div className="space-y-1.5">
                    {allDiaries.slice(0, 3).map((diary) => (
                      <Link
                        key={diary.slug}
                        href={`/diaries/${diary.slug}`}
                        onClick={onItemClick}
                        className="group flex items-center justify-between p-2.5 rounded-md border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatDateShort(diary.date)}
                          </span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition-colors truncate">
                            {diary.title}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                          手记随笔
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <Link
                    href="/archives"
                    onClick={onItemClick}
                    className="group hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center space-x-1 font-medium text-slate-700 dark:text-slate-200"
                  >
                    <span>进入完整时间轴年谱</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                    随笔与手记年谱
                  </span>
                </div>
              </div>
            )}

            {/* 2. 手记 (Diaries) 悬浮面板 */}
            {activeKey === '/diaries' && (
              <div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1">
                    <span>手记随笔 &bull; 最新灵感</span>
                    <span>{allDiaries.length} 则</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {allDiaries.slice(0, 4).map((diary) => (
                      <Link
                        key={diary.slug}
                        href={`/diaries/${diary.slug}`}
                        onClick={onItemClick}
                        className="block p-3 rounded-md border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>{formatDateShort(diary.date)}</span>
                          {diary.weather && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-sakura-50 dark:bg-sakura-950/40 text-sakura-600 dark:text-sakura-400 text-[9px] border border-sakura-200/40 dark:border-sakura-800/40">
                              {diary.weather}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition-colors line-clamp-1">
                          {diary.title}
                        </h4>
                        {diary.summary && (
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                            {diary.summary}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <Link
                    href="/diaries"
                    onClick={onItemClick}
                    className="group hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center space-x-1 font-medium"
                  >
                    <span>查看全部手记</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                    共 {allDiaries.length} 则手记
                  </span>
                </div>
              </div>
            )}

            {/* 3. 动态 (Says) 悬浮面板 */}
            {activeKey === '/says' && (
              <div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1">
                    <span>日常碎片 &bull; 最新动态</span>
                    <span>{allRecords.length} 条</span>
                  </div>
                  <div className="space-y-2">
                    {allRecords.slice(0, 3).map((record) => (
                      <Link
                        key={record.id}
                        href="/says"
                        onClick={onItemClick}
                        className="block p-3 rounded-md border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {record.content}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{formatRelativeTime(String(record.createTime))}</span>
                          {record.mood && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-sakura-50 dark:bg-sakura-950/40 text-sakura-600 dark:text-sakura-400 border border-sakura-200/40 dark:border-sakura-800/40">
                              {record.mood}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <Link
                    href="/says"
                    onClick={onItemClick}
                    className="group hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center space-x-1 font-medium"
                  >
                    <span>查看全部动态</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                    共 {allRecords.length} 条动态
                  </span>
                </div>
              </div>
            )}

            {/* 4. 朋友 (Friends) 悬浮面板 */}
            {activeKey === '/friends' && (
              <div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1">
                    <span>志同道合 &bull; 朋友们</span>
                    <span>{allFriends.length} 位好友</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {allFriends.slice(0, 4).map((friend) => (
                      <a
                        key={friend.id}
                        href={friend.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-md border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors group flex items-start space-x-2.5"
                      >
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{friend.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition-colors truncate">
                              {friend.name}
                            </span>
                            <ArrowUpRight className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                          </div>
                          {friend.desc && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {friend.desc}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <Link
                    href="/friends"
                    onClick={onItemClick}
                    className="group hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center space-x-1 font-medium"
                  >
                    <span>前往友链大厅</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                    欢迎交换友链
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
