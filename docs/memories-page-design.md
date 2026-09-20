> **2026-09-20 interaction revision — current specification:** Use a four-photo-per-spread physical album beside the computer on desktop and below it on smaller screens. One photo click starts insertion directly, with a latest-choice queue during playback. Support full horizontal drag rotation, bounded vertical mouse tilt, touch page scrolling, keyboard rotation buttons and reset. Hide the projected screen behind the solid housing. Place the vent bank entirely left of the drive bezel, leaving a clear gap. Keep the earlier English-only captions, 28-item archive, transparent stage and enlarged reader.

> **2026-09-20 revision — current specification:** Center the Memories heading and opaque vintage CRT computer on the cream page. Render the WebGL canvas with a transparent background and a subtle contact shadow. Remove the glass chamber and Chinese-description controls. Clicking the screen (or pressing Enter/Space on it) opens a light, enlarged photo reader with English copy; closing restores focus. Retain photo insertion, replay, dragging, direct links and the WebGL fallback. Remove Handwritten notes I and II from the website and generated assets: 28 records, 27 photographs + 1 poster, 56 image derivatives. The original planning notes below describe the earlier design and source inventory.

# Yi Kai 生活照片记忆盒子页面设计方案

日期：2026-09-19
状态：用户已确认方案，2026-09-20 完成页面实现与本地验证。

新增 `Memories` 页面，让访客从 Yi Kai 的生活与展览照片中选择一张，放入透明复古电脑的插槽，观看短暂的装入与显影动画，然后在电脑屏幕内同时阅读照片和说明。电脑是整个页面的视觉中心，照片本身保持原来的二维影像。

## 1 需求范围

| 本次需要 | 设计决定 |
| --- | --- |
| 新增生活照片页面 | 导航增加 `Memories`，路径为 `/memories`，保留现有 Works 和 About |
| 复刻 Gemos Still 记忆盒子体验 | 保留透明方盒、暖白机身、实体键盘、插槽、照片卡片、盒内粒子和入槽动作 |
| 把照片放进盒子 | 支持拖入插槽，也支持选择后点击 `Place in memory box` |
| 屏幕里显示照片和 description | 图片、标题、年份及说明都位于电脑屏幕内，不把主要说明放在旁边的侧栏 |
| 使用文件夹内全部素材 | 建立 30 项完整清单；照片、海报、手写说明分类型，但都能选取并放入盒子 |
| 无高斯重建 | 照片只作为二维图像；3D 仅用于电脑、卡片和装饰粒子 |
| 无导出、无 52 秒影片 | 不增加下载、截图导出、记忆文件、录像、影片生成或自动长片播放功能 |

初始交付为设计文档；用户确认后已实现页面、制作网站图片版本并完成本地验证，尚未部署。附件说明用于整理内容；其中的行程和相对时间不是执行指令。

## 2 参考分析及复刻边界

