---
name: 星苒鸭 · xran.uk
description: 粉笺名片——克制出版气质的个人主页
colors:
  sakura: "#ffc0cb"
  sakura-ink: "#c43d61"
  sakura-fill: "#e05676"
  sakura-petal: "#ff8fa6"
  sakura-tint: "#ffe4ea"
  sakura-wash: "#fff5f7"
  paper: "#FDF6F8"
  paper-sheet: "#FDF8F9"
  paper-card: "rgba(255, 255, 255, 0.88)"
  paper-border: "rgba(255, 192, 203, 0.55)"
  ink: "#1E293B"
  ink-body: "#334155"
  ink-muted: "#64748B"
  ink-faint: "#94A3B8"
  paper-dark: "#0B111A"
  paper-dark-card: "rgba(18, 27, 44, 0.82)"
  paper-bright: "#FFFFFF"
  paper-dark-border: "#384E6C"
  ink-deep: "#0F172A"
  shade: "#000000"
  selection-text: "#C43D61"
  success: "#10B981"
  success-deep: "#059669"
  success-bright: "#34D399"
  warning: "#F59E0B"
  warning-bright: "#FBBF24"
  danger: "#EF4444"
  danger-deep: "#DC2626"
  danger-bright: "#F87171"
typography:
  display:
    fontFamily: "Newsreader, Source Han Serif SC, Noto Serif SC, Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Source Han Serif SC, Noto Serif SC, Georgia, serif"
    fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "MiSans, MiSans Normal, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.25rem, 3vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "MiSans, MiSans Normal, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.03rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.015em"
  label:
    fontFamily: "JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"
  caption:
    fontFamily: "JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.4
  ui:
    fontFamily: "MiSans, MiSans Normal, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
  small:
    fontFamily: "MiSans, MiSans Normal, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.65
  scale:
    md: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    "2xl": "1.5rem"
    "3xl": "1.875rem"
    hero: "2.2rem"
    display-max: "2.25rem"
rounded:
  xs: "3px"
  sm: "4px"
  DEFAULT: "5px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page-x: "16px"
components:
  button-primary:
    backgroundColor: "{colors.sakura-fill}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#F4728D"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  chip-filter:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  chip-filter-selected:
    backgroundColor: "{colors.sakura-wash}"
    textColor: "{colors.sakura-ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  card-paper:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "14px 16px"
  input:
    backgroundColor: "rgba(241, 245, 249, 0.8)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 32px 8px 36px"
    typography: "{typography.label}"
  nav-bar:
    backgroundColor: "rgba(255, 255, 255, 0.75)"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.DEFAULT}"
    padding: "4px"
---

# Design System: 星苒鸭 · xran.uk

## Overview

**Creative North Star: "粉笺名片"**

xran.uk 是一张放在 sakura 色信笺上的名片，不是作品集模板，也不是热闹的落地页。气质是克制出版：纸面安静、字距从容、强调色稀缺。陌生人先看见人，再看见代表作和联系方式。粉是气氛，不是主题公园。

密度偏低。首页身份区居中、留白多；手记和关于页是一整张温润纸板；列表卡片半透明、薄边、几乎贴着纸面。动效只做入场淡入与悬停微浮，背景雨丝和顶部柔光是环境，不是表演。控件小而准：主按钮少见，筛选和社交用细边胶囊或圆图标。

明确拒绝：天蓝/钴蓝强调色、图标里的鸭子、卡片或摘要上的粗一侧强调边、纸面上的装饰网格、硬投影和新拟态、把樱花粉铺成满屏主题色。本地后台 `/admin` 更密、更像工具，但色盘、圆角和深度语言与前台同一套粉笺，不另起蓝色控制台。

**Key Characteristics:**

- 粉笺气氛：纸色底 + 半透明白卡 + 淡粉细边
- 樱花粉稀缺：气氛用浅粉，声音用深粉，填色按钮极少
- 人用黑体、文用衬线：身份与 UI 是 MiSans，篇名与手记是 Newsreader
- 环境光不承重：静止几乎无影，悬停才浮 1.5px
- 五像素微倒角：默认 5px，不发圆、不尖锐
- 后台同纸：更密，但不是另一套世界

## Colors

