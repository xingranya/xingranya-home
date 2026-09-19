import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface MediaLightboxProps {
  images: { url: string; alt?: string; thumbnail?: string }[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  images,
  index,
  onClose,
  onChange,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // 切图时重置变换状态
  const resetTransform = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImgLoading(true);
    setImgError(false);
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
  }, []);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      resetTransform();
      onChange((index - 1 + images.length) % images.length);
    },
    [images.length, index, onChange, resetTransform]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      resetTransform();
      onChange((index + 1) % images.length);
    },
    [images.length, index, onChange, resetTransform]
  );

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.min(Number((s + 0.3).toFixed(2)), 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => {
      const next = Math.max(Number((s - 0.3).toFixed(2)), 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    resetTransform();
  };

  // 双击 1x / 2x
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale !== 1) {
      resetTransform();
    } else {
      setScale(2);
    }
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.5), 4);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // 拖拽平移事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...position };
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startMouseRef.current.x;
      const dy = e.clientY - startMouseRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        hasDraggedRef.current = true;
        setPosition({
          x: startPosRef.current.x + dx,
          y: startPosRef.current.y + dy,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // 键盘快捷键与滚动锁定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '=' || e.key === '+') {
        setScale((s) => Math.min(Number((s + 0.25).toFixed(2)), 4));
      } else if (e.key === '-') {
        setScale((s) => {
          const next = Math.max(Number((s - 0.25).toFixed(2)), 0.5);
          if (next <= 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0' || e.key === 'r') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleNext, handlePrev, onClose, resetTransform]);

  const currentImage = images[index];
  if (!currentImage) return null;

  // 使用 createPortal 挂载至 body 顶层，彻底隔离卡片 DOM 层次与父级 transform/hover
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/85 backdrop-blur-md select-none overflow-hidden"
      role="dialog"
      aria-label="图片预览"
      onWheel={handleWheel}
    >
      {/* 顶部工具栏 */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左侧页码与缩放比 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-white/10 dark:bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {index + 1} / {images.length}
          </span>
          {scale !== 1 && (
            <span className="text-xs font-mono text-sakura-400 bg-sakura-500/10 px-2 py-0.5 rounded-full border border-sakura-400/20">
              {Math.round(scale * 100)}%
            </span>
          )}
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 text-white/80">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 hover:text-white transition-colors"
            title="放大 (+)"
            aria-label="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 hover:text-white transition-colors"
            title="缩小 (-)"
            aria-label="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 hover:text-white transition-colors"
            title="旋转"
            aria-label="旋转"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          {(scale !== 1 || rotation !== 0) && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 hover:text-white transition-colors text-sakura-400"
              title="复位 (0)"
              aria-label="复位"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <a
            href={currentImage.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 hover:text-white transition-colors"
            title="新窗口查看原图"
            aria-label="查看原图"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <div className="h-4 w-[1px] bg-white/20 mx-0.5" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-rose-500/80 hover:text-white transition-colors"
            title="关闭 (Esc)"
            aria-label="关闭预览"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 中间视区 */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget && !hasDraggedRef.current) {
            onClose();
          }
        }}
        onMouseDown={handleMouseDown}
        style={{
          cursor: scale > 1 ? 'grab' : 'default',
        }}
      >
        {/* 上一张按钮 */}
        {images.length > 1 && (
          <button
            type="button"
            className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-lg"
            onClick={handlePrev}
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* 加载状态提示 */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-sakura-400 animate-spin" />
          </div>
        )}

        {/* 错误提示 */}
        {imgError && (
          <div className="flex flex-col items-center justify-center text-slate-300 p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 space-y-3 z-10">
            <p className="text-sm font-sans">图片加载失败或文件不存在</p>
            <a
              href={currentImage.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-sakura-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{currentImage.url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* 图片主体 */}
        {!imgError && (
          <div
            className="flex items-center justify-center p-2"
            onDoubleClick={handleDoubleClick}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.12s ease-out',
            }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt || '预览大图'}
              className={`max-h-[82vh] max-w-[88vw] object-contain rounded-xs shadow-2xl pointer-events-none select-none transition-opacity duration-200 ${
                imgLoading ? 'opacity-0' : 'opacity-100'
              }`}
              draggable={false}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
            />
          </div>
        )}

        {/* 下一张按钮 */}
        {images.length > 1 && (
          <button
            type="button"
            className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-lg"
            onClick={handleNext}
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* 底部操作提示 */}
      <div className="w-full flex items-center justify-center pb-4 z-20 pointer-events-none">
        <span className="text-[11px] text-white/60 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono">
          滚轮 / 双击缩放 · 拖拽平移 · ESC 关闭
        </span>
      </div>
    </div>,
    document.body
  );
};
