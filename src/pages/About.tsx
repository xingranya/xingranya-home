import React, { useMemo } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { Container } from '../components/layout/Container';
import { getProjects, siteConfig } from '../content';
import type { AboutProject } from '../types';
import {
  User,
  Sparkles,
  Cpu,
  MapPin,
  Mail,
  Award,
  FolderGit2,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import { SocialLinks } from '../components/ui/SocialLinks';
import { TechIcon } from '../components/ui/TechIcon';

function ProjectMeta({ project }: { project: AboutProject }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500">
      <span
        className={
          project.role === 'author'
            ? 'text-sakura-700 dark:text-sakura-300'
            : 'text-amber-700 dark:text-amber-300'
        }
      >
        {project.role === 'author' ? '我做的' : '参与贡献'}
      </span>
      {project.language && (
        <>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>{project.language}</span>
        </>
      )}
      {(project.stars || 0) > 0 && (
        <>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="inline-flex items-center gap-0.5">
            <Star className="w-3 h-3" />
            {project.stars}
          </span>
        </>
      )}
      {project.pushedAt && (
        <>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>{project.pushedAt}</span>
        </>
      )}
    </div>
  );
}

export const About: React.FC = () => {
  const about = siteConfig.about;
  const author = siteConfig.author;
  const projects = useMemo(() => getProjects().slice(0, 10), []);

  return (
    <PageShell>
      <Container size="wide">
        <article className="paper-sheet-realistic p-6 sm:p-10 md:p-12 font-sans space-y-12 my-4 sm:my-8 text-slate-800 dark:text-slate-200">
          <header className="pb-8 border-b border-slate-200/70 dark:border-slate-800/70">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-sakura-200 to-sakura-300/40 dark:from-slate-800 dark:to-sakura-900/60 shadow-md shrink-0">
                <img
                  src={author.avatar || '/avatar.jpg'}
                  alt={author.name}
                  className="w-full h-full rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                />
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-[11px] font-mono tracking-wider text-slate-600 dark:text-slate-400">
                  <User className="w-3 h-3 text-sakura-600 dark:text-sakura-400" />
                  <span>{about?.identityTitle || 'ABOUT • 关于作者'}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-950 dark:text-slate-50 tracking-tight">
                  {author.name}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
                  {author.description}
                </p>
                {about?.bio && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
                    {about.bio}
                  </p>
                )}
                {about?.quote && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-serif italic">
                    「{about.quote}」
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs font-mono text-slate-400 dark:text-slate-500">
                  {author.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-sakura-500" />
                      <span>{author.location}</span>
                    </span>
                  )}
                  {author.statusBadge && (
                    <>
                      {author.location && <span>&bull;</span>}
                      <span className="text-slate-600 dark:text-slate-400">{author.statusBadge}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {author.socials && author.socials.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-center md:justify-start gap-2.5 relative z-20">
                <SocialLinks items={author.socials} variant="chip" />
              </div>
            )}
          </header>

          {about?.techCategories && about.techCategories.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-sakura-600 dark:text-sakura-400">
                    <Cpu className="w-3 h-3" />
                    <span>TECH STACK</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {about.techStackTitle || '技术栈'}
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {about.techCategories.reduce((acc, cur) => acc + cur.items.length, 0)} 项
                </span>
              </div>

              {about.techStackDesc && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  {about.techStackDesc}
                </p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {about.techCategories.map((catGroup) => (
                  <div
                    key={catGroup.category}
                    className="p-4 sm:p-5 rounded-md border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="w-2 h-2 rounded-full bg-sakura-500 inline-block" />
                      <span>{catGroup.category}</span>
                      <span className="text-slate-400 font-normal">({catGroup.items.length})</span>
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2">
                      {catGroup.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex min-h-[4.25rem] flex-col justify-center gap-1 rounded-sm border border-slate-200/50 bg-slate-50/60 p-2.5 dark:border-slate-800/60 dark:bg-slate-850/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                              <TechIcon
                                name={item.icon || item.name}
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {item.name}
                            </span>
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

          {about?.awards && about.awards.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5 space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-sakura-600 dark:text-sakura-400">
                  <Award className="w-3 h-3" />
                  <span>AWARDS</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {about.awardsTitle || '荣誉与奖项'}
                </h2>
              </div>
              <ul className="space-y-2 list-disc pl-5 marker:text-slate-400 dark:marker:text-slate-500">
                {about.awards.map((award) => (
                  <li
                    key={award}
                    className="text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed"
                  >
                    {award}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {projects.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-sakura-600 dark:text-sakura-400">
                    <FolderGit2 className="w-3 h-3" />
                    <span>PROJECTS</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {about?.projectsTitle || '项目与贡献'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    这里放 10 个常看的项目。其余仓库见 GitHub。
                  </p>
                </div>
                <a
                  href={author.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-sakura-700 dark:text-sakura-300 hover:underline underline-offset-2"
                >
                  GitHub 主页
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <a
                    key={project.url}
                    href={project.homepage || project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group p-4 rounded-md border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 hover:border-sakura-300/80 dark:hover:border-sakura-800 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">
                        {project.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sakura-600 dark:group-hover:text-sakura-400 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                      {project.desc}
                    </p>
                    <ProjectMeta project={project} />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="p-5 sm:p-6 rounded-md border border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-b from-white/90 via-slate-50/70 to-slate-100/40 dark:from-[#141E2D]/90 dark:via-[#111926]/85 dark:to-[#0D1420]/80 space-y-3.5 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sakura-600 dark:text-sakura-400" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {about?.designTitle || '关于本站'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              {about?.designPhilosophy ||
                '主站用来放下手记、动态和朋友。技术长文放在 blog.xran.uk，两边分开，互不打扰。'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50">
              <span>技术驱动：Rsbuild · React 19 · Tailwind CSS</span>
              <span>&bull;</span>
              <span>字体体系：MiSans · Newsreader · JetBrains Mono</span>
            </div>
          </section>

          <div className="text-center pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              如果你也喜欢折腾技术、做有趣项目，欢迎来交流。
            </p>
            <a
              href={`mailto:${author.email}`}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-sakura-50 dark:bg-sakura-950/60 text-sakura-700 dark:text-sakura-300 border border-sakura-300/80 dark:border-sakura-800 text-xs font-mono font-medium hover:bg-sakura-100/70 transition-colors shadow-2xs"
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
