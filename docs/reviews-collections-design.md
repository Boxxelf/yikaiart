# Reviews & Collections — design proposal

日期：2026-09-20。状态：已按确认方案完成本地搭建；增加 10 张用户提供的档案照片。未发布线上站点。

## 1. 内容依据与定位

- [Reviews and Accolades](https://yikaistudio.com/reviews/)：核对到 13 条署名评论，跨越 1987—2015 年，其中 9 条英文、4 条中文。它们包括评论、展览相关文字及个人评价，不能一概标成媒体刊发的报道。
- [Notable Collections](https://yikaistudio.com/collections/)：核对到 16 项收藏记录，包含作品、媒介、尺寸、收藏者及地点；源页面中存在 16 个对应作品图片元素，图片可用性和画面对应需在实施时逐项验证。
- 新的 Collections 页面展示收藏去向。Works 现有六组创作分类继续称为 Series；两类数据分别维护。
- 前台采用英文。中文来源整理为英文摘要，明确标注译写性质；摘要不加引号，不冒充作者逐字原话。
- 内容出处保留为以上参考页，评论署名中的机构属于来源列出的身份信息，不自动视为刊发媒体或现任职务。

## 2. 与现有网站共享的视觉基础

| 项目 | 沿用规范 |
| --- | --- |
| 页面底色 | `#FCFAF5`，与 Works / Memories 一致 |
| 纸页底色 | `#F3EADB`，呼应 About 的书籍与纸张 |
| 正文 | `#181613` |
| 次要信息 | `#625D55` |
| 分隔线 | `#D7D0C5` |
| 强调色 | `#B94132`，用于标题句点、选中项和少量交互状态 |
| 标题与阅读文字 | 现有 Source Serif 4 |
| 导航与信息标签 | 现有 Instrument Sans |
| 页边距 | 复用 `--edge: clamp(24px, 4.2vw, 80px)` |
| 文字尺度 | 桌面页标题约 64–80px；手机约 44–52px；长文 17–18px、行高约 1.75 |

两页继续使用 YIKAI. 标识、导航下划线、浅色大图/阅读面板以及相同的返回与关闭操作。整体通过纸张、作品本身和留白形成联系；动效负责解释选中、展开和返回。

## 3. Reviews：评论纸页

### 页面构图

居中标题 `Reviews.`，副标题建议为 `Perspectives on a life in painting.`。主要区域是一张正在阅读的评论纸页，后面露出两张轻微错位的纸边。左侧为年份与作者索引；右侧保留呼吸空间与当前位置提示。

```text
YIKAI.                 Works  Collections  Reviews  Memories  About

                              Reviews.
                  Perspectives on a life in painting.

2015  作者 A             ┌──────────────────────────────┐
      作者 B             │                              │
      作者 C             │  精选短引文 / 英文摘要         │
2014  作者 D             │                              │
1999  作者 E             │  作者姓名                     │
      ……                │  来源所列身份 · 年份           │
                         │  Read perspective             │
                         └──────────────────────────────┘
                                  ←  01 / 13  →
```

建议优先展示 David Pagel 的 2015 年条目，以作品讨论进入页面。其余条目按时间倒序组织。同一年内的次序在内容整理时固定，避免每次进入发生变化。

### 阅读与交互

- 点击作者，或使用前后箭头，切换到对应纸页；翻页动效约 400–500ms，仅轻微平移与旋转。
- 纸页中显示简短、可读的内容；篇幅长的条目通过 `Read perspective` 打开阅读面板。
- 阅读面板复用 About 的排版逻辑：舒适行宽、作者与年份、英文摘要及来源入口。逐字短引文和编辑摘要使用不同标记。
- 初版以一条精选短引文和各条独立摘要组织信息；来源入口允许访客核对原文。后续如补充原稿，可按明确的文本来源完善阅读内容。
- 大段文字始终是可选择的 HTML；纸页厚度与阴影只负责外观。
- 手机采用单张纸页、作者选择器及前后按钮；阅读面板占满可用屏幕，关闭后恢复原来的条目和焦点。
- 支持直达链接 `/reviews?review=<id>`，链接刷新后仍回到指定条目。

### 评论清单

以下仅列署名与年份，正文整理时逐项对应来源。

| 署名 | 年份 |
| --- | --- |
| Tammi J Schneider | 2015 |
| 金董建平 | 2015 |
| David Pagel | 2015 |
| Andi Campognone | 2014 |
| Robert D. Jacobson | 1999 |
| Mary Abbe | 1999 |
| Ruth Stevens Appelhof | 1996 |
| Dolly Fiterman | 1996 |
| Stewart Turnquist | 1996 |
| Susan Tai | 1992 |
| 顏水龍 | 1989 |
| 莫言 | 1988 |
| 刘海栗（原站写法，待核对） | 1987 |

## 4. Collections：收藏展厅

### 页面构图

居中标题 `Collections.`，副标题建议为 `Selected public and private collections.`。首屏以一件来源对应清晰的作品作为主要画面，旁边排收藏者、地点及作品标签；下方展开完整的收藏目录。

```text
YIKAI.                 Works  Collections  Reviews  Memories  About

                            Collections.
                Selected public and private collections.

             大幅原比例作品             收藏机构 / 收藏者
                                        城市、地区
                                        作品名称
                                        媒介、尺寸
                                        View work

All   Museums & Universities   Galleries   Corporate & Hospitality   Private

       作品 A                            作品 B
       收藏者 / 地点                     收藏者 / 地点
       作品名称                          作品名称

       …… 共 16 项收藏记录 ……
```

目录采用桌面两列、手机单列。横幅、竖幅和多联画保持各自比例；每行利用留白对齐说明，不把作品裁成统一缩略图。作品标签与 Works 详情页保持同样的字体、信息顺序与单位表达。

### 交互与内容规则

- 主目录按收藏者类型筛选；每条记录的分组需要根据明确的收藏者身份确定。
- 作品可点击放大。浅色面板内完整展示作品、媒介、尺寸、收藏者、所在地及来源入口，并支持上一件/下一件。
- 如作品确实与现有 Works 条目对应，核对画面、名称及尺寸后加入站内链接；相似标题不能作为自动合并依据。
- 来源缺少年份、材质细节或尺寸时留空，不推断补齐。
- 同名作品但收藏者不同的记录保持独立。
- 机构与地点按来源记录呈现，不宣称作品目前公开展出。
- 手机筛选控件允许换行或紧凑选择，作品图片优先占据宽度，收藏信息紧跟图片。
- 支持直达链接 `/collections?collection=<id>`。

### 收藏作品清单

以下标题来自参考页，实施时保留原始字段，再制作规范显示标题。

| 序号 | 来源作品标题 |
| --- | --- |
| 01 | AI & Tech in the City |
| 02 | Love, Family and People |
| 03 | Words Mixture in Red, White & Blue |
| 04 | Red, Yellow and Blue Mask Ladies |
| 05 | Circuit World #2 |
| 06 | Untitled |
| 07 | Time and Yin & Yang #8 |
| 08 | Words with Yin Yang |
| 09 | Village of Miao |
| 10 | Earth and Water with Ying Yang |
| 11 | Symbolic Impression of America |
| 12 | Words with Ying Yang |
| 13 | Monk Before Temple |
| 14 | Forever |
| 15 | Mother and Baby |
| 16 | Calligraphy |

## 5. 内容核对事项

- 评论页少数英文文字存在拼写问题；摘引、摘要和显示姓名分别处理，原始记录保留用于核对。
- 中文署名的正式英文拼写需要依据可靠来源核实，不能直接猜写；年份保留来源注明的评论年份。
- 收藏页一处英寸与括号内厘米数值不相符。初版只采用核实过的尺寸表达，不将冲突值并列发布，也不悄悄改写来源记录。
- 原站对部分机构、画廊和作品名称存在写法差异。显示用名称与来源原文分开存储。
- 个人姓名后列有学校或机构时，先核对其关系，不能直接把该机构写成作品拥有者。
- 原站图像逐项检查清晰度、完整性、多联画结构和说明对应关系；缺图时保留可阅读的收藏记录，使用真实素材补齐。

## 6. 导航与实施结构

建议桌面导航顺序：`Works / Collections / Reviews / Memories / About`。
手机新增统一的 `Menu` 入口，展开完整五项导航，避免压缩成过小链接。

拟新增文件：

- `src/pages/ReviewsPage.tsx`
- `src/pages/CollectionsPage.tsx`
- `src/content/reviews.ts` 与对应数据文件
- `src/content/holdings.ts` 与对应数据文件；避免与现有 Series 数据的 `collections.ts` 混淆
- `src/components/ReviewReader.tsx`
- `src/components/CollectionDetail.tsx`
- 两页独立样式文件与经核对的图片目录

复用既有颜色、字体、弹窗焦点管理、路由参数及减少动态效果设置。新增两条静态深链接，并将实际使用的图片纳入当前构建资源清单。

实施次序：内容与图像核对 → 两页静态版式 → 阅读/大图面板 → 切换动效 → 导航和手机适配 → 验证。

## 7. 验收清单

- 13 条评论、16 项收藏记录均有稳定 ID、可访问入口及来源对应。
- 前台英文；摘要、译写和逐字短引文不会混淆。
- 新的 Collections 与现有六个 Series 含义清楚。
- 图片保持完整比例；收藏关系、姓名与尺寸不靠猜测补齐。
- 评论切换、收藏筛选、放大、关闭、前后切换及深链接正常。
- 手机菜单、触控、键盘操作、焦点恢复和减少动态效果设置正常。
- 保持 Works、About、Memories 的已完成功能。
- 完成桌面/手机视觉检查、生产构建和相关回归测试。

## 8. 实施补充

已新增 `/reviews`、`/collections`，统一五项导航和手机菜单。Reviews 收录 13 位署名者的英文摘要与原文入口；Collections 包含 16 项收藏记录和 10 张新增档案照片。所有图像按原比例显示，支持大图、缩放、前后切换和直达链接。

新增照片逐张英文介绍见 [collection-additional-photos.md](collection-additional-photos.md)。已检查相应扫描内容；不把档案照片自动作为收藏关系证明。

姓名核对来源：[Alice King / Alisan Fine Arts](https://www.alisan.com.hk/en/about)、[Yen Shui-Long / National Taiwan Museum of Fine Arts](https://www.ntmofa.gov.tw/en/News_timeline.aspx?n=1580&sms=11480)、[Liu Haisu / National Art Museum of China](https://www.namoc.org/zgmsgen/History/history.shtml)。来源尺寸存在冲突的作品仅保留英寸值；Jill Martin 按个人收藏记录呈现。

验证记录：生产构建通过；26 条记录、52 张新图像的构建校验通过。23 项浏览器测试均已验证通过（完整回归 21 项通过，手机菜单语义问题修复后单项复测通过；开场动画测试因并行测试输出目录冲突单独复测通过）。桌面及 390px 手机视觉检查完成，320px 阅读器无横向溢出。新增页面、阅读器和手机菜单的 axe 检查通过。
