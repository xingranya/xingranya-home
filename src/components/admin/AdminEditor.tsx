import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  Download,
  Sliders,
  X,
  Bold,
  Italic,
  Quote,
  Code,
  Link as LinkIcon,
  Image,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Sigma,
  GitGraph,
  Info,
  Calendar,
  Tag,
  FolderPlus,
  CloudSun,
  Smile,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  ListTree,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import { calculateReadingTime } from '../../lib/markdown';

interface AdminEditorProps {
  type: 'post' | 'diary';
  slug?: string;
  onBack: () => void;
}

interface TocItem {
  level: number;
  text: string;
  line: number;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  type,
  slug,
  onBack,
}) => {
  const {
    categories,
    savePost,
    saveDiary,
    getPostBySlug,
    getDiaryBySlug,
    loadPostContent,
    loadDiaryContent,
    saveAutoDraft,
    getAutoDraft,
    clearAutoDraft,
  } = useAdminStore();
  const { success, error, warning } = useToast();

  const isNew = !slug;
  const existingPost = slug && type === 'post' ? getPostBySlug(slug) : null;
  const existingDiary = slug && type === 'diary' ? getDiaryBySlug(slug) : null;

  // 基础表单状态
  const [title, setTitle] = useState(existingPost?.title || existingDiary?.title || '');
  const [postSlug, setPostSlug] = useState(slug || '');
  const [content, setContent] = useState(existingPost?.content || existingDiary?.content || '');
  const [category, setCategory] = useState(existingPost?.category || (categories[0]?.name || '技术文章'));
  const [tagsInput, setTagsInput] = useState(existingPost?.tags?.join(', ') || existingDiary?.tags?.join(', ') || '');
  const [summary, setSummary] = useState(existingPost?.summary || existingDiary?.summary || '');
  const [draft, setDraft] = useState(existingPost?.draft ?? false);
  const [coverImage, setCoverImage] = useState(existingPost?.coverImage || '');
  const [recommend, setRecommend] = useState(existingPost?.recommend || 0);
  const [date, setDate] = useState(existingPost?.date || existingDiary?.date || new Date().toISOString().split('T')[0]);

  // 手记专属字段
  const [weather, setWeather] = useState(existingDiary?.weather || '晴');
  const [mood, setMood] = useState(existingDiary?.mood || '平静');
  const [location, setLocation] = useState(existingDiary?.location || '书房');
  const [time, setTime] = useState(existingDiary?.time || new Date().toTimeString().slice(0, 5));

  // 编辑器打开时按需拉取正文（构建产物默认只有元数据）
  const [editorReady, setEditorReady] = useState(
    isNew || Boolean(existingPost?.content || existingDiary?.content)
  );
  useEffect(() => {
    if (editorReady || !slug) return;
    let cancelled = false;
    const load = type === 'post' ? loadPostContent(slug) : loadDiaryContent(slug);
    load
      .then((full) => {
        if (cancelled || !full) {
          if (!cancelled) setEditorReady(true);
          return;
        }
        setContent(full.content || '');
        if (full.title) setTitle(full.title);
        if (type === 'post' && 'category' in full && full.category) setCategory(full.category);
        if (full.summary) setSummary(full.summary);
        if (full.tags) setTagsInput(full.tags.join(', '));
        if ('coverImage' in full && full.coverImage) setCoverImage(full.coverImage);
        if ('recommend' in full && typeof full.recommend === 'number') setRecommend(full.recommend);
        if ('draft' in full && typeof full.draft === 'boolean') setDraft(full.draft);
        if (full.date) setDate(full.date);
        if (type === 'diary') {
          const d = full as { weather?: string; mood?: string; location?: string; time?: string };
          if (d.weather) setWeather(d.weather);
          if (d.mood) setMood(d.mood);
          if (d.location) setLocation(d.location);
          if (d.time) setTime(d.time);
        }
        setEditorReady(true);
      })
      .catch(() => {
        if (!cancelled) setEditorReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, type, editorReady, isNew, loadPostContent, loadDiaryContent]);

  // 编辑器交互状态
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [zenMode, setZenMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [calloutMenuOpen, setCalloutMenuOpen] = useState(false);
  const [dirtyExitConfirm, setDirtyExitConfirm] = useState(false);
  const [hasAutoDraftBanner, setHasAutoDraftBanner] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<any>(null);

  const initialContentRef = useRef(existingPost?.content || existingDiary?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 检查脏数据状态
  const isDirty = useMemo(() => {
    return content !== initialContentRef.current || title !== (existingPost?.title || existingDiary?.title || '');
  }, [content, title, existingPost, existingDiary]);

  // 检查是否有未保存的本地自动草稿
  useEffect(() => {
    const savedDraft = getAutoDraft(type, slug);
    if (savedDraft && savedDraft.content && savedDraft.content !== content) {
      setPendingDraftData(savedDraft);
      setHasAutoDraftBanner(true);
    }
  }, [type, slug]);

  // 自动暂存草稿 (防抖 1.5s)
  useEffect(() => {
    if (!isDirty || !content) return;
    const timer = setTimeout(() => {
      saveAutoDraft({
        type,
        slug,
        title,
        content,
        category,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        summary,
        draft,
        coverImage,
        recommend,
        weather,
        mood,
        location,
        time,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [content, title, category, tagsInput, summary, draft, coverImage, recommend, date, weather, mood, location, time, isDirty]);

  // 离开页面防误关
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 自动从标题生成 slug（仅在新建时）
  useEffect(() => {
    if (isNew && !postSlug && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setPostSlug(generated || `item-${Date.now().toString().slice(-6)}`);
    }
  }, [title, isNew, postSlug]);

  // 实时字数与阅读时间
  const { readingTime, wordCount } = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  // 实时提取 TOC 目录大纲
  const tocList: TocItem[] = useMemo(() => {
    const lines = content.split('\n');
    const list: TocItem[] = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        list.push({
          level: match[1].length,
          text: match[2].trim(),
          line: index + 1,
        });
      }
    });
    return list;
  }, [content]);

  // 工具栏辅助插入文本
  const insertText = (before: string, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // 恢复草稿
  const handleRestoreDraft = () => {
    if (!pendingDraftData) return;
    setTitle(pendingDraftData.title || title);
    setContent(pendingDraftData.content || content);
    if (pendingDraftData.data) {
      if (pendingDraftData.data.category) setCategory(pendingDraftData.data.category);
      if (pendingDraftData.data.tagsInput) setTagsInput(pendingDraftData.data.tagsInput);
      if (pendingDraftData.data.summary) setSummary(pendingDraftData.data.summary);
      if (pendingDraftData.data.weather) setWeather(pendingDraftData.data.weather);
      if (pendingDraftData.data.mood) setMood(pendingDraftData.data.mood);
    }
    setHasAutoDraftBanner(false);
    success('已成功恢复本地自动暂存草稿！');
  };

  // 丢弃草稿
  const handleDiscardDraft = () => {
    clearAutoDraft(type, slug);
    setHasAutoDraftBanner(false);
    setPendingDraftData(null);
  };

  // 快捷提取摘要
  const handleAutoSummary = () => {
    const clean = content.replace(/[#*`_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) {
      warning('正文内容为空，无法提取摘要');
      return;
    }
    const extracted = clean.slice(0, 150) + (clean.length > 150 ? '...' : '');
    setSummary(extracted);
    success('已自动提取正文前 150 字为摘要');
  };

  // 保存操作
  const handleSave = () => {
    if (!title.trim()) {
      error('保存失败：请填写标题');
      return;
    }

    const finalSlug = postSlug.trim() || `post-${Date.now()}`;
    const parsedTags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (type === 'post') {
      savePost({
        slug: finalSlug,
        title: title.trim(),
        date,
        summary: summary.trim() || content.slice(0, 120).replace(/[#*`_\n]/g, ' ') + '...',
        tags: parsedTags.length > 0 ? parsedTags : ['未分类'],
        category: category.trim() || '技术文章',
        content,
        draft,
        coverImage: coverImage.trim() || undefined,
        recommend: Number(recommend) || 0,
      });
      success(`文章《${title}》已成功保存！`);
    } else {
      saveDiary({
        slug: finalSlug,
        title: title.trim(),
        date,
        time,
        weather,
        mood,
        location,
        tags: parsedTags.length > 0 ? parsedTags : ['手记'],
        summary: summary.trim() || content.slice(0, 100).replace(/[#*`_\n]/g, ' ') + '...',
        content,
      });
      success(`手记《${title}》已成功保存！`);
    }

    // 更新基准并清除暂存
    initialContentRef.current = content;
    clearAutoDraft(type, slug);
  };

  // 拦截返回按钮
  const handleBackIntercept = () => {
    if (isDirty) {
      setDirtyExitConfirm(true);
    } else {
      onBack();
    }
  };

  // 快捷键 Ctrl+S 保存 & ESC 退出 Zen 模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // 下载导出 .md 文件
  const handleDownloadMd = () => {
    const frontmatter = type === 'post'
      ? `---\ntitle: "${title}"\ndate: "${date}"\ncategory: "${category}"\ntags: [${tagsInput.split(/[,，]/).map(t => `"${t.trim()}"`).filter(Boolean).join(', ')}]\nsummary: "${summary}"\ndraft: ${draft}\nrecommend: ${recommend}\n---\n\n`
      : `---\ntitle: "${title}"\ndate: "${date}"\ntime: "${time}"\nweather: "${weather}"\nmood: "${mood}"\nlocation: "${location}"\ntags: [${tagsInput.split(/[,，]/).map(t => `"${t.trim()}"`).filter(Boolean).join(', ')}]\n---\n\n`;

    const fullContent = frontmatter + content;
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${postSlug || 'post'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    success('已导出 Markdown 文件');
  };

  if (!editorReady) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--admin-topbar-h))] bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">正在加载正文…</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-[calc(100vh-var(--admin-topbar-h))] bg-slate-50 dark:bg-slate-950 overflow-hidden ${
        zenMode ? 'admin-zen-mode' : ''
      }`}
    >
      {/* 自动草稿检测提醒横幅 */}
      {hasAutoDraftBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 z-30 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              检测到您在{' '}
              {pendingDraftData?.savedAt
                ? new Date(pendingDraftData.savedAt).toLocaleTimeString('zh-CN', { hour12: false })
                : '近期'}{' '}
              有未保存的本地编辑草稿。
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-2.5 py-0.5 rounded font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              一键恢复草稿
            </button>
            <button
              onClick={handleDiscardDraft}
              className="text-xs text-slate-500 hover:underline"
            >
              放弃
            </button>
          </div>
        </div>
      )}

      {/* 顶部操作条 */}
      <div className="h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* 左侧：返回 + 标题输入 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleBackIntercept}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="返回列表"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 max-w-xl flex items-center">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'post' ? '输入文稿标题...' : '输入手记标题...'}
              className="text-base sm:text-lg font-bold bg-transparent border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none w-full truncate pr-4"
            />
            {isDirty && (
              <span
                className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1"
                title="存在未保存改动"
              />
            )}
          </div>
        </div>

        {/* 右侧：目录大纲 + 模式切换 + 字数 + 沉浸模式 + 属性抽屉开关 + 保存 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 目录大纲浮动面板开关 */}
          <div className="relative">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className={`admin-icon-btn !w-8 !h-8 ${tocOpen ? '!bg-sakura-50 dark:!bg-sakura-950 !text-sakura-600 !border-sakura-500' : ''}`}
              title="文档大纲结构目录"
            >
              <ListTree className="w-4 h-4" />
            </button>

            {tocOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setTocOpen(false)} />
                <div className="admin-toc-panel">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      文档大纲 ({tocList.length})
                    </span>
                    <button
                      onClick={() => setTocOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {tocList.length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">暂无标题大纲</div>
                  ) : (
                    <div className="space-y-1">
                      {tocList.map((item, i) => (
                        <div
                          key={i}
                          style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                          className="text-xs text-slate-600 dark:text-slate-300 hover:text-sakura-600 cursor-pointer truncate py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-1"
                          onClick={() => {
                            setTocOpen(false);
                            // 滚动定位
                            if (textareaRef.current) {
                              const lines = content.split('\n');
                              let pos = 0;
                              for (let j = 0; j < item.line - 1; j++) {
                                pos += lines[j].length + 1;
                              }
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(pos, pos);
                            }
                          }}
                        >
                          <span className="text-slate-400 font-mono mr-1">H{item.level}</span>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 模式选择按钮组 */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('edit')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                mode === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-sakura-600 dark:text-sakura-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="纯编辑模式"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>编辑</span>
            </button>
            <button
              onClick={() => setMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                mode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-sakura-600 dark:text-sakura-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="双栏分屏实时预览"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>分屏</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                mode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-sakura-600 dark:text-sakura-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="纯预览模式"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>预览</span>
            </button>
          </div>

          {/* Zen 沉浸专注模式切换 */}
          <button
            onClick={() => setZenMode(!zenMode)}
            className={`admin-icon-btn !w-8 !h-8 ${zenMode ? '!bg-indigo-50 dark:!bg-indigo-950 !text-indigo-600' : ''}`}
            title={zenMode ? '退出沉浸模式 (ESC)' : '进入全屏纯净沉浸专注模式'}
          >
            {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <span className="hidden md:inline text-xs font-mono text-slate-400">
            {wordCount} 字 &bull; {readingTime}
          </span>

          <button
            onClick={handleDownloadMd}
            className="admin-icon-btn !w-8 !h-8"
            title="导出为 Markdown 文件"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`admin-icon-btn !w-8 !h-8 ${settingsOpen ? '!bg-sakura-50 dark:!bg-sakura-950 !text-sakura-600 !border-sakura-500' : ''}`}
            title="元数据与发布配置"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            className="admin-btn admin-btn-primary admin-btn-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存 (Ctrl+S)</span>
          </button>
        </div>
      </div>

      {/* 快捷 Markdown 工具栏（在编辑或分屏模式显示） */}
      {mode !== 'preview' && (
        <div className="h-10 px-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 select-none text-slate-600 dark:text-slate-400 text-xs">
          <button
            onClick={() => insertText('**', '**', '加粗文本')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="加粗"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*', '斜体文本')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="斜体"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => insertText('# ', '', '一级标题')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors font-mono font-bold text-[11px]"
            title="H1 标题"
          >
            H1
          </button>
          <button
            onClick={() => insertText('## ', '', '二级标题')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors font-mono font-bold text-[11px]"
            title="H2 标题"
          >
            H2
          </button>
          <button
            onClick={() => insertText('### ', '', '三级标题')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors font-mono font-bold text-[11px]"
            title="H3 标题"
          >
            H3
          </button>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => insertText('> ', '', '引用内容')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="引用块"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('`', '`', 'code')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="行内代码"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('```typescript\n', '\n```', '// 代码内容')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors font-mono text-[11px]"
            title="代码块"
          >
            CodeBlock
          </button>
          <button
            onClick={() => insertText('[', '](https://example.com)', '链接描述')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="超链接"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('![', '](https://images.unsplash.com/photo-1579783900882-c0d3dad7b119)', '图片描述')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="图片"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => insertText('- ', '', '列表项')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="无序列表"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('1. ', '', '列表项')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="有序列表"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('- [ ] ', '', '待办事项')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="任务列表"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('| 标题 1 | 标题 2 |\n| --- | --- |\n| 内容 1 | 内容 2 |\n')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="表格"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => insertText('$$\n', '\n$$', 'E = mc^2')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="KaTeX 数学公式"
          >
            <Sigma className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('```mermaid\ngraph TD;\n  A-->B;\n  B-->C;\n```\n')}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            title="Mermaid 流程图"
          >
            <GitGraph className="w-3.5 h-3.5" />
          </button>

          {/* Callout 辅助菜单 */}
          <div className="relative">
            <button
              onClick={() => setCalloutMenuOpen(!calloutMenuOpen)}
              className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="GitHub 风格 Callout 提示块"
            >
              <Info className="w-3.5 h-3.5 text-sakura-500" />
              <span className="text-[11px]">Callout</span>
            </button>

            {calloutMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setCalloutMenuOpen(false)} />
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-30 flex flex-col min-w-[130px] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      insertText('> [!NOTE]\n> 这里是说明内容。\n');
                      setCalloutMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-left text-xs text-sakura-600 hover:bg-sakura-50 dark:hover:bg-sakura-950/60 rounded"
                  >
                    Note (提示)
                  </button>
                  <button
                    onClick={() => {
                      insertText('> [!TIP]\n> 这里是技巧与优化建议。\n');
                      setCalloutMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-left text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded"
                  >
                    Tip (建议)
                  </button>
                  <button
                    onClick={() => {
                      insertText('> [!IMPORTANT]\n> 这里是重要须知。\n');
                      setCalloutMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-left text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded"
                  >
                    Important (重要)
                  </button>
                  <button
                    onClick={() => {
                      insertText('> [!WARNING]\n> 这里是警告风险事项。\n');
                      setCalloutMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-left text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded"
                  >
                    Warning (警告)
                  </button>
                  <button
                    onClick={() => {
                      insertText('> [!CAUTION]\n> 这里是高危操作提醒。\n');
                      setCalloutMenuOpen(false);
                    }}
                    className="px-2.5 py-1 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded"
                  >
                    Caution (高危)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 编辑与预览核心区 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧：Markdown 文本编辑区 */}
        {(mode === 'edit' || mode === 'split') && (
          <div
            className={`flex-1 h-full overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${
              mode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此处开始编写 Markdown 内容..."
              className="w-full h-full p-5 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none outline-none overflow-y-auto"
            />
          </div>
        )}

        {/* 右侧：实时渲染预览区 */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={`flex-1 h-full overflow-y-auto p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/50 ${
              mode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 pb-4 border-b border-slate-200 dark:border-slate-800">
                  {title}
                </h1>
              )}
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <div className="py-20 text-center text-xs font-mono text-slate-400">
                  暂无内容，在左侧输入 Markdown 即可在此实时预览
                </div>
              )}
            </div>
          </div>
        )}

        {/* 元数据与发布属性抽屉 */}
        {settingsOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sakura-500" />
                <span>内容属性设置</span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Slug 路径 */}
              <div className="admin-input-group">
                <label className="admin-label flex items-center justify-between">
                  <span>URL 路径 (Slug)</span>
                  <span className="text-[10px] font-mono text-slate-400">唯一标识</span>
                </label>
                <input
                  type="text"
                  value={postSlug}
                  onChange={(e) => setPostSlug(e.target.value)}
                  placeholder="例如: react-19-guide"
                  className="admin-input font-mono"
                />
              </div>

              {/* 发布时间 */}
              <div className="admin-input-group">
                <label className="admin-label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sakura-500" />
                  <span>发布日期</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="admin-input font-mono"
                />
              </div>

              {/* 仅文章显示的字段 */}
              {type === 'post' && (
                <>
                  {/* 分类 */}
                  <div className="admin-input-group">
                    <label className="admin-label flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-sakura-500" />
                      <span>所属分类</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="admin-select"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count}篇)
                        </option>
                      ))}
                      <option value="技术文章">技术文章</option>
                      <option value="生活随笔">生活随笔</option>
                      <option value="架构设计">架构设计</option>
                      <option value="工具折腾">工具折腾</option>
                    </select>
                  </div>

                  {/* 推荐置顶权重 */}
                  <div className="admin-input-group">
                    <label className="admin-label flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>推荐置顶权重 (0-100)</span>
                      </span>
                      <span className="font-mono text-sakura-600">{recommend}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={recommend}
                      onChange={(e) => setRecommend(Number(e.target.value))}
                      className="w-full accent-sakura-500"
                    />
                  </div>

                  {/* 封面图 */}
                  <div className="admin-input-group">
                    <label className="admin-label flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-sakura-500" />
                      <span>封面图 URL (可选)</span>
                    </label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="admin-input font-mono"
                    />
                    {coverImage && (
                      <div className="mt-1.5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-32">
                        <img
                          src={coverImage}
                          alt="封面预览"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 仅手记显示的字段 */}
              {type === 'diary' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="admin-input-group">
                      <label className="admin-label flex items-center gap-1">
                        <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                        <span>天气</span>
                      </label>
                      <select
                        value={weather}
                        onChange={(e) => setWeather(e.target.value)}
                        className="admin-select"
                      >
                        <option value="晴">晴</option>
                        <option value="多云">多云</option>
                        <option value="阴">阴</option>
                        <option value="雨">雨</option>
                        <option value="雪">雪</option>
                        <option value="微风">微风</option>
                      </select>
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-violet-500" />
                        <span>心境</span>
                      </label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="admin-select"
                      >
                        <option value="平静">平静</option>
                        <option value="喜悦">喜悦</option>
                        <option value="思考">思考</option>
                        <option value="专注">专注</option>
                        <option value="疲倦">疲倦</option>
                        <option value="治愈">治愈</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="admin-input-group">
                      <label className="admin-label flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sakura-500" />
                        <span>时间</span>
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="admin-input font-mono"
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>地点</span>
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 标签 */}
              <div className="admin-input-group">
                <label className="admin-label flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-sakura-500" />
                  <span>标签 (逗号分隔)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React, TypeScript, 性能优化"
                  className="admin-input"
                />
              </div>

              {/* 摘要 */}
              <div className="admin-input-group">
                <div className="flex items-center justify-between mb-1">
                  <label className="admin-label">文章摘要 (Summary)</label>
                  <button
                    onClick={handleAutoSummary}
                    className="text-[11px] text-sakura-600 dark:text-sakura-400 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>自动提取</span>
                  </button>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="简述主要内容..."
                  className="admin-textarea text-xs"
                />
              </div>

              {/* 草稿状态开关 (仅文章) */}
              {type === 'post' && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      设为草稿
                    </div>
                    <div className="text-[11px] text-slate-400">
                      草稿不会在前台公开显示
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                    className="w-4 h-4 accent-sakura-500 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 脏数据离开确认弹窗 */}
      {dirtyExitConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDirtyExitConfirm(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                未保存的改动提醒
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              您当前编辑的内容尚未保存。离开后可能丢失最新改动（但系统已在本地为您记录自动暂存快照）。是否确认退出？
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDirtyExitConfirm(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                继续编辑
              </button>
              <button
                onClick={() => {
                  setDirtyExitConfirm(false);
                  onBack();
                }}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                直接离开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