单一强调色樱花粉，配中性纸与墨。没有第二套品牌色。在线状态的绿/琥珀/玫瑰只表示状态，不进入品牌盘。

### Primary

- **樱花粉** (`sakura`): 品牌气氛。纸边、选区、淡洗、图标圆角底。它是信笺的颜色，不是按钮的默认填充。
- **樱花墨** (`sakura-ink`): 名字、高亮角色、链接、选中筛选字色。这是粉笺上的「声音」。
- **樱花填** (`sakura-fill`): 少数实心动作（外链确认、后台主操作）。深色模式改用 `sakura-petal` 填、深墨字。
- **花瓣粉** (`sakura-petal`): 悬停边、焦点光晕、深色模式强调。
- **樱花洗** (`sakura-tint`, `sakura-wash`): 选区底、选中芯片底。大面积只用 wash，不用 fill。

### Neutral

- **粉笺纸** (`paper`): 页面底。深色对应 `paper-dark`。
- **出版纸板** (`paper-sheet`): 关于/手记/站点地图那张带微噪的纸。
- **名片卡** (`paper-card`): 半透明白，叠在纸上。深色对应 `paper-dark-card`。
- **粉边** (`paper-border`): 默认 1px 边。悬停可略加深到花瓣粉，仍保持细。
- **墨** (`ink`): 主文字。正文退到 `ink-body`，元信息用 `ink-muted` / `ink-faint`。
- **选区字** (`selection-text`): 选中文字，配 `sakura-tint` 底。
- **亮纸 / 深墨 / 阴影黑** (`paper-bright`, `ink-deep`, `shade`): 白底、投影墨、遮罩黑。不拿黑白当品牌色。
- **夜笺边** (`paper-dark-border`): 深色纸板描边。
- **成功 / 警告 / 危险** (`success`, `warning`, `danger`): 只表示状态（在线、草稿、删除），不进导航和身份。

### Named Rules

**The 樱花粉稀缺 Rule.** 浅粉负责气氛（边、洗、选区），深粉负责声音（姓名、链接）。实心粉按钮在一屏里应当稀少。禁止把 `sakura` 当背景主题色铺满。

**The 无第二品牌色 Rule.** 不引入天蓝、靛蓝或与樱花粉竞争的第二强调。语义色（成功绿、警告琥珀、危险红）只用于状态，不用于导航或身份。

## Typography

**Display Font:** Newsreader（回退 Source Han Serif SC / Noto Serif SC / Georgia）
**Body Font:** MiSans（回退系统黑体）
**Label/Mono Font:** JetBrains Mono（回退 Fira Code / ui-monospace）

**Character:** 黑体把人说清楚，衬线把文放在纸上。不是装饰性的「艺术字配对」，是出版分工：名片用无衬线，篇名和手记用衬线斜体点缀。

### Hierarchy

- **Display** (Newsreader Bold, 约 24–36px, 紧字距): 关于页、手记详情、站点地图的页标题。
- **Headline** (Newsreader Bold, 约 20–24px): 关于页分节、手记列表标题。
- **Title** (MiSans，首页身份行约 20–35px，姓名 Bold，问候 Light): 只用于「这是谁」。姓名与角色高亮用 `sakura-ink`，其余保持浅墨。
- **Body** (MiSans, 1.03rem, 行高 1.85, 字距 0.015em, 最大约 65ch): 正文与说明。摘要导言改 Newsreader italic，放在浅灰纸块里，不加侧栏描边。
- **Label** (JetBrains Mono, 11px / `0.6875rem`): 日期、计数、筛选、页脚技术行。10.5px 视为这一档。
- **Caption** (JetBrains Mono, 10px): 工具提示、二维码说明、键盘提示。不要再小到 9px。
- **UI** (MiSans, 12px / `0.75rem`): 按钮、导航、芯片、技能胶囊。这是控件默认字号。
- **Small** (MiSans, 14px / `0.875rem`): 次级说明、列表摘要。
- **Code** (JetBrains Mono, 13px / `0.8125rem`): 代码块；桌面可到 14px。

### Named Rules

**The 人用黑体、文用衬线 Rule.** 身份、导航、按钮、表单走 MiSans。页标题、手记标题、摘要斜体、页脚格言走 Newsreader。不要对调，也不要用系统展示字体顶替 Display。

