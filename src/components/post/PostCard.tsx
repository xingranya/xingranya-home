import React from 'react';
import { Link } from 'wouter';
import { Calendar, Folder, Tag } from 'lucide-react';
import type { Post } from '../../types';
import { formatDateShort } from '../../lib/date';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [imgSrc, setImgSrc] = React.useState<string>(post.coverImage || `/covers/${post.slug}.svg`);

  return (
    <article className="group rounded overflow-hidden border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:border-slate-300/90 dark:hover:border-slate-700/80 hover:bg-white/95 dark:hover:bg-slate-900/85 transition-all duration-300 ease-out flex flex-col h-full">
      <Link href={`/posts/${post.slug}`} className="flex flex-col h-full">
        {/* 顶部标准 16:9 柔润相框封面 */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          <img
            src={imgSrc}
            alt={post.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-95"
            loading="lazy"
            onError={() => {
              if (imgSrc !== `/covers/${post.slug}.svg`) {
                setImgSrc(`/covers/${post.slug}.svg`);
              }
            }}
          />
        </div>

        {/* 下半部分白底内容区 */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div className="space-y-1.5">
            {/* 标题 */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-tight font-sans min-h-[2.5rem]">
              {post.title}
            </h3>

            {/* 摘要 */}
            {post.summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {post.summary}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {/* 标签列表 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-400 dark:text-slate-500 font-mono">
                <Tag className="w-2.5 h-2.5 opacity-70 flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-xs bg-slate-100/70 dark:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 底部元信息行（降噪弱化分割线） */}
            <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 dark:text-slate-500 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 opacity-70" />
                <span>{formatDateShort(post.date)}</span>
              </div>
              {post.category && (
                <div className="flex items-center space-x-1">
                  <Folder className="w-3 h-3 opacity-70" />
                  <span className="truncate max-w-[110px]">{post.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};
