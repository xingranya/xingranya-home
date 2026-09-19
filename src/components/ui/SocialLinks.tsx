import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
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

function splitItems(items: SocialLink[]) {
  const emails = items.filter((item) => item.icon === 'email');
  const others = items.filter((item) => item.icon !== 'email');
  const primaryEmail = emails[0]
    ? { ...emails[0], name: emails[0].name === 'Gmail' ? '邮件' : emails[0].name || '邮件' }
    : null;
  const extraEmails = emails.slice(1);
  const merged = primaryEmail ? [...others, primaryEmail] : others;

  const featured = merged.filter((item) => item.featured);
  const rest = [
    ...merged.filter((item) => !item.featured),
    ...extraEmails,
  ];

  if (featured.length === 0) {
    return { featured: merged, rest: extraEmails };
  }
  return { featured, rest };
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

  return (
    <div
      ref={ref}
      className={`absolute left-1/2 bottom-full mb-2 w-44 max-w-[calc(100vw-1.5rem)] rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2 z-50 transition-opacity ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto'
      }`}
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
    ? `inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-sans text-slate-700 dark:text-slate-200 transition-colors ${FOCUS}`
    : `relative inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ${FOCUS}`;

  if (hasQr && social.qr) {
    return (
      <span className="relative group inline-flex">
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
      className={triggerClass}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {labeled && <span>{social.name}</span>}
    </a>
  );
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ items, variant = 'icon' }) => {
  const [openQr, setOpenQr] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openQr && !moreOpen) return;
    const close = (event: MouseEvent) => {
      if (moreRef.current?.contains(event.target as Node)) return;
      setOpenQr(null);
      setMoreOpen(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openQr, moreOpen]);

  const labeled = true;
  const { featured, rest } = splitItems(items);
  const primary =
    variant === 'chip'
      ? [...featured, ...rest.filter((item) => item.icon !== 'email')]
      : featured;

  return (
    <div className="flex flex-wrap justify-center items-center gap-2">
      {primary.map((social) => (
        <Item
          key={`${social.name}-${social.icon}`}
          social={social}
          labeled={labeled}
          openQr={openQr}
          setOpenQr={setOpenQr}
        />
      ))}

      {variant === 'icon' && rest.length > 0 && (
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
              setMoreOpen((open) => !open);
              setOpenQr(null);
            }}
            className={`inline-flex items-center justify-center gap-1 min-h-11 px-3.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-xs font-sans text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 ${FOCUS}`}
          >
            更多
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
          </button>
          {moreOpen && (
            <div
              role="menu"
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[10.5rem] rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-1.5 z-50"
            >
              {rest.map((social) => (
                <div key={`${social.name}-${social.icon}`} className="flex">
                  <span className="w-full [&_a]:w-full [&_a]:justify-start [&_button]:w-full [&_button]:justify-start [&_a]:border-0 [&_button]:border-0 [&_a]:bg-transparent [&_button]:bg-transparent [&_a]:rounded-md [&_button]:rounded-md">
                    <Item
                      social={social}
                      labeled
                      openQr={openQr}
                      setOpenQr={setOpenQr}
                    />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