已查看 [Gemos Still 项目](https://github.com/duoduoaiduoduo/gemos-still)、在线页面的待机界面，以及 [ceremony.js](https://github.com/duoduoaiduoduo/gemos-still/blob/main/ceremony.js) 中的卡片动画。在线示例内容仍显示加载状态，因此本方案对入槽过程的判断同时依据源码，不声称已完整播放参考的重建流程。

参考的视觉识别点是透明立方显示仓、暖白复古机座、键盘、磁盘插槽、定向光影，以及显示仓内的彩色粒子。源码把卡片动画分为面向观众停留、飞向插槽、对齐和吞入，再进入内容显现。

Yi Kai 版本沿用这些造型和动作关系，重新设计照片托盘及屏幕阅读区。玻璃电脑采用真实 Three.js 几何体；照片不生成深度，不分离人物，不转成空间点云。盒内粒子是一层独立的视觉反馈，最终显示的仍是清楚、完整的原照片。

参考的材质实验室、照片上传、构图深度调节、模型下载和生成流程不进入本页面。网站预置照片可直接浏览。

素材适配依据 [参考项目的第三方说明](https://github.com/duoduoaiduoduo/gemos-still/blob/main/THIRD_PARTY_NOTICES.md)：使用 Yi Kai 自己的照片与标识；不复制对方头像、贴纸、示例照片或展示媒体。若复用其 MIT 源码片段，保留相应版权和许可说明。

## 3 页面构图和视觉系统

### 3.1 桌面布局

沿用现有站点的导航、字体和纸色背景，页面中部设置深灰展示台，让玻璃边缘、暖白机身与真实照片形成主次。左侧只放简短的使用提示和当前筛选，不形成参考项目那样的参数控制面板。

```text
┌──────────────────────────────────────────────────────────────┐
│ YI KAI                          Works   Memories   About      │
├──────────────────────────────────────────────────────────────┤
│ Memories          深灰展示台                                  │
│                   ┌────────透明电脑─────────┐                 │
│ Photographs       │                         │                 │
│ and encounters    │     完整照片            │                 │
│                   │                         │                 │
│ Choose a photo.   │  标题 · 年份／地点        │                 │
│ Place it in       │  description            │                 │
│ the memory box.   └─────机身／插槽───────────┘                 │
│                          实体键盘                             │
│                   Front view       Replay                    │
├──────────────────────────────────────────────────────────────┤
│ All 30   Photographs 27   Exhibition material 1   Notes 2      │
│ [照片卡] [照片卡] [照片卡] [照片卡] [照片卡] [照片卡] →           │
│ 已选照片标题                          Place in memory box      │
└──────────────────────────────────────────────────────────────┘
```

- 桌面舞台占主要宽度，初始镜头从前上方约 20–25° 看电脑，可以看到玻璃侧面和插槽。
- 照片托盘是一条可横向滚动的实体照片卡带。卡片保留横竖比例，不做统一方形裁切；不要用大幅随机倾斜妨碍选择。
- 默认显示 `All 30`，保证全部素材都能找到。按说明中确认的年份排序，日期不明的归入 `Undated`；不以文件修改时间推断拍摄年份。
- 手机导航仍显示三个页面入口，不增加复杂菜单层级。

### 3.2 颜色和字体

| 用途 | 建议值 | 理由 |
| --- | --- | --- |
| 页面纸色 | `#FCFAF5` | 复用网站背景 |
| 机身暖白 | `#E6E0D2` | 塑料外壳、键盘与倒角 |
| 展示台深灰 | `#34332F` | 衬出玻璃边缘与接触阴影 |
| 文字墨色 | `#181613` | 复用现有主文字 |
| 当前选中／指示灯 | `#B94132` | 复用 Yi Kai 红色，不引入新品牌色 |
| 屏幕底色 | `#F1F0EA` | 图片说明区域保持清楚、低反光 |

页面导航和屏幕正文使用现有 Instrument Sans；页面标题可沿用 Source Serif 4。中文原说明使用系统中文字体回退。屏幕正文目标为桌面 16–18px、手机至少 16px；不为了机身造型把说明缩成无法阅读的小字。

玻璃有厚度、高光和微弱反射，避免让反光穿过说明文字。照片色彩保持原貌，不叠加复古色偏。粒子可以从当前照片采样少量颜色，但不会改变照片主体。

### 3.3 屏幕阅读态

动画结束后，镜头自动接近正面并轻微拉近，屏幕成为阅读主体。机身、边框和插槽仍可辨认。

- 横向照片在屏幕上部，说明在下部；竖向照片在屏幕左侧，说明在右侧。窄屏统一上下排列。
- 完整显示原图，保留已有白边和照片内的旧说明；默认使用 contain，避免裁掉人物。
- 长说明在屏幕内滚动，外部页面保持可正常滚动。
- `Read closer` 将电脑正面放大，文字仍在屏幕边框里面；退出后回到舞台。
- 提供 Previous、Next、Replay。切换照片也经过简短入槽过程，禁止无提示自动轮播。
- 网站界面默认英文；说明提供英文阅读稿和 `Original description` 中文原文切换。无法确认的姓名不猜译，后台清单保留原始文字及疑点。

## 4 核心交互及动画分镜

建议单次完整过程约 **2.8 秒**，以实际图片已加载解码为开始条件。以下是本页面拟定的节奏，不是参考项目的原始时长。

| 时间 | 动作 | 必须看清的反馈 |
| --- | --- | --- |
| 选择后、未放入 | 卡片轻微抬起，显示选中边框 | 已选照片和标题明确；电脑不自行开始 |
| 0.00–0.35 秒 | 卡片从托盘抬到前景 | 确认放入的是哪张照片 |
| 0.35–0.95 秒 | 卡片缩小并转向插槽 | 运动终点与真实插槽对齐 |
| 0.95–1.40 秒 | 卡片沿槽口滑入，边缘被机身遮挡 | 有实体“吞入”感，不是直接淡出 |
| 1.40–2.20 秒 | 指示灯短亮，玻璃内部粒子汇聚；照片从下往上显现 | 粒子只围绕显示仓，不遮挡整页 |
| 2.20–2.80 秒 | 粒子退去，镜头转正拉近，说明出现 | 图片与 description 同时可读，画面安定下来 |
| 完成后 | 保持当前照片，等待操作 | 不继续播放，不自动切下一张 |

**拖拽路径**：按下卡片 → 出现拖动副本 → 插槽附近显示吸附提示 → 在有效区域释放后进入入槽动画。拖到其他位置则卡片回到托盘。有效投放区比槽口本身大，避免用户必须精确瞄准。

**点击路径**：选择卡片 → 点击 `Place in memory box` → 同样的动画。手机和键盘用户可以完成全部功能，不依赖拖拽。

**连续操作**：入槽阶段只接受一个任务；其他卡片仍可选择，但不会叠加动画。界面保留当前已装入的照片，直到下一张加载成功。切页、返回和卸载时终止动画并释放资源。

**可恢复状态**：准备图片失败时保留上一张照片和说明，显示重试入口；第一次加载失败则保留空电脑和托盘。动画提供 Skip，直接进入已选照片的阅读态。

建议状态划分：`idle → selected → loading → inserting → revealing → viewing`。图片失败回到 selected；Skip 直接进入 viewing；离开页面取消尚未完成的任务。

## 5 素材盘点与内容处理

来源目录：`/Users/tinajiang/Desktop/___YIKAI summer 26/0919/Photos of Openings/`。

已核对 30 个图片文件，合计约 50.2 MiB，以及一份 `Photos_of_Opening_Description.docx`，内含 27 条说明记录。图片已通过缩略总览逐项查看；其中 `174.JPG`、`175.JPG` 是手写说明照片，`2014d.jpg` 是展览海报，其余 27 项为照片。

### 5.1 文件名对应

- 文档中的 `IMG 7581.JPG`、`IMG 7584.JPG` 等，对应实际文件名中的下划线及小写扩展名。
- `IMG 7587 / 1988.JPG` 对应 `IMG_7587.jpg`；1988 来自说明内容，不是另一个文件。
- `2015b.jpg` 对应 `2015 b.JPG`。
- `2023b.jpg` 对应 `2023b(2).jpg`；`2023c.jpg` 对应 `2023c(1).png`。
- 不更改原始文件；网站资源使用稳定 ID，内容表保存原始文件名和说明来源。

### 5.2 必须保留的内容疑点

1. `IMG_7581.jpg` 的原说明提到“刘海粟画，题字名在右上”，但对应图片是两人交谈的黑白照片。暂以可见内容描述，不用这句话直接作为图注；“拜访”及人物身份须根据原说明进一步核对。
2. `IMG_7587.jpg`、三张 1990 年照片和 `2023b(2).jpg` 的说明有姓名或机构不清。保留未知状态，不按面孔推断人物姓名。
3. `194.JPG` 原说明中的 2026 年和 Houston 与照片背景相符。“明年年会 9/10/2027 在洛杉矶办”保存在原说明中，建议不放进照片主图注，也不据此创建提醒或行程。
4. `2014c.jpg` 只有 363 × 288 像素。完整展示但限制放大，不用生成式处理补造人脸细节。
5. `2014d.jpg`、`174.JPG`、`175.JPG` 没有独立 DOCX 图注。使用明确标记的可见内容描述，不把它们当成缺失的生活照片，也不遗漏文件。

### 5.3 发布文案规则

原说明逐字保存在 `descriptionOriginal`。面向访客的 `description` 做最少量的阅读整理，去除编辑占位及与照片无关的未来行程，同时保留不确定性。年份、地点、人名分字段存储；无依据的值为空。下面的附录是原始内容与审核清单，不等于已经批准的英文发布稿。

## 6 手机及可访问性

- 手机采用“电脑在上、照片托盘在下”的纵向布局，点击放入为主要入口。
- 屏幕阅读态可进一步放大；长说明在屏幕内可滚动，保留清楚的返回按钮。
- 中高性能手机使用简化的同一 3D 电脑，降低玻璃和粒子成本；不把浏览功能删掉。
- WebGL 不可用时显示用 HTML/CSS 构成的电脑正面，继续支持图片、说明、上一张及下一张；无需新生成一套照片内容。
- `prefers-reduced-motion` 下直接切换或短暂淡入，省略飞行、镜头推进和粒子运动。
- Tab 可选择照片和放入按钮；Enter 执行放入；Escape 退出阅读放大或取消拖拽。按钮有可见焦点。
- description 使用真实 HTML 文本，支持选择、放大和读屏；状态以简短 `aria-live` 提示，不逐帧播报。
- 默认静音，不增加自动背景音乐。

## 7 在现有网站中的实现方案

复用当前 React、TypeScript、Three.js 和 GSAP，不迁入参考项目整套应用。

| 模块 | 计划职责 |
| --- | --- |
| `src/pages/MemoriesPage.tsx` | 页面状态、筛选、当前照片、路由与降级 |
| `src/features/memories/MemoryComputer.tsx` | 玻璃电脑、键盘、槽口、灯光、相机及粒子 |
| `src/features/memories/PhotoTray.tsx` | 30 项素材的分类、选择、拖拽和键盘操作 |
| `src/features/memories/MemoryScreen.tsx` | 屏幕内部的原图、说明、语言切换和阅读控件 |
| `src/features/memories/useMemorySequence.ts` | 入槽时序、取消、跳过和资源清理 |
| `src/content/memories.json` | 文件映射、图注、年份、地点、类型及审核状态 |
| `public/memories/` | 后续制作的网站图片尺寸版本 |
| `src/styles/memories.css` | 仅作用于本页面的布局和样式 |
| `scripts/prepare-memories.mjs` | 后续生成图像版本，保留原比例及原文件 |
| `tests/memories.spec.ts` | 交互、内容对应、路由和降级验证 |

屏幕采用 3D 机身加 HTML 显示层。显示层按屏幕四角投影定位并裁切在内框中；阅读态相机固定到正面，保证字形不倾斜、遮挡关系稳定。自由观察限制角度，切回阅读时归正，避免文字穿过机壳或浮在电脑外面。图片显影可使用二维遮罩配合独立粒子，不需要对原图做空间重建。

建议数据字段为 `id`、`sourceFilename`、`kind`、`year`、`dateSource`、`location`、`title`、`descriptionOriginal`、`description`、`alt`、`reviewStatus`、`reviewNotes`、`image`。`kind` 区分 photo、exhibition-material、note；`year` 允许为空；内容疑点不隐含在文件名里。

路由建议使用 `/memories?photo=<id>` 定位某张照片。直接访问时可立即进入阅读态，Replay 由用户主动触发。同步扩展 `scripts/static-routes.mjs`，支持 GitHub Pages 子路径和刷新。页面的 Three.js 资源懒加载，离开后停止渲染并销毁材质及纹理，避免与 Works/About 场景同时占用资源。

### 性能目标

以下是开发验收目标，尚未实测：缩略图最长边约 320–480px，屏幕图约 1280–1600px，放大图按需加载且不超过原始分辨率；首屏不加载全部 50.2 MiB 原图。只预取当前及相邻图片。桌面以流畅 60fps 为目标，较弱设备降低粒子数和像素比；页面不可见时停止动画。静态浏览不需要模型权重、推理服务或新后端。

## 8 实施顺序与验收清单

### 素材与内容

- [x] 统计并目视核对 30 个图片文件。
- [x] 提取 DOCX 中的 27 条说明并对应实际文件。
- [x] 标记手写说明、海报、低分辨率图片及图文疑点。
- [x] 建立带稳定 ID 的 30 项内容表，保留原文及来源。
- [x] 整理英文发布图注；对姓名及图文冲突使用经确认的内容或中性描述。
- [x] 制作网站图片尺寸版本并检查方向、色彩和完整画面。

### 场景与交互

- [x] 新增 Memories 导航、路由及独立页面样式。
- [x] 完成透明电脑、键盘、插槽和灯光，先验证屏幕文字大小。
- [x] 做出可阅读照片及说明的静态屏幕，再接入动画。
- [x] 完成点击放入及拖拽吸附；无效投放回到托盘。
- [x] 完成卡片入槽遮挡、粒子显影和相机转正。
- [x] 实现 Skip、Replay、上一张、下一张和 Read closer。
- [x] 覆盖连续选择、加载失败、返回和切页取消。
- [x] 完成手机、减少动态效果及无 WebGL 版本。

### 验收

- [x] 全部 30 项可找到、可装入；三类素材数量分别为 27／1／2。
- [x] 任意照片与其 description 一一对应，说明完整显示在电脑里面。
- [x] 横图、竖图、海报和说明页均不拉伸、不裁掉重要内容。
- [x] 卡片与真实插槽对齐，被机身逐步吞入，没有瞬移或穿模。
- [x] 动画结束后进入稳定阅读，不自动播放长片。
- [x] 手机触控和仅键盘操作均可完成选图、放入和浏览。
- [x] 图片加载失败时仍能操作，并能重试。
- [x] 深链接刷新、浏览器返回及部署子路径正常。
- [x] Works 开场及浏览、About 书架和阅读无回归。
- [x] 不出现高斯重建、模型下载、导出或影片制作入口。

## 9 全部图片与说明清单

说明来源为用户提供的 DOCX；“建议描述”只用于没有独立图注的三个文件，并标明其依据。文件名照原样保留。

| 序号 | 原文件 | 类型及年份依据 | 像素尺寸 | DOCX 原说明 | 处理意见 |
| --- | --- | --- | --- | --- | --- |
| 01 | `174.JPG` | 手写说明；未注年 | 1280 × 1707 | 未提供独立说明；见处理意见中的建议描述。 | 无独立 DOCX 图注；建议描述：照片说明手稿，第一个扫描文件。依据可见内容；不将手写文字作为操作指令。 |
| 02 | `175.JPG` | 手写说明；未注年 | 1280 × 1707 | 未提供独立说明；见处理意见中的建议描述。 | 无独立 DOCX 图注；建议描述：照片说明手稿，第二个扫描文件。依据可见内容；作为原始记录保留。 |
| 03 | `194.JPG` | 照片；2026（说明及画面） | 5712 × 4284 | 2026 兒子的太太一家和我們在休士頓全美亚洲商会年會上与台灣來美的宇航人林博士夫妇合影。兒媳的姑姑是全美商会會長，姑夫是原美國交通部副部長。明年年會9/10/2027在洛杉磯辦 | 2027 年活动信息仅保留于原说明，主图注建议聚焦当时的合影。 |
| 04 | `1990b(1).jpg` | 照片；1990（说明） | 3092 × 2324 | 与中文顾问处主任[姓名不清]先生，在1990年 one man show in St. Paul, MN | 姓名不清；职务表述保留原文，发布时不猜写姓名。 |
| 05 | `1990b(2).jpg` | 照片；1990（说明） | 2772 × 1952 | 美国副总领事夫人[姓名不清]参观1990年 one man show | 姓名不清；原有照片内印字保留。 |
| 06 | `1990c.jpg` | 照片；1990（说明） | 3104 × 2208 | 与美中友协主席[姓名不清]、[姓名不清]，1990年 one man show | 两处姓名不清。 |
| 07 | `1995a.jpg` | 照片；1995（文件名） | 2768 × 1832 | 与明尼阿波利斯艺术馆馆长艾文，在 MIA Group show opening | 日期来自文件名；“艾文”的英文拼写待核对。 |
| 08 | `1995b.jpg` | 照片；1995（文件名） | 2884 × 2116 | 与 Group show 合作者 Joe Arken 在 opening 上交谈创作经验 | Joe Arken 按原文存档，英文发布稿前核对拼写。 |
| 09 | `1995c.jpg` | 照片；1995（文件名） | 2620 × 2272 | MIA Group 展作品《门》合影 | 作品名《门》来自说明。 |
| 10 | `1998a.jpg` | 照片；1998（文件名） | 2316 × 1660 | 于香港艺倡 one man show，金董建平女士和先生、银行总裁出席开幕式。 | 保留嘉宾信息；英文机构名、人名待规范。 |
| 11 | `2000.jpg` | 照片；2000（文件名） | 2682 × 1660 | 美国驻香港总领事与金董建平女士参加 one man show opening  [下方注释字迹不清] | 下方注释字迹不清，不补全。 |
| 12 | `2014a.JPG` | 照片；2014（文件名） | 4000 × 3000 | Lancaster one man show opening | 文档扩展名为 .jpg，实际 .JPG。 |
| 13 | `2014c.jpg` | 照片；2014（文件名） | 363 × 288 | Lancaster one man show opening | 仅 363 × 288px，不强行放大至高清。 |
| 14 | `2014d.jpg` | 展览海报；2014（海报） | 2550 × 1653 | 未提供独立说明；见处理意见中的建议描述。 | 无独立 DOCX 图注；建议描述：Yi Kai Selected Paintings and Works on Paper 展览开幕海报。依据海报可见文字。 |
| 15 | `2015 b.JPG` | 照片；2015（文件名） | 3264 × 2448 | Claremont graduate University, 香港艺倡, 广州53美术馆巡展，53美术馆 opening。 | 对应文档 2015b.jpg；保留原文件名空格。 |
| 16 | `2015a.JPG` | 照片；2015（说明） | 3264 × 2448 | 2015巡展，CGU opening | 对应文档 2015a.jpg。 |
| 17 | `2015c.JPG` | 照片；2015（说明） | 3264 × 2448 | 2015巡展，香港 opening | 对应文档 2015c.jpg。 |
| 18 | `2015d.JPG` | 照片；2015（说明） | 3264 × 2448 | 与 David Pagel 对谈，在2015香港 opening | David Pagel 来自原说明；对应文档 2015d.jpg。 |
| 19 | `2018a.JPG` | 照片；2018（文件名） | 3264 × 2448 | 组织策展：CGU、天津美术学院美术馆 Group show | 策展角色按原说明整理，不扩写细节。 |
| 20 | `2023b(2).jpg` | 照片；2023（文件名） | 1623 × 1251 | Leading USC 艺术设计学院院长 Haven Lin-Kirk，[中国某美术学院]访问。 | 对应文档 2023b.jpg；中国访问机构不明确。 |
| 21 | `2023c(1).png` | 照片；2023（文件名） | 1193 × 964 | 策展：CGU、USC、中国天津、广州展。 | 对应文档 2023c.jpg；机构与展览关系按原文保留，具体展名待核对。 |
| 22 | `DSC_0057.jpg` | 照片；未注年 | 3180 × 2354 | Mixture for ever 收藏展，Minnesota Museum of American Art。 | 展名 Mixture for ever 按原文保存，正式拼写待核对。 |
| 23 | `IMG_0090.jpg` | 照片；2015（说明） | 3196 × 2208 | 与作品收藏者在2015香港 opening，编号35。 | 编号 35 作为原说明记录，不当作本页排序号。 |
| 24 | `IMG_3608.jpg` | 照片；2016（说明） | 2820 × 2448 | 2016香港艺倡画廊 director Daphne King，in 艺倡画廊35周年展 opening。 | Daphne King 来自原文。 |
| 25 | `IMG_3623.jpg` | 照片；未注年 | 3464 × 1888 | 与董建华、金董建平、Steven King，in 艺倡画廊35周年展 opening。 | 说明只有 35 周年信息；不直接借用相邻照片年份。 |
| 26 | `IMG_7581.jpg` | 照片；未注年 | 3388 × 2333 | 中国艺术大师刘海粟画，题字名在右上。（旁注：拜访） | 图文疑点：实图为两人交谈，原文却提及画作和题字。建议临时标题为“交谈”，人物与拜访信息待核对。 |
| 27 | `IMG_7584.jpg` | 照片；1999（说明） | 2380 × 2976 | 与香港艺倡画廊主金董建平合影。1999年 one man show in Dolly Fiterman Gallery。 | 文档名 IMG 7584.JPG；画廊／人名的英文拼写待整理，不凭照片识别人名。 |
| 28 | `IMG_7587.jpg` | 照片；1988（说明） | 3397 × 2427 | 与[两位姓名不清]，1988年台湾个展时合影。 | 文档名 IMG 7587 / 1988.JPG；两位姓名不清，保留待核对。 |
| 29 | `IMG_7590.jpg` | 照片；1999（说明） | 3054 × 1830 | One man show opening in Dolly Fiterman Gallery, 1999. | 文档名 IMG 7590.JPG。 |
| 30 | `IMG_7591.jpg` | 照片；1999（说明） | 3498 × 2286 | One man show opening in Dolly Fiterman Gallery, 1999. | 文档名 IMG 7591.JPG。 |

## 10 当前结论

建议采用“透明复古电脑 + 实体照片卡入槽 + 二维照片显影 + 屏幕内阅读”的方案。下一阶段先完成电脑造型与真实照片、说明的静态阅读效果，再接入约 2.8 秒的装入动画。所有 30 项素材列入内容表；有疑点的说明使用中性描述并保留原文，不让未知人名影响页面开发。

## Implementation verification 2026-09-20

The Memories page is implemented. Production build passed, including the static Memories route. All 14 Playwright checks passed, covering Memories, Works, About, accessibility and fallback behavior. The final mobile and drag interactions also passed two targeted checks.

The archive contains 30 records and 60 image derivatives, approximately 7.5 MiB. Original descriptions and review notes are retained; uncertain identities use neutral English captions. No reconstruction, upload, export or film features were added.

Local file-read stalls were repaired by reinstalling locked dependencies and restoring 339 existing artwork files from the original yikaiart-main.zip. Every filename and file size matched; ZIP CRCs were verified during extraction. The original artwork directory is preserved at /tmp/yikai-original-art-backup-1789888749. No original source photos were edited.


## Revision implementation — 2026-09-20

The current page uses an opaque CRT housing, alpha WebGL canvas, centered layout, English-only visible copy, and a screen button opening a light photo reader. Notes I/II and their four generated images have been removed; original supplied files are untouched. All 14 Playwright checks passed, including six Memories interaction/accessibility checks and the Works/About regressions. Production build passed. Desktop and mobile layouts and enlarged readers were also visually verified.

During validation, Vite stalled reading unreferenced ` 2.webp` duplicate files in the pre-existing art directory. The directory was preserved in `/tmp/yikai-art-build-backup-1789891190` (49 duplicate files had already been moved to `/tmp/yikai-unused-art-duplicates-1789891130`). The 339 referenced art assets were restored from the original project ZIP, with matching expected filenames and ZIP CRC verification.


## Interaction revision validation — 2026-09-20

Production build passed. All 17 Playwright checks passed, including nine Memories checks for one-click insertion, all 28 album entries, image-error recovery, missing WebGL, English copy and accessibility, physical-slot drag-and-drop, rear-screen occlusion and pointer click suppression, latest-choice queueing, and touch rotation with vertical page scrolling. Desktop and phone layouts were visually reviewed; camera framing keeps the complete keyboard in view.

Build asset copying now reads the validated catalogues (339 work images and 56 Memories derivatives), so recurring unreferenced sync-conflict duplicates cannot stall Vite's public-directory copy. This revision leaves source assets and duplicates in place.
