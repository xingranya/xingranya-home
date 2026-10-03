import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2, Cloud, ExternalLink, FileCode2, GitBranch, ImagePlus, Loader2, Plus, RefreshCw, Rocket, Save, Search, Server, Trash2, X } from 'lucide-react';
import { AdminStore } from '../../lib/admin-store';

type WorkspaceMode = 'overview' | 'blogPosts' | 'blogPages' | 'media' | 'homeProjects' | 'homeWallpapers' | 'blogLinks' | 'blogMasonry';
type GitState = { available: boolean; branch: string; origin: string; status: string; dirty: boolean };
type WorkspaceData = { home: { root: string; git: GitState }; blog: { root: string; exists: boolean; git: GitState } };
type MarkdownItem = { path: string; slug: string; title: string; date: string; summary: string; draft: boolean; snapshot: string | null; frontmatter?: { permalink?: string; slug?: string } };
type BootstrapData = { blog: { posts: MarkdownItem[]; drafts: MarkdownItem[]; pages: MarkdownItem[] } };
type Preview = { url: string; ok: boolean; status: number };
type PublishResult = { success: boolean; partial?: boolean; mode?: string; error?: string; steps?: Array<{ name: string; result?: { success: boolean; output: string } }> };
type Editor = { root: 'home' | 'blog'; path: string; content: string; original: string; snapshot: string | null; isNew?: boolean };
const DATA_TARGETS = {
  homeProjects: { root: 'home', path: 'src/content/pages/projects.json', label: '主页项目', kind: 'json' },
  homeWallpapers: { root: 'home', path: 'src/content/pages/wallpapers.json', label: '番剧墙', kind: 'json' },
  blogLinks: { root: 'blog', path: 'source/_data/links.yml', label: '博客友情链接', kind: 'yaml' },
  blogMasonry: { root: 'blog', path: 'source/_data/masonry.yml', label: '博客壁纸图库', kind: 'yaml' },
} as const;

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const payload = await response.json() as { success: boolean; data: T; error?: string };
  if (!response.ok || !payload.success) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload.data;
}
const post = <T,>(url: string, body: unknown) => api<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const AdminWorkspace: React.FC<{ mode: WorkspaceMode }> = ({ mode }) => {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [previews, setPreviews] = useState<{ home: Preview; blog: Preview } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<MarkdownItem | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState('post');
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaResult, setMediaResult] = useState<{ url?: string; matches?: string[]; uploaded?: boolean } | null>(null);
  const target = mode in DATA_TARGETS ? DATA_TARGETS[mode as keyof typeof DATA_TARGETS] : null;
  const dirty = Boolean(editor && (editor.isNew || editor.content !== editor.original));
  const showError = useCallback((error: unknown) => setNotice({ type: 'error', text: error instanceof Error ? error.message : String(error) }), []);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    setLoading(true);
    setNotice(null);
    setEditor(null);
    setQuery('');
    void (async () => {
      try {
        const status = await api<WorkspaceData>('/admin/api/workspace', options);
        setWorkspace(status);
        if (mode === 'overview') setPreviews(await api('/admin/api/preview', options));
        else if (target) {
          const data = await api<{ content: string; snapshot: string | null }>(`/admin/api/file?root=${target.root}&path=${encodeURIComponent(target.path)}`, options);
          setEditor({ ...data, root: target.root, path: target.path, original: data.content });
        } else if (mode !== 'media') setBootstrap(await api('/admin/api/bootstrap', options));
      } catch (error) { if (!controller.signal.aborted) showError(error); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [mode, revision, target, showError]);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const beforeNavigate = (event: Event) => { if (!window.confirm('编辑内容尚未保存，确定离开？')) event.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('admin:before-navigate', beforeNavigate);
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('admin:before-navigate', beforeNavigate); };
  }, [dirty]);

  const items = useMemo(() => {
    const source = mode === 'blogPages' ? bootstrap?.blog.pages || [] : [...(bootstrap?.blog.posts || []), ...(bootstrap?.blog.drafts || [])];
    return source.filter((item) => `${item.title} ${item.path} ${item.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [bootstrap, mode, query]);
  const closeEditor = () => { if (!saving && (!dirty || window.confirm('编辑内容尚未保存，确定关闭？'))) setEditor(null); };

  async function openEditor(item: MarkdownItem) {
    try {
      const data = await api<{ content: string; snapshot: string | null }>(`/admin/api/file?root=blog&path=${encodeURIComponent(item.path)}`);
      setEditor({ ...data, root: 'blog', path: item.path, original: data.content });
    } catch (error) { showError(error); }
  }
  async function saveEditor() {
    if (!editor || saving) return;
    setSaving(true);
    try {
      const kind = target?.kind || 'markdown';
      const result = await post<{ snapshot: string | null }>('/admin/api/file', { root: editor.root, path: editor.path, content: editor.content, snapshot: editor.snapshot, kind });
      setEditor({ ...editor, original: editor.content, snapshot: result.snapshot, isNew: false });
      setNotice({ type: 'success', text: '源文件已保存，恢复快照已保留。前台预览可查看最新内容。' });
      if (!target) setBootstrap(await api('/admin/api/bootstrap'));
    } catch (error) { showError(error); }
    finally { setSaving(false); }
  }
  async function runPublish(checkOnly: boolean) {
    setPublishing(true);
    setPublishResult(null);
    try {
      await AdminStore.flushServerSaves();
      const result = await post<PublishResult>(checkOnly ? '/admin/api/check' : '/admin/api/publish', { message: publishMessage });
      setPublishResult(result);
      setPublishOpen(false);
      setNotice({ type: result.success ? 'success' : 'error', text: result.success ? checkOnly ? '两站校验和构建通过，尚未提交或推送。' : '两个仓库已推送，线上部署结果请在部署平台确认。' : `${result.partial ? '部分步骤已完成。' : ''}${result.error || '操作未完成。'}` });
      setWorkspace(await api('/admin/api/workspace'));
    } catch (error) { showError(error); }
    finally { setPublishing(false); }
  }
  async function changeArticle(item: MarkdownItem, action: 'move' | 'delete') {
    setSaving(true);
    try {
      await post(`/admin/api/file/${action}`, { path: item.path, snapshot: item.snapshot });
      setDeleteTarget(null);
      setBootstrap(await api('/admin/api/bootstrap'));
      setNotice({ type: 'success', text: action === 'delete' ? '文章已删除，原文件保留在恢复快照中。' : '文章目录已更新，线上内容需要发布后才会变化。' });
    } catch (error) { showError(error); }
    finally { setSaving(false); }
  }
  async function inspectMedia() {
    if (!mediaUrl.trim()) return;
    setMediaBusy(true); setMediaResult(null);
    try { setMediaResult(await post('/admin/api/media/usage', { url: mediaUrl.trim() })); }
    catch (error) { showError(error); }
    finally { setMediaBusy(false); }
  }
  async function uploadMedia() {
    setMediaBusy(true); setMediaResult(null);
    try {
      if (mediaFile && (!mediaFile.type.startsWith('image/') || mediaFile.size > 8 * 1024 * 1024)) throw new Error('请选择不超过 8MB 的图片。');
      if (!mediaFile && !/^https?:\/\//.test(mediaUrl.trim())) throw new Error('请选择图片或填写完整的图片 URL。');
      const body: Record<string, string> = { purpose };
      if (mediaFile) {
        body.filename = mediaFile.name;
        body.data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('图片读取失败。')); reader.readAsDataURL(mediaFile); });
      } else body.url = mediaUrl.trim();
      const result = await post<{ url: string }>('/admin/api/media/upload', body);
      if (!result.url) throw new Error('上传服务未返回图片地址。');
      setMediaResult({ ...result, uploaded: true });
      setMediaUrl(result.url); setMediaFile(null);
      setNotice({ type: 'success', text: '图片已上传，可复制地址到文章或图库数据。' });
    } catch (error) { showError(error); }
    finally { setMediaBusy(false); }
  }

  const noticeView = notice && <div role="status" className={`admin-workspace-notice ${notice.type}`}><span>{notice.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}</span><span className="flex-1">{notice.text}</span><button type="button" onClick={() => setNotice(null)} aria-label="关闭提示"><X className="w-4 h-4" /></button></div>;
  const editorView = editor && <><div className="admin-card-header"><div><h2>{editor.isNew ? '新建博客草稿' : editor.path}</h2><p className="text-xs text-slate-500">{dirty ? '有未保存修改' : '已与源文件同步'}</p></div><button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => void saveEditor()} disabled={saving || !dirty}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}保存源文件</button></div>{editor.isNew && <label className="block px-4 py-2 text-xs">文件名<input aria-label="草稿文件名" className="admin-input mt-2" value={editor.path.replace('source/_drafts/', '').replace(/\.md$/, '')} onChange={(event) => setEditor({ ...editor, path: `source/_drafts/${event.target.value}.md` })} /></label>}<textarea aria-label="源文件内容" className="admin-textarea admin-file-textarea" value={editor.content} onChange={(event) => setEditor({ ...editor, content: event.target.value })} spellCheck={false} disabled={saving} /></>;

  if (loading) return <div className="admin-page-body"><div className="admin-card p-8 flex items-center gap-2" role="status"><Loader2 className="w-4 h-4 animate-spin" />正在读取工作区…</div></div>;

  if (mode === 'overview') return <div className="admin-page-body space-y-5">
    <div className="admin-page-header"><div className="admin-page-title-group"><h1><Server className="w-5 h-5" />统一工作区</h1><p>查看源文件变更、真实预览和两站发布结果。</p></div><div className="flex flex-wrap gap-2"><button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={publishing} onClick={() => setRevision((value) => value + 1)}><RefreshCw className="w-4 h-4" />刷新状态</button><button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={publishing} onClick={() => void runPublish(true)}>{publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}校验两个站点</button><button className="admin-btn admin-btn-primary admin-btn-sm" disabled={publishing} onClick={() => setPublishOpen(true)}><Rocket className="w-4 h-4" />发布两个站点</button></div></div>
    {noticeView}
    <div className="admin-workspace-grid">{(['home', 'blog'] as const).map((key) => <article className="admin-card" key={key}><div className="admin-card-header"><h2><GitBranch className="w-4 h-4" />{key === 'home' ? '个人主页' : '博客'}</h2><span className={`admin-badge ${workspace?.[key].git.dirty ? 'draft' : 'published'}`}>{workspace?.[key].git.available === false ? 'Git 不可用' : workspace?.[key].git.dirty ? '有本地变更' : '工作区干净'}</span></div><div className="admin-card-body space-y-2 text-xs"><p className="font-mono break-all">{workspace?.[key].root || '未找到仓库'}</p><p>分支：{workspace?.[key].git.branch || '未知'}</p><pre className="admin-workspace-status">{workspace?.[key].git.available === false ? '未读取到 Git 状态，请检查仓库目录。' : workspace?.[key].git.status || '暂无 Git 变更'}</pre></div></article>)}</div>
    <div className="admin-card"><div className="admin-card-header"><h2><ExternalLink className="w-4 h-4" />本地预览</h2></div><div className="admin-card-body flex flex-wrap gap-3">{(['home', 'blog'] as const).map((key) => <div key={key}><a className="admin-btn admin-btn-secondary admin-btn-sm" href={previews?.[key].url || '#'} target="_blank" rel="noreferrer">打开{key === 'home' ? '主页' : '博客'}预览</a><span className="ml-2 text-xs text-slate-500">{previews?.[key].ok ? '服务已就绪' : '服务未连接'}</span></div>)}</div></div>
    {publishing && <div className="admin-workspace-notice info" role="status"><Loader2 className="w-4 h-4 animate-spin" />正在执行检查，请等待结果并暂缓编辑。</div>}
    {publishResult && <div className="admin-card"><div className="admin-card-header"><h2>本次执行结果</h2></div><div className="admin-card-body space-y-3">{publishResult.error && <p className="text-sm text-red-500">{publishResult.error}</p>}{publishResult.steps?.map((step) => <details key={step.name}><summary className="flex items-center gap-2 cursor-pointer text-sm">{step.result?.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}{step.name}</summary><pre className="admin-workspace-status mt-2">{step.result?.output}</pre></details>)}</div></div>}
    <Dialog.Root open={publishOpen} onOpenChange={(open) => { if (!publishing) setPublishOpen(open); }}><Dialog.Portal><Dialog.Overlay className="admin-modal-overlay" /><Dialog.Content className="admin-workspace-dialog p-6 space-y-4"><Dialog.Title className="text-lg font-semibold">发布两个站点</Dialog.Title><Dialog.Description className="text-sm text-slate-500">先校验构建，再提交并推送两个仓库。推送成功后，部署平台仍需完成线上部署。</Dialog.Description><label className="block text-xs">提交说明<input className="admin-input mt-2" value={publishMessage} onChange={(event) => setPublishMessage(event.target.value)} disabled={publishing} /></label><div className="flex justify-end gap-2"><Dialog.Close className="admin-btn admin-btn-secondary admin-btn-sm" disabled={publishing}>取消</Dialog.Close><button className="admin-btn admin-btn-primary admin-btn-sm" disabled={publishing} onClick={() => void runPublish(false)}>确认提交并推送</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;

  if (mode === 'media') return <div className="admin-page-body space-y-5"><div className="admin-page-title-group"><h1><ImagePlus className="w-5 h-5" />媒体中心</h1><p>检查两站图片引用，或上传新图片。</p></div>{noticeView}<div className="admin-card admin-card-body space-y-4"><label className="block text-xs">图片地址<div className="flex flex-wrap gap-2 mt-2"><input className="admin-input flex-1 min-w-0" type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://…" /><button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => void inspectMedia()} disabled={mediaBusy || !mediaUrl.trim()}><Search className="w-4 h-4" />检查引用</button></div></label><label className="block text-xs">选择图片（不超过 8MB）<input className="block mt-2 max-w-full" type="file" accept="image/*" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} /></label><div className="flex flex-wrap items-center gap-2"><label className="text-xs">用途<select className="admin-select ml-2" value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="post">文章插图</option><option value="cover">文章封面</option><option value="wallpaper">图库</option></select></label><button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => void uploadMedia()} disabled={mediaBusy || (!mediaFile && !mediaUrl.trim())}>{mediaBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}上传到图仓</button></div>{mediaResult && <div className="admin-media-result text-xs space-y-2"><p className="font-mono break-all">{mediaResult.url}</p>{mediaResult.uploaded ? <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { void navigator.clipboard.writeText(mediaResult.url || '').then(() => setNotice({ type: 'success', text: '图片地址已复制。' })).catch(showError); }}>复制图片地址</button> : mediaResult.matches?.length ? <ul className="space-y-1">{mediaResult.matches.map((match) => <li key={match}>{match}</li>)}</ul> : <p>两个仓库中均未找到引用。</p>}</div>}</div></div>;

  if (target) return <div className="admin-page-body space-y-5"><div className="admin-page-title-group"><h1><FileCode2 className="w-5 h-5" />{target.label}</h1><p>保存后前台预览读取最新数据，线上站点需要发布后更新。</p></div>{noticeView}{editor ? <div className="admin-card admin-file-modal">{editorView}</div> : <button className="admin-btn admin-btn-secondary" onClick={() => setRevision((value) => value + 1)}>重新读取文件</button>}</div>;

  return <div className="admin-page-body space-y-5"><div className="admin-page-header"><div className="admin-page-title-group"><h1><FileCode2 className="w-5 h-5" />{mode === 'blogPosts' ? '博客文章' : '博客页面'}</h1><p>内容保存在博客源文件中；草稿转为文章后可在本地预览。</p></div>{mode === 'blogPosts' && <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setEditor({ root: 'blog', path: `source/_drafts/draft-${Date.now()}.md`, content: `---\ntitle: 新草稿\ndate: ${new Date().toISOString()}\n---\n\n`, original: '', snapshot: null, isNew: true })}><Plus className="w-4 h-4" />新建草稿</button>}</div>{noticeView}<label className="admin-search-wrap"><Search className="w-4 h-4" /><input className="admin-input" aria-label="搜索博客文件" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或文件名" /></label><div className="admin-card"><div className="admin-table-container"><table className="admin-table"><thead><tr><th>标题</th><th>文件</th><th>状态</th><th>操作</th></tr></thead><tbody>{items.map((item) => <tr key={item.path}><td><strong>{item.title}</strong><p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p></td><td className="text-xs font-mono">{item.path}</td><td><span className={`admin-badge ${item.draft ? 'draft' : 'published'}`}>{item.draft ? '本地草稿' : '文章源文件'}</span></td><td><div className="flex flex-wrap gap-2"><button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={saving} onClick={() => void openEditor(item)}>编辑</button>{mode === 'blogPosts' && <><button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={saving} onClick={() => void changeArticle(item, 'move')}>{item.path.startsWith('source/_drafts/') ? '转为文章' : '转为草稿'}</button><button className="admin-icon-btn" aria-label={`删除 ${item.title}`} disabled={saving} onClick={() => setDeleteTarget(item)}><Trash2 className="w-4 h-4" /></button></>}</div></td></tr>)}{!items.length && <tr><td colSpan={4} className="text-center py-10 text-slate-500">没有匹配内容</td></tr>}</tbody></table></div></div>
    <Dialog.Root open={Boolean(editor)} onOpenChange={(open) => { if (!open) closeEditor(); }}><Dialog.Portal><Dialog.Overlay className="admin-modal-overlay" /><Dialog.Content className="admin-workspace-dialog admin-file-modal"><Dialog.Title className="sr-only">编辑博客源文件</Dialog.Title><Dialog.Description className="sr-only">保存前校验格式，并检查外部修改冲突。</Dialog.Description>{noticeView}{editorView}<div className="p-4 flex justify-end"><button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={saving} onClick={closeEditor}>关闭编辑器</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    <Dialog.Root open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!saving && !open) setDeleteTarget(null); }}><Dialog.Portal><Dialog.Overlay className="admin-modal-overlay" /><Dialog.Content className="admin-workspace-dialog p-6 space-y-4"><Dialog.Title className="font-semibold">删除文章源文件</Dialog.Title><Dialog.Description className="text-sm text-slate-500">删除《{deleteTarget?.title}》前会保留恢复快照；线上内容在发布后更新。</Dialog.Description><div className="flex justify-end gap-2"><Dialog.Close className="admin-btn admin-btn-secondary admin-btn-sm" disabled={saving}>取消</Dialog.Close><button className="admin-btn admin-btn-danger admin-btn-sm" disabled={saving} onClick={() => { if (deleteTarget) void changeArticle(deleteTarget, 'delete'); }}>确认删除</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
};
