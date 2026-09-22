import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Search,
  X,
} from 'lucide-react';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import collection from '../content/pages/wallpapers.json';

type Anime = (typeof collection.items)[number];
const filters = ['全部', '正在追', '已追完', '剧场版'] as const;
type Filter = (typeof filters)[number];
const statusLabels: Record<string, string> = { watching: '正在追', watched: '已追完' };
const matchesFilter = (item: Anime, filter: Filter) =>
  filter === '全部' ||
  (filter === '剧场版' ? item.version === '剧场版' : statusLabels[item.status] === filter);
// 新作在前，同年按首播日期排序；筛选和详情切换沿用同一顺序。
const chronologicalItems = [...collection.items].sort(
  (a, b) => b.year - a.year || (b.publishDate || '').localeCompare(a.publishDate || '')
);

function Poster({ item, preview = false }: { item: Anime; preview?: boolean }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [nearby, setNearby] = useState(preview);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (nearby || !imageRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearby(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [nearby]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setStatus('loaded');
  }, [nearby]);

  return (
    <div className={`wall-poster ${preview ? 'wall-poster-preview' : ''}`} data-status={status}>
      <span className="wall-image-placeholder" aria-hidden="true">
        {status === 'error' ? (
          <>
            <ImageOff size={22} />
            <span>封面暂时无法加载</span>
          </>
        ) : (
          <span className="wall-loading-mark">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
      <img
        ref={imageRef}
        src={nearby ? item.image : undefined}
        alt={`${item.title}的封面`}
        width={item.width}
        height={item.height}
        loading={preview ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {!preview && (
        <noscript>
          <img
            src={item.image}
            alt={`${item.title}的封面`}
            width={item.width}
            height={item.height}
            loading="lazy"
          />
        </noscript>
      )}
    </div>
  );
}

export const Wallpapers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('全部');
  const [activeId, setActiveId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const visibleItems = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return chronologicalItems.filter(
      (item) =>
        matchesFilter(item, filter) &&
        (!term ||
          [item.title, item.subtitle, item.englishTitle, item.year, ...item.tags]
            .join(' ')
            .toLocaleLowerCase()
            .includes(term))
    );
  }, [query, filter]);
  const activeIndex = visibleItems.findIndex((item) => item.id === activeId);
  const active = visibleItems[activeIndex];

  // 借鉴 React Bits Masonry 的错落排布与入场节奏，保留原生懒加载和静态正文。
  useEffect(() => {
    const grid = gridRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!grid || motion.matches) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const card = entry.target;
            observer.unobserve(card);
            animations.push(
              card.animate(
                [
                  { opacity: 0.45, transform: 'translateY(20px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                {
                  duration: 650,
                  delay: Math.min(index * 45, 180),
                  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }
              )
            );
          });
      },
      { threshold: 0.08 }
    );
    grid.querySelectorAll('.wall-card').forEach((card) => observer.observe(card));
    const stopMotion = () => {
      if (motion.matches) {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
      }
    };
    motion.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener('change', stopMotion);
    };
  }, [visibleItems]);

  const move = (direction: number) => {
    const next =
      visibleItems[(activeIndex + direction + visibleItems.length) % visibleItems.length];
    if (next) {
      setActiveId(next.id);
      dialogRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <PageShell className="wall-page">
      <Container size="wide">
        <header className="wall-heading">
          <div>
            <h1>
              番剧墙<span className="wall-heading-dot">.</span>
            </h1>
            <p>记录正在追和已经看完的番剧。</p>
          </div>
          <div className="wall-collection-note">
            <span>
              我的追番收藏 <span className="wall-count">{collection.items.length}</span> 部
            </span>
            <span>
              整理于{' '}
              <time dateTime={collection.updatedAt}>
                {collection.updatedAt.replaceAll('-', '.')}
              </time>
            </span>
          </div>
        </header>

        <div className="wall-toolbar">
          <div className="wall-filters" role="group" aria-label="按追番状态或剧场版筛选">
            {filters.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value}
                <span>{collection.items.filter((item) => matchesFilter(item, value)).length}</span>
              </button>
            ))}
          </div>
          <div className="wall-search">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="搜索番剧"
              placeholder="搜索片名、年份或标签"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
            />
            {query && (
              <button type="button" aria-label="清除搜索" onClick={() => setQuery('')}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="wall-caption">
          <p role="status" aria-live="polite">
            {query || filter !== '全部'
              ? `找到 ${visibleItems.length} 部番剧`
              : '按播出年份从新到旧'}
          </p>
          <span>
            点击封面查看详情 <ArrowDown size={12} aria-hidden="true" />
          </span>
        </div>

        <div className="wall-grid" ref={gridRef}>
          {visibleItems.map((item) => (
            <article className="wall-card" key={item.id}>
              <button
                type="button"
                className="wall-card-button"
                aria-label={`查看《${item.title}》的封面和简介`}
                onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setActiveId(item.id);
                }}
              >
                <div className="wall-artwork">
                  <Poster item={item} />
                  <span className="wall-open" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="wall-card-copy">
                  <div className="wall-card-meta">
                    <span>
                      {item.year} <span aria-hidden="true">/</span> {item.version}
                    </span>
                    <span className="wall-score">BGM {item.score.toFixed(1)}</span>
                  </div>
                  <h2>{item.title}</h2>
                </div>
              </button>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="wall-empty">
            <Search size={28} aria-hidden="true" />
            <h2>还没找到这个故事</h2>
            <p>换个片名、年份，或看看全部收藏。</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('全部');
              }}
            >
              查看全部收藏
            </button>
          </div>
        )}

        <div className="wall-end">
          <span>
            {visibleItems.length > 0
              ? `这一页，收藏了 ${visibleItems.length} 个故事。`
              : '喜欢的故事，还在等你发现。'}
          </span>
          <p>
            片单取自次元城动画「正在追 / 已追完」 · 评分为来源站 BGM 评分 · {collection.updatedAt}{' '}
            快照
          </p>
        </div>
      </Container>

      <Dialog.Root
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="wall-dialog-overlay" />
          {active && (
            <Dialog.Content
              className="wall-dialog"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                returnFocusRef.current?.focus({ preventScroll: true });
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  move(1);
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  move(-1);
                }
              }}
            >
              <Dialog.Close className="wall-dialog-close" aria-label="关闭详情">
                <X size={20} />
              </Dialog.Close>
              <div className="wall-dialog-scroll" ref={dialogRef}>
                <div
                  className="wall-dialog-art"
                  style={{ '--wall-cover': `url("${active.image}")` } as React.CSSProperties}
                >
                  <Poster key={active.id} item={active} preview />
                </div>
                <div className="wall-dialog-copy" key={active.id}>
                  <div className="wall-detail-meta">
                    <span>
                      {active.year} · {active.version} · {active.area}
                    </span>
                    <span>BGM {active.score.toFixed(1)}</span>
                  </div>
                  <Dialog.Title>{active.title}</Dialog.Title>
                  <p className="wall-alias">
                    {[active.subtitle, active.englishTitle].filter(Boolean).join(' / ')}
                  </p>
                  <Dialog.Description className="wall-description">
                    {active.description || '暂无简介。'}
                  </Dialog.Description>
                  <dl className="wall-facts">
                    <div>
                      <dt>追番</dt>
                      <dd>{statusLabels[active.status]}</dd>
                    </div>
                    <div>
                      <dt>首播</dt>
                      <dd>{active.publishDate || '暂无资料'}</dd>
                    </div>
                    <div>
                      <dt>集数</dt>
                      <dd>
                        {active.total > 0 ? `全 ${active.total} 话` : '尚未公布'} ·{' '}
                        {active.completed ? '已完结' : active.remarks || '连载中'}
                      </dd>
                    </div>
                    {active.directors.length > 0 && (
                      <div>
                        <dt>监督</dt>
                        <dd>{active.directors.join(' / ')}</dd>
                      </div>
                    )}
                    {active.writer && (
                      <div>
                        <dt>编剧</dt>
                        <dd>{active.writer}</dd>
                      </div>
                    )}
                    {active.actors.length > 0 && (
                      <div>
                        <dt>出演</dt>
                        <dd>{active.actors.join(' / ')}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="wall-tags">
                    {active.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="wall-detail-links">
                    <a
                      href={active.image}
                      target="_blank"
                      rel="noreferrer"
                      data-external-bypass="true"
                    >
                      查看原图 <ArrowUpRight size={14} />
                    </a>
                    <a href={active.sourceUrl} target="_blank" rel="noreferrer">
                      番剧来源 <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="wall-dialog-paging">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="上一部"
                  disabled={visibleItems.length < 2}
                >
                  <ChevronLeft size={18} />
                  <span>上一部</span>
                </button>
                <span aria-live="polite">
                  {activeIndex + 1} / {visibleItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="下一部"
                  disabled={visibleItems.length < 2}
                >
                  <span>下一部</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
      <noscript>
        <style>
          {
            '.wall-poster img { opacity: 1; filter: none; } .wall-image-placeholder { display: none; }'
          }
        </style>
      </noscript>
    </PageShell>
  );
};
