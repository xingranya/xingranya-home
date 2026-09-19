import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  FileJson,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';

type FileKey = 'siteConfig' | 'friends' | 'records';

interface FileDescriptor {
  key: FileKey;
  filename: string;
  targetPath: string;
  label: string;
  description: string;
}

const FILES: FileDescriptor[] = [
  {
    key: 'siteConfig',
    filename: 'site.config.json',
    targetPath: 'src/content/config/site.config.json',
    label: '站点与全页面配置 (site.config.json)',
    description: '包含站点基础元数据、SEO、站长档案、社交矩阵、首页 Hero、关于页技术栈、友链指南模板、顶部导航与页脚配置。',
  },
  {
    key: 'friends',
    filename: 'friends.json',
    targetPath: 'src/content/pages/friends.json',
    label: '友链伙伴数据 (friends.json)',
    description: '包含所有已录入的独立博主友链、头像、简介、技术栈与部署方式徽章信息。',
  },
  {
    key: 'records',
    filename: 'records.json',
    targetPath: 'src/content/records/records.json',
    label: '说说即时动态 (records.json)',
    description: '包含全站时间线说说、心情标签、地理位置、多媒体卡片（图片/视频/音乐/链接）及互动评论。',
  },
];

export const AdminFileEditor: React.FC = () => {
  const {
    getSiteConfigFileContent,
    getFriendsFileContent,
    getRecordsFileContent,
    saveSiteConfigFileContent,
    saveFriendsFileContent,
    saveRecordsFileContent,
    downloadFile,
  } = useAdminStore();

  const { success, error } = useToast();

  const [activeFile, setActiveFile] = useState<FileKey>('siteConfig');
  const [content, setContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 根据当前选中的文件加载内容
  const loadFileContent = (key: FileKey) => {
    let raw = '';
    if (key === 'siteConfig') raw = getSiteConfigFileContent();
    else if (key === 'friends') raw = getFriendsFileContent();
    else if (key === 'records') raw = getRecordsFileContent();
    setContent(raw);
    setJsonError(null);
  };

  useEffect(() => {
    loadFileContent(activeFile);
  }, [activeFile]);

  // 实时校验 JSON
  const handleContentChange = (val: string) => {
    setContent(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  // 格式化 JSON
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
      setJsonError(null);
      success('JSON 代码已格式化排版！');
    } catch (e) {
      error(`格式化失败：JSON 语法错误 (${(e as Error).message})`);
    }
  };

  // 保存并应用
  const handleSave = () => {
    if (activeFile === 'siteConfig') {
      const res = saveSiteConfigFileContent(content);
      if (res.success) success(res.message);
      else error(res.message);
    } else if (activeFile === 'friends') {
      const res = saveFriendsFileContent(content);
      if (res.success) success(res.message);
      else error(res.message);
    } else if (activeFile === 'records') {
      const res = saveRecordsFileContent(content);
      if (res.success) success(res.message);
      else error(res.message);
    }
  };

  // 下载当前文件
  const handleDownload = () => {
    const fileDesc = FILES.find((f) => f.key === activeFile)!;
    downloadFile(fileDesc.filename, content, 'application/json');
    success(`已触发下载 ${fileDesc.filename}！可直接放入项目 ${fileDesc.targetPath} 目录。`);
  };

  // 复制源码
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('文件源码已复制到剪贴板！');
  };

  // 导入本地文件至编辑器
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        handleContentChange(text);
        success(`已加载文件 ${file.name} 内容到编辑器`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentDesc = FILES.find((f) => f.key === activeFile)!;
  const lineCount = content.split('\n').length;

  return (
    <div className="admin-page-body space-y-5">
      {/* 页面头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <FileCode2 className="w-6 h-6 text-sky-500" />
            <span>底层数据文件中心 (Data & Source Center)</span>
          </h1>
          <p>
            集中查看、校验并在线维护全站核心底层数据与配置文件。修改后支持实时热重载，并可导出同步至本地项目仓库。
          </p>
        </div>
      </div>

      {/* 顶部文件选择卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FILES.map((file) => {
          const isSelected = activeFile === file.key;
          return (
            <button
              key={file.key}
              onClick={() => setActiveFile(file.key)}
              className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-400 dark:border-sky-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FileJson className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {file.filename}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {file.targetPath}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {file.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* 主编辑器卡片 */}
      <div className="admin-card overflow-hidden">
        {/* 工具栏 */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
              {currentDesc.filename}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-400">
              共 {lineCount} 行 &bull; {content.length} 字符
            </span>

            {/* JSON 校验状态标签 */}
            {jsonError ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>JSON 格式错误</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                <Check className="w-3 h-3" />
                <span>有效 JSON</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="admin-btn admin-btn-secondary admin-btn-sm cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>导入文件</span>
              <input
                type="file"
                accept=".json"
                onChange={handleUploadFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleCopy}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="复制全部代码"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? '已复制' : '复制'}</span>
            </button>

            <button
              type="button"
              onClick={handleFormat}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="自动排版对齐 JSON"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>美化格式</span>
            </button>

            <button
              type="button"
              onClick={() => loadFileContent(activeFile)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="放弃当前未保存的修改并重载"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重载</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="admin-btn admin-btn-secondary admin-btn-sm text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-800"
              title="下载该文件直接覆盖到项目源码目录"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载该文件</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={Boolean(jsonError)}
              className={`admin-btn admin-btn-primary admin-btn-sm ${
                jsonError ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存并实时生效</span>
            </button>
          </div>
        </div>

        {/* 错误提示条 */}
        {jsonError && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs font-mono text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">语法错误提示: {jsonError}</span>
          </div>
        )}

        {/* 源码输入框 */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            spellCheck={false}
            rows={24}
            className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-950 text-slate-100 border-none outline-none resize-y selection:bg-sky-600 selection:text-white"
            placeholder="在此编辑 JSON 源码..."
          />
        </div>

        {/* 底部使用指引提示 */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <HelpCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p>
              <strong>使用提示：</strong>在底层数据中心，点击『<strong>保存并实时生效</strong>』后，系统将校验语法并使全局页面热更新；点击『<strong>下载该文件</strong>』可将修改后的配置文件导出覆盖至本地仓库目录（例如 <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">{currentDesc.targetPath}</code>），保持代码仓库与本地存储同步。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
