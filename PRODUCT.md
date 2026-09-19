# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主用户是刚搜到星苒鸭的人：GitHub 访客、其他开发者、招聘相关浏览。他们在一次短停留里要搞清「这是谁、做过什么、怎么联系」。

已经认识你的人（同学、朋友、协作者）是次要用户，会来看近况、友链和联系方式，但不驱动首页优先级。

## Product Purpose

xran.uk 是星苒鸭的个人主页。用来放下身份、精选项目、手记、日常动态和友链；技术长文在 blog.xran.uk，两边分开。

对首次访客，成功意味着几十秒内能确认身份、看到代表作、找到联系方式和博客入口。

## Positioning

这不是博客，也不是作品集模板站。机制是「人的主页 + 长文外置」：主站只承担认识你这件事，深度文章明确指向 blog.xran.uk。

## Operating Context

- 线上主站：https://xran.uk
- 博客：https://blog.xran.uk
- 源码：https://github.com/xingranya/xingranya-home
- 本地：`pnpm dev` → http://localhost:3000
- 内容：手记 Markdown、动态 JSON、友链 JSON、站点配置 JSON
- 后台 `/admin` 仅 localhost / 127.0.0.1 可用，线上直接 404

## Capabilities and Constraints

已有能力：首页、归档、手记、动态、友链（功能保留、名单可空）、关于（奖项 + 最多 10 个精选项目）、站点地图、RSS、外链确认、本地后台。

约束：

- 友链功能不能删，只允许名单为空或由主人自己加
- 关于页项目最多 10 个精选，其余指向 GitHub
- 不把 blog.xran.uk 的长文搬进主站
- 不编造奖项、客户、数据或未公开仓库
- 私有仓库不展示

未决：无单独无障碍标准承诺。

## Brand Commitments

- 对外名：星苒鸭（xingranya）
- 主站域名：xran.uk；博客：blog.xran.uk
- 口吻：直接、短句、不装；金句「把复杂问题拆简单，把简单方案做扎实。」
- 强调色绑定樱花粉，约 `#ffc0cb`
- 站点头像用主人提供的二次元头像；网站图标用该头像的圆角裁切，不要鸭子元素
- 联系：Outlook `xingranya@outlook.jp`、Gmail、GitHub、Bilibili、X、Telegram、微信/QQ 二维码

## Evidence on Hand

- 关于页奖项与精选项目来自主人博客介绍和公开 GitHub，见 `src/content/config/site.config.json`、`src/content/pages/projects.json`
- 头像：`public/avatar.jpg`；图标：`public/favicon.svg`
- 友链数据当前为空：`src/content/pages/friends.json`
- 手记与部分文稿仍可能是模板遗留，不得当成主人经历对外宣称
- 没有客户证言、媒体报道或付费产品数据；后续工作不得捏造

## Product Principles

1. 先让陌生人在一屏内认识你，再展开手记和动态。
2. 主站是人，博客是文；入口清楚，不要抢戏。
3. 只展示主人认领过的事实：项目、奖项、联系方式。
4. 功能可以空着等内容，不要为了看起来热闹填别人的东西。
5. 本地才能改内容；线上访客只读。
