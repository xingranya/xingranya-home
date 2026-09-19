import React, { useEffect, useMemo, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { MermaidBlock } from './MermaidBlock';
import { AbcjsBlock } from './AbcjsBlock';
import { Callout } from './Callout';
import { generateHeadingId } from '../../lib/markdown';
import { CheckSquare, Square, ImageIcon } from 'lucide-react';
import { MediaLightbox } from '../says/MediaLightbox';

type KatexModule = typeof import('katex');
type KatexInstance = KatexModule['default'] | KatexModule;
let katexMod: KatexInstance | null = null;
let katexPromise: Promise<KatexInstance> | null = null;
let katexCssPromise: Promise<unknown> | null = null;

function ensureKatex(): Promise<KatexInstance> {
  if (!katexPromise) {
    katexPromise = import('katex').then((m) => {
      katexMod = m.default ?? m;
      return katexMod;
    });
  }
  if (!katexCssPromise) {
    katexCssPromise = import('katex/dist/katex.min.css').catch(() => undefined);
  }
  return katexPromise;
}

interface MarkdownRendererProps {
  content: string;
}

type BlockToken =
  | { type: 'code'; lang: string; code: string }
  | { type: 'mermaid'; chart: string }
  | { type: 'abc'; notation: string }
  | { type: 'math'; expression: string; displayMode: boolean }
  | { type: 'callout'; calloutType: 'note' | 'tip' | 'warning' | 'quote'; title?: string; text: string }
  | { type: 'markdown'; content: string };

function renderKatexMath(math: string, displayMode: boolean = false): string {
  if (!katexMod) {
    ensureKatex();
    return displayMode ? `$$${math}$$` : `$${math}$`;
  }
  try {
    return katexMod.renderToString(math.trim(), {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    console.error('KaTeX render error:', err);
    return math;
  }
}

// 独立的图片渲染组件，带错误兜底、点击放大与柔和相框
const MarkdownImage: React.FC<{ src: string; alt?: string; title?: string }> = ({
  src,
  alt,
  title,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <figure className="my-6 flex flex-col items-center justify-center">
        <div className="relative overflow-hidden rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 shadow-2xs max-w-full">
          {!loadError ? (
            <img
              src={src}
              alt={alt || ''}
              title={title || alt || '点击放大查看'}
              className="max-w-full h-auto object-contain block mx-auto transition-transform duration-300 hover:scale-[1.01] cursor-zoom-in"
              loading="lazy"
              onClick={() => setShowLightbox(true)}
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-slate-400 space-y-2 select-none min-h-[140px]">
              <ImageIcon className="w-8 h-8 opacity-60" />
              <span className="text-xs font-mono">图片加载失败: {alt || src}</span>
            </div>
          )}
        </div>
        {(alt || title) && (
          <figcaption className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 text-center">
            {title || alt}
          </figcaption>
        )}
      </figure>

      {showLightbox && !loadError && (
        <MediaLightbox
          images={[{ url: src, alt: alt || title }]}
          index={0}
          onClose={() => setShowLightbox(false)}
          onChange={() => {}}
        />
      )}
    </>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const needsKatex = useMemo(() => content.includes('$'), [content]);
  const [katexReady, setKatexReady] = useState(() => !needsKatex || katexMod !== null);

  useEffect(() => {
    if (!needsKatex || katexReady) return;
    let cancelled = false;
    ensureKatex()
      .then(() => {
        if (!cancelled) setKatexReady(true);
      })
      .catch(() => {
        if (!cancelled) setKatexReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [needsKatex, katexReady]);

  const blocks = useMemo(() => {
    const lines = content.split('\n');
    const result: BlockToken[] = [];
    let currentMd: string[] = [];

    const flushMd = () => {
      if (currentMd.length > 0) {
        result.push({
          type: 'markdown',
          content: currentMd.join('\n'),
        });
        currentMd = [];
      }
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. 数学公式块 $$ ... $$
      if (trimmed.startsWith('$$')) {
        flushMd();
        const mathLines: string[] = [];
        const singleLineMatch = trimmed.match(/^\$\$(.+)\$\$$/);
        if (singleLineMatch) {
          result.push({
            type: 'math',
            expression: singleLineMatch[1],
            displayMode: true,
          });
          i++;
          continue;
        } else {
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            const lastLine = lines[i].replace(/\$\$$/, '');
            if (lastLine) mathLines.push(lastLine);
            i++;
          }
          result.push({
            type: 'math',
            expression: mathLines.join('\n'),
            displayMode: true,
          });
          continue;
        }
      }

      // 2. 代码块 ```
      if (trimmed.startsWith('```')) {
        flushMd();
        const lang = trimmed.slice(3).trim().toLowerCase();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // 跳过闭合 ```
        const code = codeLines.join('\n');

        if (lang === 'mermaid') {
          result.push({ type: 'mermaid', chart: code });
        } else if (lang === 'abc') {
          result.push({ type: 'abc', notation: code });
        } else {
          result.push({ type: 'code', lang: lang || 'text', code });
        }
        continue;
      }

      // 3. 引用块 / Callout >
      if (trimmed.startsWith('>')) {
        flushMd();
        const quoteLines: string[] = [];
        let calloutType: 'note' | 'tip' | 'warning' | 'quote' = 'note';
        let title: string | undefined;

        while (i < lines.length && lines[i].trim().startsWith('>')) {
          const raw = lines[i].replace(/^>\s?/, '');
          quoteLines.push(raw);
          i++;
        }

        const firstLine = quoteLines[0]?.trim() || '';
        // 匹配 GitHub 风格 Alert: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
        const alertMatch = firstLine.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(.*)$/i);
        if (alertMatch) {
          const alertTag = alertMatch[1].toUpperCase();
          title = alertMatch[2]?.trim() || undefined;
          quoteLines.shift(); // 移除 Alert 标头
          if (alertTag === 'TIP' || alertTag === 'IMPORTANT') {
            calloutType = 'tip';
          } else if (alertTag === 'WARNING' || alertTag === 'CAUTION') {
            calloutType = 'warning';
          } else {
            calloutType = 'note';
          }
        } else {
          const fullText = quoteLines.join('\n');
          if (fullText.includes('提示：') || fullText.includes('Tip:')) {
            calloutType = 'tip';
          } else if (fullText.includes('注意：') || fullText.includes('Warning:')) {
            calloutType = 'warning';
          } else if (fullText.includes('引用：') || fullText.includes('Quote:')) {
            calloutType = 'quote';
          }
        }

        result.push({
          type: 'callout',
          calloutType,
          title,
          text: quoteLines.join('\n'),
        });
        continue;
      }

      currentMd.push(line);
      i++;
    }

    flushMd();
    return result;
  }, [content, katexReady]);

  // 行内富文本解析器（支持嵌套解析：图片、公式、行内代码、加粗、斜体、删除线、高亮、链接）
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;

    // 正则拆分模式：图片 ![]()、行内公式 $...$、行内代码 `...`、加粗 **...** / __...__、删除线 ~~...~~、高亮 ==...==、链接 []()
    const tokenRegex = /(!\[[^\]]*\]\([^)]+\)|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|==[^=]+==|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. 行内图片 ![alt](url)
      const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        return (
          <MarkdownImage
            key={index}
            src={imgMatch[2]}
            alt={imgMatch[1]}
          />
        );
      }

      // 2. 行内数学公式 $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const mathExpr = part.slice(1, -1);
        const rendered = renderKatexMath(mathExpr, false);
        return (
          <span
            key={index}
            className="inline-katex mx-0.5"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        );
      }

      // 3. 行内代码 `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded-sm text-xs font-mono bg-slate-200/60 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // 4. 加粗 **...** 或 __...__
      if (
        (part.startsWith('**') && part.endsWith('**') && part.length > 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length > 4)
      ) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // 5. 删除线 ~~...~~
      if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
        return (
          <del key={index} className="line-through text-slate-400 dark:text-slate-500">
            {part.slice(2, -2)}
          </del>
        );
      }

      // 6. 高亮 ==...==
      if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
        return (
          <mark
            key={index}
            className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded-sm"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }

      // 7. 链接 [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const linkUrl = linkMatch[2];
        const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');
        return (
          <a
            key={index}
            href={linkUrl}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 decoration-blue-300/60 dark:decoration-blue-700/60 transition-colors font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
  };

  // 处理标准 Markdown 段落行内样式、列表、表格、标题锚点与分割线
  const renderMarkdownSegment = (md: string, keyPrefix: string) => {
    const rawLines = md.split('\n');
    const elements: React.ReactNode[] = [];

    let inList = false;
    let listItems: { text: string; isTask?: boolean; checked?: boolean }[] = [];

    let inTable = false;
    let tableLines: string[] = [];

    const flushList = (listKey: string) => {
      if (inList && listItems.length > 0) {
        const hasTask = listItems.some((item) => item.isTask);
        if (hasTask) {
          elements.push(
            <ul key={listKey} className="my-4 space-y-2 text-slate-700 dark:text-slate-300 list-none pl-1">
              {listItems.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                  {item.isTask ? (
                    item.checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0 mt-1" />
                    )
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 shrink-0" />
                  )}
                  <div className={item.checked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                    {renderInlineMarkdown(item.text)}
                  </div>
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ul key={listKey} className="my-4 pl-6 space-y-1.5 list-disc text-slate-700 dark:text-slate-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInlineMarkdown(item.text)}
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (tableKey: string) => {
      if (inTable && tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        const alignCells = tableLines[1]
          .split('|')
          .slice(1, -1)
          .map((c) => {
            const t = c.trim();
            if (t.startsWith(':') && t.endsWith(':')) return 'center';
            if (t.endsWith(':')) return 'right';
            return 'left';
          });

        const bodyRows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div
            key={tableKey}
            className="my-6 overflow-x-auto rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xs shadow-2xs"
          >
            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800/80 text-xs sm:text-sm">
              <thead className="bg-slate-100/75 dark:bg-slate-800/60">
                <tr>
                  {headerCells.map((cell, cIdx) => (
                    <th
                      key={cIdx}
                      className={`px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-${alignCells[cIdx] || 'left'}`}
                    >
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-2.5 leading-relaxed text-${alignCells[cIdx] || 'left'}`}
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        tableLines = [];
        inTable = false;
      } else if (inTable) {
        tableLines.forEach((tLine, tIdx) => {
          elements.push(
            <p key={`${tableKey}-fallback-${tIdx}`} className="my-2 text-slate-700 dark:text-slate-300">
              {renderInlineMarkdown(tLine)}
            </p>
          );
        });
        tableLines = [];
        inTable = false;
      }
    };

    rawLines.forEach((rawLine, idx) => {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushList(`list-${keyPrefix}-${idx}`);
        flushTable(`table-${keyPrefix}-${idx}`);
        return;
      }

      // 表格处理
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList(`list-${keyPrefix}-${idx}`);
        inTable = true;
        tableLines.push(trimmed);
        return;
      } else {
        flushTable(`table-${keyPrefix}-${idx}`);
      }

      // 分割线 Horizontal Rule (---, ***, ___)
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushList(`list-${keyPrefix}-${idx}`);
        elements.push(
          <hr
            key={`hr-${keyPrefix}-${idx}`}
            className="my-5 sm:my-8 border-0 h-px bg-slate-200/80 dark:bg-slate-800/80"
          />
        );
        return;
      }

      // 独立图片语法匹配 ![alt](url)
      const standaloneImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (standaloneImgMatch) {
        flushList(`list-${keyPrefix}-${idx}`);
        elements.push(
          <MarkdownImage
            key={`img-${keyPrefix}-${idx}`}
            src={standaloneImgMatch[2]}
            alt={standaloneImgMatch[1]}
          />
        );
        return;
      }

      // 标题（1~4级，自动绑定统一的 generateHeadingId）
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushList(`list-${keyPrefix}-${idx}`);
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const cleanText = text.replace(/[*_`]/g, '').trim();
        const id = generateHeadingId(cleanText);

        if (level === 1) {
          elements.push(
            <h1
              id={id}
              key={`h1-${keyPrefix}-${idx}`}
              className="scroll-mt-24 font-serif text-xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-6 sm:mt-10 mb-2.5 sm:mb-4 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2
              id={id}
              key={`h2-${keyPrefix}-${idx}`}
              className="scroll-mt-24 font-serif text-lg sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-5 sm:mt-8 mb-2 sm:mb-3 tracking-tight border-b border-slate-200/60 dark:border-slate-800/60 pb-1 sm:pb-1.5"
            >
              {renderInlineMarkdown(text)}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3
              id={id}
              key={`h3-${keyPrefix}-${idx}`}
              className="scroll-mt-24 font-serif text-base sm:text-xl font-medium text-slate-800 dark:text-slate-200 mt-4 sm:mt-6 mb-1.5 sm:mb-2"
            >
              {renderInlineMarkdown(text)}
            </h3>
          );
        } else {
          elements.push(
            <h4
              id={id}
              key={`h4-${keyPrefix}-${idx}`}
              className="scroll-mt-24 font-serif text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 mt-3 sm:mt-4 mb-1 sm:mb-2"
            >
              {renderInlineMarkdown(text)}
            </h4>
          );
        }
        return;
      }

      // 任务列表与无序列表 (- [ ] / - [x] / - / * / +)
      const taskListMatch = line.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
      if (taskListMatch) {
        inList = true;
        listItems.push({
          text: taskListMatch[2],
          isTask: true,
          checked: taskListMatch[1].toLowerCase() === 'x',
        });
        return;
      }

      const listMatch = line.match(/^[-*+]\s+(.+)$/);
      if (listMatch) {
        inList = true;
        listItems.push({ text: listMatch[1], isTask: false });
        return;
      }

      // 有序列表 (1. 2.)
      const numListMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numListMatch) {
        flushList(`list-${keyPrefix}-${idx}`);
        elements.push(
          <div key={`num-${keyPrefix}-${idx}`} className="my-1.5 sm:my-2 flex items-start space-x-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
            <span className="font-mono text-xs font-semibold text-slate-500 mt-0.5 sm:mt-1 min-w-[1.25rem]">
              {numListMatch[1]}.
            </span>
            <div className="flex-1 leading-relaxed">
              {renderInlineMarkdown(numListMatch[2])}
            </div>
          </div>
        );
        return;
      }

      flushList(`list-${keyPrefix}-${idx}`);

      // 普通段落
      elements.push(
        <p
          key={`p-${keyPrefix}-${idx}`}
          className="my-2.5 sm:my-3.5 leading-[1.75] sm:leading-relaxed text-slate-700 dark:text-slate-300 text-[0.9375rem] sm:text-[1.02rem] tracking-normal sm:tracking-wide"
        >
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    flushList(`list-${keyPrefix}-end`);
    flushTable(`table-${keyPrefix}-end`);
    return elements;
  };

  return (
    <article className="prose prose-paper max-w-none text-slate-800 dark:text-slate-200">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock
                key={`code-${idx}`}
                code={block.code}
                lang={block.lang}
              />
            );
          case 'mermaid':
            return <MermaidBlock key={`mermaid-${idx}`} chart={block.chart} />;
          case 'abc':
            return (
              <AbcjsBlock key={`abc-${idx}`} abcNotation={block.notation} />
            );
          case 'math': {
            const html = renderKatexMath(block.expression, block.displayMode);
            return (
              <div
                key={`math-${idx}`}
                className="my-6 p-3.5 rounded-sm border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/30 overflow-x-auto text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
          case 'callout':
            return (
              <Callout
                key={`callout-${idx}`}
                type={block.calloutType}
                title={block.title}
              >
                <div className="space-y-1.5">
                  {block.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="leading-relaxed">
                      {renderInlineMarkdown(line)}
                    </p>
                  ))}
                </div>
              </Callout>
            );
          case 'markdown':
          default:
            return (
              <React.Fragment key={`md-${idx}`}>
                {renderMarkdownSegment(block.content, `seg-${idx}`)}
              </React.Fragment>
            );
        }
      })}
    </article>
  );
};
