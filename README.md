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

导航中的「番剧墙」对应 `/wallpapers`，片单来自次元城「正在追 / 已追完」，包含封面、简介及来源信息。按播出年份从新到旧排列，同年按首播日期排列。封面存放于图仓文件夹 4249，前端仅包含公开图片地址；数量和快照日期以 `src/content/pages/wallpapers.json` 及本次来源核对结果为准。

交错封面排布与入场节奏参考 [React Bits Masonry](https://reactbits.dev/components/masonry)，在既有粉笺视觉上以 CSS、IntersectionObserver 和 Web Animations 实现，没有新增依赖。图片在接近视口时加载，默认展示全部，支持搜索、正在追 / 已追完 / 剧场版筛选、详情预览、键盘切换和减少动态效果设置。

更新片单后执行 `pnpm build`；使用 `node scripts/check-wallpapers.mjs` 核对本次快照的完整性、静态正文、站点地图及生产路由。图床上传凭据与账号密码不放入仓库。

搜索优先匹配片名，支持别名、年份、标签与空格组合关键词；四位年份以首播字段为准，单字不会模糊匹配工作人员姓名标签。使用 `pnpm check:anime-search`（Node.js 22.18+）验证排序、组合条件与中文简介。

日语简介的中文译文单独保存在 `src/content/pages/anime-descriptions.zh.json`，详情优先展示中文并提供日语原文折叠区。同步片单会保留这些译文；来源站后来补上的中文简介优先于本地译文。

### 一键同步次元城

用户说“同步壁纸墙 / 番剧墙”时，目标是本仓库的 [番剧墙](https://xran.uk/wallpapers)，不是相邻 Hexo 博客的壁纸数据。复用 `scripts/sync-anime.mjs`，同步状态、资料和封面，不手工修改计数，也不需要启动浏览器或开发服务器来采集。

1. **确认仓库与环境。** 本机目录为 `/Users/xingranya/Downloads/HTML5CSS/xingranya-home`，远端为 `xingranya/xingranya-home`。使用 Node.js 22.18+ 和 `package.json` 指定的 pnpm；依赖缺失时执行 `pnpm install --frozen-lockfile`。先检查工作区，保留他人的改动；准备发布时确认 `main` 与 `origin/main` 一致，有分叉或未提交改动先处理，不能强制重置。

```bash
cd /Users/xingranya/Downloads/HTML5CSS/xingranya-home
git status --short
node scripts/sync-anime.mjs --help
```

2. **按授权范围执行。** 推荐先同步到本地，补齐中文简介后再发布。以下三种模式任选一种，不要依次全部运行。

```bash
# 只核对两种分类与新增、移除、状态变化；仍会登录来源站
node scripts/sync-anime.mjs --check --username xingranya
# 同步到本地，必要时上传封面，并自动构建及检查；不提交、不推送
node scripts/sync-anime.mjs --username xingranya --folder 4249
# 已获发布授权且允许片单先发布时：同步、检查、自动提交并推送
node scripts/sync-anime.mjs --push --username xingranya --folder 4249
```

账号密码与图仓 Token 的取值顺序为：环境变量 → `.cache/anime-sync/credentials.env` → 隐藏提示。凭据文件由脚本启动时自动读取，`.cache/anime-sync/` 已在 `.gitignore` 中，不会进入 Git；文件权限建议 `chmod 600`，已有的同名环境变量不会被覆盖。代理终端需启用 PTY（例如 `exec_command` 的 `tty: true`）。只有需要新上传封面时才用图仓 Token。可用变量：`CYC_USERNAME`、`CYC_PASSWORD`，或用 `CYC_TOKEN` 跳过登录；图仓使用 `TUCANG_TOKEN`。默认文件夹为 4249，可由 `--folder` 或 `TUCANG_FOLDER_ID` 指定。真实值不写进文档、提交内容、日志或命令历史。

脚本完整读取两种分类的分页，核对总数及重复条目；复用未变的封面，只上传新增或已更换的封面。成功后更新 `src/content/pages/wallpapers.json`，自动运行 `pnpm run build` 和 `node scripts/check-wallpapers.mjs`。资料完全未变时直接退出，不更新快照日期、不构建、不提交。`--push` 额外检查工作区、分支、远端和允许提交的文件，并回读远端提交；它**不会自动翻译或运行中文简介检查**。

3. **补齐中文简介。** 同步后运行：

```bash
pnpm check:anime-search
```

若提示某部番剧仍展示日文，用该条目 `id` 作键，将忠实中文译文加入 `src/content/pages/anime-descriptions.zh.json`；保留 `wallpapers.json` 中的来源原文。来源站已有中文时由 `getAnimeSynopsis` 优先使用来源中文，不要为了旧测试覆盖它。片单移除条目导致译文键失效时，核对移除结果后清理对应键。

补过译文或修过本次相关代码后，执行以下检查；没有新改动时不重复同步脚本已经通过的构建和片单检查：

```bash
pnpm check:anime-search
pnpm run build
node scripts/check-wallpapers.mjs
```

仅修改同步脚本时，另运行 `pnpm check:anime-sync`，验证分页、分类合并与异常阻断。

4. **检查并发布。** 仅在本次请求或已有会话授权覆盖发布时执行。先看 `git diff --stat` 和 `git diff --check`，只暂存本次片单、译文、必要修复及实际变化的生成文件。同步脚本的生成文件白名单为 `public/sitemap.xml`、`public/indexnow-urls.json`、`src/content/generated/valid-routes.js`。按仓库约定提交后执行 `git push origin main`，核对 `git rev-parse HEAD` 与 `git ls-remote origin refs/heads/main` 的提交一致。

先本地同步或补过译文后，不要再补跑 `--push`：工作区改动会触发它的前置阻断，此时审核本地改动后正常提交即可。若先用了 `--push`，新增译文仍需单独验证、提交和推送。

5. **确认线上结果。** 打开或回读 `https://xran.uk/wallpapers`，将卡片总数、两种分类数量、快照日期和新增标题与本次 JSON 对照。若更新了译文，检查线上详情或实际加载的 JS 中已包含新译文；仅 HTTP 200 不足以证明更新，资源请求可能返回旧版或 HTML 回退页。部署未完成就明确报告“已推送，线上待确认”，不要把历史数量当作当前结果。交付只需说明新增 / 移除 / 状态变化、当前数量、实际检查与未验证项。

### 同步失败时

- 资料或图片验证失败时尚未覆盖片单；已成功上传的记录在 `.cache/anime-sync/uploads.json`，保留缓存后重新运行可复用图片。脚本每 10 部打印一次进度，间隔内无输出不代表卡死；首次构建可能出现 Corepack 下载 pnpm 的确认提示。
- 写入片单后的构建或检查失败不会提交，但本地文件已改变，旧片单在 `.cache/anime-sync/previous.json`。先修复并完成检查，再审核提交；不要直接重跑 `--push`，也不要自动回滚覆盖其他改动。所有恢复操作先检查当前 Git 差异。
- 推送失败时检查提交是否已留在本地，排除远端分叉后重试 `git push origin main`，无需重新采集或上传。登录、权限或限流错误先解决原因，不连续盲目重试。

这是按需手动同步，不会创建定时任务；`.cache/anime-sync/` 已忽略，不提交缓存、凭据或原始响应。

## 中文字体

正文与界面使用 MiSans，标题使用 Noto Serif SC，首页和关于页的短引用使用 Ma Shan Zheng 楷书。新增中文字体自托管于 `public/fonts/chinese/`，按 `unicode-range` 分片按需加载，使用 `font-display: swap`；来源与 OFL 许可随字体保留。

## 本地管理后台

访问 `http://localhost:<port>/admin`（仅 localhost / 127.0.0.1 可用，线上直接 404）。

支持：手记 / 说说 / 友链 / 站点设置 / 底层 JSON 编辑、草稿暂存、回收站、导入导出。

### 统一后台

在主页仓库运行：

```bash
pnpm admin
```

命令会在 `127.0.0.1` 启动主页后台（`http://127.0.0.1:3000/admin`）和博客本地预览（`http://127.0.0.1:4000/admin`）。默认博客目录为主页仓库同级的 `../xingranya-blog`，也可以通过 `XINGRANYA_BLOG_ROOT` 覆盖；不需要博客预览时设置 `XINGRANYA_SKIP_BLOG_PREVIEW=1`。

统一后台直接读写两个仓库的源文件，保存前会创建 `.cache/admin-snapshots/` 快照，并在检测到外部修改时阻止覆盖。统一工作区可以查看两个仓库的 Git 状态、编辑博客文章和页面、维护主页项目/番剧墙、博客友链/壁纸数据、检查媒体引用，并按“主页 → 博客”顺序执行校验、构建、提交和推送。

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

统一后台支持新建博客草稿、草稿与文章互转、删除前快照备份，以及连续保存项目、番剧墙、友链和图库数据。保存状态以源文件回执为准；失败的浏览器草稿会保留，可重试或明确放弃后重新读取源文件。

- `pnpm check:admin-api`：在临时目录验证保存、冲突、索引、文章生命周期和上传桥接，不修改真实内容。
- “校验两个站点”只检查和构建，不提交或推送。
- “发布两个站点”会明确确认提交和推送，源码改动或已暂存变更会阻止内容发布；推送成功不代表线上部署完成。
- `XINGRANYA_HOME_PORT`、`XINGRANYA_BLOG_PORT` 可指定本地端口，端口占用时停止启动，不自动换到其他地址。
