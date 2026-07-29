# 交互重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero 头像溢出卡片边界；Skills 精简为"雷达图+权重词云"；Projects 改为交错时间轴；Gallery 改为抽卡交互（含 About 旅行趣事文案迁移）；Experience/Gallery 两张图片素材更新。

**Architecture:** 延续既有的纯 HTML/CSS/原生 JS、零构建模式；Gallery 抽卡逻辑仿照 `js/visualizations.js` 的写法新增独立文件 `js/gallery-cards.js`，不侵入 `js/main.js` 既有职责；`js/visualizations.js` 因为不再需要环形卡动画而大幅简化。

**Tech Stack:** 纯 HTML/CSS/原生 JS；`sips` 用于素材压缩；headless Chrome 用于截图/DOM 结构验证。

## Global Constraints（继承自前三轮）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 配色仅用 `css/tokens.css` 定义的 CSS 变量；深浅色、中英文切换机制对本轮新增的所有内容同样生效
- 本轮只借用参考网站的"交互结构"（时间轴、抽卡），不借用其视觉风格（渐变背景、编号标题等一律不采用，继续用 Electric Ink 体系）
- 图片只用本地文件（`assets/images/`），一律 `<img>` + 有意义 `alt`
- 内容锚定真实资料：时间轴节点不编造具体日期，用现有真实 badge 文案；词云技能点全部是站内已确认的真实技能
- 截图验证一律用 headless Chrome：`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=<路径> --window-size=<W>,<H> "file://<index.html 绝对路径>"`；本代码库有已知的"滚动淡入动画时序"问题，需要更可靠验证时改用 `--dump-dom`

---

## Task 1: 素材更新（蔚来建筑图 + 普拉提训练图）

**Files:**
- Modify: `assets/images/company-nio.jpg`（覆盖内容，文件名不变）
- Modify: `assets/images/gallery-pilates.jpg`（覆盖内容，文件名不变）

**Interfaces:**
- Consumes：无
- Produces：两个文件内容更新，`index.html` 里已有的 `src="assets/images/company-nio.jpg"`/`src="assets/images/gallery-pilates.jpg"` 引用不需要改动

- [ ] **Step 1: 覆盖蔚来公司图**

```bash
cd /Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos
cp "/Users/huiying.h.chen/Desktop/补充内容/公司照片/1385565f87a84027ac3a481325cc9e48.jpg" assets/images/company-nio.jpg
sips -Z 1000 assets/images/company-nio.jpg
```

注意：这是 `cp`（拷贝），不是 `mv`（移动）——源文件必须保持原样不动。

- [ ] **Step 2: 覆盖普拉提照片**

```bash
cp "/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片/3d8c5b5d48dd6926b36d61d4d461de29.jpg" assets/images/gallery-pilates.jpg
sips -Z 1200 assets/images/gallery-pilates.jpg
```

- [ ] **Step 3: 验证**

```bash
ls -la assets/images/company-nio.jpg assets/images/gallery-pilates.jpg
sips -g pixelWidth -g pixelHeight assets/images/company-nio.jpg
sips -g pixelWidth -g pixelHeight assets/images/gallery-pilates.jpg
```

Expected：两个文件都存在，尺寸都不超过各自的 `-Z` 上限。

- [ ] **Step 4: 用 Read 工具目视确认两张图片内容正确**

用 Read 工具查看 `assets/images/company-nio.jpg`，确认是远景建筑外观+NIO logo（不是旧的近景 logo 照）。查看 `assets/images/gallery-pilates.jpg`，确认是普拉提器械训练动作照（不是旧的镜前自拍）。

- [ ] **Step 5: Commit**

```bash
git add assets/images/company-nio.jpg assets/images/gallery-pilates.jpg
git commit -m "chore: 更新蔚来公司背景图与 Gallery 普拉提照片素材"
```

---

## Task 2: Hero 头像溢出卡片边界

**Files:**
- Modify: `css/style.css`（`.hero-avatar` 高度）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `css/style.css`**

将（第 225-231 行）：

```css
.hero-avatar {
  height: 300px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(10, 15, 20, 0.28));
}
```

替换为：

```css
.hero-avatar {
  height: 380px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(10, 15, 20, 0.28));
}
```

`.hero-card` 本身没有设置 `overflow: hidden`（确认：`css/style.css` 里 `.hero-card` 规则只有 `position/inset/border-radius/background/border/box-shadow/display/align-items/justify-content/backdrop-filter`，没有 `overflow`），所以加高头像会自然从卡片上下边缘溢出，不需要额外的定位或 `overflow: visible` 处理。

- [ ] **Step 2: 验证**

```bash
grep -q "height: 380px" css/style.css && echo "hero avatar overflow height OK"
```

- [ ] **Step 3: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-redesign-task2-hero.png --window-size=1440,900 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具查看截图，确认人像照片明显从玻璃卡片上下边缘露出（不是被裁切、也不是完全包含在卡片内）。如果因为已知的滚动淡入动画时序问题导致截图显得很淡，改用 `--dump-dom` 确认 `<img class="hero-avatar">` 存在且没有报错即可，不必反复截图。

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat: Hero 头像加高至溢出玻璃卡片边界，增强立体感"
```

---

## Task 3: Skills 精简为"雷达图 + 权重词云"

**Files:**
- Modify: `index.html`（删除 8 个环形卡 + 熟悉工具标签卡，新增词云卡）
- Modify: `css/style.css`（删除环形卡/熟悉工具相关规则，新增词云样式）
- Modify: `js/i18n.js`（删除 `skills.familiarLabel` key）
- Modify: `js/visualizations.js`（删除环形卡动画逻辑，只保留雷达图渲染）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定（词云是纯静态 HTML+CSS，不需要 JS 生成）

- [ ] **Step 1: 修改 `index.html`，删除环形卡与熟悉工具卡，新增词云卡**

将（第 106-180 行，`.skills-grid` 完整内容）：

```html
        <div class="skills-grid">
          <div class="card skills-radar-card" data-reveal>
            <div id="radar-chart" class="radar-chart-mount"></div>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="95" style="stroke-dasharray:213.63; stroke-dashoffset:10.68;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">95%</span>
            <p class="skill-name">Data Analysis</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="90" style="stroke-dasharray:213.63; stroke-dashoffset:21.36;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">90%</span>
            <p class="skill-name">Python</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="85" style="stroke-dasharray:213.63; stroke-dashoffset:32.04;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">85%</span>
            <p class="skill-name">SQL</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="82" style="stroke-dasharray:213.63; stroke-dashoffset:38.45;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">82%</span>
            <p class="skill-name">AI Tools</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="78" style="stroke-dasharray:213.63; stroke-dashoffset:47.00;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">78%</span>
            <p class="skill-name">Machine Learning</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="70" style="stroke-dasharray:213.63; stroke-dashoffset:64.09;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">70%</span>
            <p class="skill-name">Power BI</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="85" style="stroke-dasharray:213.63; stroke-dashoffset:32.04;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">85%</span>
            <p class="skill-name">MySQL</p>
          </div>
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="75" style="stroke-dasharray:213.63; stroke-dashoffset:53.41;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">75%</span>
            <p class="skill-name">Tableau</p>
          </div>
          <div class="card skills-familiar-card" data-reveal>
            <p class="skills-familiar-label" data-i18n-key="skills.familiarLabel">熟悉工具</p>
            <div class="timeline-tags">
              <span>Pandas</span><span>OpenPyXL</span><span>Matplotlib</span><span>Tkinter</span><span>Excel</span><span>ARIMAX</span><span>XGBoost-SHAP</span><span>MPC</span>
            </div>
          </div>
        </div>
