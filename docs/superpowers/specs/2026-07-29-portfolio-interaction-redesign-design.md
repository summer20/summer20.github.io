# 交互重构 Design（Hero/Skills/Experience/Projects/Gallery）

> 基础文档：2026-07-27 v1 设计+计划（已合并 master）、2026-07-28 真实图片设计+计划（已合并 master）、2026-07-28 内容深化设计+计划（本 worktree 内，Task 1-8 已完成待最终验收）。本文档描述内容深化之后的第四轮增量变更，**在同一个 worktree（`portfolio-real-photos`，分支 `worktree-portfolio-real-photos`）继续实施**。

**Goal:** Hero 头像溢出卡片边界增强立体感；About 旅行趣事文字迁移到 Gallery；Skills 撤回环形卡改为"雷达图+权重词云"精简版；Experience 蔚来背景图与 Gallery 普拉提照片换成用户新传的图片；Projects 从网格卡片改为交错时间轴布局；Gallery 从 Bento 网格改为抽卡交互。

**背景说明——为什么 Skills 板块要撤回上一轮刚做的内容：** 上一轮（2026-07-28 内容深化）Task 3 因为用户反馈"占位太多内容太少"新增了 8 个环形进度卡+"熟悉工具"标签行。这一轮用户看了实际效果后改变主意，要求只保留雷达图、把其余内容压缩成一个权重词云。这不是本文档的疏漏，是用户在看到实际渲染效果后的真实决策变化，已经明确确认（见下文验证记录），实施时按本文档为准。

## Global Constraints（继承自前三轮）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 配色仅用 `css/tokens.css` 定义的 CSS 变量；深浅色模式、中英文切换机制必须对新增的所有交互（词云、时间轴、抽卡）同样生效——参考图（另一个作品集网站"ZW PORTFOLIO"）本身既不支持深色模式也不是双语，本轮只借用其"时间轴"和"抽卡"两种交互结构，不借用其视觉风格（渐变背景、编号标题、字体等一律不采用，继续用 Electric Ink 体系）
- 图片只用本地文件（`assets/images/`），一律 `<img>` + 有意义 `alt`
- 内容锚定真实资料：时间轴节点不编造具体日期，用现有真实 badge 文案作为标签；词云技能点全部是站内已确认的真实技能，不新增未确认技能

---

## 1. Hero 头像溢出卡片边界

现状：`.hero-avatar` 是 300px 高的 `<img>`，`object-fit: contain`，被 `.hero-card`（`.hero-visual` 内 inset 20px 的玻璃卡片，内部可用高度约 320px）包裹。`.hero-card` 没有设置 `overflow: hidden`，所以子元素本来就不会被裁剪——只是目前 300px 还没有明显超出卡片高度。

**方案：** 把 `.hero-avatar` 的 `height` 从 300px 增加到 380px（明显超过卡片约 320px 的可用高度，人像会从卡片顶部和底部自然露出），配合已有的 `drop-shadow` 让露出部分看起来是"浮"在卡片前面而不是被裁切的错误观感。因为 `.hero-card` 用 `display:flex; align-items:center; justify-content:center` 让头像居中，加高后会向上下两侧对称溢出。不需要新增任何定位或 `overflow: visible` 逻辑——现状已经天然支持溢出，只是数值要调大。

窄屏（`max-width: 900px`）`.hero-visual` 高度是 280px，比桌面端更矮；溢出效果在窄屏会更明显，属于预期效果，不需要额外处理（如果实施后发现窄屏溢出到影响下方内容布局，才需要加断点特例，先按现状验证）。

## 2. About 删除旅行趣事段落 → 迁移到 Gallery 抽卡文案

`index.html` 里 `.about-travel` 卡片（含 `about.travelNote` 文案）整块删除。这段文案原文（"旅行是我和朋友们的固定节目：轮流组队当'导游'……"）不丢弃，改成 Gallery 抽卡机制里"旅行"主题卡片背面的配文（见第 6 节）。`js/i18n.js` 里 `about.travelNote` key 删除，改为新增一个 `gallery.travelCaption`（或类似命名，与其余 7 张卡片的每卡配文并列）供 Gallery 使用。

