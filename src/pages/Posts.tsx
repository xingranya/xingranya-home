import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { PostCard } from '../components/post/PostCard';
import { getAllPosts, getAllCategories, siteConfig } from '../content';
import { getYear } from '../lib/date';
import {
  FileText,
  Tag as TagIcon,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
  Search,
} from 'lucide-react';

export const Posts: React.FC = () => {
  const allPosts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => getAllCategories(), []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) return decodeURIComponent(cat);
    }
    return 'all';
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('tag');
      if (tag) return decodeURIComponent(tag);
    }
    return null;
  });
  const [showAllTags, setShowAllTags] = useState<boolean>(false);

  // 监听 URL Query 参数变化，支持从详情页、归档或站点地图直接定位分类与标签
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const tag = params.get('tag');
    if (cat) {
      setSelectedCategory(decodeURIComponent(cat));
      if (!tag) setSelectedTag(null);
    }
    if (tag) {
      setSelectedTag(decodeURIComponent(tag));
    }
  }, []);

  // 根据当前所选分类动态联动计算可用标签及频次
  const availableTags = useMemo(() => {
    const relevantPosts =
      selectedCategory === 'all'
        ? allPosts
        : allPosts.filter((p) => p.category === selectedCategory);

    const tagCounts: Record<string, number> = {};
    relevantPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allPosts, selectedCategory]);

  const DEFAULT_TAG_LIMIT = 6;

  const displayTags = useMemo(() => {
    if (showAllTags || availableTags.length <= DEFAULT_TAG_LIMIT) {
      return availableTags;
    }
    const top = availableTags.slice(0, DEFAULT_TAG_LIMIT);
    if (selectedTag && !top.some((t) => t.name === selectedTag)) {
      const activeObj = availableTags.find((t) => t.name === selectedTag);
      if (activeObj) top.push(activeObj);
    }
    return top;
  }, [availableTags, showAllTags, selectedTag]);

  const filteredPosts = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    return allPosts.filter((post) => {
      const matchCategory =
        selectedCategory === 'all' || post.category === selectedCategory;
      const matchTag =
        !selectedTag || post.tags.includes(selectedTag);

      if (!matchCategory || !matchTag) return false;

      if (!cleanQuery) return true;

      const titleMatch = post.title?.toLowerCase().includes(cleanQuery);
      const summaryMatch = post.summary?.toLowerCase().includes(cleanQuery);
      const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
      const categoryMatch = post.category?.toLowerCase().includes(cleanQuery);

      return titleMatch || summaryMatch || tagMatch || categoryMatch;
    });
  }, [allPosts, selectedCategory, selectedTag, searchQuery]);

  // 按年份分组
  const postsByYear = useMemo(() => {
    const grouped: Record<string, typeof filteredPosts> = {};
    filteredPosts.forEach((post) => {
      const year = getYear(post.date);
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    });
    return grouped;
  }, [filteredPosts]);

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  const hasFilterActive =
    selectedCategory !== 'all' ||
    selectedTag !== null ||
    searchQuery.trim().length > 0;

  const handleResetFilter = () => {
    setSelectedCategory('all');
    setSelectedTag(null);
    setSearchQuery('');
  };

  const postsPage = siteConfig.postsPage;
  const pageTitle = postsPage?.title || '文稿归档';

  return (
    <PageShell>
      <Container size="wide">
        {/* 页面顶栏：标题与筛选控制面板 (手记同款居中规范) */}
        <div className="mb-4 pb-3.5 sm:mb-10 sm:pb-6 border-b border-slate-200/70 dark:border-slate-800/70 text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            <FileText className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>POSTS</span>
          </div>

          <h1 className="font-sans text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {pageTitle}
          </h1>

          {postsPage?.subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 font-sans max-w-lg mx-auto">
              {postsPage.subtitle}
            </p>
          )}

          {/* 居中搜索与操作栏 */}
          <div className="mt-4 sm:mt-5 max-w-md mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文稿标题、摘要或标签..."
                className="w-full pl-9 pr-8 py-2 rounded-md text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-sky-400/80 dark:focus:border-sky-400/80 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.3)] transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="清除搜索"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <Link
              href="/archives"
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-2 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800/70 transition-colors shadow-2xs shrink-0"
              title="切换至垂直时间轴归档"
            >
              <History className="w-3.5 h-3.5" />
              <span>时光归档</span>
            </Link>

            {hasFilterActive && (
              <button
                onClick={handleResetFilter}
                className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-md text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors shrink-0"
                title="重置所有筛选"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[11px]">重置</span>
              </button>
            )}
          </div>

          {/* 一级分类过滤器 (移动端横向顺滑滚动，桌面端自动换行居中) */}
          <div className="mt-3.5 sm:mt-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all flex items-center space-x-1.5 shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-300/80 dark:border-sky-700/80 shadow-2xs'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <span>全部</span>
              <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-xs ${
                selectedCategory === 'all'
                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                {allPosts.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : cat.name);
                    setSelectedTag(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-sans transition-all flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-300/80 dark:border-sky-700/80 shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-xs ${
                    isSelected
                      ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 二级标签筛选栏（精美收拢与联动） */}
          {availableTags.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] flex items-center mr-1">
                <TagIcon className="w-3 h-3 mr-1 opacity-70" /> 标签:
              </span>

              {displayTags.map((tag) => {
                const active = selectedTag === tag.name;
                return (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(active ? null : tag.name)}
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs font-mono text-[11px] transition-colors ${
                      active
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 font-medium shadow-2xs'
                        : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-transparent'
                    }`}
                  >
                    <span>#{tag.name}</span>
                    {active ? (
                      <X className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                    ) : (
                      <span className="text-[9.5px] opacity-60">({tag.count})</span>
                    )}
                  </button>
                );
              })}

              {/* 展开/收起更多标签按钮 */}
              {availableTags.length > DEFAULT_TAG_LIMIT && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-xs text-[11px] font-mono text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ml-1"
                >
                  <span>{showAllTags ? '收起' : `更多 (${availableTags.length})`}</span>
                  {showAllTags ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 文章列表（按年分组，响应式相框网格） */}
        {years.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-mono text-xs space-y-2">
            <div>未找到符合当前筛选条件的文稿</div>
            <button
              onClick={handleResetFilter}
              className="text-sky-600 dark:text-sky-400 hover:underline font-sans text-xs"
            >
              清除所有筛选条件
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map((year) => (
              <section key={year} className="relative">
                <div className="flex items-center space-x-3 mb-5 pt-2">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                    {year}
                  </span>
                  <div className="flex-1 h-px bg-slate-200/75 dark:bg-slate-800/75" />
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
                    {postsByYear[year].length} 篇
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {postsByYear[year].map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
};