```

替换为：

```html
        <div class="skills-grid">
          <div class="card skills-radar-card" data-reveal>
            <div id="radar-chart" class="radar-chart-mount"></div>
          </div>
          <div class="card skills-wordcloud-card" data-reveal>
            <div class="skills-wordcloud">
              <span class="skills-word skills-word--tier1">Data Analysis</span>
              <span class="skills-word skills-word--tier1">Python</span>
              <span class="skills-word skills-word--tier1">SQL</span>
              <span class="skills-word skills-word--tier2">AI Tools</span>
              <span class="skills-word skills-word--tier2">Machine Learning</span>
              <span class="skills-word skills-word--tier2">Power BI</span>
              <span class="skills-word skills-word--tier2">MySQL</span>
              <span class="skills-word skills-word--tier2">Tableau</span>
              <span class="skills-word skills-word--tier3">Pandas</span>
              <span class="skills-word skills-word--tier3">OpenPyXL</span>
              <span class="skills-word skills-word--tier3">Matplotlib</span>
              <span class="skills-word skills-word--tier3">Tkinter</span>
              <span class="skills-word skills-word--tier3">Excel</span>
              <span class="skills-word skills-word--tier3">ARIMAX</span>
              <span class="skills-word skills-word--tier3">XGBoost-SHAP</span>
              <span class="skills-word skills-word--tier3">MPC</span>
            </div>
          </div>
        </div>
```

（16 个技能点：核心档 3 个 = 雷达图前 3 项；熟练档 5 个 = 雷达图其余 3 项 + MySQL/Tableau；了解档 8 个 = 原"熟悉工具"标签行的全部内容，一个不少地保留下来，只是从独立标签行变成词云的一部分。）

- [ ] **Step 2: 修改 `css/style.css`，删除环形卡/熟悉工具规则，新增词云规则**

将（第 295-352 行，`.skills-grid` 到 `.skills-familiar-card` 响应式规则结束）：

```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: var(--space-3);
}
.skills-radar-card {
  grid-column: span 4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
.skills-familiar-card { grid-column: span 4; padding: var(--space-3); }
.skills-familiar-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-accent-violet);
  margin-bottom: 8px;
}
.radar-chart-mount { width: 100%; max-width: 320px; min-height: 260px; }
/* min-height 避免 JS 未执行、SVG 未被注入时这张卡片直接塌成 0 高度——
   雷达图本身没有实用的纯 CSS 静态替代，属于设计文档里"JS 增强型"的可视化，
   保留卡片占位尺寸即可，不强求无 JS 时也画出完整雷达图 */
.radar-grid { fill: none; stroke: var(--color-border); stroke-width: 1; }
.radar-data {
  fill: var(--color-accent-violet);
  fill-opacity: 0.28;
  stroke: var(--color-accent-violet);
  stroke-width: 2;
}
.radar-label { font-size: 10px; fill: var(--color-text-muted); font-family: var(--font-sans); }

.skill-ring-card {
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: var(--space-3);
}
.skill-ring { width: 80px; height: 80px; }
.skill-ring-track { fill: none; stroke: var(--color-border); stroke-width: 6; }
.skill-ring-progress { fill: none; stroke: var(--color-accent-cyan); stroke-width: 6; stroke-linecap: round; }
.skill-ring-value { font-size: 18px; font-weight: 800; margin-top: -54px; }
.skill-name { font-size: 13px; font-weight: 600; color: var(--color-text-muted); margin-top: 40px; }

@media (max-width: 900px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr); }
  .skills-radar-card { grid-column: span 2; }
  .skills-familiar-card { grid-column: span 2; }
}
@media (max-width: 560px) {
  .skills-grid { grid-template-columns: 1fr; }
  .skills-radar-card { grid-column: span 1; }
  .skills-familiar-card { grid-column: span 1; }
}
```

替换为：

```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  align-items: stretch;
}
.skills-radar-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
.radar-chart-mount { width: 100%; max-width: 320px; min-height: 260px; }
/* min-height 避免 JS 未执行、SVG 未被注入时这张卡片直接塌成 0 高度——
   雷达图本身没有实用的纯 CSS 静态替代，属于设计文档里"JS 增强型"的可视化，
   保留卡片占位尺寸即可，不强求无 JS 时也画出完整雷达图 */
.radar-grid { fill: none; stroke: var(--color-border); stroke-width: 1; }
.radar-data {
  fill: var(--color-accent-violet);
  fill-opacity: 0.28;
  stroke: var(--color-accent-violet);
  stroke-width: 2;
}
.radar-label { font-size: 10px; fill: var(--color-text-muted); font-family: var(--font-sans); }

.skills-wordcloud-card {
  display: flex;
  align-items: center;
  padding: var(--space-4);
}
.skills-wordcloud {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
}
.skills-word { font-weight: 700; }
.skills-word--tier1 { font-size: 28px; color: var(--color-accent-violet); }
.skills-word--tier2 { font-size: 19px; color: var(--color-accent-cyan); font-weight: 600; }
.skills-word--tier3 { font-size: 14px; color: var(--color-text-muted); font-weight: 500; }

