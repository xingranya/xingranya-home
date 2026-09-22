---
target: 首页
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/xingranya/Downloads/HTML5CSS/xingranya-home/src/pages/Home.tsx"
target_fingerprint: "sha256:afa2cae89c12dbe631ee671f31a15ba50210574d35ad58ca2324206b35ac09c4"
target_path: /Users/xingranya/Downloads/HTML5CSS/xingranya-home/src/pages/Home.tsx
timestamp: 2026-09-19T03-34-49Z
slug: src-pages-home-tsx
closed: true
---
# Critique: 首页 (`src/pages/Home.tsx`)

Method: dual-agent (A: 01a0b7b1-1dca-7ec1-8afe-9e042bf96088 · B: 01a0b7b1-1dcb-7002-8d6c-d4e5209140b1)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | 社交无常驻标签；在线点 hover 才出英文 `online`；搜索仅 ⌘K |
| 2 | Match System / Real World | 2 | 中英混排；「7 篇手记 / 运行 1362 天」像模板遗产 |
| 3 | User Control and Freedom | 3 | 导航始终在、博客新开正确；全局取消 outline、外链 5s 倒计时 |
| 4 | Consistency and Standards | 2 | 「博客」四处入口形态不同；双信封；页脚「动态手记」≠ 导航「手记/动态」 |
| 5 | Error Prevention | 2 | 双邮箱易点错；二维码未裁切；手记指标把访客导向模板日记 |
| 6 | Recognition Rather Than Recall | 2 | 9 个 icon-only；代表作要自己想到点「关于」 |
| 7 | Flexibility and Efficiency | n/a | Persuade/Experience 名片页，无重复专家任务 |
| 8 | Aesthetic and Minimalist Design | 3 | 纸与姓名克制；雨丝、9 图标、7 导航、半屏页脚抢像素 |
| 9 | Error Recovery | 2 | 首页几乎无错误态；二维码依赖外链图床，失败无占位 |
| 10 | Help and Documentation | n/a | 名片页不需要文档系统 |
| **Total** | | **18/32** | **Acceptable（56%）** |

## Design Specificity Verdict

**LLM：** 半成品粉笺名片。头像、樱花墨姓名、金句、微信/QQ 纸片是这个人的；`Hi, I'm` / `full-stack things`、7 槽对等导航、Jobs 英文 motto、表演型雨丝、把模板手记当人生预览，换皮即可变成别人的数字花园。产品成功标准「做过什么」不在首页。

**Deterministic scan：** CLI `impeccable detect --json` 对 8 个首页相关源文件 **exit 0 / 空数组**。浏览器注入 `detect.js` 后 **8** 条：low-contrast×5、extreme-negative-tracking×1、undersized-ui-text×1、skipped-heading×1。源码扫描漏掉了计算后的对比度与字号，overlay 补上了。

**Visual overlays：** Assessment B 在独立标签注入成功（port 8400，8 个 `.impeccable-overlay`）。live-server 已停止，叠加层不再常驻。

## Overall Impression

第一眼像递出粉笺：纸底、头像、姓名成立。读完第一屏仍不知道做过什么。最大机会：把 2–3 个认领过的项目放到身份区下面，把顶栏和社交从「频道墙」收成名片动作。

## What's Working

1. 头像圆裁 + MiSans 姓名 sakura-ink + 纸色，身份三拍清楚。
2. 博客外置正确：导航 ↗、公告「去博客」、社交地球均指向 blog.xran.uk，新开、不拦首页。
3. 微信/QQ 悬停出纸片二维码，不跳外链。

## Priority Issues

### [P1] 首页没有代表作
- **Why：** 主任务「做过什么」失败。精选项目锁在关于页。
- **Fix：** 身份区下收 2–3 个主人认领项目（名 + 一句 + 链接）。不要用模板手记充数。
- **Suggested command：** `$impeccable layout`

### [P1] 顶栏把频道与认识你等权，并预览模板人生
- **Why：** 7 项对等；hover 手记弹出模板日记；「7 篇手记」会当作成绩。
- **Fix：** 顶栏收敛为首页 / 博客 / 关于（至多再留一个内容入口）；指标改为真实或删掉。
- **Suggested command：** `$impeccable distill`

### [P1] 联系方式是 9 枚无标签图标，两只信封
- **Why：** 移动端无 tooltip；Email/Gmail 同图标。
- **Fix：** 主路径 GitHub / 博客 / 一个邮箱，其余进更多；热区 ≥44px。
- **Suggested command：** `$impeccable clarify`

### [P2] 弱对比、过小字、焦点被关掉
- **Why：** 指标 2.41:1；金句 4.47:1；全局 `outline: none !important`。
- **Fix：** 正文/指标 ≥4.5:1；恢复 sakura 焦点光晕。
- **Suggested command：** `$impeccable harden`

### [P2] 移动端公告截断、二维码溢出、热区过小
- **Why：** 390 宽公告 `line-clamp-1`；微信纸片超出视口；导航高 20px、社交 32px。
- **Fix：** 裁切二维码、防溢出、热区 44px、移动页脚降权。
- **Suggested command：** `$impeccable adapt`

## Persona Red Flags

**Jordan：** 5 秒内能读到星苒鸭，随后被 full-stack things 卡住；代表作不在屏上；点手记会碰到模板日记。

**Casey：** 顶栏热区 20px、社交 32px；微信 QR 右侧裁切；公告截成「技术长文请看…」；拇指区没有主 CTA。

**招聘/GitHub 访客：** 看不到仓库名与角色；GitHub 只是 9 图标之一；短停留结论像模板站。

## Minor Observations

- 技能胶囊粉闪标像未完成 CLI。
- 页脚 Jobs 句与「Powered by Rsbuild & React 19」抢走终局。
- Hero 初始 `opacity-0` 等 GSAP，减动效/无 JS 有空白风险。
- `enableSearch: true` 但首页无搜索按钮。
- 朋友功能保留正确，空名单 hover 像故障。
- Overlay：`h1` 后页脚 `h3` 跳级；技能胶囊字距 -0.07em；公告徽章 10.5px。

## Questions to Consider

- 若首页只允许三个动作，为什么不是 GitHub / 一篇代表作 / 去博客？
- 「7 篇手记」若不能代表主人，为什么印在姓名下面？
- `full-stack things` 是自嘲还是还没决定自己是谁？
