# 内容深化与视觉优化 Design

> 基础文档：`docs/superpowers/specs/2026-07-27-portfolio-website-design.md`（v1 设计）、`docs/superpowers/plans/2026-07-27-portfolio-website-implementation.md`（v1 实施计划，已合并到 master）、`docs/superpowers/specs/2026-07-28-portfolio-real-photos-design.md`（v2 真实图片设计，实施中，worktree `portfolio-real-photos` 分支 `worktree-portfolio-real-photos`，Task 1-6 已完成待最终验收）。本文档描述 v2 之后的第三轮增量变更，**在同一个 worktree/分支上继续实施**，因为本轮多处改动直接依赖 v2 已经建立的"真实图片 + `<img>` + alt"模式（Gallery 网格、Projects 缩略图等）。

**Goal:** 放大 Hero 头像、补全 About 引言、丰富 Skills 内容密度、深化 Experience 描述并加公司图、给 Projects 5 张卡片全部配上真实图片、把 Achievements 从纯数字改成列表式真实内容、调整 Gallery 3 个格子的尺寸。

## Global Constraints（继承自 v1/v2，本次依然适用）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 配色仅用 `css/tokens.css` 定义的 CSS 变量，不写死新颜色字面量（白色半透明纹理叠层 `rgba(255,255,255,0.12-0.14)` 沿用 v1 已确认接受的例外写法）
- 图片只用本地文件（`assets/images/`），不引用外部图床；一律 `<img>` + 有意义 `alt`，不用纯 CSS background-image
- 内容锚定真实资料：新增文案（About 引言、Experience 描述扩写、Achievements 奖项列表、Skills 新增技能、Projects 新项目描述）均来自用户提供的原文或已确认的真实简历/报告内容，不编造
- 素材来源：`/Users/huiying.h.chen/Desktop/补充内容/公司照片/`（3 张公司照片）、`/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目一考勤系统/`（2 张新增真实截图）、`/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目二.../决赛B2025094.pdf`（供应链 PDF）、已有的 `900aac08....jpg`（MCM 证书）、`/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目四业务自动化分析工具/*.py`（真实源代码，用于渲染代码截图）

---

## 1. Hero 头像放大

`css/style.css` 里 `.hero-avatar` 规则（v2 Task 3 已改为 `height: 240px`）：

```css
.hero-avatar {
  height: 240px;
  ...
}
```

改为：

```css
.hero-avatar {
  height: 300px;
  ...
}
```

其余属性（`width: auto; max-width: 100%; object-fit: contain; filter: drop-shadow(...)`）不变。`.hero-card` 内部可用高度约 320px（`.hero-visual` 360px 高，`.hero-card` 四边各 20px inset），300px 留出约 20px 上下呼吸空间，不会顶到卡片边缘。

## 2. About 板块新增引言段

在 `index.html` 的 `.about-grid` 卡片网格**之前**（`<h2 class="section-title">` 之后）插入一段引言 `<p>`：

```html
<p class="about-lead" data-i18n-key="about.lead" data-reveal>应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。</p>
```

`css/style.css` 新增：

```css
.about-lead {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text);
  max-width: 720px;
  margin-bottom: var(--space-4);
}
```

`js/i18n.js` 的 `CONTENT_ZH.about` 新增 `lead` key（值为上面中文原文逐字），`CONTENT_EN.about` 新增：

```
lead: "M.S. in Applied Statistics with three data-analytics internships at KN Group, NIO, and beyond, bringing hands-on experience in business analytics, risk analysis, and predictive modeling. Proficient in SQL, Python, and Tableau for business analysis, and skilled at using AI tools to build automated analysis scripts and efficiency tools — productizing the data-analysis workflow to continuously improve business decision-making."
```

## 3. Skills 板块内容密度优化

**雷达图**：`js/visualizations.js` 里 `SKILLS` 数组（当前 6 项）驱动雷达图轴数（`total = SKILLS.length` 是动态的，不需要改雷达图算法本身）。保持现有 6 项不变。

**环形进度卡**：从 6 张扩到 8 张，新增两项真实高频技能：

- `MySQL`（在 KN Group、洲暨科技两段实习里都用到，真实技能）—— 拟定 85%
- `Tableau`（在 NIO、洲暨科技两段实习里都用到，真实技能）—— 拟定 75%

