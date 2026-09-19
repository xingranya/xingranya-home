import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRoute, Link, useLocation } from 'wouter';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { TOC } from '../components/post/TOC';
import { ReadingProgressBar } from '../components/post/ReadingProgressBar';
import { getPostBySlug, getAllPosts, loadPostContent, siteConfig } from '../content';
import { formatDate } from '../lib/date';
import { stripDuplicateHeading } from '../lib/markdown';
import {
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ListOrdered,
  AlignLeft,
  ArrowUp,
} from 'lucide-react';

export const PostDetail: React.FC = () => {
  const [, params] = useRoute('/posts/:slug');
  const [, setLocation] = useLocation();
  const slug = params?.slug;
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // 移动端目录抽屉打开时锁定外部页面滚动与支持 Esc 关闭
  useEffect(() => {
    if (!mobileTocOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileTocOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileTocOpen]);

  const allPosts = useMemo(() => getAllPosts(), []);
  const postMeta = useMemo(() => (slug ? getPostBySlug(slug) : null), [slug]);
  const [post, setPost] = useState(() => postMeta);
  const [contentLoading, setContentLoading] = useState(false);

  // 正文按需加载：列表索引仅有元数据，进入详情再拉 Markdown chunk
  useEffect(() => {
    if (!slug) {
      setPost(null);
      return;
    }
    let cancelled = false;
    const meta = getPostBySlug(slug);
    if (!meta) {
      setPost(null);
      return;
    }
    setPost(meta);
    if (meta.content && meta.content.trim().length > 0) {
      setContentLoading(false);
      return;
    }
    setContentLoading(true);
    loadPostContent(slug)
      .then((full) => {
        if (!cancelled) {
          setPost(full ?? meta);
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

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} · ${siteConfig.title}`;
    }
  }, [post?.title]);

  // JSON-LD 结构化数据，利于搜索引擎理解文章
  useEffect(() => {
    if (!post?.title || contentLoading) return;
    const siteUrl = siteConfig.url || 'https://xran.uk';
    const elId = 'post-jsonld';
    document.getElementById(elId)?.remove();
    const script = document.createElement('script');
    script.id = elId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: siteConfig.author?.name || '星苒鸭',
        url: siteConfig.author?.github || siteUrl,
      },
      publisher: {
        '@type': 'Person',
        name: siteConfig.author?.name || '星苒鸭',
      },
      mainEntityOfPage: `${siteUrl}/posts/${post.slug}`,
      keywords: (post.tags || []).join(','),
      wordCount: post.wordCount,
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById(elId)?.remove();
    };
  }, [post?.title, post?.slug, post?.summary, post?.date, post?.wordCount, post?.tags, contentLoading]);

  // 上一篇与下一篇导航计算
  const { prevPost, nextPost } = useMemo(() => {
    if (!slug) return { prevPost: null, nextPost: null };
    const currentIndex = allPosts.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) return { prevPost: null, nextPost: null };
    return {
      prevPost: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
      nextPost: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
    };
  }, [allPosts, slug]);

  // 过滤掉 Markdown 正文开头与文章大标题重复的首行 # 标题
  const cleanContent = useMemo(() => {
    return stripDuplicateHeading(post?.content || '', post?.title);
  }, [post?.content, post?.title]);

  const [coverError, setCoverError] = useState(false);
  const coverUrl = useMemo(() => {
    if (!post) return null;
    if (coverError) return `/covers/${post.slug}.svg`;
    if (post.coverImage) return post.coverImage;
    return `/covers/${post.slug}.svg`;
  }, [post, coverError]);

  if (!post) {
    return (
      <PageShell>
        <Container>
          <div className="py-24 text-center">
            <h2 className="font-sans text-2xl font-semibold text-slate-800 dark:text-slate-200">
              文稿未找到
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-mono">
              请求的文章路径不存在或已归档下线
            </p>
            <button
              onClick={() => setLocation('/posts')}
              className="mt-6 px-4 py-2 rounded-sm bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 text-xs font-medium"
            >
              返回文章列表
            </button>
          </div>
        </Container>
      </PageShell>
    );
  }

  const hasToc = post.toc && post.toc.length > 0;

  return (
    <>
      <ReadingProgressBar />

      <PageShell>
        <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-10 sm:pb-16">
          
          {/* 核心布局：正文纸张大板 + 宽屏右侧 Sticky 目录，平滑过渡中等视口留白 */}
          <div className="flex items-start justify-center gap-6 lg:gap-8 xl:gap-10">
            
            {/* 1. 出版级温润纸质大板容器 */}
            <main className="w-full flex-1 max-w-[920px] min-w-0 font-sans paper-sheet-realistic overflow-hidden text-slate-800 dark:text-slate-200">
              
              {/* 顶部全宽一体化通顶大画幅背景图 (Full-Bleed Cover Hero) - 移动端紧凑高度 */}
              {coverUrl ? (
                <div className="relative w-full h-44 sm:h-64 lg:h-72 overflow-hidden bg-slate-950">
                  <img
                    src={coverUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={() => {
                      if (!coverError) setCoverError(true);
                    }}
                  />
                  {/* 自然的多阶环境光渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/40 pointer-events-none" />

                  {/* 浮于大图底部的文章头衔：分类、日期、主标题 */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-10 text-white space-y-1.5 sm:space-y-2 pointer-events-none">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono text-white/90">
                      {post.category && (
                        <>
                          <Link
                            href={`/posts?category=${encodeURIComponent(post.category)}`}
                            className="group/cat pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/60 hover:bg-slate-900/85 backdrop-blur-md border border-white/15 hover:border-sakura-400/50 text-white/90 hover:text-white transition-all duration-200 shadow-sm"
                            title={`查看「${post.category}」分类文章`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sakura-400 shadow-[0_0_6px_rgba(255,143,166,0.85)] group-hover/cat:bg-sakura-300 group-hover/cat:scale-110 transition-all" />
                            <span className="font-medium text-[11px] sm:text-xs tracking-tight">{post.category}</span>
                          </Link>
                          <span>&bull;</span>
                        </>
                      )}
                      <span className="flex items-center space-x-1 text-white/90">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </span>
                      <span>&bull;</span>
                      <span className="text-white/90">约 {post.wordCount} 字</span>
                    </div>

                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug drop-shadow-md line-clamp-2 sm:line-clamp-none">
                      {post.title}
                    </h1>
                  </div>
                </div>
              ) : (
                /* 无图片时的纯净文章头部 */
                <div className="p-4 sm:p-7 md:p-8 pb-0">
                  <header className="mb-4 sm:mb-6 pb-4 sm:pb-5 border-b border-slate-200/70 dark:border-slate-800/70">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 sm:mb-2.5">
                      {post.category && (
                        <>
                          <Link
                            href={`/posts?category=${encodeURIComponent(post.category)}`}
                            className="group/cat inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sakura-500/10 hover:bg-sakura-500/15 dark:bg-sakura-400/10 dark:hover:bg-sakura-400/15 border border-sakura-500/20 hover:border-sakura-500/40 dark:border-sakura-400/25 dark:hover:border-sakura-400/50 text-sakura-700 dark:text-sakura-300 transition-all duration-200 shadow-2xs"
                            title={`查看「${post.category}」分类文章`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sakura-500 dark:bg-sakura-400 shadow-[0_0_5px_rgba(244,114,141,0.5)] group-hover/cat:scale-110 transition-transform" />
                            <span className="font-medium text-[11px] sm:text-xs tracking-tight">{post.category}</span>
                          </Link>
                          <span>&bull;</span>
                        </>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </span>
                      <span>&bull;</span>
                      <span>约 {post.wordCount} 字</span>
                    </div>

                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-950 dark:text-slate-50 tracking-tight leading-snug">
                      {post.title}
                    </h1>
                  </header>
                </div>
              )}

              {/* 纸张正文核心内容区（统一自然内边距） */}
              <div className="p-4 sm:p-6 md:p-8 pt-3 sm:pt-4 md:pt-4">
                
                {/* 摘要导言 */}
                {post.summary && (
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-md bg-slate-100/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-serif italic">
                    {post.summary}
                  </div>
                )}

                {/* 标签微选 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4 sm:mb-6 flex flex-wrap gap-1 sm:gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-xs text-[11px] sm:text-xs font-mono bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Markdown 正文渲染 (自动去重首行同名大标题) */}
                <div className="min-h-[300px] sm:min-h-[400px] leading-relaxed">
                  {contentLoading && !cleanContent ? (
                    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="正文加载中">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-10/12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-9/12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8/12" />
                    </div>
                  ) : (
                    <MarkdownRenderer content={cleanContent} />
                  )}
                </div>

              {/* 底部声明与署名 */}
              <footer className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3 sm:space-y-4">
                <div className="p-2.5 sm:p-3.5 rounded-md bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/60 flex items-start space-x-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-sans">
                    <strong>版权与原创声明：</strong>
                    本篇文章由 <strong>{siteConfig.author.name}</strong> 原创撰写，遵循{' '}
                    <span className="font-mono">CC BY-NC-SA 4.0</span>{' '}
                    知识共享协议。商业转载请联系作者获得授权。
                  </div>
                </div>

                {/* 上一篇 / 下一篇极简轻量导航（无框纯净排版） */}
                <nav aria-label="文章上下篇导航" className="pt-4 sm:pt-5 mt-2 sm:mt-3 border-t border-slate-200/70 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  {prevPost ? (
                    <Link
                      href={`/posts/${prevPost.slug}`}
                      className="group flex items-center gap-2.5 sm:gap-3 text-left transition-opacity duration-200 hover:opacity-75"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {prevPost.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(prevPost.date).replace(/^20(\d{2}年)/, '$1')}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextPost ? (
                    <Link
                      href={`/posts/${nextPost.slug}`}
                      className="group flex items-center justify-end gap-2.5 sm:gap-3 text-right sm:ml-auto w-full transition-opacity duration-200 hover:opacity-75"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {nextPost.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(nextPost.date).replace(/^20(\d{2}年)/, '$1')}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              </footer>
            </div>
          </main>

            {/* 2. 宽屏右侧 Sticky 目录 (≥1280px / xl:block) - self-stretch 撑满正文高度，全程吸顶浮动跟随 */}
            {hasToc && (
              <aside className="hidden xl:block w-72 xl:w-80 shrink-0 self-stretch">
                <div className="sticky top-24 pt-2">
                  <TOC toc={post.toc} />
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* 3. 中小屏 (<1280px) 右下角浮动目录按钮 */}
        {hasToc && (
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setMobileTocOpen(true)}
              className="fixed right-4 bottom-6 sm:right-5 sm:bottom-8 z-40 p-2.5 rounded-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/90 shadow-lg text-slate-700 dark:text-slate-300 hover:text-sakura-600 dark:hover:text-sakura-400 active:scale-95 flex items-center justify-center cursor-pointer pointer-events-auto"
              title="打开文章目录"
              aria-label="打开文章目录"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* 移动端自适应底部抽屉（通过 Portal 挂载至 body 顶层，自适应内容高度，微倒角一致性） */}
            {typeof document !== 'undefined' &&
              createPortal(
                <div
                  className={`fixed inset-0 z-50 transition-visibility duration-300 ${
                    mobileTocOpen ? 'pointer-events-auto' : 'pointer-events-none invisible'
                  }`}
                  aria-hidden={!mobileTocOpen}
                >
                  {/* 背景遮罩，点击即关闭 */}
                  <div
                    onClick={() => setMobileTocOpen(false)}
                    className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
                      mobileTocOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* 底部自适应抽屉面板（微倒角规范 rounded-t-lg） */}
                  <div
                    className={`fixed bottom-0 left-0 right-0 max-h-[72vh] w-full max-w-lg mx-auto bg-white dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 rounded-t-lg z-10 px-4 pt-2.5 pb-6 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
                      mobileTocOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {/* 顶部指示条 */}
                    <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2 shrink-0" />

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-2 px-1 shrink-0">
                      <div className="flex items-center space-x-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                        <AlignLeft className="w-3.5 h-3.5 text-sakura-500" />
                        <span>文章目录</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setMobileTocOpen(false);
                        }}
                        className="text-[11px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center space-x-0.5 transition-colors cursor-pointer"
                        title="回到文章顶部"
                      >
                        <ArrowUp className="w-3 h-3" />
                        <span>顶部</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1">
                      <TOC toc={post.toc} hideHeader onItemClick={() => setMobileTocOpen(false)} />
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>
        )}
      </PageShell>
    </>
  );
};