## 3. Skills 板块精简为"雷达图 + 权重词云"

删除内容：8 个 `.skill-ring-card`（`index.html`）、其对应的 `.skill-ring*` CSS 规则、"熟悉工具"标签卡（`.skills-familiar-card`/`.skills-familiar-label`，连同 `js/i18n.js` 里的 `skills.familiarLabel` key）。

保留：`.skills-radar-card`（雷达图挂载点 `#radar-chart`）。

新增：雷达图卡片旁边/后方新增一个"权重词云"容器，用 `<span>` 罗列全部真实技能点，`font-size` 按熟练度分档（不是精确到每个技能一个不同字号，而是分成 3-4 档，比如"核心"/"熟练"/"了解"），视觉上形成大小不一的词云效果：

- **核心档（最大字号）：** Data Analysis、Python、SQL（对应雷达图里排名前 3 的技能）
- **熟练档：** AI Tools、Machine Learning、Power BI、MySQL、Tableau（雷达图其余 3 项 + 上一轮新增的 2 项）
- **了解档（最小字号）：** Pandas、OpenPyXL、Matplotlib、Tkinter、Excel、ARIMAX、XGBoost-SHAP、MPC（Experience/Projects 里出现过的辅助工具/方法，原"熟悉工具"标签行的内容原样保留，只是从独立标签行改成词云的一部分）

技术实现：不用真正的碰撞检测词云布局（需要额外算法或库），改用 flex-wrap 的标签云——每个 `<span>` 按档位给不同 `font-size`/`font-weight`/`color`（用现有 3 个 accent token 轮流上色，不新增字面量颜色），`gap` 让大小不一的词自然交错排列，视觉上接近词云但不做真实物理碰撞包裹。这个简化点已经在需求澄清阶段跟用户说明过。

布局：`.skills-grid` 保留 2 列（雷达图卡片一列，词云卡片一列），桌面端并排；窄屏（沿用现有断点）改为上下堆叠。

## 4. Experience 蔚来背景图更新 + Gallery 普拉提照片更新

两处纯素材替换，无结构变化：

- Experience 蔚来（NIO）timeline 卡片的 `.timeline-photo` 源文件从 `company-nio.jpg`（旧的近景 logo 照）替换为新素材 `/Users/huiying.h.chen/Desktop/补充内容/公司照片/1385565f87a84027ac3a481325cc9e48.jpg`（远景建筑外观+logo，用户今天新传）。文件名保持 `assets/images/company-nio.jpg` 不变，直接用新素材覆盖压缩后的文件内容——不新增文件名，`index.html` 里的 `src` 引用不需要改动，只是这个文件对应的图片内容变了。
- Gallery 普拉提照片同样保持文件名 `assets/images/gallery-pilates.jpg` 不变，用新素材 `/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片/3d8c5b5d48dd6926b36d61d4d461de29.jpg`（普拉提器械训练动作照，更能体现真实练习场景）覆盖压缩后的文件内容，`index.html` 的 `src` 引用不需要改动。

## 5. Projects 板块改为交错时间轴

现状：`.projects-grid` 是 2 列卡片网格，5 张卡片（第 5 张单独占一整行）。

**新结构：** `.projects-timeline`，中间一条竖线（`::before` 伪元素，`background: var(--color-border)` 或渐变色），5 个 `.timeline-node` 沿竖线交错排列——奇数节点（第 1、3、5 个：供应链、代码工具、考勤系统）内容在竖线右侧，偶数节点（第 2、4 个：保险公司、MyOffer 网站）内容在竖线左侧，每个节点在竖线上有一个圆点标记（复用 `--gradient-primary` 或 accent token 做填色圆点）。

每个 `.timeline-node` 内部结构沿用现有 `.project-card` 的图片+badge+title+desc(+metric) 内容，不改变文案，只改变外层排布容器和左右交替的定位方式。标签（现有 `.project-badge` 文字，如"国竞一等奖"、"美国 MCM Honorable Mention"）放在节点靠近竖线的位置，视觉上充当"时间轴刻度"的替代（不编造具体日期）。