`index.html` 的 `.skills-grid` 里追加两张 `.skill-ring-card`（与现有 6 张结构完全一致，只是新的 `data-value`/`stroke-dashoffset`/文案），`js/visualizations.js` 的 `SKILLS` 数组同步追加两项（用于雷达图轴）。`css/style.css` 的 `.skills-grid` 网格从 `repeat(3, 1fr)` + 雷达图 `grid-column: span 3` 改为能容纳 1 张雷达图 + 8 张环形卡的布局——改成 4 列网格，雷达图卡占满整行（`grid-column: span 4`），8 张环形卡占两行（每行 4 张）。

**新增"熟悉工具"标签行**：在环形卡网格下方追加一个卡片，罗列真实用到但不适合做百分比环形图的工具/方法（复用 Experience 里出现过的真实名称，不新造）：`Pandas`、`OpenPyXL`、`Matplotlib`、`Tkinter`、`Excel`、`ARIMAX`、`XGBoost-SHAP`、`MPC`。样式复用 Experience 板块已有的 `.timeline-tags span` 药丸样式（同一套 CSS，不新增字面量颜色）。

```html
<div class="card skills-familiar-card" data-reveal>
  <p class="skills-familiar-label" data-i18n-key="skills.familiarLabel">熟悉工具</p>
  <div class="timeline-tags">
    <span>Pandas</span><span>OpenPyXL</span><span>Matplotlib</span><span>Tkinter</span><span>Excel</span><span>ARIMAX</span><span>XGBoost-SHAP</span><span>MPC</span>
  </div>
</div>
```

`.skills-familiar-card { grid-column: span 4; padding: var(--space-3); }`；`.skills-familiar-label` 复用 `.project-badge` 的排版规则（12px/700/紫色 eyebrow 风格）。

## 4. Experience 板块深化

### 4.1 描述扩写

三段经历的 `bullet1/2/3` 和 `highlight` 文案在现有真实内容基础上适当扩写、补充量化细节（不新增未确认的数字，只是把现有简历里的信息说得更完整），具体文案在实施计划里给出逐字版本。

### 4.2 公司背景图

三张公司照片素材（来自 `/Users/huiying.h.chen/Desktop/补充内容/公司照片/`）：

| 公司 | 源文件 | 内容 |
|---|---|---|
| KN Group | `d0641070f6d2f09ee819f6ffbb79ba43.jpg` | 手持 KN GROUP 工牌 |
| 上海蔚来汽车（NIO） | `70855e22328aab3a9a71b98d89b9c2ca.jpg` | 蔚来大堂 logo 墙 |
| 上海洲暨科技 | `43f4c816252304faf492b4411f91be31.jpg` | 洲暨科技/Intercon Technology 前台屏幕 |

**布局方案**：每张 `.timeline-item` 卡片新增一个内部容器 `.timeline-photo-wrap`，包裹除 `.timeline-head`（公司名+时间）之外的所有内容（role、bullets、tags、highlight）。该容器 `position: relative`；内部放一张 `<img class="timeline-photo">`（`position: absolute; inset: 0; z-index: 0; object-fit: cover; opacity: 与遮罩配合`），再叠加一层 `.timeline-photo-scrim`（`position: absolute; inset:0; z-index:1; background: var(--color-surface)`，透明度做渐变：顶部（紧邻公司名下方）更不透明，向下略微透明，但整体保持在 88%~94% 不透明度区间——不是 Gallery 那种"照片为主、遮罩为辅"的效果，而是"照片为背景水印、文字始终清晰"的效果，因为 Experience 卡片文字密度远高于 Gallery 的一个短标签）。原有的 `role/bullets/tags/highlight` 元素本身 `position: relative; z-index: 2`，确保始终在遮罩之上。

```css
.timeline-photo-wrap { position: relative; }
.timeline-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.timeline-photo-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, var(--color-surface) 0%, color-mix(in srgb, var(--color-surface) 90%, transparent) 100%);
}
.timeline-role, .timeline-bullets, .timeline-tags, .timeline-highlight {
  position: relative;
  z-index: 2;
}
```

（`color-mix()` 是标准 CSS 函数，现代 Chrome/Safari 均支持，不算第三方依赖；如果实施时发现目标环境对 `color-mix` 支持有疑虑，退化方案是把渐变终点换成一个手写的 `rgba` 值——但由于 `--color-surface` 在深浅色模式下数值不同，写死 rgba 会破坏深色模式适配，所以优先用 `color-mix`，这是它在本项目里的唯一必要用途。）

`data-i18n-alt` 不适用（本项目 i18n 机制只翻译 textContent，不翻译属性，alt 文本沿用中文，与 v2 Gallery/Hero 的既有简化一致）。

## 5. Projects 板块全部配图

