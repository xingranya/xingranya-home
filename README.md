# 星苒鸭

个人主页。留下手记、日常和朋友。

线上地址：[https://xran.uk](https://xran.uk)

## 关联站点

- **主站**：[https://xran.uk](https://xran.uk)
- **博客**：[https://blog.xran.uk](https://blog.xran.uk)

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Rsbuild（Rspack） |
| 路由 | wouter |
| 样式 | Tailwind CSS 3 |
| 动画 | GSAP |
| 内容 | Markdown（gray-matter frontmatter） |
| 渲染增强 | Shiki / KaTeX / Mermaid / abcjs |
| 部署 | 静态托管（Cloudflare Pages / Vercel / GitHub Pages 等） |

## 快速开始

```bash
# 安装依赖（推荐 pnpm）
pnpm install
# 或
npm install
```

### 启动开发服务器

```bash
# 启动本地开发服务
pnpm dev
# 或
npm run dev
```

启动成功后访问 **http://localhost:3000**。

```bash
# 类型检查
npm run typecheck

# 生产构建（索引 → sitemap → RSS → rsbuild → 404 fallback）
npm run build

# 预览构建产物
npm run preview
```

## 内容架构

```
src/content/
  diaries/*.md        # 随笔手记
  records/records.json # 动态说说与记录
  pages/friends.json  # 志同道合友链
  pages/wallpapers.json # 番剧墙的公开片单快照
  config/site.config.json # 站点全局配置
  generated/          # 构建期自动生成，勿手改
    content-index.json   # 元数据索引
    content-loaders.ts   # 正文动态 import 映射
```

正文 **按需加载**：列表/搜索只依赖元数据索引，进入详情页再拉对应 Markdown chunk。新增或删除手记后请执行：

```bash
pnpm generate:content-index
```

（`pnpm dev` / `pnpm build` 会自动执行。）

## 番剧墙

导航中的「番剧墙」对应 `/wallpapers`。初始片单为 2026-09-22 从次元城「正在追 / 已追完」同步的 52 部番剧，包含封面、简介及来源信息。按播出年份从新到旧排列，同年按首播日期排列。封面存放于图仓文件夹 4249，前端仅包含公开图片地址；实际数量以最新同步结果为准。

交错封面排布与入场节奏参考 [React Bits Masonry](https://reactbits.dev/components/masonry)，在既有粉笺视觉上以 CSS、IntersectionObserver 和 Web Animations 实现，没有新增依赖。图片在接近视口时加载，默认展示全部，支持搜索、正在追 / 已追完 / 剧场版筛选、详情预览、键盘切换和减少动态效果设置。

更新片单后执行 `pnpm build`；使用 `node scripts/check-wallpapers.mjs` 核对本次快照的完整性、静态正文、站点地图及生产路由。图床上传凭据与账号密码不放入仓库。

### 一键同步次元城

在仓库目录运行（Node.js 22+，先安装项目依赖）：

```bash
pnpm sync:anime --check # 只核对两种分类，不上传或修改文件
pnpm sync:anime         # 同步资料、新增封面并构建验证
pnpm sync:anime --push  # 同步、验证，然后自动提交并推送 GitHub
```

未设置环境变量时，脚本会询问次元城账号、密码；有新增封面时才询问图仓 Token。密码与 Token 隐藏输入，仅保存在本次进程内。也可由本机环境提供 `CYC_USERNAME`、`CYC_PASSWORD`（或 `CYC_TOKEN`）与 `TUCANG_TOKEN`，不要把真实凭据写入项目文件或命令历史。默认图仓文件夹为 4249，可通过 `--folder` 或 `TUCANG_FOLDER_ID` 修改。

自动推送要求工作区干净，且 `main` 与 `xingranya/xingranya-home` 的 `origin/main` 一致。脚本会完整读取分页，更新两种追番状态与资料，复用原有图片，只上传新增或封面已更换的图片。读取或图片验证失败时不会覆盖片单；构建失败时不会提交。上传进度和上一份片单保存在已忽略的 `.cache/anime-sync/`，失败后可检查并重新运行。若推送因网络失败，提交仍在本地，恢复网络后执行 `git push origin main`。

这不是定时任务，每次需要更新时运行一次。`pnpm check:anime-sync` 检查分页、分类合并和异常阻断逻辑。

## 中文字体

正文与界面使用 MiSans，标题使用 Noto Serif SC，首页和关于页的短引用使用 Ma Shan Zheng 楷书。新增中文字体自托管于 `public/fonts/chinese/`，按 `unicode-range` 分片按需加载，使用 `font-display: swap`；来源与 OFL 许可随字体保留。

## 本地管理后台

访问 `http://localhost:<port>/admin`（仅 localhost / 127.0.0.1 可用，线上直接 404）。

支持：手记 / 说说 / 友链 / 站点设置 / 底层 JSON 编辑、草稿暂存、回收站、导入导出。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm generate:content-index` | 重新生成正文元数据索引与 loaders |
| `pnpm generate:sitemap` | 生成 sitemap.xml |
| `pnpm generate:rss` | 生成 feed.xml / rss.xml |
| `pnpm detect:friends` | 探测友链可达性 |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier 格式化 |

## 许可

见 [LICENSE](./LICENSE)。
