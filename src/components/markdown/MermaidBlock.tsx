import React, { useEffect, useRef, useState, useId } from 'react';
import { Network, Check, Copy } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface MermaidBlockProps {
  chart: string;
}

function cleanMermaidChart(raw: string): string {
  const lines = raw.trim().split('\n');
  const processed = lines.map((line) => {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('graph') ||
      trimmed.startsWith('flowchart') ||
      trimmed.startsWith('end') ||
      trimmed.startsWith('%%') ||
      trimmed.startsWith('classDef') ||
      trimmed.startsWith('sequenceDiagram') ||
      trimmed.startsWith('classDiagram')
    ) {
      return line;
    }

    let l = line;

    // 处理 subgraph ID [Title with special characters]
    if (trimmed.startsWith('subgraph')) {
      return l.replace(/subgraph\s+([A-Za-z0-9_-]+)\s*\[(.*?)\]/g, (match, id, text) => {
        let t = text.trim();
        if (t.startsWith('"') && t.endsWith('"')) return match;
        return `subgraph ${id} ["${t.replace(/"/g, "'")}"]`;
      });
    }

    // 自动清洗 NodeID[Text]
    l = l.replace(/(\b[\w\d_\-]+)\[(.*?)\]/g, (match, id, text) => {
      let t = text.trim();
      if (t.startsWith('(') && t.endsWith(')')) return match; // 避免圆柱 [(...)]
      if (t.startsWith('"') && t.endsWith('"')) return match;
      if (
        t.includes('(') ||
        t.includes(')') ||
        t.includes('[') ||
        t.includes(']') ||
        t.includes(':') ||
        t.includes(',') ||
        t.includes("'") ||
        t.includes('>') ||
        t.includes('<') ||
        t.includes('&')
      ) {
        return `${id}["${t.replace(/"/g, "'")}"]`;
      }
      return match;
    });

    return l;
  });

  return processed.join('\n');
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const uniqueId = useId().replace(/[:]/g, '_');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const safeChart = cleanMermaidChart(chart);

    import('mermaid')
      .then((m) => {
        if (!active) return;
        const mermaid = m.default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'MiSans, "MiSans Normal", "MiSans-Normal", "MiSans VF", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          themeVariables: isDark
            ? {
                primaryColor: '#1E293B',
                primaryTextColor: '#F8FAFC',
                primaryBorderColor: '#475569',
                lineColor: '#94A3B8',
                secondaryColor: '#0F172A',
                tertiaryColor: '#0F172A',
                actorBkg: '#1E293B',
                actorBorder: '#475569',
                actorTextColor: '#F8FAFC',
              }
            : {
                primaryColor: '#F1F5F9',
                primaryTextColor: '#0F172A',
                primaryBorderColor: '#CBD5E1',
                lineColor: '#64748B',
                secondaryColor: '#F8FAFC',
                tertiaryColor: '#FFFFFF',
                actorBkg: '#FFFFFF',
                actorBorder: '#CBD5E1',
                actorTextColor: '#0F172A',
              },
        });

        const id = `mermaid_${uniqueId}_${Date.now()}`;
        // 使用离屏沙箱容器隔离，防止 Mermaid 向 document.body 直接挂载节点
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);

        return mermaid
          .render(id, safeChart, tempContainer)
          .finally(() => {
            tempContainer.remove();
          });
      })
      .then((result) => {
        if (active && result) {
          setSvgContent(result.svg);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Mermaid render error:', err);
          // 彻底清除任何 Mermaid 库可能注入到页面底部 document.body 的错误 SVG 节点
          try {
            const errorSvgs = document.querySelectorAll(
              'svg.error-icon, body > svg[id*="mermaid"], body > [id^="dmermaid_"], svg[id^="dmermaid_"]'
            );
            errorSvgs.forEach((el) => el.remove());
          } catch (cleanupErr) {
            // ignore
          }

          setError('流程图解析失败，请检查语法规范');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      // 卸载时清理可能遗留的临时节点
      try {
        const tempNodes = document.querySelectorAll('body > svg[id*="mermaid"], body > [id^="dmermaid_"]');
        tempNodes.forEach((node) => node.remove());
      } catch (e) {
        // ignore
      }
    };
  }, [chart, isDark, uniqueId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="my-8 rounded-sm border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#161618]/60 backdrop-blur-sm overflow-hidden transition-all">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100/60 dark:bg-[#1a1a1e]/60 border-b border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <Network className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            MERMAID 结构图
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded-sm hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="复制图表源码"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>源码</span>
            </>
          )}
        </button>
      </div>

      {/* 图表展示区 */}
      <div className="p-6 flex items-center justify-center overflow-x-auto min-h-[140px]">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 py-6">
            <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-sakura-600 rounded-full animate-spin" />
            <span className="text-xs font-mono">正在渲染拓扑图...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-xs font-mono text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 rounded-sm">
            {error}
          </div>
        )}

        {!loading && !error && svgContent && (
          <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto transition-all"
          />
        )}
      </div>
    </div>
  );
};