| 卡片 | 图片来源 | 处理方式 |
|---|---|---|
| 供应链 (`supply-chain`) | `决赛B2025094.pdf` 第 1 页 | 用 `pdftoppm` 渲染为 PNG（已验证效果良好：深色背景+仓库照片+标题"数据驱动的爆品供应链智能决策系统"） |
| 保险公司 (`insurance`) | `900aac08198c785ec84f8de0884b8b7a.jpg`（MCM 证书，与 Gallery 获奖时刻格复用同一张源文件，各自压缩出独立的 assets 文件） | 直接使用 |
| 业务自动化分析工具 (`automation`) | 自制代码截图 | 取 `分包首续贷按月放款金额.py` 前 25 行左右（imports + `natural_sort_key` 函数定义，真实代码，不是全文件）用 HTML/CSS 渲染语法高亮效果，headless Chrome 截图产出 PNG |
| 学生考勤管理系统 (`attendance`) | `1255b3d9e49d4e7f4c2005c9d634da50.png`（真实运行截图，个人考勤统计 tab） | 直接使用（不使用另一张系统结构图，保持每张 Projects 卡片一张图的既有惯例，选运行截图是因为更能证明"这是一个真正跑起来的软件"） |
| 个人展示网页/简历投递辅助工具 (`website`) | 已在 v2 Task 4 用真实 MyOffer 截图 | 本轮不改动 |

供应链/保险公司/考勤系统三张卡片目前是纯 CSS 渐变缩略图（`.project-thumb--supply-chain`/`--insurance`/`--attendance`），本轮改成 `<img>`，写法与 v2 Task 4 已经给 website 卡片做过的一样（`.project-thumb` 基础规则已经兼容 `<img>` 用法，无需再改）。

## 6. Achievements 改版为列表式布局

从 4 张纯数字卡片改为 4 组"数字 + 列表"卡片，数字保留作为视觉锚点，下方补充真实内容：

```html
<div class="achievements-grid">
  <div class="card achievement-card" data-reveal>
    <p class="achievement-number"><span class="counter" data-target="3">3</span></p>
    <p class="achievement-label" data-i18n-key="achievements.internships">段数据分析实习经历</p>
    <ul class="achievement-list">
      <li data-i18n-key="achievements.list.knGroup">KN Group</li>
      <li data-i18n-key="achievements.list.nio">上海蔚来汽车有限公司</li>
      <li data-i18n-key="achievements.list.zhouji">上海洲暨科技有限公司</li>
    </ul>
  </div>
  <div class="card achievement-card" data-reveal>
    <p class="achievement-number"><span class="counter" data-target="5">5</span></p>
    <p class="achievement-label" data-i18n-key="achievements.projects">个核心项目</p>
    <ul class="achievement-list">
      <li data-i18n-key="projects.supplyChain.title">爆品供应链全渠道库存优化与风险建模研究</li>
      <li data-i18n-key="projects.insurance.title">保险公司承保评级系统</li>
      <li data-i18n-key="projects.automation.title">业务自动化分析工具</li>
      <li data-i18n-key="projects.website.title">个人展示网页 / 简历投递辅助工具</li>
      <li data-i18n-key="projects.attendance.title">学生考勤管理系统</li>
    </ul>
  </div>
  <div class="card achievement-card" data-reveal>
    <p class="achievement-number"><span class="counter" data-target="3">3</span></p>
    <p class="achievement-label" data-i18n-key="achievements.awards">项国家级/国际级竞赛奖项</p>
    <ul class="achievement-list">
      <li data-i18n-key="achievements.list.award1">全国大数据建模大赛一等奖</li>
      <li data-i18n-key="achievements.list.award2">"华为杯"国家级数学建模竞赛三等奖</li>
      <li data-i18n-key="achievements.list.award3">美国大学生数学建模竞赛 Honorable Mention</li>
    </ul>
  </div>
  <div class="card achievement-card" data-reveal>
    <p class="achievement-number"><span class="counter" data-target="4" data-suffix="+">4+</span></p>
    <p class="achievement-label" data-i18n-key="achievements.kpis">项核心业务指标监控体系</p>
    <ul class="achievement-list">
      <li data-i18n-key="achievements.list.kpi1">注册成本 / CAC</li>
      <li data-i18n-key="achievements.list.kpi2">放款率与坏账率</li>
      <li data-i18n-key="achievements.list.kpi3">CPS</li>
      <li data-i18n-key="achievements.list.kpi4">运营数据准确率</li>
    </ul>
  </div>
</div>
```

