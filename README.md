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

导航中的「番剧墙」对应 `/wallpapers`。内容为 2026-09-22 从次元城「正在追 / 已追完」同步的 52 部番剧，包含封面、简介及来源信息；其中 24 部正在追、28 部已追完；另有 6 部剧场版（包含在前述状态中），按播出年份从新到旧排列，同年按首播日期排列。它是静态快照，不会自动同步账号。封面存放于图仓文件夹 4249，前端仅包含公开图片地址。

交错封面排布与入场节奏参考 [React Bits Masonry](https://reactbits.dev/components/masonry)，在既有粉笺视觉上以 CSS、IntersectionObserver 和 Web Animations 实现，没有新增依赖。图片在接近视口时加载，默认展示全部，支持搜索、正在追 / 已追完 / 剧场版筛选、详情预览、键盘切换和减少动态效果设置。

更新片单后执行 `pnpm build`；使用 `node scripts/check-wallpapers.mjs` 核对本次快照的完整性、静态正文、站点地图及生产路由。图床上传凭据与账号密码不放入仓库。

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