@media (max-width: 900px) {
  .skills-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，删除 `skills.familiarLabel`**

`CONTENT_ZH`（第 35 行）从：

```js
  skills: { eyebrow: 'SKILLS', title: '技能', familiarLabel: '熟悉工具' },
```

改为：

```js
  skills: { eyebrow: 'SKILLS', title: '技能' },
```

`CONTENT_EN`（第 165 行）从：

```js
  skills: { eyebrow: 'SKILLS', title: 'Skills', familiarLabel: 'Also Familiar With' },
```

改为：

```js
  skills: { eyebrow: 'SKILLS', title: 'Skills' },
```

- [ ] **Step 4: 修改 `js/visualizations.js`，删除环形卡动画逻辑**

将整个文件（第 1-130 行）替换为：

```js
(function () {
  'use strict';

  var SKILLS = [
    { label: 'Data Analysis', value: 95 },
    { label: 'Python', value: 90 },
    { label: 'SQL', value: 85 },
    { label: 'AI Tools', value: 82 },
    { label: 'Machine Learning', value: 78 },
    { label: 'Power BI', value: 70 },
    { label: 'MySQL', value: 85 },
    { label: 'Tableau', value: 75 }
  ];

  function polarPoint(cx, cy, radius, index, total) {
    var angle = -Math.PI / 2 + index * (2 * Math.PI / total);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  function buildRadarSVG() {
    var cx = 130, cy = 130, maxR = 96, total = SKILLS.length;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 260 260');
    svg.setAttribute('class', 'radar-svg');

    [0.25, 0.5, 0.75, 1].forEach(function (ratio) {
      var pts = [];
      for (var i = 0; i < total; i++) {
        var p = polarPoint(cx, cy, maxR * ratio, i, total);
        pts.push(p.x + ',' + p.y);
      }
      var grid = document.createElementNS(svgNS, 'polygon');
      grid.setAttribute('points', pts.join(' '));
      grid.setAttribute('class', 'radar-grid');
      svg.appendChild(grid);
    });

    var dataPoints = [];
    SKILLS.forEach(function (skill, i) {
      var p = polarPoint(cx, cy, maxR * (skill.value / 100), i, total);
      dataPoints.push(p.x + ',' + p.y);
    });
    var dataPolygon = document.createElementNS(svgNS, 'polygon');
    dataPolygon.setAttribute('points', dataPoints.join(' '));
    dataPolygon.setAttribute('class', 'radar-data');
    svg.appendChild(dataPolygon);

    SKILLS.forEach(function (skill, i) {
      var labelPoint = polarPoint(cx, cy, maxR + 24, i, total);
      var text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', labelPoint.x);
      text.setAttribute('y', labelPoint.y);
      text.setAttribute('class', 'radar-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = skill.label;
      svg.appendChild(text);
    });

    return svg;
  }

  function renderRadar() {
    var mount = document.getElementById('radar-chart');
    if (!mount) return;
    mount.innerHTML = '';
    mount.appendChild(buildRadarSVG());
  }

  document.addEventListener('DOMContentLoaded', renderRadar);
})();
```

（`SKILLS` 数组保持不变——雷达图仍然是 8 轴，数组只驱动雷达图，和词云的静态 HTML 是两套独立数据，词云不需要从这个数组动态生成。`animateRings`/`initSkills`/`IntersectionObserver` 相关代码全部删除，因为环形卡不存在了，雷达图本身是一次性 SVG 构建，不需要滚动触发的动画。）

- [ ] **Step 5: 验证**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && echo "ALL JS OK"
grep -q "skill-ring-card" index.html && echo "STALE RING CARD FOUND (bug)" || echo "ring cards removed OK"
grep -q "skills-familiar-card" index.html && echo "STALE FAMILIAR CARD FOUND (bug)" || echo "familiar card removed OK"
grep -c "skills-word" index.html
grep -q "familiarLabel" js/i18n.js && echo "STALE i18n KEY FOUND (bug)" || echo "familiarLabel removed OK"
node -e "
var m = require('fs').readFileSync('js/visualizations.js','utf8').match(/var SKILLS = (\[[\s\S]*?\]);/);
console.log('SKILLS array length:', eval(m[1]).length);
"
```

Expected：`ALL JS OK`；`ring cards removed OK`；`familiar card removed OK`；`grep -c` 输出 `16`（16 个 `.skills-word` span）；`familiarLabel removed OK`；`SKILLS array length: 8`。

- [ ] **Step 6: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,2000 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -c 'class="skills-word'
```

Expected：输出 `16`。另外截图 `--screenshot=/tmp/portfolio-redesign-task3-skills.png --window-size=1440,1400` 用 Read 工具查看，确认 Skills 板块只剩两张卡片并排：左边雷达图、右边大小不一的技能词云，不再有环形进度条。

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/i18n.js js/visualizations.js
git commit -m "feat: Skills 板块精简为雷达图+权重词云，撤回环形卡与熟悉工具标签行"
```

---

## Task 4: Projects 改为交错时间轴

**Files:**
- Modify: `index.html`（`.projects-grid` 结构改为 `.projects-timeline`）
- Modify: `css/style.css`（新增时间轴样式，移除旧的 `.projects-grid` 规则）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定；5 个项目的文案（badge/title/desc/metric）与 `data-i18n-key` 完全不变，只改变外层容器结构

- [ ] **Step 1: 修改 `index.html`，`.projects-grid` 改为 `.projects-timeline`**

将（第 257-306 行，`.projects-grid` 开始到结束）：

```html
        <div class="projects-grid">
          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-supplychain.png" alt="供应链智能决策系统竞赛报告封面" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.supplyChain.badge">国竞一等奖</p>
              <h3 data-i18n-key="projects.supplyChain.title">爆品供应链全渠道库存优化与风险建模研究</h3>
              <p class="project-desc" data-i18n-key="projects.supplyChain.desc">构建 ARIMAX+TCN 需求预测模型，完成分渠道/分区域 13 周预测与风险区间测算；设计 MPC 动态库存优化框架，基于 XGBoost-SHAP 搭建风险传导模型</p>
              <p class="project-metric" data-i18n-key="projects.supplyChain.metric">库存周转率 +241.2% · 总成本 -25% · 服务水平 98.83%</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-insurance.jpg" alt="美国大学生数学建模竞赛 Honorable Mention 获奖证书" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.insurance.badge">美国 MCM Honorable Mention</p>
              <h3 data-i18n-key="projects.insurance.title">保险公司承保评级系统</h3>
              <p class="project-desc" data-i18n-key="projects.insurance.desc">基于巨灾模型计算保险公司预期损失，通过泊松分布仿真模拟随机生成损失总价值和极端天气发生概率，采用空间分析技术构建 Bankruptcy Index Model</p>
              <p class="project-metric" data-i18n-key="projects.insurance.metric">覆盖 146 个国家、16 万条数据</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-automation.png" alt="业务自动化分析工具 Python 代码截图" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.automation.badge">KN Group 实习产出</p>
              <h3 data-i18n-key="projects.automation.title">业务自动化分析工具</h3>
              <p class="project-desc" data-i18n-key="projects.automation.desc">基于 Python（Pandas、OpenPyXL）开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成</p>
              <p class="project-metric" data-i18n-key="projects.automation.metric">大幅提升周报/月报产出效率</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <img class="project-thumb project-thumb--website" src="assets/images/project-myoffer.png" alt="MyOffer 求职进度追踪网页界面截图" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.website.badge">AI 实践</p>
              <h3 data-i18n-key="projects.website.title">个人展示网页 / 简历投递辅助工具</h3>
              <p class="project-desc" data-i18n-key="projects.website.desc">利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-attendance.png" alt="学生考勤管理系统个人考勤统计运行截图" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.attendance.badge">大数据课程项目</p>
              <h3 data-i18n-key="projects.attendance.title">学生考勤管理系统</h3>
              <p class="project-desc" data-i18n-key="projects.attendance.desc">基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台，实现学生/班级/考勤信息增删改查，并用 Matplotlib 提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析</p>
              <p class="project-metric" data-i18n-key="projects.attendance.metric">覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）</p>
            </div>
          </div>
        </div>
```

替换为：

```html
        <div class="projects-timeline">
          <div class="timeline-node timeline-node--right" data-reveal>
            <span class="timeline-node-dot"></span>
            <div class="timeline-node-content">
              <div class="card project-card">
                <img class="project-thumb" src="assets/images/project-supplychain.png" alt="供应链智能决策系统竞赛报告封面" loading="lazy">
                <div class="project-body">
                  <p class="project-badge" data-i18n-key="projects.supplyChain.badge">国竞一等奖</p>
                  <h3 data-i18n-key="projects.supplyChain.title">爆品供应链全渠道库存优化与风险建模研究</h3>
                  <p class="project-desc" data-i18n-key="projects.supplyChain.desc">构建 ARIMAX+TCN 需求预测模型，完成分渠道/分区域 13 周预测与风险区间测算；设计 MPC 动态库存优化框架，基于 XGBoost-SHAP 搭建风险传导模型</p>
                  <p class="project-metric" data-i18n-key="projects.supplyChain.metric">库存周转率 +241.2% · 总成本 -25% · 服务水平 98.83%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline-node timeline-node--left" data-reveal>
            <span class="timeline-node-dot"></span>
            <div class="timeline-node-content">
              <div class="card project-card">
                <img class="project-thumb" src="assets/images/project-insurance.jpg" alt="美国大学生数学建模竞赛 Honorable Mention 获奖证书" loading="lazy">
                <div class="project-body">
                  <p class="project-badge" data-i18n-key="projects.insurance.badge">美国 MCM Honorable Mention</p>
                  <h3 data-i18n-key="projects.insurance.title">保险公司承保评级系统</h3>
                  <p class="project-desc" data-i18n-key="projects.insurance.desc">基于巨灾模型计算保险公司预期损失，通过泊松分布仿真模拟随机生成损失总价值和极端天气发生概率，采用空间分析技术构建 Bankruptcy Index Model</p>
                  <p class="project-metric" data-i18n-key="projects.insurance.metric">覆盖 146 个国家、16 万条数据</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline-node timeline-node--right" data-reveal>
            <span class="timeline-node-dot"></span>
            <div class="timeline-node-content">
              <div class="card project-card">
                <img class="project-thumb" src="assets/images/project-automation.png" alt="业务自动化分析工具 Python 代码截图" loading="lazy">
                <div class="project-body">
                  <p class="project-badge" data-i18n-key="projects.automation.badge">KN Group 实习产出</p>
                  <h3 data-i18n-key="projects.automation.title">业务自动化分析工具</h3>
                  <p class="project-desc" data-i18n-key="projects.automation.desc">基于 Python（Pandas、OpenPyXL）开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成</p>
                  <p class="project-metric" data-i18n-key="projects.automation.metric">大幅提升周报/月报产出效率</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline-node timeline-node--left" data-reveal>
            <span class="timeline-node-dot"></span>
            <div class="timeline-node-content">
              <div class="card project-card">
                <img class="project-thumb project-thumb--website" src="assets/images/project-myoffer.png" alt="MyOffer 求职进度追踪网页界面截图" loading="lazy">
                <div class="project-body">
                  <p class="project-badge" data-i18n-key="projects.website.badge">AI 实践</p>
                  <h3 data-i18n-key="projects.website.title">个人展示网页 / 简历投递辅助工具</h3>
                  <p class="project-desc" data-i18n-key="projects.website.desc">利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline-node timeline-node--right" data-reveal>
            <span class="timeline-node-dot"></span>
            <div class="timeline-node-content">
              <div class="card project-card">
                <img class="project-thumb" src="assets/images/project-attendance.png" alt="学生考勤管理系统个人考勤统计运行截图" loading="lazy">
                <div class="project-body">
                  <p class="project-badge" data-i18n-key="projects.attendance.badge">大数据课程项目</p>
                  <h3 data-i18n-key="projects.attendance.title">学生考勤管理系统</h3>
                  <p class="project-desc" data-i18n-key="projects.attendance.desc">基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台，实现学生/班级/考勤信息增删改查，并用 Matplotlib 提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析</p>
                  <p class="project-metric" data-i18n-key="projects.attendance.metric">覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）</p>
                </div>
              </div>
            </div>
          </div>
        </div>
```

（5 个项目的文案/图片/i18n key 全部原样保留，只是外层从"网格里的一张卡片"变成"时间轴上的一个节点"；第 1、3、5 个节点内容在右侧（`--right`），第 2、4 个在左侧（`--left`），`data-reveal` 移到 `.timeline-node` 上而不是内层 `.card`，因为现在 `.card` 不再直接参与网格布局。）

- [ ] **Step 2: 修改 `css/style.css`，时间轴样式替换网格样式**

将（第 398-417 行，`/* ===== Projects ===== */` 到 `.projects-grid` 响应式规则结束）：

```css
/* ===== Projects ===== */
.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.project-card { overflow: hidden; }
.project-thumb { display: block; width: 100%; height: 160px; position: relative; overflow: hidden; object-fit: cover; }
.project-body { padding: var(--space-3); }
.project-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-accent-violet);
  margin-bottom: 8px;
}
.project-body h3 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.project-desc { font-size: 14px; color: var(--color-text-muted); margin-bottom: 10px; }
.project-metric { font-size: 13px; font-weight: 700; color: var(--color-accent-orange); }

