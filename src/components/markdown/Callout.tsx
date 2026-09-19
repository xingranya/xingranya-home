import React from 'react';
import { Info, AlertTriangle, Lightbulb, Quote } from 'lucide-react';

interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'quote';
  title?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  type = 'note',
  title,
  children,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case 'quote':
        return <Quote className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />;
      case 'note':
      default:
        return <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'tip':
        return 'border-l-sky-500/70 bg-sky-50/40 dark:bg-sky-950/20';
      case 'warning':
        return 'border-l-rose-500/80 bg-rose-50/50 dark:bg-rose-950/20';
      case 'quote':
        return 'border-l-slate-400/80 bg-slate-100/40 dark:bg-slate-900/40';
      case 'note':
      default:
        return 'border-l-slate-400/70 bg-slate-50/60 dark:bg-[#18181B]/60';
    }
  };

  return (
    <div
      className={`my-4 sm:my-6 pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-3.5 border-l-2 rounded-r-sm border-y border-r border-y-slate-200/50 border-r-slate-200/50 dark:border-y-slate-800/40 dark:border-r-slate-800/40 text-slate-700 dark:text-slate-300 ${getBorderColor()}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-2.5">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-sans text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {title}
            </div>
          )}
          <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
