import React, { useState, useEffect } from 'react';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { highlightCode } from '../../lib/shiki';
import { useTheme } from '../../hooks/useTheme';
import { CodeLangIcon } from './CodeLangIcon';

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  lang = 'text',
  filename,
}) => {
  const { isDark } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const lines = code.trim().split('\n');
  const isLong = lines.length > 25;

  useEffect(() => {
    let active = true;
    highlightCode(code.trim(), lang, isDark).then((html) => {
      if (active) {
        setHighlightedHtml(html);
      }
    });
    return () => {
      active = false;
    };
  }, [code, lang, isDark]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="my-4 sm:my-6 rounded-sm overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161618] text-xs sm:text-sm transition-all duration-200">
      {/* 顶部工具条 */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100/70 dark:bg-[#1a1a1e] border-b border-slate-200/60 dark:border-slate-800/80 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-1.5">
          <CodeLangIcon lang={lang} filename={filename} size={14} className="shrink-0" />
          {filename ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {filename}
            </span>
          ) : (
            <span className="uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-300">
              {lang}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-2 py-1 rounded-sm hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? '折叠代码' : '展开代码'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>折叠</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>展开 ({lines.length} 行)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-sm hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            title="复制代码"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  已复制
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 代码内容区 */}
      <div
        className={`relative overflow-x-auto ${
          !isExpanded ? 'max-h-36 overflow-hidden' : ''
        }`}
      >
        {highlightedHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:!rounded-none [&_span]:!bg-transparent [&_span]:!rounded-none"
          />
        ) : (
          <pre className="p-4 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre overflow-x-auto leading-relaxed !bg-transparent">
            <code className="!bg-transparent !p-0 !rounded-none">{code.trim()}</code>
          </pre>
        )}

        {!isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 dark:from-[#161618] to-transparent pointer-events-none flex items-end justify-center pb-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              ... 点击右上角展开剩余代码 ...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
