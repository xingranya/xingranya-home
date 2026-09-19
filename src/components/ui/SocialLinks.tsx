import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import type { SocialLink } from '../../types';
import {
  GithubIcon,
  XTwitterIcon,
  MailIcon,
  BilibiliIcon,
  TelegramIcon,
  WeixinIcon,
  QQIcon,
} from './Icons';

const SOCIAL_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  github: GithubIcon,
  bilibili: BilibiliIcon,
  x: XTwitterIcon,
  email: MailIcon,
  telegram: TelegramIcon,
  weixin: WeixinIcon,
  qq: QQIcon,
  custom: Globe,
};

interface SocialLinksProps {
  items: SocialLink[];
  variant?: 'icon' | 'chip';
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ items, variant = 'icon' }) => {
  const [openQr, setOpenQr] = useState<string | null>(null);

  useEffect(() => {
    if (!openQr) return;
    const close = () => setOpenQr(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openQr]);

  return (
    <>
      {items.map((social) => {
        const Icon = SOCIAL_ICONS[social.icon] || GithubIcon;
        const hasQr = Boolean(social.qr);
        const key = `${social.name}-${social.icon}`;
        const isOpen = openQr === key;

        const triggerClass =
          variant === 'chip'
            ? 'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shadow-2xs'
            : 'relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all duration-200 focus-visible:outline-none';

        const popover = hasQr && social.qr && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2 z-50 transition-all ${
              isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto'
            }`}
          >
            <img
              src={social.qr}
              alt={`${social.name} 二维码`}
              width={160}
              height={160}
              className="w-full h-auto rounded-md"
            />
            <p className="mt-1.5 text-[10px] font-mono text-center text-slate-500 dark:text-slate-400">
              扫码加{social.name}
            </p>
            <a
              href={social.qr}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block text-center text-[11px] font-mono text-sakura-700 dark:text-sakura-300 hover:underline"
            >
              打开图片
            </a>
          </div>
        );

        if (hasQr) {
          return (
            <span key={key} className="relative group inline-flex">
              <button
                type="button"
                aria-label={`显示${social.name}二维码`}
                aria-expanded={isOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenQr(isOpen ? null : key);
                }}
                className={triggerClass}
              >
                <Icon className={variant === 'chip' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                {variant === 'chip' && <span>{social.name}</span>}
              </button>
              {popover}
            </span>
          );
        }

        return (
          <a
            key={key}
            href={social.url}
            target={social.url.startsWith('http') ? '_blank' : '_self'}
            rel="noreferrer"
            aria-label={social.name}
            className={`group/social ${triggerClass}`}
          >
            <Icon className={variant === 'chip' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
            {variant === 'chip' && <span>{social.name}</span>}
            {variant === 'icon' && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap bg-slate-900/90 text-white dark:bg-slate-100/95 dark:text-slate-900 shadow-md pointer-events-none opacity-0 invisible group-hover/social:opacity-100 group-hover/social:visible transition-all z-20">
                {social.name}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-900/90 dark:border-t-slate-100/95" />
              </span>
            )}
          </a>
        );
      })}
    </>
  );
};
