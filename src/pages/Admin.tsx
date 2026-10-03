import '../styles/admin.css';
import '../lib/buffer-polyfill';
import React, { useCallback, useEffect, useState } from 'react';
import { AdminStore } from '../lib/admin-store';
import { ToastProvider } from '../components/admin/AdminToast';
import { AdminLayout, type AdminViewType } from '../components/admin/AdminLayout';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminPosts } from '../components/admin/AdminPosts';
import { AdminDiaries } from '../components/admin/AdminDiaries';
import { AdminRecords } from '../components/admin/AdminRecords';
import { AdminFriends } from '../components/admin/AdminFriends';
import { AdminTaxonomy } from '../components/admin/AdminTaxonomy';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminFileEditor } from '../components/admin/AdminFileEditor';
import { AdminEditor } from '../components/admin/AdminEditor';
import { AdminWorkspace } from '../components/admin/AdminWorkspace';

export const Admin: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminViewType>(() => {
    const saved = sessionStorage.getItem('xingranya-admin-view');
    const views: AdminViewType[] = ['overview', 'posts', 'diaries', 'records', 'friends', 'taxonomy', 'settings', 'fileEditor', 'workspace', 'blogPosts', 'blogPages', 'media', 'homeProjects', 'homeWallpapers', 'blogLinks', 'blogMasonry'];
    return views.includes(saved as AdminViewType) ? saved as AdminViewType : 'overview';
  });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const readSource = useCallback(async () => {
    setLoading(true);
    const loaded = await AdminStore.hydrateFromServer();
    setReady(loaded);
    setLoadError(loaded ? '' : AdminStore.getServerSync().error);
    setLoading(false);
  }, []);
  useEffect(() => { void readSource(); }, [readSource]);
  const [editorState, setEditorState] = useState<{
    type: 'post' | 'diary';
    slug?: string;
  } | null>(null);
  useEffect(() => {
    sessionStorage.setItem('xingranya-admin-view', currentView === 'editor' ? editorState?.type === 'diary' ? 'diaries' : 'posts' : currentView);
  }, [currentView, editorState]);

  // 打开编辑器
  const handleOpenEditor = (type: 'post' | 'diary', slug?: string) => {
    if (!window.dispatchEvent(new Event('admin:before-navigate', { cancelable: true }))) return;
    setEditorState({ type, slug });
    setCurrentView('editor');
  };

  // 退出编辑器
  const handleCloseEditor = () => {
    const returnView = editorState?.type === 'diary' ? 'diaries' : 'posts';
    setEditorState(null);
    setCurrentView(returnView);
  };

  // 切换常规导航视图
  const handleNavigate = (view: AdminViewType) => {
    if (!window.dispatchEvent(new Event('admin:before-navigate', { cancelable: true }))) return;
    setEditorState(null);
    setCurrentView(view);
  };

  if (!ready) return <main className="admin-page-body max-w-xl mx-auto py-12"><div className="admin-card p-6 space-y-4" role="status"><h1 className="text-lg font-semibold">{loading ? '正在读取本地源文件…' : '后台暂时无法连接'}</h1><p className="text-sm text-slate-500">{loading ? '读取完成后即可编辑个人主页与博客。' : loadError || '请使用 pnpm admin 启动本地后台。'}</p>{!loading && <button className="admin-btn admin-btn-primary" onClick={() => void readSource()}>重新连接</button>}</div></main>;

  return (
    <ToastProvider>
      <AdminLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenEditor={handleOpenEditor}
      >
        {currentView === 'overview' && (
          <AdminOverview
            onNavigate={handleNavigate}
            onOpenEditor={handleOpenEditor}
          />
        )}
        {currentView === 'posts' && (
          <AdminPosts onOpenEditor={handleOpenEditor} />
        )}
        {currentView === 'diaries' && (
          <AdminDiaries onOpenEditor={handleOpenEditor} />
        )}
        {currentView === 'records' && <AdminRecords />}
        {currentView === 'friends' && <AdminFriends />}
        {currentView === 'taxonomy' && <AdminTaxonomy />}
        {currentView === 'settings' && <AdminSettings />}
        {currentView === 'fileEditor' && <AdminFileEditor />}
        {currentView === 'workspace' && <AdminWorkspace mode="overview" />}
        {currentView === 'blogPosts' && <AdminWorkspace mode="blogPosts" />}
        {currentView === 'blogPages' && <AdminWorkspace mode="blogPages" />}
        {currentView === 'media' && <AdminWorkspace mode="media" />}
        {currentView === 'homeProjects' && <AdminWorkspace mode="homeProjects" />}
        {currentView === 'homeWallpapers' && <AdminWorkspace mode="homeWallpapers" />}
        {currentView === 'blogLinks' && <AdminWorkspace mode="blogLinks" />}
        {currentView === 'blogMasonry' && <AdminWorkspace mode="blogMasonry" />}
        {currentView === 'editor' && editorState && (
          <AdminEditor
            type={editorState.type}
            slug={editorState.slug}
            onBack={handleCloseEditor}
          />
        )}
      </AdminLayout>
    </ToastProvider>
  );
};

export default Admin;
