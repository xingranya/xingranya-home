import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { siteConfig } from './content';
import { Home } from './pages/Home';
import { ExternalLinkModal } from './components/ui/ExternalLinkModal';

// 路由级代码分割：非首屏页面与本地后台不进入主包
const Archives = lazy(() => import('./pages/Archives').then((m) => ({ default: m.Archives })));
const Diaries = lazy(() => import('./pages/Diaries').then((m) => ({ default: m.Diaries })));
const DiaryDetail = lazy(() => import('./pages/DiaryDetail').then((m) => ({ default: m.DiaryDetail })));
const Says = lazy(() => import('./pages/Says').then((m) => ({ default: m.Says })));
const Friends = lazy(() => import('./pages/Friends').then((m) => ({ default: m.Friends })));
const Sitemap = lazy(() => import('./pages/Sitemap').then((m) => ({ default: m.Sitemap })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));

// 栏目路由定义（含旧路径别名），同时驱动 <Switch> 与浏览器标签标题
interface Section {
  label: string;
  paths: string[];
  list: React.LazyExoticComponent<React.FC>;
  detail?: React.LazyExoticComponent<React.FC>;
}

const SECTIONS: Section[] = [
  { label: '归档', paths: ['/archives', '/timeline', '/archive'], list: Archives },
  { label: '手记', paths: ['/diaries', '/journal', '/shouji'], list: Diaries, detail: DiaryDetail },
  { label: '说说', paths: ['/says', '/record'], list: Says },
  { label: '友链', paths: ['/friends', '/friend'], list: Friends },
  { label: '站点地图', paths: ['/sitemap'], list: Sitemap },
  { label: '关于', paths: ['/about'], list: About },
];

function findSection(pathname: string) {
  return SECTIONS.find((s) =>
    s.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

const RouteFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-mono">加载中…</div>
  </div>
);

export const App: React.FC = () => {
  const [location] = useLocation();
  const [externalUrl, setExternalUrl] = React.useState<string | null>(null);
  const [isExternalModalOpen, setIsExternalModalOpen] = React.useState(false);

  // 本地环境安全守卫：仅允许本地开发调试（localhost / 127.0.0.1 / 0.0.0.0）激活后台，线上生产环境直接回退 404
  const isLocalEnv =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname === '0.0.0.0');

  const isAdminRoute = (location === '/admin' || location.startsWith('/admin/')) && isLocalEnv;

  // 路由跳转时平滑回滚至顶部并动态更新浏览器标签标题
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (isAdminRoute) {
      document.title = `管理控制台 · ${siteConfig.title}`;
    } else {
      const section = findSection(location);
      if (section) {
        document.title = `${section.label} · ${siteConfig.title}`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          const sectionDescMap: Record<string, string> = {
            '归档': siteConfig.archivesPage?.subtitle || `${siteConfig.title} 全站随笔与手记的时间脉络与足迹索引。`,
            '手记': siteConfig.diariesPage?.subtitle || siteConfig.description,
            '说说': siteConfig.saysPage?.subtitle || '把灵感、日常与正在发生的事情，留在时间线上。',
            '友链': siteConfig.friendsPage?.subtitle || '山海相逢，灵感共振。',
            '站点地图': '聚合全站核心频道结构、生活随笔手记与全局标签图谱。',
            '关于': `关于 ${siteConfig.author?.name || '星苒鸭'} - ${siteConfig.author?.description || ''}。${siteConfig.about?.quote || siteConfig.description}`,
          };
          metaDesc.setAttribute('content', sectionDescMap[section.label] || siteConfig.description);
        }
      } else {
        document.title = siteConfig.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', siteConfig.description);
        }
      }
    }
  }, [location, isAdminRoute]);

  // 后台独立路由体系：完全脱离前台 Header、Footer 与背景特效
  if (isAdminRoute) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route path="/admin/:rest*" component={Admin} />
        </Switch>
      </Suspense>
    );
  }

  // 全局外链拦截代理
  const handleGlobalClick = (e: React.MouseEvent) => {
    // 忽略在后台路由发生的点击，只处理前台
    if (isAdminRoute) return;

    // 寻找冒泡路径中最近的 a 标签
    const target = (e.target as Element).closest('a');
    if (!target) return;

    // 检查是否有直接放行标记 (如志同道合友链、受信生态链接)
    if (target.closest('[data-external-bypass="true"]')) {
      return;
    }

    const href = target.getAttribute('href');
    if (!href) return;

    // 检查是否为外部链接
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const urlObj = new URL(href);
        const hostname = urlObj.hostname.toLowerCase();

        // 1. 本地调试与当前同源主机直接放行
        if (
          (typeof window !== 'undefined' && hostname === window.location.hostname) ||
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0'
        ) {
          return;
        }

        // 2. 站长自身生态域名及所有子域放行 (*.xran.uk, xran.uk)
        if (hostname === 'xran.uk' || hostname.endsWith('.xran.uk')) {
          return;
        }

        // 3. 站长自身 GitHub 主页与名下项目仓库放行 (github.com/xingranya/*)
        if (
          (hostname === 'github.com' || hostname === 'www.github.com') &&
          urlObj.pathname.toLowerCase().startsWith('/xingranya')
        ) {
          return;
        }

        // 4. 站长自身配置的官方社交媒体主页放行
        const trustedSocialUrls = (siteConfig.author?.socials || []).map((s) => s.url);
        if (trustedSocialUrls.some((tUrl) => tUrl && href.startsWith(tUrl))) {
          return;
        }

        // 非授信外部链接：拦截并弹窗
        e.preventDefault();
        setExternalUrl(href);
        setIsExternalModalOpen(true);
      } catch (err) {
        // 解析失败则忽略
      }
    }
  };

  // 前台博客浏览体系
  return (
    <div
      className="min-h-screen flex flex-col relative selection:bg-sakura-200 selection:text-sakura-900 dark:selection:bg-sakura-900/60 dark:selection:text-sakura-100 transition-colors duration-300"
      onClick={handleGlobalClick}
    >
      <AmbientBackground />
      <Header />
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<RouteFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            {SECTIONS.map((section) => (
              <React.Fragment key={section.label}>
                {section.paths.map((path) => (
                  <React.Fragment key={path}>
                    <Route path={path} component={section.list} />
                    {section.detail && (
                      <Route path={`${path}/:slug`} component={section.detail} />
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
      <Footer />

      {/* 外部链接二次确认弹窗 */}
      <ExternalLinkModal
        isOpen={isExternalModalOpen}
        url={externalUrl}
        onClose={() => setIsExternalModalOpen(false)}
        onConfirm={() => {
          if (externalUrl) {
            window.open(externalUrl, '_blank', 'noopener,noreferrer');
          }
          setIsExternalModalOpen(false);
        }}
      />
    </div>
  );
};
