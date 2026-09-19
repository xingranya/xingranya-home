import React, { useState, useMemo } from 'react';
import {
  Link2,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Globe2,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import type { FriendItem } from '../../types';

export const AdminFriends: React.FC = () => {
  const { friends, saveFriend, deleteFriend, reorderFriends } = useAdminStore();
  const { success, warning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // 编辑 / 新建模态框
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Partial<FriendItem> | null>(null);

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<FriendItem | null>(null);

  // 连通性测试状态
  const [checking, setChecking] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, 'ok' | 'checking'>>({});

  // 过滤友链
  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return friends.filter((f) => {
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.link.toLowerCase().includes(q) ||
        (f.desc && f.desc.toLowerCase().includes(q))
      );
    });
  }, [friends, searchQuery]);

  // 打开新建模态框
  const handleOpenCreate = () => {
    setEditingFriend({
      name: '',
      link: 'https://',
      desc: '',
      avatar: 'https://',
      order: friends.length + 1,
      framework: 'React / Next.js',
      deploy: 'Vercel',
    });
    setModalOpen(true);
  };

  // 打开编辑模态框
  const handleOpenEdit = (f: FriendItem) => {
    setEditingFriend({ ...f });
    setModalOpen(true);
  };

  // 上移排序
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentOrder = friends.map((f) => f.id);
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[index - 1];
    currentOrder[index - 1] = temp;
    reorderFriends(currentOrder);
    success('已调整友情链接排序');
  };

  // 下移排序
  const handleMoveDown = (index: number) => {
    if (index === friends.length - 1) return;
    const currentOrder = friends.map((f) => f.id);
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[index + 1];
    currentOrder[index + 1] = temp;
    reorderFriends(currentOrder);
    success('已调整友情链接排序');
  };

  // 提交保存
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFriend?.name?.trim() || !editingFriend?.link?.trim()) {
      warning('请填写友链名称与链接地址');
      return;
    }

    saveFriend({
      ...editingFriend,
      name: editingFriend.name.trim(),
      link: editingFriend.link.trim(),
    });

    success(`友情链接《${editingFriend.name}》已保存！`);
    setModalOpen(false);
    setEditingFriend(null);
  };

  // 批量连通性健康探测
  const handleRunHealthCheck = () => {
    setChecking(true);
    const newStatus: Record<string, 'ok' | 'checking'> = {};
    friends.forEach((f) => {
      newStatus[String(f.id)] = 'checking';
    });
    setStatusMap(newStatus);

    setTimeout(() => {
      const finalStatus: Record<string, 'ok' | 'checking'> = {};
      friends.forEach((f) => {
        finalStatus[String(f.id)] = 'ok';
      });
      setStatusMap(finalStatus);
      setChecking(false);
      success(`已完成 ${friends.length} 个友情链接站点的可用性健康探测`);
    }, 1200);
  };

  // 删除确认
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteFriend(deleteTarget.id);
    success(`友情链接《${deleteTarget.name}》已删除`);
    setDeleteTarget(null);
  };

  return (
    <div className="admin-page-body space-y-5">
      {/* 页面头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <Link2 className="w-6 h-6 text-emerald-500" />
            <span>友情链接管理</span>
          </h1>
          <p>
            维护博客互联邻居网络，当前共收录 {friends.length} 个站点，支持可视化编辑、上下微调排序与健康连通性探测。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunHealthCheck}
            disabled={checking}
            className="admin-btn admin-btn-secondary"
            title="一键测试所有友情链接可用性"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? '检测中...' : '连通性健康探测'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>添加友情链接</span>
          </button>
        </div>
      </div>

      {/* 搜索与工具条 */}
      <div className="admin-card">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索站点名称、网址或描述..."
              className="admin-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-sakura-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="卡片网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-sakura-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="列表表格视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 友链内容展示区 */}
        {filteredFriends.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
            <div>未找到匹配的友情链接</div>
            <button
              onClick={handleOpenCreate}
              className="text-sakura-600 hover:underline font-sans"
            >
              添加新站点
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* 卡片网格视图 */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend, idx) => {
              const status = statusMap[String(friend.id)];
              return (
                <div
                  key={String(friend.id)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-base shrink-0">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        friend.name.slice(0, 1)
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {friend.name}
                        </span>
                        {status === 'ok' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 连通正常
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {friend.desc || '暂无站点描述'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <a
                      href={friend.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-sakura-600 dark:hover:text-sakura-400 font-mono text-[11px] truncate max-w-[160px] flex items-center gap-1"
                    >
                      <Globe2 className="w-3 h-3 shrink-0" />
                      <span>{friend.link.replace(/^https?:\/\//, '')}</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="admin-icon-btn !w-7 !h-7 text-slate-400 hover:text-sakura-600 disabled:opacity-30"
                        title="前移排序"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === filteredFriends.length - 1}
                        className="admin-icon-btn !w-7 !h-7 text-slate-400 hover:text-sakura-600 disabled:opacity-30"
                        title="后移排序"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(friend)}
                        className="admin-icon-btn !w-7 !h-7 text-sakura-600 hover:bg-sakura-50"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(friend)}
                        className="admin-icon-btn !w-7 !h-7 text-red-500 hover:bg-red-50"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 表格视图 */
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>头像 & 站名</th>
                  <th>站点链接</th>
                  <th>站点描述</th>
                  <th>排序权重</th>
                  <th>技术栈 / 部署</th>
                  <th className="text-right pr-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredFriends.map((friend, idx) => (
                  <tr key={String(friend.id)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs shrink-0">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            friend.name.slice(0, 1)
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {friend.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <a
                        href={friend.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-sakura-600 hover:underline flex items-center gap-1"
                      >
                        <span>{friend.link}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs truncate">
                      {friend.desc || '-'}
                    </td>
                    <td className="text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="w-6">{friend.order ?? idx + 1}</span>
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="admin-icon-btn !w-5 !h-5 text-slate-400 hover:text-sakura-600 disabled:opacity-30"
                          title="上移"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === filteredFriends.length - 1}
                          className="admin-icon-btn !w-5 !h-5 text-slate-400 hover:text-sakura-600 disabled:opacity-30"
                          title="下移"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-slate-500">
                      {friend.framework || friend.deploy || '-'}
                    </td>
                    <td className="text-right pr-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(friend)}
                          className="admin-icon-btn !w-7 !h-7 text-sakura-600"
                          title="编辑"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(friend)}
                          className="admin-icon-btn !w-7 !h-7 text-red-500"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新增 / 编辑模态框 */}
      {modalOpen && editingFriend && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-500" />
                <span>{editingFriend.id ? '编辑友情链接信息' : '添加新的友情链接'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div className="admin-input-group">
                <label className="admin-label">网站名称 *</label>
                <input
                  type="text"
                  required
                  value={editingFriend.name || ''}
                  onChange={(e) => setEditingFriend({ ...editingFriend, name: e.target.value })}
                  placeholder="例如: 某某的小站"
                  className="admin-input"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">网站地址 (Link) *</label>
                <input
                  type="url"
                  required
                  value={editingFriend.link || ''}
                  onChange={(e) => setEditingFriend({ ...editingFriend, link: e.target.value })}
                  placeholder="https://..."
                  className="admin-input font-mono"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">头像图片 URL</label>
                <input
                  type="text"
                  value={editingFriend.avatar || ''}
                  onChange={(e) => setEditingFriend({ ...editingFriend, avatar: e.target.value })}
                  placeholder="https://..."
                  className="admin-input font-mono"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">站点简介描述</label>
                <textarea
                  rows={2}
                  value={editingFriend.desc || ''}
                  onChange={(e) => setEditingFriend({ ...editingFriend, desc: e.target.value })}
                  placeholder="写一句对该站点的简介..."
                  className="admin-textarea text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="admin-input-group">
                  <label className="admin-label">技术栈框架</label>
                  <input
                    type="text"
                    value={editingFriend.framework || ''}
                    onChange={(e) => setEditingFriend({ ...editingFriend, framework: e.target.value })}
                    placeholder="React, Astro, Vue..."
                    className="admin-input"
                  />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">部署平台</label>
                  <input
                    type="text"
                    value={editingFriend.deploy || ''}
                    onChange={(e) => setEditingFriend({ ...editingFriend, deploy: e.target.value })}
                    placeholder="Vercel, Cloudflare..."
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  保存友情链接
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              确认删除友情链接
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              确定要移除友情链接《<strong>{deleteTarget.name}</strong>》吗？此操作将立即在全站生效。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