@media (max-width: 768px) {
  .projects-grid { grid-template-columns: 1fr; }
}
```

替换为：

```css
/* ===== Projects ===== */
.projects-timeline { position: relative; display: flex; flex-direction: column; gap: var(--space-4); }
.projects-timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
  transform: translateX(-50%);
}
.timeline-node {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  align-items: start;
}
.timeline-node-dot {
  grid-column: 2;
  justify-self: center;
  width: 16px;
  height: 16px;
  margin-top: 8px;
  border-radius: 50%;
  background: var(--gradient-primary);
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 4px var(--color-bg);
}
.timeline-node--right .timeline-node-content { grid-column: 3; padding-left: var(--space-3); }
.timeline-node--left .timeline-node-content { grid-column: 1; padding-right: var(--space-3); }
.project-card { overflow: hidden; }
.project-thumb { display: block; width: 100%; height: 160px; position: relative; overflow: hidden; object-fit: cover; }
.project-body { padding: var(--space-3); }
.project-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-accent-violet);
  margin-bottom: 8px;
}
.project-body h3 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.project-desc { font-size: 14px; color: var(--color-text-muted); margin-bottom: 10px; }
.project-metric { font-size: 13px; font-weight: 700; color: var(--color-accent-orange); }

@media (max-width: 768px) {
  .projects-timeline::before { left: 20px; }
  .timeline-node { grid-template-columns: 40px 1fr; }
  .timeline-node-dot { grid-column: 1; margin-top: 8px; }
  .timeline-node--right .timeline-node-content,
  .timeline-node--left .timeline-node-content {
    grid-column: 2;
    padding-left: var(--space-3);
    padding-right: 0;
  }
}
```

（窄屏下放弃左右交错，退化成单栏时间轴：竖线移到左侧 20px 处，圆点固定在左边第 1 列，内容统一放第 2 列，`.timeline-node--right`/`--left` 的差异化 `grid-column` 在这个断点下被覆盖成相同值。）

- [ ] **Step 3: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -q "projects-grid" index.html css/style.css && echo "STALE GRID CLASS FOUND (bug)" || echo "projects-grid removed OK"
grep -c "timeline-node--right" index.html
grep -c "timeline-node--left" index.html
grep -c "class=\"timeline-node " index.html
```

