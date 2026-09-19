import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { Container } from '../components/layout/Container';
import { siteConfig } from '../content';
import {
  User,
  Sparkles,
  Cpu,
  Terminal,
  MapPin,
  Mail,
} from 'lucide-react';
import { GithubIcon, XTwitterIcon, MailIcon, BilibiliIcon } from '../components/ui/Icons';

const SOCIAL_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  github: GithubIcon,
  bilibili: BilibiliIcon,
  x: XTwitterIcon,
  email: MailIcon,
};

export const About: React.FC = () => {
  const about = siteConfig.about;
  const author = siteConfig.author;

  return (
    <PageShell>
      <Container size="wide">
        {/* 出版级温润纸板大单 */}
        <article className="paper-sheet-realistic p-6 sm:p-10 md:p-12 font-sans space-y-12 my-4 sm:my-8 text-slate-800 dark:text-slate-200">
          
          {/* 1. 卷首个人题头 */}
          <header className="pb-8 border-b border-slate-200/70 dark:border-slate-800/70">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
              {/* 大头像 */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-sky-200 to-blue-300/40 dark:from-slate-800 dark:to-sky-900/60 shadow-md shrink-0">
                <img
                  src={author.avatar || '/avatar.jpg'}
                  alt={author.name}
                  className="w-full h-full rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                />
              </div>

              {/* 身份文字 */}
              <div className="flex-1 space-y-2.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400">
                  <User className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>{about?.identityTitle || 'ABOUT • 关于作者'}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-950 dark:text-slate-50 tracking-tight">
                  {author.name}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
                  {author.description || '全栈工程师与开源爱好者，专注于云原生微服务、底层架构与新一代 Web 工程化。'}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs font-mono text-slate-400 dark:text-slate-500">
                  {author.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>{author.location}</span>
                    </span>
                  )}
                  {author.statusBadge && (
                    <>
                      <span>&bull;</span>
                      <span className="text-slate-600 dark:text-slate-400">{author.statusBadge}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 社交链接按钮组 */}
            {author.socials && author.socials.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {author.socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.icon] || GithubIcon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target={social.url.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{social.name}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </header>

          {/* 2. 工程与全栈技术栈分类墙 */}
          {about?.techCategories && about.techCategories.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-sky-600 dark:text-sky-400">
                    <Cpu className="w-3 h-3" />
                    <span>TECH STACK &amp; CAPABILITIES</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {about.techStackTitle || '工程与全栈技术栈'}
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {about.techCategories.reduce((acc, cur) => acc + cur.items.length, 0)} 项核心技术
                </span>
              </div>

              {about.techStackDesc && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  {about.techStackDesc}
                </p>
              )}

              {/* 技术栈分类网格 (2列响应式布局) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {about.techCategories.map((catGroup) => (
                  <div
                    key={catGroup.category}
                    className="p-4 sm:p-5 rounded-md border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                      <span>{catGroup.category}</span>
                      <span className="text-slate-400 font-normal">({catGroup.items.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {catGroup.items.map((item) => (
                        <div
                          key={item.name}
                          className="p-2.5 rounded-sm border border-slate-200/50 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-850/50 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {item.name}
                            </span>
                            <Terminal className="w-3 h-3 text-slate-400" />
                          </div>
                          {item.desc && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans line-clamp-1 leading-normal">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. 设计哲学与本站架构 */}
          <section className="p-5 sm:p-6 rounded-md border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-b from-white/90 via-slate-50/70 to-slate-100/40 dark:from-[#141E2D]/90 dark:via-[#111926]/85 dark:to-[#0D1420]/80 space-y-3.5 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {about?.designTitle || '关于本站与设计理念'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              {about?.designPhilosophy ||
                '本博客旨在打造具有纸质温度与现代极速性能的个人数字空间，摒弃过度装饰，让每一行技术文字如同落于宣纸之上自然呼吸。'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50">
              <span>技术驱动：Rsbuild · React 19 · Tailwind CSS</span>
              <span>&bull;</span>
              <span>字体体系：MiSans · Newsreader · JetBrains Mono</span>
            </div>
          </section>

          {/* 4. 底部联络方式 */}
          <div className="text-center pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              如果你有技术交流、开源项目协作或设计探讨的需求，欢迎来信：
            </p>
            <a
              href={`mailto:${author.email}`}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300/80 dark:border-sky-800 text-xs font-mono font-medium hover:bg-sky-100/70 transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{author.email}</span>
            </a>
          </div>

        </article>
      </Container>
    </PageShell>
  );
};