技术实现：CSS 用 `display: flex; flex-direction: column` 的节点列表，每个节点是 `display: grid; grid-template-columns: 1fr 40px 1fr` 的三栏结构（左内容/中心线+圆点/右内容），奇数节点内容放右栏、左栏留空，偶数节点内容放左栏、右栏留空。窄屏（沿用现有 768px 断点）改为单栏顺序堆叠（不再左右交错，退化成普通时间轴，圆点+竖线保留在左侧或直接省略交错效果，具体断点样式留给实施计划给出字面量代码）。

## 6. Gallery 改为抽卡交互

现状：8 个真实照片格子的 Bento 网格（`.gallery-grid`，含 v2 里做的显式 3 行网格定位）。

**新结构：** 整块替换为抽卡组件：

- 顶部一个"牌堆"视觉（多张卡片错位堆叠的静态展示，用 `.deck` 容器+2-3 张装饰性卡片背面用 `transform: rotate()` 略微错开叠放，卡背用 `--gradient-primary` 渐变+网站 logo 文字，不需要用到全部 8 张真实照片做背面装饰）
- 一个"抽一张"按钮（复用 `.btn.btn-primary` 样式）
- 一个计数器（"X / 8"格式，显示当前是第几次抽到某张牌，不是"已抽完 X 张"的去重计数——见下方交互逻辑）
- 点击按钮后，用 CSS 3D 翻转动画（`transform-style: preserve-3d` + `rotateY(180deg)` 配合 `backface-visibility: hidden`）翻出一张卡片，正面显示该照片+对应主题文字+配文（8 张照片沿用现有 `gallery.*` 文案；"旅行"那张的配文用第 2 节迁移过来的旅行趣事文字，其余 7 张暂时没有专属配文，配文栏留空或只显示主题标签，不编造内容）

**交互逻辑（JS，新文件或加入 `js/main.js`）：**
1. 页面加载时生成 1-8 的随机顺序数组（Fisher-Yates 洗牌），索引指针从 0 开始
2. 点击"抽一张"：翻出洗牌数组当前索引指向的卡片，计数器显示"索引+1 / 8"，索引 +1
3. 索引到达 8（本轮 8 张全部抽完）后，点击按钮会重新洗牌、索引归零，从头开始——这样保证"抽完一轮不重复"且可以无限重复抽取
4. 翻转动画：用一个 `.card-inner` 包裹正反两面（`.card-face--back`/`.card-face--front`），JS 切换 `.is-flipped` 类控制翻面。再次点击"抽一张"时的动效：先移除 `.is-flipped`（卡片翻回卡背朝上），等一小段延时（约 300ms，与现有 `--transition-medium` 300ms 保持一致）后更新正面内容为新抽到的照片、再加上 `.is-flipped`（翻出新卡）——这样每次抽卡都能看到完整的"合上再翻开"动效，比直接切换正面内容更接近真实抽卡体验

`prefers-reduced-motion: reduce` 用户：跳过翻转动画，点击后直接切换卡片正面内容（不做 3D 旋转）。

窄屏：牌堆和按钮居中堆叠，卡片本身宽度收窄，交互逻辑不变。

## 验证

- 全部 JS 文件 `node --check` 通过
- `grep` 确认 `.skill-ring-card`/`.skills-familiar-card`/`about-travel`/`about.travelNote` 完全从 index.html 和 js/i18n.js 中移除
- `grep` 确认词云的技能点数量（6+2+8=16 个真实技能点）全部出现
- `grep` 确认 Experience/Gallery 的图片引用指向新素材文件
- `grep` 确认 Projects 5 个 timeline 节点左右交替顺序正确（奇数右/偶数左）
- 抽卡交互：用 `--dump-dom` 检查洗牌后点击抽卡按钮触发的 class 切换是否正确（不依赖视觉截图，因为涉及 JS 交互无法单纯用静态截图验证，需要用 headless Chrome 执行点击或直接读 JS 逻辑做单元级验证）
- 无头 Chrome 截图 + DOM dump 检查 Hero/Skills/Experience/Projects/Gallery 五处改动
- i18n key 完整性复查（沿用之前几轮用过的 node 脚本方法）