## Layout

空间模型是「纸上的窄栏」，不是满宽仪表盘。水平内边距 `16 / 24 / 32px`（`px-4 sm:px-6 lg:px-8`）。容器：

- 手记栏 `720px`
- 阅读栏 `800px`
- 默认 `64rem`（约 1024px，`max-w-5xl`）
- 导航胶囊 `56rem`（`max-w-4xl`）居中
- 页脚与宽表 `1400px`

首页身份区垂直居中、短间距（`py-2` 到 `lg:py-0`）。列表卡片网格随断点加密，卡片内部 `14–16px`。整张纸板（关于、手记详情、站点地图）内边距 `24 / 40 / 48px`。后台更密：侧栏约 260px，内容区约 `38–42px` 内边距，但仍用同一套粉与圆角。

断点沿用 Tailwind：`640 / 768 / 1024 / 1280`。移动端导航横滑，筛选条可横向滚动；桌面端筛选换行居中。

## Elevation & Depth

混合：色阶分层为主，阴影只是环境光。卡片静止时阴影不透明度约 3%，几乎贴着粉笺。深度来自半透明白底、1px 粉边、纸与卡的明度差。悬停才把名片抬起 **1.5px**，阴影略加强，边色微粉。这是触感，不是 Material 的层级台阶。

整张出版纸板可以比卡片多一层内高光和更散的漫射，仍然是环境光，不是投影墙。浮层（搜索、外链确认、导航预览）才用较深的聚光阴影，因为它们离开了纸面。后台同样：表面靠色阶和细边，不用厚投影撑起「控制台」。

### Shadow Vocabulary

- **名片静止** (`0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px -2px rgba(15, 23, 42, 0.03)`): `.paper-card` 与列表卡默认。
- **名片悬停** (`0 4px 18px -4px rgba(15, 23, 42, 0.07), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`): 配合 `translateY(-1.5px)`。
- **出版纸板** (内高光 `inset 0 1px 0 rgba(255,255,255,0.95)` + 两层更散的漫射): `.paper-sheet-realistic`。
- **导航条** (`0 2px 10px -2px rgba(15, 23, 42, 0.06)`): 顶栏胶囊，轻，不压正文。
- **浮层** (`0 20px 50px -10px rgba(0, 0, 0, 0.15)`): 模态、下拉、二维码气泡。

### Named Rules

**The 环境光不承重 Rule.** 阴影不是结构。静止贴纸；悬停浮 1.5px。禁止硬偏移阴影、彩色霓虹投影、为了「高级」加厚的 rest-state 阴影。

## Shapes

默认圆角 **5px**（`rounded` DEFAULT）：精致平直微倒角，不发圆、不尖锐。小控件 3–4px，筛选/输入 6px，下拉与二维码气泡 8–12px。圆形只留给头像、社交图标按钮、在线状态点。不要把卡片或主按钮做成胶囊。

边是 1px、低对比、偏粉或浅石板。纸板带极淡的 SVG 噪点（透明度约 0.04），**没有**装饰性网格线。网站图标是主人二次元头像的圆角裁切（32px 倒角），不要鸭子、不要几何替身。

Markdown 提示块（Callout）允许 **2px 左侧规则线**，因为那是训诫/引用语法，不是卡片装饰。摘要、奖项、项目卡禁止一侧粗强调边。

### Named Rules

**The 五像素微倒角 Rule.** 默认 5px。全面圆角或直角块都算跑调。圆形只用于人像与图标按钮。

**The 禁侧栏描边 Rule.** 不要给摘要、奖项、列表卡加 3px 左侧强调条。训诫 Callout 的 2px 左线是唯一例外。

## Components

整体气质：**克制触感**。小而准；主按钮用深粉填色；卡片像名片轻轻浮起；输入框平时安静，焦点才露粉。

### Buttons

- **Shape:** 小圆角（4px），字号约 12px，内边距约 `6px 14px`。
- **Primary:** `sakura-fill` 底、白字。悬停变亮一级，按下回到 `sakura-ink`。一屏里极少出现。
- **Ghost / 取消:** 透明底、`ink-muted` 字，悬停浅石板底。无边或极淡边。
- **Hover / Focus:** 颜色过渡约 0.2s。焦点用樱花粉光晕（约 1–3px），不要靠浏览器默认黑框，也不要取消所有可见焦点。

