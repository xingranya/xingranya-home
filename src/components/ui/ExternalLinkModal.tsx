import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ExternalLink, X, ShieldAlert, Lock, Unlock } from 'lucide-react';

interface ExternalLinkModalProps {
  isOpen: boolean;
  url: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  url,
  onClose,
  onConfirm,
}) => {
  const [countdown, setCountdown] = useState(5);
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(5);
    const timer = window.setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    const redirect = window.setTimeout(() => onConfirmRef.current(), 5000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(redirect);
    };
  }, [isOpen, url]);

  const parsedUrl = useMemo(() => {
    if (!url) return null;
    try {
      const u = new URL(url);
      return {
        hostname: u.hostname,
        protocol: u.protocol.replace(':', ''),
        isHttps: u.protocol === 'https:',
        full: url,
      };
    } catch {
      return {
        hostname: url,
        protocol: 'unknown',
        isHttps: false,
        full: url,
      };
    }
  }, [url]);

  const handleCancel = () => onClose();
  const handleConfirm = () => onConfirmRef.current();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] w-[90%] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded bg-white/95 dark:bg-[#0E1624]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.1)] overflow-hidden font-sans outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          <div className="p-5 space-y-4">
            {/* 头部：精致盾牌与标题 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <Dialog.Title className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  即将离开本站
                </Dialog.Title>
                
                <Dialog.Description className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  你正准备访问未受核验的第三方站点。请注意识别虚假与钓鱼内容，切勿在非受信页面输入敏感信息。
                </Dialog.Description>
              </div>
            </div>

            {/* 目标链接干净展示框 */}
            <div className="rounded-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/70 p-3 space-y-1">
              <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
                <span>目标域名</span>
                {parsedUrl && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                    {parsedUrl.isHttps ? (
                      <>
                        <Lock className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-slate-500 dark:text-slate-400">HTTPS 安全连接</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">HTTP 非加密</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {parsedUrl && (
                <div className="text-xs sm:text-[13px] font-semibold font-mono text-slate-900 dark:text-slate-100 truncate">
                  {parsedUrl.hostname}
                </div>
              )}

              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate select-all">
                {url}
              </p>
            </div>

            {/* 底部按钮区 */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                {countdown > 0 ? `${countdown}s 后自动前往` : '正在前往...'}
              </span>

              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex justify-center items-center rounded-sm px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none"
                  >
                    取消
                  </button>
                </Dialog.Close>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex justify-center items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-xs font-medium transition-colors bg-sakura-600 hover:bg-sakura-500 active:bg-sakura-700 dark:bg-sakura-500 dark:hover:bg-sakura-400 text-white dark:text-slate-950 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <span>继续访问 ({countdown}s)</span>
                  <ExternalLink className="w-3 h-3 opacity-85" />
                </button>
              </div>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              onClick={handleCancel}
              className="absolute right-3 top-3 rounded-xs p-1 opacity-50 hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">关闭</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
