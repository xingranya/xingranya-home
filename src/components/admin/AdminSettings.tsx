import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Settings2,
  Save,
  Globe,
  User,
  Home,
  FileText,
  Users,
  Compass,
  Layout,
  Palette,
  Database,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  ShieldAlert,
  HardDrive,
  Check,
  Sparkles,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useAdminStore, type AdminPreferences } from '../../hooks/useAdminStore';
import { useToast } from './AdminToast';
import type { SiteConfig, SocialLink, NavLinkItem, FooterNavColumn, TechStackCategory } from '../../types';

type SettingsTab =
  | 'global'
  | 'author'
  | 'home'
  | 'about'
  | 'friends'
  | 'pages'
  | 'header'
  | 'footer'
  | 'backups';

type OnlineStatus = NonNullable<
  NonNullable<NonNullable<SiteConfig['home']>['hero']>['onlineStatus']
>;

export const AdminSettings: React.FC = () => {
  const {
    siteConfig,
    saveSiteConfig,
    preferences,
    savePreferences,
    exportAllData,
    importData,
    resetToDefault,
    storageUsage,
    clearLogs,
  } = useAdminStore();

  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('global');
  const [configForm, setConfigForm] = useState<SiteConfig>(() => JSON.parse(JSON.stringify(siteConfig)));

  // 外观偏好
  const [accentColor, setAccentColor] = useState<AdminPreferences['accentColor']>(preferences.accentColor || 'blue');
  const [themeMode, setThemeMode] = useState<AdminPreferences['theme']>(preferences.theme || 'system');

  // 备份与重置
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // 未保存变更检测
  const isDirty = useMemo(() => {
    return JSON.stringify(configForm) !== JSON.stringify(siteConfig);
  }, [configForm, siteConfig]);

  // 离开防误触拦截
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

  // 保存站点配置
  const handleSaveAllConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSiteConfig(configForm);
    success('全站与页面配置已保存并立即生效！');
  };

  // 保存偏好
  const handleSavePreferences = () => {
    savePreferences({
      accentColor,
      theme: themeMode,
    });
    success('后台外观与偏好已保存！');
  };

  // 导出全量备份 JSON
  const handleExportBackup = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cot-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('全站数据备份文件已成功导出！');
  };

  // 导入全量备份 JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importData(content);
      if (res.success) {
        success(res.message);
        setConfigForm(JSON.parse(JSON.stringify(siteConfig)));
      } else {
        error(res.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 确认重置
  const handleConfirmReset = () => {
    resetToDefault();
    setConfigForm(JSON.parse(JSON.stringify(siteConfig)));
    setResetConfirmOpen(false);
    success('全站数据已重置为初始演示状态');
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'global', label: '基础与SEO', icon: Globe },
    { id: 'author', label: '站长与社交', icon: User },
    { id: 'home', label: '首页与Hero', icon: Home },
    { id: 'about', label: '关于页定制', icon: Compass },
    { id: 'friends', label: '友链页定制', icon: Users },
    { id: 'pages', label: '各页面标语', icon: FileText },
    { id: 'header', label: '导航栏定制', icon: Layout },
    { id: 'footer', label: '页脚与底栏', icon: FileText },
    { id: 'backups', label: '外观与备份', icon: Database },
  ];

  return (
    <div className="admin-page-body space-y-5">
      {/* 页面头部 */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>
            <Settings2 className="w-6 h-6 text-sakura-500" />
            <span>全站与页面配置中心</span>
          </h1>
          <p>
            集中配置站点基础元数据、SEO、站长名片、首页 Hero 视觉、关于页技能拓扑、友链页申请指南、导航拓扑与页脚信息。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveAllConfig()}
            className="admin-btn admin-btn-primary"
          >
            <Save className="w-4 h-4" />
            <span>保存全部配置</span>
          </button>
        </div>
      </div>

      {/* Tab 导航切换栏 */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sakura-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 内容区 */}
      <div className="space-y-6">
        {/* ================= 1. 基础与 SEO 设置 ================= */}
        {activeTab === 'global' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <Globe className="w-4 h-4 text-sakura-500" />
                <span>站点基础信息与 SEO / 分析配置</span>
              </h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">站点主标题 (Title) *</label>
                  <input
                    type="text"
                    required
                    value={configForm.title}
                    onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
                    className="admin-input"
                    placeholder="星苒鸭"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">副标题标语 (Subtitle)</label>
                  <input
                    type="text"
                    value={configForm.subtitle}
                    onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })}
                    className="admin-input"
                    placeholder="心中有景,花香满径"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">全站 SEO 描述 (Description)</label>
                <textarea
                  rows={2}
                  value={configForm.description}
                  onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                  className="admin-textarea"
                  placeholder="个人技术博客与知识库..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">站点域名 URL (含 https://)</label>
                  <input
                    type="url"
                    value={configForm.url}
                    onChange={(e) => setConfigForm({ ...configForm, url: e.target.value })}
                    className="admin-input font-mono"
                    placeholder="https://xran.uk"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Favicon 站点图标路径</label>
                  <input
                    type="text"
                    value={configForm.favicon || ''}
                    onChange={(e) => setConfigForm({ ...configForm, favicon: e.target.value })}
                    className="admin-input font-mono"
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>

              {/* SEO 关键词 */}
              <div className="admin-input-group">
                <label className="admin-label">SEO 关键词 (用英文逗号分隔)</label>
                <input
                  type="text"
                  value={(configForm.keywords || []).join(', ')}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      keywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                    })
                  }
                  className="admin-input"
                  placeholder="星苒鸭, 全栈开发, Java, Vue3"
                />
              </div>

              {/* 第三方分析统计 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>第三方统计分析追踪 ID</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="admin-input-group">
                    <label className="admin-label">Google Tag Manager ID</label>
                    <input
                      type="text"
                      value={configForm.analytics?.gtmId || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          analytics: { ...configForm.analytics, gtmId: e.target.value },
                        })
                      }
                      className="admin-input font-mono"
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">Google Analytics (GA4) ID</label>
                    <input
                      type="text"
                      value={configForm.analytics?.gaId || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          analytics: { ...configForm.analytics, gaId: e.target.value },
                        })
                      }
                      className="admin-input font-mono"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">Microsoft Clarity ID</label>
                    <input
                      type="text"
                      value={configForm.analytics?.clarityId || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          analytics: { ...configForm.analytics, clarityId: e.target.value },
                        })
                      }
                      className="admin-input font-mono"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. 站长档案与社交平台 ================= */}
        {activeTab === 'author' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <User className="w-4 h-4 text-violet-500" />
                <span>站长个人资料与全网社交矩阵</span>
              </h3>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">站长昵称 (Author Name) *</label>
                  <input
                    type="text"
                    required
                    value={configForm.author.name}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        author: { ...configForm.author, name: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">头像图片 URL / 路径</label>
                  <input
                    type="text"
                    value={configForm.author.avatar}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        author: { ...configForm.author, avatar: e.target.value },
                      })
                    }
                    className="admin-input font-mono"
                    placeholder="/avatar.webp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">联系邮箱</label>
                  <input
                    type="email"
                    value={configForm.author.email}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        author: { ...configForm.author, email: e.target.value },
                      })
                    }
                    className="admin-input font-mono"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">GitHub 主页 URL</label>
                  <input
                    type="url"
                    value={configForm.author.github}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        author: { ...configForm.author, github: e.target.value },
                      })
                    }
                    className="admin-input font-mono"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">常驻常居地点</label>
                  <input
                    type="text"
                    value={configForm.author.location || ''}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        author: { ...configForm.author, location: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="城市"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">当前个性化状态徽章</label>
                <input
                  type="text"
                  value={configForm.author.statusBadge || ''}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      author: { ...configForm.author, statusBadge: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="正在构建全栈系统"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">个人一句话简介 / 标语</label>
                <textarea
                  rows={2}
                  value={configForm.author.description}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      author: { ...configForm.author, description: e.target.value },
                    })
                  }
                  className="admin-textarea"
                />
              </div>

              {/* 社交媒体矩阵增删改 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    社交平台矩阵 ({configForm.author.socials.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newSocial: SocialLink = {
                        name: '自定义平台',
                        icon: 'github',
                        url: 'https://',
                      };
                      setConfigForm({
                        ...configForm,
                        author: {
                          ...configForm.author,
                          socials: [...configForm.author.socials, newSocial],
                        },
                      });
                    }}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加平台</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {configForm.author.socials.map((social, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={social.name}
                          onChange={(e) => {
                            const next = [...configForm.author.socials];
                            next[idx].name = e.target.value;
                            setConfigForm({
                              ...configForm,
                              author: { ...configForm.author, socials: next },
                            });
                          }}
                          placeholder="平台名称"
                          className="admin-input"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={social.icon}
                          onChange={(e) => {
                            const next = [...configForm.author.socials];
                            next[idx].icon = e.target.value;
                            setConfigForm({
                              ...configForm,
                              author: { ...configForm.author, socials: next },
                            });
                          }}
                          className="admin-select"
                        >
                          <option value="github">GitHub</option>
                          <option value="bilibili">Bilibili 哔哩哔哩</option>
                          <option value="x">X (Twitter)</option>
                          <option value="telegram">Telegram</option>
                          <option value="email">Email 邮箱</option>
                          <option value="weixin">微信</option>
                          <option value="qq">QQ</option>
                          <option value="custom">自定义</option>
                        </select>
                      </div>

                      <div className="sm:col-span-5">
                        <input
                          type="url"
                          value={social.url}
                          onChange={(e) => {
                            const next = [...configForm.author.socials];
                            next[idx].url = e.target.value;
                            setConfigForm({
                              ...configForm,
                              author: { ...configForm.author, socials: next },
                            });
                          }}
                          placeholder="主页链接，二维码项可留空"
                          className="admin-input font-mono"
                        />
                      </div>
                      <div className="sm:col-span-12">
                        <input
                          type="url"
                          value={social.qr || ''}
                          onChange={(e) => {
                            const next = [...configForm.author.socials];
                            next[idx].qr = e.target.value;
                            setConfigForm({
                              ...configForm,
                              author: { ...configForm.author, socials: next },
                            });
                          }}
                          placeholder="二维码图片地址（微信 / QQ 用）"
                          className="admin-input font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const next = configForm.author.socials.filter((_, i) => i !== idx);
                            setConfigForm({
                              ...configForm,
                              author: { ...configForm.author, socials: next },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="删除此平台"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. 首页 Hero 与分栏定制 ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <Home className="w-4 h-4 text-emerald-500" />
                  <span>首页 Hero 顶部视觉区域</span>
                </h3>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-input-group">
                    <label className="admin-label">问候语前缀 (Greeting)</label>
                    <input
                      type="text"
                      value={configForm.home?.hero?.greeting || "Hi, I'm"}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, greeting: e.target.value },
                          },
                        })
                      }
                      className="admin-input"
                      placeholder="Hi, I'm"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">高亮角色定位 (Highlight Role)</label>
                    <input
                      type="text"
                      value={configForm.home?.hero?.highlightRole || 'Cloud Native & Systems'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, highlightRole: e.target.value },
                          },
                        })
                      }
                      className="admin-input"
                      placeholder="full-stack things"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-input-group">
                    <label className="admin-label">技能药丸胶囊文案</label>
                    <input
                      type="text"
                      value={configForm.home?.hero?.skillsPills || 'Go • Rust • React 19 • K8s'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, skillsPills: e.target.value },
                          },
                        })
                      }
                      className="admin-input"
                      placeholder="Java • Vue3 • Node.js • React"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">在线状态指示点</label>
                    <select
                      value={configForm.home?.hero?.onlineStatus || 'online'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, onlineStatus: e.target.value as OnlineStatus },
                          },
                        })
                      }
                      className="admin-select"
                    >
                      <option value="online">在线 (绿色 - Online)</option>
                      <option value="busy">专注中 (红色 - Busy)</option>
                      <option value="away">离开 / 放空中 (橙色 - Away)</option>
                      <option value="offline">隐身 (灰色 - Offline)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">格言引用文案 (Quote)</label>
                  <input
                    type="text"
                    value={configForm.home?.hero?.quote || configForm.subtitle}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        home: {
                          ...configForm.home,
                          hero: { ...configForm.home?.hero, quote: e.target.value },
                        },
                      })
                    }
                    className="admin-input"
                    placeholder="心中有景,花香满径"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={configForm.home?.hero?.showMetrics ?? true}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, showMetrics: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-sakura-600 focus:ring-sakura-500"
                    />
                    <span>显示文稿篇数与字数统计胶囊</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={configForm.home?.hero?.showSocials ?? true}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            hero: { ...configForm.home?.hero, showSocials: e.target.checked },
                          },
                        })
                      }
                      className="rounded text-sakura-600 focus:ring-sakura-500"
                    />
                    <span>显示底部社交平台图标矩阵</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 首页分栏流控制 */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <Layout className="w-4 h-4 text-sakura-500" />
                  <span>首页双栏内容流参数</span>
                </h3>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    最新文章专区 (左栏 8/12)
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">栏目标题</label>
                    <input
                      type="text"
                      value={configForm.home?.sections?.postsTitle || '最新文章'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              postsTitle: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">展示数量 (默认 6 篇)</label>
                    <input
                      type="number"
                      min={1}
                      max={18}
                      value={configForm.home?.sections?.postsLimit || 6}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              postsLimit: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="admin-input font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    近期手记 (右栏上半 4/12)
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">栏目标题</label>
                    <input
                      type="text"
                      value={configForm.home?.sections?.diariesTitle || '近期手记'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              diariesTitle: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">展示数量 (默认 4 条)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={configForm.home?.sections?.diariesLimit || 4}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              diariesLimit: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="admin-input font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    即时动态 (右栏下半 4/12)
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">栏目标题</label>
                    <input
                      type="text"
                      value={configForm.home?.sections?.saysTitle || '即时动态'}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              saysTitle: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">展示数量 (默认 3 条)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={configForm.home?.sections?.saysLimit || 3}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          home: {
                            ...configForm.home,
                            sections: {
                              ...configForm.home?.sections,
                              saysLimit: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="admin-input font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. 关于页面深度定制 ================= */}
        {activeTab === 'about' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <Compass className="w-4 h-4 text-sakura-500" />
                <span>关于页面（About）元素与全栈技术栈矩阵定制</span>
              </h3>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">顶部名片标语 (Identity Title)</label>
                  <input
                    type="text"
                    value={configForm.about?.identityTitle || 'IDENTITY • 关于作者'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        about: { ...configForm.about, identityTitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">技术栈区块标题</label>
                  <input
                    type="text"
                    value={configForm.about?.techStackTitle || '工程与全栈技术栈'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        about: { ...configForm.about, techStackTitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">关于页格言引用 (Quote)</label>
                <textarea
                  rows={2}
                  value={configForm.about?.quote || ''}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      about: { ...configForm.about, quote: e.target.value },
                    })
                  }
                  className="admin-textarea"
                />
              </div>

              {/* 全栈技术栈分组矩阵管理 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sakura-500" />
                    <span>技术栈分类与标签项矩阵 ({configForm.about?.techCategories?.length || 0} 组)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      const newCat: TechStackCategory = {
                        category: '新建分类',
                        items: [{ name: '新工具', icon: 'code', desc: '说明' }],
                      };
                      setConfigForm({
                        ...configForm,
                        about: {
                          ...configForm.about,
                          techCategories: [...(configForm.about?.techCategories || []), newCat],
                        },
                      });
                    }}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加技术大类</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(configForm.about?.techCategories || []).map((cat, catIdx) => (
                    <div
                      key={catIdx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={cat.category}
                            onChange={(e) => {
                              const next = [...(configForm.about?.techCategories || [])];
                              next[catIdx].category = e.target.value;
                              setConfigForm({
                                ...configForm,
                                about: { ...configForm.about, techCategories: next },
                              });
                            }}
                            className="admin-input font-bold"
                            placeholder="分类名称 (如：后端与系统)"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(configForm.about?.techCategories || [])];
                              next[catIdx].items.push({ name: '新技术', icon: 'code' });
                              setConfigForm({
                                ...configForm,
                                about: { ...configForm.about, techCategories: next },
                              });
                            }}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            <Plus className="w-3 h-3" />
                            <span>添加技术标签</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const next = (configForm.about?.techCategories || []).filter(
                                (_, i) => i !== catIdx
                              );
                              setConfigForm({
                                ...configForm,
                                about: { ...configForm.about, techCategories: next },
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="删除分类"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 内部技术项列表 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        {cat.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5"
                          >
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => {
                                  const next = [...(configForm.about?.techCategories || [])];
                                  next[catIdx].items[itemIdx].name = e.target.value;
                                  setConfigForm({
                                    ...configForm,
                                    about: { ...configForm.about, techCategories: next },
                                  });
                                }}
                                placeholder="技术名"
                                className="w-full text-xs font-mono font-semibold bg-transparent outline-none border-b border-transparent focus:border-sakura-500"
                              />
                              <input
                                type="text"
                                value={item.desc || ''}
                                onChange={(e) => {
                                  const next = [...(configForm.about?.techCategories || [])];
                                  next[catIdx].items[itemIdx].desc = e.target.value;
                                  setConfigForm({
                                    ...configForm,
                                    about: { ...configForm.about, techCategories: next },
                                  });
                                }}
                                placeholder="描述 (可选)"
                                className="w-full text-[10.5px] text-slate-400 bg-transparent outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const next = [...(configForm.about?.techCategories || [])];
                                next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
                                setConfigForm({
                                  ...configForm,
                                  about: { ...configForm.about, techCategories: next },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 设计理念 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="admin-input-group">
                  <label className="admin-label">设计理念区块标题</label>
                  <input
                    type="text"
                    value={configForm.about?.designTitle || '关于本站与设计理念'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        about: { ...configForm.about, designTitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">设计理念详细正文</label>
                  <textarea
                    rows={3}
                    value={configForm.about?.designPhilosophy || ''}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        about: { ...configForm.about, designPhilosophy: e.target.value },
                      })
                    }
                    className="admin-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. 友链页面定制 ================= */}
        {activeTab === 'friends' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <Users className="w-4 h-4 text-sakura-500" />
                <span>友链页面（Friends）文案与申请指南模板定制</span>
              </h3>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">页面大标题 (Title)</label>
                  <input
                    type="text"
                    value={configForm.friendsPage?.title || '志同道合的朋友'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        friendsPage: { ...configForm.friendsPage, title: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">指南区块标题</label>
                  <input
                    type="text"
                    value={configForm.friendsPage?.guideTitle || '交换友链'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        friendsPage: { ...configForm.friendsPage, guideTitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">页面副标题诗意标语</label>
                <textarea
                  rows={2}
                  value={configForm.friendsPage?.subtitle || ''}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      friendsPage: { ...configForm.friendsPage, subtitle: e.target.value },
                    })
                  }
                  className="admin-textarea"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">申请指南说明文字</label>
                <textarea
                  rows={2}
                  value={configForm.friendsPage?.guideText || ''}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      friendsPage: { ...configForm.friendsPage, guideText: e.target.value },
                    })
                  }
                  className="admin-textarea"
                />
              </div>

              {/* 友链申请模板 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  本站友链信息模板（供访客复制）
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-input-group">
                    <label className="admin-label">站点名称</label>
                    <input
                      type="text"
                      value={configForm.friendsPage?.template?.name || configForm.title}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          friendsPage: {
                            ...configForm.friendsPage,
                            template: {
                              ...configForm.friendsPage?.template,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">站点简介</label>
                    <input
                      type="text"
                      value={configForm.friendsPage?.template?.desc || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          friendsPage: {
                            ...configForm.friendsPage,
                            template: {
                              ...configForm.friendsPage?.template,
                              desc: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="admin-input-group">
                    <label className="admin-label">站点主页链接</label>
                    <input
                      type="url"
                      value={configForm.friendsPage?.template?.url || configForm.url}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          friendsPage: {
                            ...configForm.friendsPage,
                            template: {
                              ...configForm.friendsPage?.template,
                              url: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input font-mono"
                    />
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">头像图片直链</label>
                    <input
                      type="text"
                      value={configForm.friendsPage?.template?.avatar || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          friendsPage: {
                            ...configForm.friendsPage,
                            template: {
                              ...configForm.friendsPage?.template,
                              avatar: e.target.value,
                            },
                          },
                        })
                      }
                      className="admin-input font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. 各前台独立页面文案定制 ================= */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            {/* 文稿归档页 */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <FileText className="w-4 h-4 text-sakura-500" />
                  <span>文稿归档页面 (Posts Page) 文案</span>
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="admin-input-group">
                  <label className="admin-label">页面大标题</label>
                  <input
                    type="text"
                    value={configForm.postsPage?.title || '文稿归档'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        postsPage: { ...configForm.postsPage, title: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">页面副标题与导语</label>
                  <input
                    type="text"
                    value={configForm.postsPage?.subtitle || '探索技术本质，记录思考与实践的轨迹。'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        postsPage: { ...configForm.postsPage, subtitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* 心境手记页 */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <FileText className="w-4 h-4 text-violet-500" />
                  <span>生活手记页面 (Diaries Page) 文案</span>
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="admin-input-group">
                  <label className="admin-label">页面大标题</label>
                  <input
                    type="text"
                    value={configForm.diariesPage?.title || '散落的日常与手记'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        diariesPage: { ...configForm.diariesPage, title: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">页面副标题与导语</label>
                  <input
                    type="text"
                    value={configForm.diariesPage?.subtitle || '捕捉那些代码之外的日暮微风、深夜随笔与生活切片。'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        diariesPage: { ...configForm.diariesPage, subtitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* 说说动态页 */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>说说即时动态页面 (Says Page) 文案与参数</span>
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="admin-input-group">
                  <label className="admin-label">页面大标题</label>
                  <input
                    type="text"
                    value={configForm.saysPage?.title || '我的动态'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        saysPage: { ...configForm.saysPage, title: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
                <div className="admin-input-group sm:col-span-2">
                  <label className="admin-label">页面副标题与导语</label>
                  <input
                    type="text"
                    value={configForm.saysPage?.subtitle || '把灵感、日常与正在发生的事情，留在时间线上。'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        saysPage: { ...configForm.saysPage, subtitle: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* 时光归档页 */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>时光归档年谱页面 (Archives Page) 文案</span>
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="admin-input-group">
                  <label className="admin-label">页面大标题</label>
                  <input
                    type="text"
                    value={configForm.archivesPage?.title || '时光归档'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        archivesPage: { ...configForm.archivesPage, title: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">页面副标题与导语 (留空则自动按篇数显示)</label>
                  <input
                    type="text"
                    value={configForm.archivesPage?.subtitle || ''}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        archivesPage: { ...configForm.archivesPage, subtitle: e.target.value },
                      })
                    }
                    placeholder="全站文稿与手记的时间脉络与足迹索引。"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. 顶部导航栏定制 ================= */}
        {activeTab === 'header' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <Layout className="w-4 h-4 text-sakura-500" />
                <span>顶部导航栏（Header）项与悬浮交互定制</span>
              </h3>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="flex flex-wrap items-center gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={configForm.header?.enableMegaMenu ?? true}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        header: { ...configForm.header, enableMegaMenu: e.target.checked },
                      })
                    }
                    className="rounded text-sakura-600 focus:ring-sakura-500"
                  />
                  <span>开启导航项悬浮预览 Popover (MegaMenu)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={configForm.header?.enableSearch ?? true}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        header: { ...configForm.header, enableSearch: e.target.checked },
                      })
                    }
                    className="rounded text-sakura-600 focus:ring-sakura-500"
                  />
                  <span>开启全局快捷键 ⌘K / Ctrl+K 搜索</span>
                </label>
              </div>

              {/* 导航项列表增删改 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    导航菜单条目 ({configForm.header?.navLinks?.length || 0})
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      const newLink: NavLinkItem = {
                        id: `nav-${Date.now()}`,
                        label: '新菜单',
                        href: '/custom',
                        icon: 'FileText',
                        enabled: true,
                        isExternal: false,
                      };
                      setConfigForm({
                        ...configForm,
                        header: {
                          ...configForm.header,
                          navLinks: [...(configForm.header?.navLinks || []), newLink],
                        },
                      });
                    }}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加菜单项</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(configForm.header?.navLinks || []).map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-1 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={link.enabled !== false}
                          onChange={(e) => {
                            const next = [...(configForm.header?.navLinks || [])];
                            next[idx].enabled = e.target.checked;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          title="是否启用"
                          className="rounded text-sakura-600"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const next = [...(configForm.header?.navLinks || [])];
                            next[idx].label = e.target.value;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          placeholder="菜单名"
                          className="admin-input"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => {
                            const next = [...(configForm.header?.navLinks || [])];
                            next[idx].href = e.target.value;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          placeholder="路由路径 (如 /posts 或 https://...)"
                          className="admin-input font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <select
                          value={link.icon}
                          onChange={(e) => {
                            const next = [...(configForm.header?.navLinks || [])];
                            next[idx].icon = e.target.value;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          className="admin-select"
                        >
                          <option value="HomeIcon">首页 (Home)</option>
                          <option value="FileText">文稿 (Posts)</option>
                          <option value="History">归档 (Archives)</option>
                          <option value="Feather">手记 (Diaries)</option>
                          <option value="MessageSquareQuote">动态 (Says)</option>
                          <option value="Users">朋友 (Friends)</option>
                          <option value="User">关于 (About)</option>
                          <option value="Sparkles">星光 (Sparkles)</option>
                          <option value="Globe">网页 (Globe)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...(configForm.header?.navLinks || [])];
                            const temp = next[idx - 1];
                            next[idx - 1] = next[idx];
                            next[idx] = temp;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          title="上移"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (configForm.header?.navLinks?.length || 0) - 1}
                          onClick={() => {
                            const next = [...(configForm.header?.navLinks || [])];
                            const temp = next[idx + 1];
                            next[idx + 1] = next[idx];
                            next[idx] = temp;
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          title="下移"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = (configForm.header?.navLinks || []).filter(
                              (_, i) => i !== idx
                            );
                            setConfigForm({
                              ...configForm,
                              header: { ...configForm.header, navLinks: next },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. 页脚与底栏定制 ================= */}
        {activeTab === 'footer' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <FileText className="w-4 h-4 text-sakura-500" />
                <span>页脚（Footer）标语、版权、备案与三列导航定制</span>
              </h3>
            </div>

            <div className="p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">页脚座右铭 (Motto)</label>
                  <input
                    type="text"
                    value={configForm.footer.motto || 'Stay hungry. Stay foolish.'}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, motto: e.target.value },
                      })
                    }
                    className="admin-input font-serif italic"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">建站起始年份 (Since Year)</label>
                  <input
                    type="number"
                    value={configForm.footer.sinceYear}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, sinceYear: Number(e.target.value) },
                      })
                    }
                    className="admin-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="admin-input-group">
                  <label className="admin-label">ICP 备案号</label>
                  <input
                    type="text"
                    value={configForm.footer.icp || ''}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, icp: e.target.value },
                      })
                    }
                    placeholder="萌ICP备20268811号"
                    className="admin-input font-mono"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">ICP 备案跳转查询链接</label>
                  <input
                    type="url"
                    value={configForm.footer.icpUrl || ''}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, icpUrl: e.target.value },
                      })
                    }
                    placeholder="https://icp.gov.moe/?keyword=20268811"
                    className="admin-input font-mono"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">底部自定义说明文本</label>
                <input
                  type="text"
                  value={configForm.footer.customText}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      footer: { ...configForm.footer, customText: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="心中有景,花香满径"
                />
              </div>

              {/* 显隐开关 */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={configForm.footer.showThemeToggle ?? true}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, showThemeToggle: e.target.checked },
                      })
                    }
                    className="rounded text-sakura-600"
                  />
                  <span>显示主题切换按钮 (Light / System / Dark)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={configForm.footer.showRss ?? true}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, showRss: e.target.checked },
                      })
                    }
                    className="rounded text-sakura-600"
                  />
                  <span>显示 RSS 订阅入口</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={configForm.footer.showSitemap ?? true}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        footer: { ...configForm.footer, showSitemap: e.target.checked },
                      })
                    }
                    className="rounded text-sakura-600"
                  />
                  <span>显示站点地图入口</span>
                </label>
              </div>

              {/* 页脚 3 列快速导航配置 */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    页脚导航分列 ({configForm.footer.navColumns?.length || 0} 列)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newCol: FooterNavColumn = {
                        title: '新导航组',
                        links: [{ label: '子链接', href: '/' }],
                      };
                      setConfigForm({
                        ...configForm,
                        footer: {
                          ...configForm.footer,
                          navColumns: [...(configForm.footer.navColumns || []), newCol],
                        },
                      });
                    }}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加导航列</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(configForm.footer.navColumns || []).map((col, colIdx) => (
                    <div
                      key={colIdx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={col.title}
                          onChange={(e) => {
                            const next = [...(configForm.footer.navColumns || [])];
                            next[colIdx].title = e.target.value;
                            setConfigForm({
                              ...configForm,
                              footer: { ...configForm.footer, navColumns: next },
                            });
                          }}
                          className="admin-input font-bold"
                          placeholder="列标题 (如: 关于)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (configForm.footer.navColumns || []).filter(
                              (_, i) => i !== colIdx
                            );
                            setConfigForm({
                              ...configForm,
                              footer: { ...configForm.footer, navColumns: next },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="删除此列"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {col.links.map((link, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const next = [...(configForm.footer.navColumns || [])];
                                next[colIdx].links[lIdx].label = e.target.value;
                                setConfigForm({
                                  ...configForm,
                                  footer: { ...configForm.footer, navColumns: next },
                                });
                              }}
                              placeholder="文案"
                              className="admin-input text-xs w-24"
                            />
                            <input
                              type="text"
                              value={link.href}
                              onChange={(e) => {
                                const next = [...(configForm.footer.navColumns || [])];
                                next[colIdx].links[lIdx].href = e.target.value;
                                setConfigForm({
                                  ...configForm,
                                  footer: { ...configForm.footer, navColumns: next },
                                });
                              }}
                              placeholder="路径 / 链接"
                              className="admin-input text-xs font-mono flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...(configForm.footer.navColumns || [])];
                                next[colIdx].links = next[colIdx].links.filter((_, i) => i !== lIdx);
                                setConfigForm({
                                  ...configForm,
                                  footer: { ...configForm.footer, navColumns: next },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const next = [...(configForm.footer.navColumns || [])];
                            next[colIdx].links.push({ label: '新链接', href: '/' });
                            setConfigForm({
                              ...configForm,
                              footer: { ...configForm.footer, navColumns: next },
                            });
                          }}
                          className="w-full py-1 text-center text-[11px] font-mono text-sakura-600 dark:text-sakura-400 hover:underline"
                        >
                          + 添加子链接
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. 外观偏好与备份恢复中心 ================= */}
        {activeTab === 'backups' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* 外观偏好卡片 */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>
                    <Palette className="w-4 h-4 text-violet-500" />
                    <span>控制台外观与主题偏好</span>
                  </h3>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="admin-input-group">
                      <label className="admin-label">控制台主题模式</label>
                      <select
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value as AdminPreferences['theme'])}
                        className="admin-select"
                      >
                        <option value="system">跟随系统 (System)</option>
                        <option value="light">浅色模式 (Light)</option>
                        <option value="dark">深色极夜 (Dark)</option>
                      </select>
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">控制台强调主题色</label>
                      <select
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value as AdminPreferences['accentColor'])}
                        className="admin-select"
                      >
                        <option value="blue">天空蓝 (Sky Blue)</option>
                        <option value="emerald">翡翠绿 (Emerald)</option>
                        <option value="violet">紫罗兰 (Violet)</option>
                        <option value="amber">日落橙 (Amber)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>应用外观偏好</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 数据备份与恢复 */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>数据备份、恢复与快照迁移</span>
                  </h3>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-sakura-500" />
                      <span>全站全量快照导出</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      将文章、手记、说说、友链、分类标签及全部页面配置打包为单文件 JSON 导出到本地。
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="admin-btn admin-btn-secondary admin-btn-sm w-full mt-2"
                    >
                      导出全站 JSON 备份
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-500" />
                      <span>从备份快照恢复全站</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      选择此前导出的 JSON 备份文件，一键恢复全站内容与所有页面定制。
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="admin-btn admin-btn-secondary admin-btn-sm w-full mt-2"
                    >
                      选择 JSON 备份恢复
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧存储与危险区域 */}
            <div className="space-y-6">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>
                    <HardDrive className="w-4 h-4 text-sakura-500" />
                    <span>存储空间与状态分析</span>
                  </h3>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>LocalStorage 占用</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {storageUsage.usedKb} KB
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>文章文稿</span>
                      <span>{storageUsage.itemsCount.posts} 篇</span>
                    </div>
                    <div className="flex justify-between">
                      <span>生活手记</span>
                      <span>{storageUsage.itemsCount.diaries} 篇</span>
                    </div>
                    <div className="flex justify-between">
                      <span>说说动态</span>
                      <span>{storageUsage.itemsCount.records} 条</span>
                    </div>
                    <div className="flex justify-between">
                      <span>友链伙伴</span>
                      <span>{storageUsage.itemsCount.friends} 位</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      clearLogs();
                      success('操作审计日志已清空！');
                    }}
                    className="w-full mt-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-mono hover:underline"
                  >
                    清理历史操作日志
                  </button>
                </div>
              </div>

              {/* 危险重置区 */}
              <div className="admin-card border-red-200 dark:border-red-900/50">
                <div className="admin-card-header bg-red-50/50 dark:bg-red-950/20">
                  <h3 className="text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>危险操作区域</span>
                  </h3>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    重置将清除浏览器本地中所有新增与修改的数据，恢复初始演示状态。
                  </p>
                  <button
                    onClick={() => setResetConfirmOpen(true)}
                    className="admin-btn admin-btn-danger admin-btn-sm w-full"
                  >
                    恢复出厂演示数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 出厂重置二次确认模态框 */}
      {resetConfirmOpen && (
        <div className="admin-modal-overlay" onClick={() => setResetConfirmOpen(false)}>
          <div
            className="admin-modal-dialog p-6 space-y-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-950 text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  确认重置全站数据？
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  此操作将丢弃所有在当前浏览器中创建或修改的文章、手记、说说、友链及全页面配置，并重置为初始演示状态。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReset}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 浮动未保存保存栏 */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 z-40 bg-sakura-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-sakura-400 flex items-center gap-4 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            <span>检测到有尚未保存的配置更改</span>
          </div>
          <button
            onClick={() => handleSaveAllConfig()}
            className="px-3.5 py-1.5 rounded-lg bg-white text-sakura-700 hover:bg-sakura-50 font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>立即保存</span>
          </button>
        </div>
      )}
    </div>
  );
};
