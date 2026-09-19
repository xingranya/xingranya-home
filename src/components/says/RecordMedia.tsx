import React, { useState } from 'react';
import { BookOpen, ExternalLink, Film, Music2, Play } from 'lucide-react';
import type { RecordContentBlock } from '../../types';
import { MediaLightbox } from './MediaLightbox';

export const RecordMedia: React.FC<{ media?: RecordContentBlock[] }> = ({ media = [] }) => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const images = media.filter((item): item is Extract<RecordContentBlock, { type: 'image' }> => item.type === 'image');
  if (!media.length) return null;

  return (
    <div className="mt-2.5 space-y-2.5">
      {images.length > 0 && (
        <div
          className={
            images.length === 1
              ? 'max-w-[340px] sm:max-w-[420px]'
              : images.length === 2 || images.length === 4
              ? 'grid max-w-[320px] sm:max-w-[380px] grid-cols-2 gap-2'
              : 'grid max-w-[360px] sm:max-w-[440px] grid-cols-3 gap-2'
          }
        >
          {images.slice(0, 9).map((image, index) => (
            <button
              key={image.url + index}
              className={
                'group relative overflow-hidden rounded-md cursor-zoom-in border border-slate-200/60 transition-opacity hover:opacity-90 dark:border-slate-800/80 ' +
                (images.length === 1 ? 'inline-block max-h-[300px] max-w-full' : 'aspect-square')
              }
              onClick={() => setLightbox(index)}
              aria-label={image.alt || '查看图片'}
            >
              <img
                src={image.thumbnail || image.url}
                alt={image.alt || ''}
                width={image.width}
                height={image.height}
                loading="lazy"
                className={
                  'h-full w-full object-cover ' +
                  (images.length === 1 ? 'max-h-[300px] max-w-full' : '')
                }
              />
              {index === 8 && images.length > 9 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-mono text-white">
                  +{images.length - 9}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    {media.filter((item) => item.type !== 'image').map((item, index) => {
      if (item.type === 'video') return <video key={'video' + index} controls muted preload="metadata" poster={item.thumbnail} src={item.url} className="max-h-[360px] w-full max-w-[480px] rounded-md bg-slate-950" />;
      if (item.type === 'link') return <a key={'link' + index} href={item.url} target="_blank" rel="noreferrer" className="flex max-w-[460px] overflow-hidden rounded-md border border-slate-200/80 bg-slate-50 transition-colors hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-600">{item.image && <img src={item.image} alt="" className="h-20 w-20 shrink-0 object-cover sm:h-24 sm:w-24" />}<span className="min-w-0 p-2.5 sm:p-3"><span className="flex items-center gap-1 text-xs text-sky-600"><ExternalLink className="h-3 w-3" /> 外部链接</span><strong className="mt-0.5 block truncate text-sm text-slate-800 dark:text-slate-100">{item.title || item.url}</strong>{item.description && <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">{item.description}</span>}</span></a>;
      if (item.type === 'music') return <a key={'music' + index} href={item.url} target="_blank" rel="noreferrer" className="flex max-w-[460px] items-center gap-2.5 rounded-md border border-slate-200/80 p-2.5 transition-colors hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-600"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-sky-100 dark:bg-sky-950/50">{item.cover ? <img src={item.cover} alt="" className="h-full w-full object-cover" /> : <Music2 className="h-4 w-4 text-sky-600" />}</div><span className="min-w-0"><strong className="block truncate text-sm dark:text-slate-100">{item.title}</strong><span className="text-xs text-slate-500">{item.artist || '音乐'}</span></span><Play className="ml-auto h-4 w-4 text-sky-600" /></a>;
      const Icon = item.type === 'douban-book' ? BookOpen : Film;
      return <a key={item.type + index} href={item.url} target="_blank" rel="noreferrer" className="flex max-w-[460px] items-center gap-2.5 rounded-md border border-slate-200/80 p-2.5 transition-colors hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-600">{item.cover ? <img src={item.cover} alt="" className="h-16 w-12 rounded-md object-cover" /> : <Icon className="h-4 w-4 text-sky-600" />}<span><span className="text-[10px] text-sky-600">{item.type === 'douban-book' ? '豆瓣读书' : '豆瓣电影'}</span><strong className="block text-sm dark:text-slate-100">{item.title}</strong><span className="text-xs text-slate-500">{item.description}</span></span></a>;
    })}
      {lightbox !== null && <MediaLightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />}
    </div>
  );
};
