import React, { useEffect, useRef, useState, useId } from 'react';
import { Music, Check, Copy } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface AbcjsBlockProps {
  abcNotation: string;
}

export const AbcjsBlock: React.FC<AbcjsBlockProps> = ({ abcNotation }) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const uniqueId = useId().replace(/[:]/g, '_');
  const targetElementId = `abcjs_render_${uniqueId}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    import('abcjs')
      .then((abcModule) => {
        if (!active) return;
        const abcjs = abcModule.default || abcModule;
        const target = document.getElementById(targetElementId);
        if (target) {
          target.innerHTML = '';
          abcjs.renderAbc(targetElementId, abcNotation.trim(), {
            responsive: 'resize',
            add_classes: true,
            foregroundColor: isDark ? '#E2E8F0' : '#0F172A',
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('ABCJS render error:', err);
          setError('乐谱渲染失败，请检查 ABC 记谱语法');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [abcNotation, isDark, targetElementId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(abcNotation.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="my-8 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#18181B]/80 backdrop-blur-sm overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100/70 dark:bg-[#202024]/70 border-b border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <Music className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            ABC NOTATION 乐谱渲染
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded-sm hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="复制乐谱文本"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>记谱</span>
            </>
          )}
        </button>
      </div>

      {/* 乐谱画布 */}
      <div className="p-6 flex flex-col items-center justify-center overflow-x-auto min-h-[160px]">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 py-6">
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-sky-600 rounded-full animate-spin" />
            <span className="text-xs font-mono">正在渲染五线谱...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-xs font-mono text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 rounded-sm">
            {error}
          </div>
        )}

        <div
          id={targetElementId}
          ref={containerRef}
          className="abcjs-container w-full max-w-full flex justify-center overflow-x-auto"
        />
      </div>
    </div>
  );
};
