import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sakura-400';

interface SocialLinksProps {
  items: SocialLink[];
  variant?: 'icon' | 'chip';
}

const QrPopover: React.FC<{
  name: string;
  src: string;
  isOpen: boolean;
}> = ({ name, src, isOpen }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!isOpen || !node) return;
    node.style.transform = 'translateX(-50%)';
    const box = node.getBoundingClientRect();
    const margin = 12;
    let dx = 0;
    if (box.left < margin) dx = margin - box.left;
    if (box.right > window.innerWidth - margin) {
      dx = window.innerWidth - margin - box.right;
    }
    node.style.transform = `translateX(calc(-50% + ${dx}px))`;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute left-1/2 bottom-full mb-2 w-44 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2 z-50"
    >
      <img
        src={src}
        alt={`${name} 二维码`}
        width={160}
        height={160}
        className="w-full aspect-square object-cover object-center rounded-md bg-white"
      />
      <p className="mt-1.5 text-xs font-sans text-center text-slate-600 dark:text-slate-300">
        扫码加{name}
      </p>
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className={`mt-1.5 flex items-center justify-center min-h-11 text-xs font-sans text-sakura-700 dark:text-sakura-300 hover:underline ${FOCUS}`}
      >
        打开图片
      </a>
    </div>
  );
};

const Item: React.FC<{
  social: SocialLink;
  labeled: boolean;
  openQr: string | null;
  setOpenQr: (key: string | null) => void;
}> = ({ social, labeled, openQr, setOpenQr }) => {
  const Icon = SOCIAL_ICONS[social.icon] || GithubIcon;
  const hasQr = Boolean(social.qr);
  const key = `${social.name}-${social.icon}`;
  const isOpen = openQr === key;
  const triggerClass = labeled
    ? `social-trigger inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-sans text-slate-700 dark:text-slate-200 ${FOCUS}`
    : `social-trigger relative inline-flex items-center justify-center min-h-[39px] min-w-[39px] min-[360px]:min-h-11 min-[360px]:min-w-11 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 ${FOCUS}`;

  if (hasQr && social.qr) {
    return (
      <span
        className="relative group inline-flex"
        onMouseEnter={() => setOpenQr(key)}
        onMouseLeave={() => setOpenQr(null)}
        onFocus={() => setOpenQr(key)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpenQr(null);
          }
        }}
      >
        <button
          type="button"
          aria-label={`显示${social.name}二维码`}
          aria-expanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            // 鼠标悬停会先打开弹层；点击时保持打开，避免触屏合成的 hover 立刻把它关掉。
            setOpenQr(key);
          }}
          className={triggerClass}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {labeled && <span>{social.name}</span>}
        </button>
        <QrPopover name={social.name} src={social.qr} isOpen={isOpen} />
      </span>
    );
  }

  return (
    <a
      href={social.url}
      target={social.url.startsWith('http') ? '_blank' : '_self'}
      rel="noreferrer"
      aria-label={labeled ? undefined : social.name}
      className={`group/social ${triggerClass}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {labeled && <span>{social.name}</span>}
      {!labeled && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-sans whitespace-nowrap bg-slate-900/90 text-white dark:bg-slate-100/95 dark:text-slate-900 shadow-md pointer-events-none opacity-0 invisible group-hover/social:opacity-100 group-hover/social:visible group-focus-visible/social:opacity-100 group-focus-visible/social:visible transition-all z-20">
          {social.name}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90 dark:border-t-slate-100/95" />
        </span>
      )}
    </a>
  );
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ items, variant = 'icon' }) => {
  const [openQr, setOpenQr] = useState<string | null>(null);

  useEffect(() => {
    if (!openQr) return;
    const close = () => setOpenQr(null);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('click', close);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [openQr]);

  const labeled = variant === 'chip';
  const layoutClass = labeled
    ? 'flex flex-wrap justify-center items-center gap-2'
    : 'home-social-row flex flex-nowrap justify-center items-center gap-px min-[360px]:gap-1 sm:gap-2';

  return (
    <div className={layoutClass}>
      {items.map((social) => (
        <Item
          key={`${social.name}-${social.icon}`}
          social={social}
          labeled={labeled}
          openQr={openQr}
          setOpenQr={setOpenQr}
        />
      ))}
    </div>
  );
};