Expected：`i18n.js OK`；`projects-grid removed OK`；`timeline-node--right` 出现 `3`；`timeline-node--left` 出现 `2`；第三条 grep 可能因为 class 顺序不同而不精确匹配，改用 `grep -c 'timeline-node timeline-node--'` 确认总数为 `5`。

- [ ] **Step 4: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-redesign-task4-projects.png --window-size=1440,4500 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具查看截图（滚动到 Projects 区域），确认：中间一条竖线贯穿 5 个项目节点，节点内容左右交替排列（第 1、3、5 个在右侧，第 2、4 个在左侧），每个节点在竖线上有一个圆点标记，5 个项目的图片/文案都完整保留没有丢失。

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: Projects 板块改为左右交错时间轴布局"
```

---

## Task 5: Gallery 改为抽卡交互（含 About 旅行趣事文案迁移）

**Files:**
- Modify: `index.html`（删除 About 的 `.about-travel` 块；`.gallery-grid` 改为抽卡组件）
- Modify: `css/style.css`（删除 `.about-travel`/`.gallery-grid`/`.gallery-cell*` 规则，新增抽卡组件样式）
- Modify: `js/i18n.js`（删除 `about.travelNote`，新增 `gallery.travelCaption`）
- Create: `js/gallery-cards.js`（洗牌/翻牌/计数器交互逻辑）
- Modify: `index.html`（`</body>` 前新增 `<script src="js/gallery-cards.js"></script>`）

**Interfaces:**
- Consumes：`assets/images/gallery-*.jpg`（8 张已有真实照片，Task 1 已把普拉提那张换成新素材）
- Produces：`js/gallery-cards.js` 独立文件，只负责 Gallery 的抽卡交互，不影响其他任务

- [ ] **Step 1: 修改 `index.html`，删除 About 的旅行趣事块**

将（第 96-99 行）：

```html
        <div class="card about-travel" data-reveal>
          <p data-i18n-key="about.travelNote">旅行是我和朋友们的固定节目：轮流组队当"导游"，那一次由导游全权安排行程，其余人无条件跟随——目前已经轮了好几轮。</p>
        </div>
      </div>
    </section>
```

替换为：

```html
      </div>
    </section>
```

- [ ] **Step 2: 修改 `index.html`，`.gallery-grid` 改为抽卡组件**

将（第 360-393 行，`.gallery-grid` 完整内容）：

```html
        <div class="gallery-grid">
          <div class="gallery-cell gallery-cell--travel" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-travel.jpg" alt="陈慧莹戴草帽在茶园旅行留影" loading="lazy">
            <span data-i18n-key="gallery.travel">旅行</span>
          </div>
          <div class="gallery-cell gallery-cell--reading" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-reading.jpg" alt="书桌上一摞个人成长类书籍" loading="lazy">
            <span data-i18n-key="gallery.reading">阅读</span>
          </div>
          <div class="gallery-cell gallery-cell--swim" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-swim.jpg" alt="陈慧莹在泳池中自由泳练习" loading="lazy">
            <span data-i18n-key="gallery.swim">游泳</span>
          </div>
          <div class="gallery-cell gallery-cell--ukulele" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-ukulele.jpg" alt="陈慧莹弹尤克里里自拍" loading="lazy">
            <span data-i18n-key="gallery.ukulele">尤克里里</span>
          </div>
          <div class="gallery-cell gallery-cell--pilates" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-pilates.jpg" alt="陈慧莹在普拉提工作室镜前自拍" loading="lazy">
            <span data-i18n-key="gallery.pilates">普拉提</span>
          </div>
          <div class="gallery-cell gallery-cell--award" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-award.jpg" alt="陈慧莹与团队在竞赛颁奖典礼上合影领奖" loading="lazy">
            <span data-i18n-key="gallery.award">获奖时刻</span>
          </div>
          <div class="gallery-cell gallery-cell--billiards" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-billiards.jpg" alt="陈慧莹在台球厅打台球" loading="lazy">
            <span data-i18n-key="gallery.billiards">台球</span>
          </div>
          <div class="gallery-cell gallery-cell--friends" data-reveal>
            <img class="gallery-cell-img" src="assets/images/gallery-friends.jpg" alt="陈慧莹与朋友们在草坪野餐合影" loading="lazy">
            <span data-i18n-key="gallery.friends">朋友时光</span>
          </div>
        </div>