第 2 组（核心项目）的 5 个 `<li>` 直接复用 `projects.*.title` 的既有 i18n key（这些 key 已经在 `js/i18n.js` 里定义过，本任务不需要新增，`data-i18n-key` 机制会在运行时把 `<li>` 的文字替换成对应语言的项目标题——`<li>` 里写的中文是无 JS 时的兜底显示文本，必须和 `projects.*.title` 里的值逐字一致，不能是占位说明文字），这样中英文只需要在一处维护，不会出现改一处忘改另一处的风险；第 3 组的三项奖项名称来自 v1 设计文档 121 行已经确认的真实清单；第 4 组的 KPI 名称来自 Experience 里 KN Group 那段已经出现过的真实指标（注册成本、放款率、坏账率、CPS）。

`css/style.css` 新增 `.achievement-list`（无序列表，小字号，`color: var(--color-text-muted)`，复用 `.timeline-bullets li::before` 的短横线项目符号写法）。`.achievement-card` 原有的 `text-align: center` 需要针对新增的列表部分改成左对齐（数字和 label 保持居中，列表左对齐更符合阅读习惯），实施时用嵌套选择器处理。

## 7. Gallery 尺寸调整

现状（v2 Task 2 已实现）：4 列网格，`grid-auto-rows: 140px`，`--travel`/`--pilates` 带 `.gallery-cell--wide`（span 2 列）。

**目标**：
- `--travel`、`--pilates` 去掉 `.gallery-cell--wide`，变成普通 1×1 格（与 `--award` 同尺寸）
- `--friends` 变成 350px 高（140px × 2.5）

**技术方案**：把 Gallery 从"隐式自动排列"改成显式网格定位，4 列 × 3 行，行高 `140px 350px 140px`（第 2 行 350px 正好是 `friends` 需要的高度，`friends` 跨第 1-2 行 `grid-row: 1 / span 2`）。

7 个普通 1×1 格子（travel/reading/swim/ukulele/pilates/award/billiards）需要填进"除 `friends` 所在列之外"的位置：row1、row2 各有 3 个非-friends 列位置（共 6 个），只能装下 6 个格子；第 7 个格子（`billiards`）放到新增的第 3 行（仅 140px 高，只占 1 列），该行其余 3 列留白——这就是前面向用户说明过的"精确 2.5 倍高"与"其余格子保持原尺寸不变"两个要求叠加后无法完全避免的取舍。

最终显式布局（4 列，3 行，行高 `140px 350px 140px`）：

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 140px 350px 140px;
  gap: var(--space-2);
}
.gallery-cell--travel   { grid-column: 1; grid-row: 1; }
.gallery-cell--reading  { grid-column: 2; grid-row: 1; }
.gallery-cell--swim     { grid-column: 3; grid-row: 1; }
.gallery-cell--friends  { grid-column: 4; grid-row: 1 / span 2; }
.gallery-cell--ukulele  { grid-column: 1; grid-row: 2; }
.gallery-cell--pilates  { grid-column: 2; grid-row: 2; }
.gallery-cell--award    { grid-column: 3; grid-row: 2; }
.gallery-cell--billiards{ grid-column: 1; grid-row: 3; }
```

第 3 行（`billiards` 所在行）只有第 1 列有内容，第 2-4 列会留白——这是"朋友时光精确 2.5 倍高"+"其余格子保持原尺寸不变"这两个明确要求叠加后，在一个矩形网格里无法完全避免的取舍（用户已知悉并同意由实施方自行决定处理方式）。移动端 768px 断点的 2 列布局需要对应改写这套 `grid-template-areas`（具体值在实施计划里给出）。

删除原有的 `.gallery-cell--wide { grid-column: span 2; }` 规则（不再需要，travel/pilates 不再是 wide）。

---

## 验证

- 全部 JS 文件 `node --check` 通过
- `grep` 确认 `.gallery-cell--wide` 规则已删除、`billiards` 单独占格
- `grep` 确认 8 个 Skills 环形卡（`data-value`）+ 8 项 `SKILLS` 数组条目数量一致
- `grep` 确认 Achievements 5 个"核心项目"列表项复用的是 `projects.*.title` key（不是新定义的重复文案）
- 用无头 Chrome 截图 + DOM dump 检查 Hero/About/Skills/Experience/Projects/Achievements/Gallery 七处改动
- i18n key 完整性复查（沿用 v2 Task 6 用过的 node 脚本方法：提取所有 `data-i18n-key`，逐个在 `CONTENT_ZH`/`CONTENT_EN` 里解析确认存在）
