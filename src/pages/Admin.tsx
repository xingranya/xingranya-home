import '../styles/admin.css';
import '../lib/buffer-polyfill';
import React, { useState } from 'react';
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

export const Admin: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminViewType>('overview');
  const [editorState, setEditorState] = useState<{
    type: 'post' | 'diary';
    slug?: string;
  } | null>(null);

  // 打开编辑器
  const handleOpenEditor = (type: 'post' | 'diary', slug?: string) => {
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
    setEditorState(null);
    setCurrentView(view);
  };

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