```

替换为：

```html
        <div class="gallery-deck-wrap" data-reveal>
          <div class="gallery-deck">
            <span class="deck-back-card deck-back-card--2" aria-hidden="true"></span>
            <span class="deck-back-card deck-back-card--1" aria-hidden="true"></span>
            <div class="gallery-flipcard" id="gallery-flipcard">
              <div class="gallery-flipcard-inner">
                <div class="card-face card-face--back">
                  <span class="card-face-logo">陈慧莹</span>
                </div>
                <div class="card-face card-face--front">
                  <img class="card-face-img" id="gallery-card-img" src="" alt="" loading="lazy">
                  <div class="card-face-scrim"></div>
                  <span class="card-face-label" id="gallery-card-label"></span>
                  <p class="card-face-caption" id="gallery-card-caption"></p>
                </div>
              </div>
            </div>
          </div>
          <div class="gallery-deck-controls">
            <button type="button" class="btn btn-primary" id="gallery-draw-btn" data-i18n-key="gallery.drawCta">抽一张</button>
            <span class="gallery-deck-counter" id="gallery-deck-counter">0 / 8</span>
          </div>
        </div>
```

- [ ] **Step 3: 修改 `index.html`，引入新脚本**

将（`</body>` 前）：

```html
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
  <script src="js/visualizations.js"></script>
</body>
```

替换为：

```html
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
  <script src="js/visualizations.js"></script>
  <script src="js/gallery-cards.js"></script>
</body>
```

- [ ] **Step 4: 修改 `css/style.css`，删除 `.about-travel`/旧 Gallery 规则，新增抽卡组件样式**

删除（第 279-285 行）：

```css
.about-travel {
  padding: var(--space-3);
  font-size: 15px;
  color: var(--color-text-muted);
  border-left: 3px solid var(--color-accent-violet);
  border-radius: var(--radius-card);
}
```

将（第 453-514 行，`/* ===== Gallery ===== */` 到该断点规则结束）：

```css
/* ===== Gallery ===== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 140px 350px 140px;
  gap: var(--space-2);
}
.gallery-cell {
  border-radius: var(--radius-card);
  display: flex;
  align-items: flex-end;
  padding: var(--space-2);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-medium);
}
.gallery-cell:hover { transform: scale(1.02); }
.gallery-cell-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.gallery-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%);
  z-index: 1;
}
.gallery-cell span {
  position: relative;
  z-index: 2;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.gallery-cell--travel   { grid-column: 1; grid-row: 1; }
.gallery-cell--reading  { grid-column: 2; grid-row: 1; }
.gallery-cell--swim     { grid-column: 3; grid-row: 1; }
.gallery-cell--friends  { grid-column: 4; grid-row: 1 / span 2; }
.gallery-cell--ukulele  { grid-column: 1; grid-row: 2; }
.gallery-cell--pilates  { grid-column: 2; grid-row: 2; }
.gallery-cell--award    { grid-column: 3; grid-row: 2; }
.gallery-cell--billiards{ grid-column: 1; grid-row: 3; }

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: none;
    grid-auto-rows: 140px;
  }
  .gallery-cell--travel, .gallery-cell--reading, .gallery-cell--swim, .gallery-cell--friends,
  .gallery-cell--ukulele, .gallery-cell--pilates, .gallery-cell--award, .gallery-cell--billiards {
    grid-column: auto;
    grid-row: auto;
  }
  .gallery-cell--friends { grid-row: span 2; }
}
```

替换为：

```css
/* ===== Gallery ===== */
.gallery-deck-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.gallery-deck {
  position: relative;
  width: 280px;
  height: 360px;
  perspective: 1200px;
}
.deck-back-card {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-card);
  background: var(--gradient-primary);
  box-shadow: var(--shadow-card);
}
.deck-back-card--1 { transform: rotate(-4deg); opacity: 0.55; }
.deck-back-card--2 { transform: rotate(6deg); opacity: 0.35; }
.gallery-flipcard {
  position: absolute;
  inset: 0;
}
.gallery-flipcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}
.gallery-flipcard.is-flipped .gallery-flipcard-inner { transform: rotateY(180deg); }
.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  backface-visibility: hidden;
  box-shadow: var(--shadow-card-hover);
}
.card-face--back {
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-face-logo {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.08em;
}
.card-face--front {
  transform: rotateY(180deg);
  background: var(--color-surface);
}
.card-face-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.card-face-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%);
  z-index: 1;
}
.card-face-label {
  position: absolute;
  left: var(--space-2);
  bottom: 48px;
  z-index: 2;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.card-face-caption {
  position: absolute;
  left: var(--space-2);
  right: var(--space-2);
  bottom: var(--space-2);
  z-index: 2;
  color: rgba(255,255,255,0.9);
  font-size: 12px;
  line-height: 1.5;
}
.card-face-caption:empty { display: none; }
.gallery-deck-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.gallery-deck-counter {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .gallery-flipcard-inner { transition: none; }
}
```

- [ ] **Step 5: 修改 `js/i18n.js`，删除 `about.travelNote`，新增 `gallery.travelCaption`/`gallery.drawCta`**

`CONTENT_ZH.about`（第 18-34 行）从：

```js
  about: {
    eyebrow: 'ABOUT ME',
    lead: '应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。',
    title: '关于我',
    labelName: '姓名',
    labelCity: '所在城市',
    valueCity: '上海',
    labelEducation: '学历',
    valueEducation: '东华大学 · 应用统计硕士（211，27届毕业生）',
    labelFocus: '职业方向',
    valueFocus: '数据分析 · 风险分析',
    labelResearch: '研究方向',
    valueResearch: '经营分析、风险建模、预测建模',
    labelHobbies: '兴趣爱好',
    valueHobbies: '阅读、普拉提、游泳、尤克里里、旅行',
    travelNote: '旅行是我和朋友们的固定节目：轮流组队当"导游"，那一次由导游全权安排行程，其余人无条件跟随——目前已经轮了好几轮。'
  },
```

改为（删除 `travelNote`）：

```js
  about: {
    eyebrow: 'ABOUT ME',
    lead: '应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。',
    title: '关于我',
    labelName: '姓名',
    labelCity: '所在城市',
    valueCity: '上海',
    labelEducation: '学历',
    valueEducation: '东华大学 · 应用统计硕士（211，27届毕业生）',
    labelFocus: '职业方向',
    valueFocus: '数据分析 · 风险分析',
    labelResearch: '研究方向',
    valueResearch: '经营分析、风险建模、预测建模',
    labelHobbies: '兴趣爱好',
    valueHobbies: '阅读、普拉提、游泳、尤克里里、旅行'
  },
```

`CONTENT_ZH.gallery`（第 115-120 行）从：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', billiards: '台球', friends: '朋友时光'
  },
```

改为：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', billiards: '台球', friends: '朋友时光',
    travelCaption: '旅行是我和朋友们的固定节目：轮流组队当"导游"，那一次由导游全权安排行程，其余人无条件跟随——目前已经轮了好几轮。',
    drawCta: '抽一张'
  },
