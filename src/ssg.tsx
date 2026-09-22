import { renderToString } from 'react-dom/server';
import { Suspense } from 'react';
import { Route, Router, Switch } from 'wouter';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { About } from './pages/About';
import { Archives } from './pages/Archives';
import { Diaries } from './pages/Diaries';
import { DiaryDetail } from './pages/DiaryDetail';
import { Friends } from './pages/Friends';
import { Wallpapers } from './pages/Wallpapers';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Says } from './pages/Says';
import { Sitemap } from './pages/Sitemap';
import { setContentSnapshot, type ContentSnapshot } from './content';
export { getPageMeta } from './lib/seo';

const STATIC_SECTIONS = [
  { paths: ['/archives', '/timeline', '/archive'], list: Archives },
  { paths: ['/diaries', '/journal', '/shouji'], list: Diaries, detail: DiaryDetail },
  { paths: ['/says', '/record'], list: Says },
  { paths: ['/friends', '/friend'], list: Friends },
  { paths: ['/wallpapers'], list: Wallpapers },
  { paths: ['/sitemap'], list: Sitemap },
  { paths: ['/about'], list: About },
];

function StaticApp() {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-sakura-200 selection:text-sakura-900 dark:selection:bg-sakura-900/60 dark:selection:text-sakura-100 transition-colors duration-300">
      <AmbientBackground />
      <Header />
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={null}>
          <Switch>
            <Route path="/" component={Home} />
            {STATIC_SECTIONS.map((section) => section.paths.map((routePath) => (
              <Route key={routePath} path={routePath} component={section.list} />
            )))}
            {STATIC_SECTIONS.flatMap((section) => section.detail
              ? section.paths.map((routePath) => (
                  <Route key={`${routePath}/:slug`} path={`${routePath}/:slug`} component={section.detail} />
                ))
              : [])}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

// 顺序渲染每个静态路由，等待懒加载页面完成后再输出正文。
export function renderPage(pathname: string, snapshot: ContentSnapshot): Promise<string> {
  setContentSnapshot(snapshot);
  return Promise.resolve(renderToString(
    <Router ssrPath={pathname}><StaticApp /></Router>,
  ));
}