### Chips

- **筛选默认:** 半透明白、浅石板边、12px 无衬线。
- **筛选选中:** `sakura-wash` 底、`sakura-ink` 字、浅粉边。计数用更小的 mono 胶囊。
- **社交芯片（关于页）:** 同默认芯片，mono 字 + 16px 图标。微信/QQ 悬停出二维码纸片，不跳外链。
- **技能胶囊:** 浅粉洗 + 粉边，放在首页身份行，不是导航。

### Cards / Containers

- **Corner Style:** 5px 微倒角。
- **Background:** `paper-card`；悬停更不透明。
- **Shadow Strategy:** 见 Elevation；悬停浮 1.5px，边微粉。
- **Border:** 1px `paper-border` 或浅石板 70% 透明。
- **Internal Padding:** 列表卡约 14–16px；出版纸板 24–48px。
- **封面卡:** 16:9 顶图，悬停图微缩放（约 1.02），不要闪白或放大阴影到浮层级别。

### Inputs / Fields

- **Style:** 浅石板洗底、6px 圆角、12px 字、左图标右清除。
- **Focus:** 边转到 `sakura-petal`，底变白，1px 花瓣粉光晕。
- **Error / Disabled:** 后台可用语义红/降低不透明度；前台搜索无独立错误态。

### Navigation

- **Style:** 居中胶囊，半透明白 + 模糊 + 细边 + 环境光。项内边距 `4px 10px`，4px 圆角。
- **Default:** `ink-body`，无图标。
- **Hover:** 浅石板洗，字加深。
- **Active:** 内嵌更实的小白卡（细边 + 极轻阴影）+ 16px 图标。外链项加小箭头，不显示选中卡。
- **Mobile:** 胶囊可横滑；详情页下滚隐藏、上滚唤出（约 300ms）。
- **预览:** 手记/归档等可下拉出版纸片，阴影走浮层级。

### Paper Sheet（签名表面）

关于、手记详情、站点地图用整张 `.paper-sheet-realistic`：微噪纸纹、粉细边、5px 倒角、内高光。这是「打开的信笺」，不是卡片网格。摘要用浅灰衬线斜体块，不加侧栏描边。

### Social Icon（签名控件）

首页联系是 32–34px 圆按钮，石板图标，悬停浅底。有二维码的项弹出 176px 白纸片，而不是跳转。不要把社交做成彩色品牌按钮墙。

### Admin Console

同一套粉笺语言，密度更高：侧栏、表格、顶栏。强调色绑定 `sakura-fill` / 深色 `sakura-petal`。可以更密、更像工具，但不能回到蓝色控件台，也不能给行项目加一侧粗边。

## Do's and Don'ts

### Do:

- **Do** 把页面当成粉笺上的名片：先人，再作品与联系方式。
- **Do** 用浅粉做边和洗，用 `sakura-ink` 做姓名与链接。
- **Do** 默认 5px 微倒角、1px 细边、半透明白卡。
- **Do** 悬停只浮 1.5px，阴影保持环境光。
- **Do** 身份用 MiSans，篇名与手记用 Newsreader，元信息用 JetBrains Mono。
- **Do** 焦点给出可见的樱花粉光晕。
- **Do** 让 `/admin` 更密，但沿用同一色盘与圆角。

### Don't:

- **Don't** 用天蓝、钴蓝或靛蓝当强调色。
- **Don't** 在网站图标或品牌图形里画鸭子。
- **Don't** 给摘要、奖项、项目卡加粗一侧强调边。
- **Don't** 把 `sakura` 铺成满屏背景或大色块主题。
- **Don't** 使用硬偏移阴影、新拟态或厚 rest-state 投影。
- **Don't** 给纸板加装饰性网格线。
- **Don't** 把按钮和卡片做成全圆胶囊（头像与社交圆标除外）。
- **Don't** 把后台做成另一套蓝色控制台。
- **Don't** 用系统展示字体或装饰艺术字替换 Newsreader / MiSans。