```

同样，`CONTENT_EN.about` 删除 `travelNote: 'Travel is a running tradition...'` 那一行（第 163 行），`CONTENT_EN.gallery`（第 245-250 行左右，具体行号以实际读取为准）新增：

```js
    travelCaption: 'Travel is a running tradition with my friends: we take turns being the "tour guide" for a trip — that person plans everything, and everyone else follows without question. We\'ve been through several rounds already.',
    drawCta: 'Draw a Card'
```

- [ ] **Step 6: 创建 `js/gallery-cards.js`**

```js
(function () {
  'use strict';

  var CARDS = [
    { key: 'travel', img: 'assets/images/gallery-travel.jpg', alt: '陈慧莹戴草帽在茶园旅行留影', hasCaption: true },
    { key: 'reading', img: 'assets/images/gallery-reading.jpg', alt: '书桌上一摞个人成长类书籍', hasCaption: false },
    { key: 'swim', img: 'assets/images/gallery-swim.jpg', alt: '陈慧莹在泳池中自由泳练习', hasCaption: false },
    { key: 'ukulele', img: 'assets/images/gallery-ukulele.jpg', alt: '陈慧莹弹尤克里里自拍', hasCaption: false },
    { key: 'pilates', img: 'assets/images/gallery-pilates.jpg', alt: '陈慧莹在普拉提工作室训练', hasCaption: false },
    { key: 'award', img: 'assets/images/gallery-award.jpg', alt: '陈慧莹与团队在竞赛颁奖典礼上合影领奖', hasCaption: false },
    { key: 'billiards', img: 'assets/images/gallery-billiards.jpg', alt: '陈慧莹在台球厅打台球', hasCaption: false },
    { key: 'friends', img: 'assets/images/gallery-friends.jpg', alt: '陈慧莹与朋友们在草坪野餐合影', hasCaption: false }
  ];

  var order = [];
  var pointer = 0;

  function shuffle() {
    var arr = CARDS.map(function (_, i) { return i; });
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function currentLang() {
    var stored = localStorage.getItem('lang');
    return (stored === 'en') ? 'en' : 'zh';
  }

  function resolveText(dictPath) {
    var dict = (currentLang() === 'en') ? window.CONTENT_EN : window.CONTENT_ZH;
    var path = dictPath.split('.');
    var value = dict;
    for (var i = 0; i < path.length; i++) {
      value = value && value[path[i]];
    }
    return (typeof value === 'string') ? value : '';
  }

  function applyCard(card) {
    var img = document.getElementById('gallery-card-img');
    var label = document.getElementById('gallery-card-label');
    var caption = document.getElementById('gallery-card-caption');
    if (!img || !label || !caption) return;
    img.src = card.img;
    img.alt = card.alt;
    label.textContent = resolveText('gallery.' + card.key);
    label.setAttribute('data-i18n-key', 'gallery.' + card.key);
    if (card.hasCaption) {
      caption.textContent = resolveText('gallery.travelCaption');
      caption.setAttribute('data-i18n-key', 'gallery.travelCaption');
    } else {
      caption.textContent = '';
      caption.removeAttribute('data-i18n-key');
    }
  }

  function updateCounter() {
    var counter = document.getElementById('gallery-deck-counter');
    if (counter) counter.textContent = pointer + ' / ' + CARDS.length;
  }

  function drawNext() {
    if (pointer >= order.length) {
      order = shuffle();
      pointer = 0;
    }
    var card = CARDS[order[pointer]];
    pointer++;
    updateCounter();

    var flipcard = document.getElementById('gallery-flipcard');
    if (!flipcard) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !flipcard.classList.contains('is-flipped')) {
      applyCard(card);
      flipcard.classList.add('is-flipped');
      return;
    }

    flipcard.classList.remove('is-flipped');
    setTimeout(function () {
      applyCard(card);
      flipcard.classList.add('is-flipped');
    }, 300);
  }

  function initGalleryCards() {
    var btn = document.getElementById('gallery-draw-btn');
    if (!btn) return;
    order = shuffle();
    pointer = 0;
    updateCounter();
    btn.addEventListener('click', drawNext);
  }

  document.addEventListener('DOMContentLoaded', initGalleryCards);
})();
```

（`resolveText` 是一个自包含的 dotted-path 解析小函数，和 `js/main.js` 里 `setLang()` 内部用的解析逻辑思路一致，但独立实现——因为 `js/main.js` 没有把这个逻辑导出成公共函数，为了不改动 `js/main.js` 既有结构，这里按同样的思路单独写一份，两处保持简单重复优于强行抽象共享。语言切换时如果卡片已经翻开，文字不会自动跟着切换语言——用户需要重新点一次"抽一张"才会用新语言重新渲染当前文案；这是一个可以接受的已知限制，因为 `main.js` 的 `setLang()` 只会更新 DOM 里已有 `data-i18n-key` 的元素文本，而这几个元素的 `data-i18n-key` 属性和文本都是这个新脚本自己管理的，两边不冲突但也不会互相触发。）

- [ ] **Step 7: 验证**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && node --check js/gallery-cards.js && echo "ALL JS OK"
grep -q "about-travel" index.html css/style.css && echo "STALE about-travel FOUND (bug)" || echo "about-travel removed OK"
grep -q "travelNote" js/i18n.js && echo "STALE travelNote KEY FOUND (bug)" || echo "travelNote removed OK"
grep -q "travelCaption" js/i18n.js && echo "travelCaption present OK"
grep -q "gallery-cell" index.html css/style.css && echo "STALE gallery-cell FOUND (bug)" || echo "gallery-cell removed OK"
grep -q "gallery-flipcard" index.html && echo "flipcard wired OK"
```

