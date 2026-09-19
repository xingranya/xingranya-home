import React, { useState, useMemo } from 'react';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { Users, Sparkles, Search, X, Mail, Check, Copy } from 'lucide-react';
import { getAllFriends, siteConfig } from '../content';
import type { FriendItem } from '../types';

import { TechBadge } from '../components/friends/TechBadge';

export const Friends: React.FC = () => {
  const [query, setQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const allFriends = useMemo(() => getAllFriends(), []);

  const filteredFriends = useMemo(() => {
    if (!query.trim()) return allFriends;
    const q = query.toLowerCase().trim();
    return allFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.desc && f.desc.toLowerCase().includes(q)) ||
        (f.framework && f.framework.toLowerCase().includes(q)) ||
        (f.deploy && f.deploy.toLowerCase().includes(q))
    );
  }, [allFriends, query]);

  const friendsPage = siteConfig.friendsPage;
  const pageTitle = friendsPage?.title || '志同道合的朋友';
  const pageSubtitle = friendsPage?.subtitle || '山海相逢，灵感共振。';
  const guideTitle = friendsPage?.guideTitle || '交换友链';
  const templateName = friendsPage?.template?.name || siteConfig.title;
  const templateDesc = friendsPage?.template?.desc || siteConfig.description;
  const templateUrl = friendsPage?.template?.url || siteConfig.url;
  const templateAvatar = friendsPage?.template?.avatar || `${siteConfig.url}${siteConfig.author.avatar}`;

  const email = siteConfig.author.email || 'hi@chent.co';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyTemplate = () => {
    const tpl = `名称：${templateName}\n简介：${templateDesc}\n链接：${templateUrl}\n头像：${templateAvatar}`;
    navigator.clipboard.writeText(tpl);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <PageShell>
      <Container size="wide">
        {/* 顶部标题区 (手记同款居中规范) */}
        <div className="mb-4 pb-3.5 sm:mb-10 sm:pb-6 border-b border-slate-200/70 dark:border-slate-800/70 text-center">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            <Users className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>FRIENDS</span>
          </div>

          <h1 className="font-sans text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 font-sans max-w-md mx-auto">
              {pageSubtitle}
            </p>
          )}

          {/* 实时搜索过滤 (居中摆放) */}
          <div className="mt-4 sm:mt-5 max-w-md mx-auto relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索友链名称、技术栈或简介..."
              className="w-full pl-9 pr-8 py-2 rounded-md text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-sky-400/80 dark:focus:border-sky-400/80 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.3)] transition-all outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="清除搜索"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 朋友卡片 Grid (弹性自适应舒展网格) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mb-6 sm:mb-10">
          {filteredFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
          {filteredFriends.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs font-mono text-slate-400">
              未找到匹配 &ldquo;{query}&rdquo; 的友链
            </div>
          )}
        </div>

        {/* 申请友链指南 */}
        <div className="p-4 sm:p-5 rounded-md border border-slate-200/70 dark:border-slate-800/70 space-y-3 bg-white/60 dark:bg-slate-900/50 shadow-2xs">
          <div className="flex items-center space-x-2 font-sans font-semibold text-slate-900 dark:text-slate-100 text-sm">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2>{guideTitle}</h2>
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            如果您也拥有自己的个人独立博客，欢迎在您的站点添加本站后通过邮件{' '}
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-mono text-[11px] shadow-xs group transition-colors hover:bg-sky-100/70 dark:hover:bg-sky-900/50 align-middle my-0.5">
              <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="hover:underline tracking-tight font-medium"
                title="点击发送邮件"
              >
                {email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 hover:bg-sky-200/60 dark:hover:bg-sky-800/80 rounded transition-colors text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 cursor-pointer"
                title={copiedEmail ? '已复制邮箱' : '复制邮箱地址'}
                aria-label="复制邮箱地址"
              >
                {copiedEmail ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </span>{' '}
            联系交换。
          </p>

          <div className="relative p-3.5 rounded-md bg-slate-50/80 dark:bg-slate-900/75 border border-slate-200/60 dark:border-slate-800/60 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 group">
            <button
              type="button"
              onClick={handleCopyTemplate}
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-xs cursor-pointer"
              title="复制本站友链信息"
            >
              {copiedTemplate ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制信息</span>
                </>
              )}
            </button>
            <div>名称：{templateName}</div>
            <div>简介：{templateDesc}</div>
            <div>链接：{templateUrl}</div>
            <div>头像：{templateAvatar}</div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
};

const FriendCard: React.FC<{ friend: FriendItem }> = ({ friend }) => {
  const [imgError, setImgError] = useState(false);
  const initial = (friend.name || '?').charAt(0).toUpperCase();

  return (
    <a
      href={friend.link}
      target="_blank"
      rel="noreferrer"
      data-external-bypass="true"
      className="p-3 sm:p-3.5 rounded-md paper-card flex items-start space-x-3 group transition-all duration-300 hover:!border-sky-300/80 dark:hover:!border-sky-500/50 hover:shadow-[0_4px_16px_-2px_rgba(56,189,248,0.12),0_2px_6px_-1px_rgba(15,23,42,0.04)]"
    >
      {/* 左侧头像 */}
      <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans text-xs font-bold shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 mt-0.5">
        {friend.avatar && !imgError ? (
          <img
            src={friend.avatar}
            alt={friend.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* 右侧主体 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-sans text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors truncate">
            {friend.name}
          </h3>

          {/* 右侧技术栈与部署方式图标 */}
          <div
            className="flex items-center space-x-1 shrink-0 px-1 py-0.5 rounded bg-slate-100/60 dark:bg-slate-800/60"
            onClick={(e) => e.stopPropagation()}
          >
            <TechBadge type="framework" name={friend.framework} />
            <TechBadge type="deploy" name={friend.deploy} />
          </div>
        </div>

        {/* 简介文本 */}
        <p
          className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-sans leading-relaxed"
          title={friend.desc}
        >
          {friend.desc || '独立个人博客'}
        </p>
      </div>
    </a>
  );
};
