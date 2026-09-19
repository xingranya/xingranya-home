# chent

个人网站与数字花园，记录随笔、日记、项目与生活，分享个人的思考、经历与正在做的事情，也保存那些值得留下来的时刻。

线上地址：[https://chent.co](https://chent.co)

## 关联生态

- **主站**：[https://chent.co](https://chent.co)
- **知识库**：[https://wiki.chent.co](https://wiki.chent.co)
- **简历**：[https://cv.chent.co](https://cv.chent.co)

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