Expected：`ALL JS OK`；`about-travel removed OK`；`travelNote removed OK`；`travelCaption present OK`；`gallery-cell removed OK`；`flipcard wired OK`。

- [ ] **Step 8: DOM 结构 + 交互检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,900 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -o '<span class="gallery-deck-counter"[^>]*>[^<]*'
```

Expected：输出 `0 / 8`（页面加载后、点击抽卡按钮前的初始计数器状态）。

另外截图 `--screenshot=/tmp/portfolio-redesign-task5-gallery.png --window-size=1440,900` 用 Read 工具查看 Gallery 区域，确认：牌堆视觉（几张错位堆叠的卡片背面）+ "抽一张"按钮 + 计数器都正常显示，不再是 8 格 Bento 网格。

由于抽卡是纯 JS 点击交互，headless Chrome 的 `--screenshot` 单帧截图无法验证"点击后翻牌"这个动态过程本身——如果需要更进一步确认点击逻辑，可以用 `--dump-dom` 配合浏览器自动化脚本模拟点击（比如通过 Node 写一个简单的 CDP 脚本触发 click 事件后再次 dump DOM，检查 `is-flipped` class 和计数器是否变成 `1 / 8`），这一步不是强制要求，做结构验证+目视截图已经能确认组件正确挂载。

- [ ] **Step 9: Commit**

```bash
git add index.html css/style.css js/i18n.js js/gallery-cards.js
git commit -m "feat: Gallery 改为抽卡交互，About 旅行趣事文案迁移为旅行卡配文"
```

---

## Task 6: 全站最终验证

**Files:**
- 无新增文件；如发现问题在本任务里直接小修（记录改了什么）

**Interfaces:**
- Consumes：Task 1-5 的全部产出
- Produces：无（收尾验收任务）

- [ ] **Step 1: 全文件语法与结构复查**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && node --check js/gallery-cards.js && echo "ALL JS OK"
grep -c '<section id=' index.html
```

Expected：`ALL JS OK`；`grep -c` 输出 `8`（8 个 section 不变）。

- [ ] **Step 2: 确认删除的元素/key 全部清理干净**

```bash
grep -qi "skill-ring\|skills-familiar\|about-travel\|travelNote\|gallery-cell\b\|projects-grid" index.html css/style.css js/i18n.js js/visualizations.js && echo "STALE REFERENCE FOUND (bug)" || echo "all stale references removed OK"
```

Expected：`all stale references removed OK`。

- [ ] **Step 3: i18n key 完整性复查**

```bash
grep -o 'data-i18n-key="[a-zA-Z0-9_.]*"' index.html | sed -E 's/data-i18n-key="(.*)"/\1/' | sort -u > /tmp/portfolio-redesign-keys.txt
node -e "
global.window = {};
const fs = require('fs');
eval(fs.readFileSync('js/i18n.js', 'utf8'));
const keys = fs.readFileSync('/tmp/portfolio-redesign-keys.txt', 'utf8').trim().split('\n');
let missing = [];
for (const k of keys) {
  const path = k.split('.');
  let zh = window.CONTENT_ZH, en = window.CONTENT_EN;
  for (const p of path) { zh = zh && zh[p]; en = en && en[p]; }
  if (typeof zh !== 'string') missing.push('ZH missing: ' + k);
  if (typeof en !== 'string') missing.push('EN missing: ' + k);
}
console.log('total keys checked:', keys.length);
console.log('missing count:', missing.length);
missing.forEach(m => console.log(m));
"
```

Expected：`missing count: 0`（注意 `js/gallery-cards.js` 里动态设置的 `data-i18n-key`——比如 `gallery.travel`、`gallery.travelCaption`——不会出现在 index.html 的静态 `data-i18n-key` 属性里，因为这两个属性是 JS 运行时才赋值上去的，这条 grep 只检查页面加载时就存在于 HTML 源码里的 key，属于预期范围内的限制，不是漏洞）。

- [ ] **Step 4: 图片引用完整性**

```bash
grep -o 'assets/images/[a-zA-Z0-9_.-]*\.\(jpg\|png\)' index.html js/gallery-cards.js | sed 's/^[^:]*://' | sort -u | while read -r p; do
  test -f "$p" && echo "OK: $p" || echo "MISSING: $p"
done
```

Expected：每一行都是 `OK: ...`。

- [ ] **Step 5: 视觉总检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-redesign-final-full.png --window-size=1440,7000 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具通读全页截图（受滚动淡入动画时序问题影响可能显得很淡，属于已知情况，用之前几步的 `--dump-dom` 结果交叉确认结构即可），从上到下确认：Hero 头像溢出卡片、About 没有旅行趣事段落了、Skills 只剩雷达图+词云两张卡、Experience 蔚来卡片背景图是新的建筑外观图、Projects 是交错时间轴、Gallery 是抽卡组件。

- [ ] **Step 6: 人工验收清单（需要用户在真实浏览器里完成）**

请双击打开 `index.html`，确认：

1. 无控制台报错
2. Hero 头像溢出卡片边界的视觉效果是否满意
3. Skills 词云字号大小是否有明显的层次感（核心/熟练/了解三档清晰可辨）
4. Experience 蔚来卡片的新背景图显示正常
5. Projects 时间轴左右交错的视觉效果，桌面宽屏和手机宽度下都检查一遍
6. Gallery 点击"抽一张"按钮，确认：翻牌动画正常、每次点击换一张不同照片、计数器数字递增、抽满 8 张后再点击会重新洗牌从 1 开始、抽到"旅行"那张卡时下方有旅行趣事配文
7. 深浅色切换、中英文切换后，以上各处内容依然正常（注意：如果在卡片已经翻开的状态下切换语言，卡片上的文字不会立即更新，需要重新点一次"抽一张"才会用新语言显示——这是已知的设计取舍，不是 bug）

确认完成后告诉我结果；如果发现任何一项不符合预期，说明具体是哪一步、看到了什么，我再回来修。

- [ ] **Step 7: Commit（仅当 Step 1-4 期间有实际修改时才提交；若无修改可跳过）**

```bash
git status --short
```

若有变更：

```bash
git add -A
git commit -m "chore: 交互重构收尾复核"
```

若无变更，本任务到 Step 6 的人工确认为止即可。

---
