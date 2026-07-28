# 内容深化与视觉优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 放大 Hero 头像、补全 About 引言、丰富 Skills 内容密度、深化 Experience 描述并加公司图、给 Projects 5 张卡片全部配上真实图片、把 Achievements 从纯数字改成列表式真实内容、调整 Gallery 3 个格子的尺寸。

**Architecture:** 在现有 index.html/css/style.css/js/i18n.js/js/visualizations.js 的既有结构上做增量替换，不引入新文件类型或新机制；延续 v2（真实图片）建立的"素材先拷贝压缩进 assets/images/，再改 HTML 引用"的两阶段模式。

**Tech Stack:** 沿用 v1/v2（纯 HTML/CSS/原生 JS，零依赖零构建）；素材准备阶段用到 `sips`（缩放）、`pdftoppm`（PDF 转图片，已确认可用于 `/opt/homebrew/bin/pdftoppm`）、headless Chrome（渲染代码截图）。

## Global Constraints（继承自 v1/v2）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 配色仅用 `css/tokens.css` 定义的 CSS 变量，不写死新颜色字面量（白色半透明纹理叠层是已确认接受的例外）
- 图片只用本地文件（`assets/images/`），一律 `<img>` + 有意义 `alt`
- 内容锚定真实资料，不编造未确认数据
- 截图验证一律用 headless Chrome：`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=<路径> --window-size=<W>,<H> "file://<index.html 绝对路径>"`；本代码库有已知的"滚动淡入动画时序"问题（单帧截图会拍到 IntersectionObserver+CSS transition 动画中途，显得很淡），需要更可靠验证时改用 `--dump-dom` 检查 DOM 结构而不是纠结截图观感

---

## Task 1: 素材准备（公司照片 + 项目配图 + 代码截图生成）

**Files:**
- Create: `assets/images/company-kngroup.jpg`
- Create: `assets/images/company-nio.jpg`
- Create: `assets/images/company-zhouji.jpg`
- Create: `assets/images/project-supplychain.png`
- Create: `assets/images/project-insurance.jpg`
- Create: `assets/images/project-attendance.png`
- Create: `assets/images/project-automation.png`

**Interfaces:**
- Consumes：无
- Produces：以上 7 个文件路径，供 Task 4（Experience 公司图）、Task 5（Projects 配图）直接引用

- [ ] **Step 1: 拷贝并压缩 3 张公司照片**

```bash
cd /Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos
SRC="/Users/huiying.h.chen/Desktop/补充内容/公司照片"
cp "$SRC/d0641070f6d2f09ee819f6ffbb79ba43.jpg" assets/images/company-kngroup.jpg
cp "$SRC/70855e22328aab3a9a71b98d89b9c2ca.jpg" assets/images/company-nio.jpg
cp "$SRC/43f4c816252304faf492b4411f91be31.jpg" assets/images/company-zhouji.jpg
sips -Z 1000 assets/images/company-kngroup.jpg assets/images/company-nio.jpg assets/images/company-zhouji.jpg
```

注意：这是 `cp`（拷贝），不是 `mv`（移动）——`/Users/huiying.h.chen/Desktop/补充内容/` 下的原始文件必须保持原样不动。

- [ ] **Step 2: 渲染供应链 PDF 封面页**

```bash
pdftoppm -png -f 1 -l 1 -r 150 "/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目二供应链全渠道库存优化与风险建模研究/决赛B2025094.pdf" /tmp/portfolio-content-refresh-supplychain
cp /tmp/portfolio-content-refresh-supplychain-1.png assets/images/project-supplychain.png
sips -Z 1200 assets/images/project-supplychain.png
```

Expected：`pdftoppm` 可能会输出字体相关的 `Syntax Warning`，忽略即可（不影响输出图片），最终 `assets/images/project-supplychain.png` 存在。

- [ ] **Step 3: 拷贝保险公司获奖证书图（独立于 Gallery 已用的那份拷贝）**

```bash
cp "/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片/900aac08198c785ec84f8de0884b8b7a.jpg" assets/images/project-insurance.jpg
sips -Z 1200 assets/images/project-insurance.jpg
```

- [ ] **Step 4: 拷贝考勤系统真实运行截图**

```bash
cp "/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目一考勤系统/1255b3d9e49d4e7f4c2005c9d634da50.png" assets/images/project-attendance.png
sips -Z 1200 assets/images/project-attendance.png
```

- [ ] **Step 5: 生成业务自动化分析工具的代码截图**

先读取真实源码前 25 行做确认：

```bash
head -25 "/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/项目四业务自动化分析工具/分包首续贷按月放款金额.py"
```

Expected 输出应为：

```python
import pandas as pd
import numpy as np
from pathlib import Path


def natural_sort_key(text):
    """
    自然排序键函数，用于正确处理数字和字符串的混合排序
    例如：1, 2, 3, 10, 11 而不是 1, 10, 11, 2, 3
    """
    import re
    def convert(text):
        return int(text) if str(text).isdigit() else text

    return [convert(c) for c in re.split('([0-9]+)', str(text))]


def process_loan_data(file_path, output_path=None):
    """
    处理放款金额表，按reg_app_name生成多个sheet

    参数:
    file_path: 输入Excel文件路径
    output_path: 输出Excel文件路径（默认为原文件名_processed.xlsx）
    """

    # 读取数据，确保数值列是数值类型
```

如果实际输出和上面不完全一致，以实际读到的内容为准，跳过下一步的一次性渲染文件，改用实际读到的真实代码文本替换下面 HTML 里 `<pre>` 块中的对应内容（不要保留上面这段作为兜底占位，必须是从源文件读到的真实文本）。

创建临时渲染文件 `/tmp/portfolio-content-refresh-code.html`（这是一次性素材生成用的文件，不进项目仓库，纯内联 HTML/CSS，不引用任何外部资源）：

```bash
cat > /tmp/portfolio-content-refresh-code.html << 'CODE_EOF'
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { margin: 0; background: #0d1117; font-family: -apple-system, "SF Mono", Menlo, monospace; }
  .window { width: 720px; }
  .titlebar { background: #161b22; padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #21262d; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }
  .filename { color: #8b949e; font-size: 13px; margin-left: 8px; }
  pre { margin: 0; padding: 20px 24px; font-size: 14px; line-height: 1.7; color: #c9d1d9; white-space: pre; overflow: hidden; }
  .kw { color: #ff7b72; }
  .fn { color: #d2a8ff; }
  .str { color: #a5d6ff; }
  .cm { color: #8b949e; }
  .num { color: #79c0ff; }
</style></head>
<body>
<div class="window">
  <div class="titlebar">
    <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
    <span class="filename">分包首续贷按月放款金额.py</span>
  </div>
  <pre><span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> pathlib <span class="kw">import</span> Path


<span class="kw">def</span> <span class="fn">natural_sort_key</span>(text):
    <span class="str">"""
    自然排序键函数，用于正确处理数字和字符串的混合排序
    例如：1, 2, 3, 10, 11 而不是 1, 10, 11, 2, 3
    """</span>
    <span class="kw">import</span> re
    <span class="kw">def</span> <span class="fn">convert</span>(text):
        <span class="kw">return</span> <span class="fn">int</span>(text) <span class="kw">if</span> <span class="fn">str</span>(text).isdigit() <span class="kw">else</span> text

    <span class="kw">return</span> [convert(c) <span class="kw">for</span> c <span class="kw">in</span> re.split(<span class="str">'([0-9]+)'</span>, <span class="fn">str</span>(text))]


<span class="kw">def</span> <span class="fn">process_loan_data</span>(file_path, output_path=<span class="kw">None</span>):
    <span class="str">"""
    处理放款金额表，按reg_app_name生成多个sheet

    参数:
    file_path: 输入Excel文件路径
    output_path: 输出Excel文件路径（默认为原文件名_processed.xlsx）
    """</span>

    <span class="cm"># 读取数据，确保数值列是数值类型</span>
    df = pd.read_excel(file_path)</pre>
</div>
</body></html>
CODE_EOF
```

**重要：** 上面 `<pre>` 块里的代码内容必须与本 Step 开头 `head -25` 实际读到的真实文件内容逐字一致（本计划撰写时已经现场读取过一次，如果实施时重新读取发现不一致，以实施时读到的为准，手动修正这个 HTML 文件里的代码文本，不要保留不匹配的旧文本）。

用 headless Chrome 截图：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-content-refresh-code.png --window-size=760,560 "file:///tmp/portfolio-content-refresh-code.html"
cp /tmp/portfolio-content-refresh-code.png assets/images/project-automation.png
sips -Z 1200 assets/images/project-automation.png
```

- [ ] **Step 6: 验证**

```bash
ls -la assets/images/company-kngroup.jpg assets/images/company-nio.jpg assets/images/company-zhouji.jpg assets/images/project-supplychain.png assets/images/project-insurance.jpg assets/images/project-attendance.png assets/images/project-automation.png
```

Expected：7 个文件全部存在，大小均非 0 字节。

- [ ] **Step 7: 用 Read 工具目视确认代码截图渲染正确**

用 Read 工具查看 `assets/images/project-automation.png`，确认：深色代码编辑器风格卡片，标题栏显示"分包首续贷按月放款金额.py"，正文是真实的 Python 代码（`import pandas as pd` 开头，`natural_sort_key` 函数定义），关键字/字符串/注释有不同颜色区分。

- [ ] **Step 8: Commit**

```bash
git add assets/images/
git commit -m "chore: 新增 Experience 公司图与 Projects 5 张真实配图素材"
```

---

## Task 2: Hero 头像放大 + About 新增引言段

**Files:**
- Modify: `css/style.css`（`.hero-avatar` 高度）
- Modify: `index.html`（About 区块新增引言 `<p>`）
- Modify: `css/style.css`（新增 `.about-lead` 样式）
- Modify: `js/i18n.js`（`about.lead` key，中英文）

**Interfaces:**
- Consumes：无
- Produces：`.about-lead` CSS 类，`about.lead` i18n key，供本任务独立使用，不影响后续任务

- [ ] **Step 1: 修改 `css/style.css`，放大 Hero 头像**

将（第 225-231 行）：

```css
.hero-avatar {
  height: 240px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(10, 15, 20, 0.28));
}
```

替换为：

```css
.hero-avatar {
  height: 300px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(10, 15, 20, 0.28));
}
```

- [ ] **Step 2: 修改 `index.html`，About 区块新增引言段**

将（第 68-70 行）：

```html
        <p class="section-eyebrow" data-i18n-key="about.eyebrow">ABOUT ME</p>
        <h2 class="section-title" data-i18n-key="about.title">关于我</h2>
        <div class="about-grid">
```

替换为：

```html
        <p class="section-eyebrow" data-i18n-key="about.eyebrow">ABOUT ME</p>
        <h2 class="section-title" data-i18n-key="about.title">关于我</h2>
        <p class="about-lead" data-i18n-key="about.lead" data-reveal>应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。</p>
        <div class="about-grid">
```

- [ ] **Step 3: 修改 `css/style.css`，新增 `.about-lead` 样式**

在 `.about-grid` 规则（第 256-261 行）之前插入：

```css
.about-lead {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text);
  max-width: 720px;
  margin-bottom: var(--space-4);
}
```

- [ ] **Step 4: 修改 `js/i18n.js`，新增 `about.lead` key**

`CONTENT_ZH.about`（第 18-33 行）的 `eyebrow: 'ABOUT ME',` 后面追加一行：

```js
    lead: '应用统计硕士，拥有 KN Group、蔚来等三段数据分析实习经历，具备经营分析、风险分析及预测建模能力。熟练使用 SQL、Python 与 Tableau 开展业务分析，并能够利用 AI 工具开发自动化分析脚本和效率工具，将数据分析流程产品化，持续提升业务决策效率。',
```

`CONTENT_EN.about`（第 135-150 行）的 `eyebrow: 'ABOUT ME',` 后面追加一行：

```js
    lead: 'M.S. in Applied Statistics with three data-analytics internships at KN Group, NIO, and beyond, bringing hands-on experience in business analytics, risk analysis, and predictive modeling. Proficient in SQL, Python, and Tableau for business analysis, and skilled at using AI tools to build automated analysis scripts and efficiency tools — productizing the data-analysis workflow to continuously improve business decision-making.',
```

- [ ] **Step 5: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -q "about-lead" index.html && echo "lead paragraph wired OK"
grep -q "height: 300px" css/style.css && echo "hero avatar resized OK"
grep -q "lead:" js/i18n.js && echo "lead i18n key present OK"
```

Expected：四行均输出对应 OK。

- [ ] **Step 6: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,900 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -o '<img class="hero-avatar"[^>]*>'
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,900 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -o '<p class="about-lead"[^>]*>[^<]*'
```

Expected：第一条输出 hero-avatar 的 img 标签（确认存在）；第二条输出引言段的真实文字内容（确认 DOM 里渲染出了引言文本，不是空的）。

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Hero 头像放大 + About 板块新增引言段"
```

---

## Task 3: Skills 板块内容密度优化

**Files:**
- Modify: `index.html`（`.skills-grid` 新增 2 张环形卡 + 熟悉工具标签行）
- Modify: `css/style.css`（`.skills-grid` 列数调整，新增 `.skills-familiar-card`/`.skills-familiar-label`）
- Modify: `js/i18n.js`（`skills` key 新增 `familiarLabel`）
- Modify: `js/visualizations.js`（`SKILLS` 数组新增 2 项）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定，`.timeline-tags` 样式被复用（不修改其定义）

- [ ] **Step 1: 修改 `index.html`，追加 2 张环形卡 + 熟悉工具卡**

将（第 149-157 行，最后一张环形卡 Power BI 结束到 `.skills-grid` 结束）：

```html
          <div class="card skill-ring-card" data-reveal>
            <svg class="skill-ring" viewBox="0 0 80 80">
              <circle class="skill-ring-track" cx="40" cy="40" r="34"></circle>
              <circle class="skill-ring-progress" cx="40" cy="40" r="34" data-value="70" style="stroke-dasharray:213.63; stroke-dashoffset:64.09;" transform="rotate(-90 40 40)"></circle>
            </svg>
            <span class="skill-ring-value">70%</span>
            <p class="skill-name">Power BI</p>
          </div>
        </div>
      </div>
    </section>
```

替换为（新增 MySQL 85%、Tableau 75% 两张环形卡，以及熟悉工具卡）：

```html
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
      </div>
    </section>
```

（`stroke-dashoffset` 计算方式：圆周长 = 2π×34 ≈ 213.63，`dashoffset = 213.63 × (1 − 百分比/100)`；85% → 213.63×0.15=32.04，75% → 213.63×0.25=53.41，与既有 6 张卡片的计算方式一致。）

- [ ] **Step 2: 修改 `css/style.css`，调整网格列数并新增熟悉工具卡样式**

将（第 288-300 行）：

```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: var(--space-3);
}
.skills-radar-card {
  grid-column: span 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
```

替换为：

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
```

将响应式断点规则（第 328-335 行）：

```css
@media (max-width: 900px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr); }
  .skills-radar-card { grid-column: span 2; }
}
@media (max-width: 560px) {
  .skills-grid { grid-template-columns: 1fr; }
  .skills-radar-card { grid-column: span 1; }
}
```

替换为：

```css
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

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `skills.familiarLabel`**

`CONTENT_ZH`（第 34 行）从：

```js
  skills: { eyebrow: 'SKILLS', title: '技能' },
```

改为：

```js
  skills: { eyebrow: 'SKILLS', title: '技能', familiarLabel: '熟悉工具' },
```

`CONTENT_EN`（第 151 行）从：

```js
  skills: { eyebrow: 'SKILLS', title: 'Skills' },
```

改为：

```js
  skills: { eyebrow: 'SKILLS', title: 'Skills', familiarLabel: 'Also Familiar With' },
```

- [ ] **Step 4: 修改 `js/visualizations.js`，`SKILLS` 数组新增 2 项**

将（第 4-10 行）：

```js
  var SKILLS = [
    { label: 'Data Analysis', value: 95 },
    { label: 'Python', value: 90 },
    { label: 'SQL', value: 85 },
    { label: 'AI Tools', value: 82 },
    { label: 'Machine Learning', value: 78 },
    { label: 'Power BI', value: 70 }
  ];
```

替换为：

```js
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
```

（雷达图的轴数 `total = SKILLS.length` 是动态读取数组长度的，不需要改雷达图绘制逻辑本身，追加数组项会自动让雷达图从 6 轴变成 8 轴。）

- [ ] **Step 5: 验证**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && echo "ALL JS OK"
grep -c 'skill-ring-card' index.html
grep -q "MySQL" js/visualizations.js && grep -q "Tableau" js/visualizations.js && echo "radar data updated OK"
grep -q "familiarLabel" js/i18n.js && echo "familiar label i18n OK"
node -e "
var m = require('fs').readFileSync('js/visualizations.js','utf8').match(/var SKILLS = (\[[\s\S]*?\]);/);
var arr = eval(m[1]);
console.log('SKILLS count:', arr.length);
"
```

Expected：`ALL JS OK`；`grep -c` 输出 `8`；`radar data updated OK`；`familiar label i18n OK`；`SKILLS count: 8`。

- [ ] **Step 6: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,2200 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null > /tmp/portfolio-content-refresh-skills-dom.html
grep -c 'class="skill-ring-card"' /tmp/portfolio-content-refresh-skills-dom.html
grep -o '<span>Pandas</span>' /tmp/portfolio-content-refresh-skills-dom.html
```

Expected：`grep -c` 输出 `8`；第二条能匹配到（确认熟悉工具标签渲染出来了）。另外用无头 Chrome 截图 `--screenshot=/tmp/portfolio-content-refresh-skills.png --window-size=1440,2200` 并用 Read 工具查看，确认雷达图有 8 个轴（比之前多两个尖角），环形卡是 4 列 × 2 行排布，下方有一行工具标签。

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/i18n.js js/visualizations.js
git commit -m "feat: Skills 板块新增 MySQL/Tableau 环形卡与熟悉工具标签，雷达图扩展到 8 轴"
```

---

## Task 4: Experience 板块深化（文案扩写 + 公司背景图）

**Files:**
- Modify: `index.html`（3 段经历的 bullet 文案扩写，新增 `.timeline-photo-wrap` 结构）
- Modify: `css/style.css`（新增 `.timeline-photo-wrap`/`.timeline-photo`/`.timeline-photo-scrim` 样式）
- Modify: `js/i18n.js`（对应 bullet key 的中英文都要同步扩写）

**Interfaces:**
- Consumes：Task 1 产出的 `assets/images/company-kngroup.jpg`、`company-nio.jpg`、`company-zhouji.jpg`
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`，扩写文案并包裹 `.timeline-photo-wrap`**

将（第 165-214 行，完整 3 张 timeline-item）：

```html
          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.knGroup.company">KN Group</h3>
              <span class="timeline-period" data-i18n-key="experience.knGroup.period">2026.06 – 2026.08</span>
            </div>
            <p class="timeline-role" data-i18n-key="experience.knGroup.role">数据分析实习生</p>
            <ul class="timeline-bullets">
              <li data-i18n-key="experience.knGroup.bullet1">搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，跟踪注册成本、放款率、坏账率、CPS 等核心指标</li>
              <li data-i18n-key="experience.knGroup.bullet2">基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算</li>
              <li data-i18n-key="experience.knGroup.bullet3">开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成</li>
            </ul>
            <div class="timeline-tags">
              <span>MySQL</span><span>Python</span><span>Pandas</span><span>OpenPyXL</span>
            </div>
            <p class="timeline-highlight" data-i18n-key="experience.knGroup.highlight">大幅提升周报/月报产出效率</p>
          </div>

          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.nio.company">上海蔚来汽车有限公司</h3>
              <span class="timeline-period" data-i18n-key="experience.nio.period">2026.01 – 2026.06</span>
            </div>
            <p class="timeline-role" data-i18n-key="experience.nio.role">服务运营（数据分析方向）实习生</p>
            <ul class="timeline-bullets">
              <li data-i18n-key="experience.nio.bullet1">独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化</li>
              <li data-i18n-key="experience.nio.bullet2">跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告</li>
              <li data-i18n-key="experience.nio.bullet3">深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析</li>
            </ul>
            <div class="timeline-tags">
              <span>SQL</span><span>Excel</span><span data-i18n-key="experience.nio.tagViz">数据可视化</span>
            </div>
            <p class="timeline-highlight" data-i18n-key="experience.nio.highlight">保障运营数据 100% 准确及时输出</p>
          </div>

          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.zhouji.company">上海洲暨科技有限公司</h3>
              <span class="timeline-period" data-i18n-key="experience.zhouji.period">2025.01 – 2025.05</span>
            </div>
            <p class="timeline-role" data-i18n-key="experience.zhouji.role">数据分析实习生</p>
            <ul class="timeline-bullets">
              <li data-i18n-key="experience.zhouji.bullet1">利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征</li>
              <li data-i18n-key="experience.zhouji.bullet2">使用 Tableau 发现数据中的模式、趋势和异常数据</li>
              <li data-i18n-key="experience.zhouji.bullet3">通过数据分析发现业务中的潜在问题或机会，推动业务优化</li>
            </ul>
            <div class="timeline-tags">
              <span>MySQL</span><span>Tableau</span>
            </div>
            <p class="timeline-highlight" data-i18n-key="experience.zhouji.highlight">交易率较三个月前提升 20%</p>
          </div>
```

替换为：

```html
          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.knGroup.company">KN Group</h3>
              <span class="timeline-period" data-i18n-key="experience.knGroup.period">2026.06 – 2026.08</span>
            </div>
            <div class="timeline-photo-wrap">
              <img class="timeline-photo" src="assets/images/company-kngroup.jpg" alt="KN Group 公司工牌" loading="lazy">
              <div class="timeline-photo-scrim"></div>
              <p class="timeline-role" data-i18n-key="experience.knGroup.role">数据分析实习生</p>
              <ul class="timeline-bullets">
                <li data-i18n-key="experience.knGroup.bullet1">从 0 到 1 搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，持续跟踪注册成本、放款率、坏账率、CPS 等核心指标，为业务决策提供实时数据支撑</li>
                <li data-i18n-key="experience.knGroup.bullet2">基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算，辅助风险策略调整</li>
                <li data-i18n-key="experience.knGroup.bullet3">开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成，大幅减少人工整理时间</li>
              </ul>
              <div class="timeline-tags">
                <span>MySQL</span><span>Python</span><span>Pandas</span><span>OpenPyXL</span>
              </div>
              <p class="timeline-highlight" data-i18n-key="experience.knGroup.highlight">大幅提升周报/月报产出效率</p>
            </div>
          </div>

          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.nio.company">上海蔚来汽车有限公司</h3>
              <span class="timeline-period" data-i18n-key="experience.nio.period">2026.01 – 2026.06</span>
            </div>
            <div class="timeline-photo-wrap">
              <img class="timeline-photo" src="assets/images/company-nio.jpg" alt="上海蔚来汽车有限公司大堂 logo" loading="lazy">
              <div class="timeline-photo-scrim"></div>
              <p class="timeline-role" data-i18n-key="experience.nio.role">服务运营（数据分析方向）实习生</p>
              <ul class="timeline-bullets">
                <li data-i18n-key="experience.nio.bullet1">独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化，为跨部门汇报提供统一数据口径</li>
                <li data-i18n-key="experience.nio.bullet2">跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告，协助运营团队定位高频问题</li>
                <li data-i18n-key="experience.nio.bullet3">深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析，保障重大节假日期间服务稳定性</li>
              </ul>
              <div class="timeline-tags">
                <span>SQL</span><span>Excel</span><span data-i18n-key="experience.nio.tagViz">数据可视化</span>
              </div>
              <p class="timeline-highlight" data-i18n-key="experience.nio.highlight">保障运营数据 100% 准确及时输出</p>
            </div>
          </div>

          <div class="card timeline-item" data-reveal>
            <div class="timeline-head">
              <h3 data-i18n-key="experience.zhouji.company">上海洲暨科技有限公司</h3>
              <span class="timeline-period" data-i18n-key="experience.zhouji.period">2025.01 – 2025.05</span>
            </div>
            <div class="timeline-photo-wrap">
              <img class="timeline-photo" src="assets/images/company-zhouji.jpg" alt="上海洲暨科技有限公司前台屏幕" loading="lazy">
              <div class="timeline-photo-scrim"></div>
              <p class="timeline-role" data-i18n-key="experience.zhouji.role">数据分析实习生</p>
              <ul class="timeline-bullets">
                <li data-i18n-key="experience.zhouji.bullet1">利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征，识别客户行为规律</li>
                <li data-i18n-key="experience.zhouji.bullet2">使用 Tableau 发现数据中的模式、趋势和异常数据，制作可视化看板辅助团队决策</li>
                <li data-i18n-key="experience.zhouji.bullet3">通过数据分析发现业务中的潜在问题或机会，推动业务优化</li>
              </ul>
              <div class="timeline-tags">
                <span>MySQL</span><span>Tableau</span>
              </div>
              <p class="timeline-highlight" data-i18n-key="experience.zhouji.highlight">交易率较三个月前提升 20%</p>
            </div>
          </div>
```

- [ ] **Step 2: 修改 `css/style.css`，新增公司背景图样式**

在 `.timeline-highlight` 规则（第 356 行）后面追加：

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
.timeline-photo-wrap .timeline-role,
.timeline-photo-wrap .timeline-bullets,
.timeline-photo-wrap .timeline-tags,
.timeline-photo-wrap .timeline-highlight {
  position: relative;
  z-index: 2;
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，同步扩写后的中英文 bullet 文案**

`CONTENT_ZH.experience.knGroup`（第 38-44 行）从：

```js
    knGroup: {
      company: 'KN Group', period: '2026.06 – 2026.08', role: '数据分析实习生',
      bullet1: '搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，跟踪注册成本、放款率、坏账率、CPS 等核心指标',
      bullet2: '基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算',
      bullet3: '开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成',
      highlight: '大幅提升周报/月报产出效率'
    },
```

改为：

```js
    knGroup: {
      company: 'KN Group', period: '2026.06 – 2026.08', role: '数据分析实习生',
      bullet1: '从 0 到 1 搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，持续跟踪注册成本、放款率、坏账率、CPS 等核心指标，为业务决策提供实时数据支撑',
      bullet2: '基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算，辅助风险策略调整',
      bullet3: '开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成，大幅减少人工整理时间',
      highlight: '大幅提升周报/月报产出效率'
    },
```

`CONTENT_ZH.experience.nio`（第 45-52 行）从：

```js
    nio: {
      company: '上海蔚来汽车有限公司', period: '2026.01 – 2026.06', role: '服务运营（数据分析方向）实习生',
      bullet1: '独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化',
      bullet2: '跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告',
      bullet3: '深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析',
      highlight: '保障运营数据 100% 准确及时输出',
      tagViz: '数据可视化'
    },
```

改为：

```js
    nio: {
      company: '上海蔚来汽车有限公司', period: '2026.01 – 2026.06', role: '服务运营（数据分析方向）实习生',
      bullet1: '独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化，为跨部门汇报提供统一数据口径',
      bullet2: '跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告，协助运营团队定位高频问题',
      bullet3: '深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析，保障重大节假日期间服务稳定性',
      highlight: '保障运营数据 100% 准确及时输出',
      tagViz: '数据可视化'
    },
```

`CONTENT_ZH.experience.zhouji`（第 53-59 行）从：

```js
    zhouji: {
      company: '上海洲暨科技有限公司', period: '2025.01 – 2025.05', role: '数据分析实习生',
      bullet1: '利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征',
      bullet2: '使用 Tableau 发现数据中的模式、趋势和异常数据',
      bullet3: '通过数据分析发现业务中的潜在问题或机会，推动业务优化',
      highlight: '交易率较三个月前提升 20%'
    }
```

改为：

```js
    zhouji: {
      company: '上海洲暨科技有限公司', period: '2025.01 – 2025.05', role: '数据分析实习生',
      bullet1: '利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征，识别客户行为规律',
      bullet2: '使用 Tableau 发现数据中的模式、趋势和异常数据，制作可视化看板辅助团队决策',
      bullet3: '通过数据分析发现业务中的潜在问题或机会，推动业务优化',
      highlight: '交易率较三个月前提升 20%'
    }
```

`CONTENT_EN.experience.knGroup`（第 155-161 行）从：

```js
    knGroup: {
      company: 'KN Group', period: 'Jun 2026 – Aug 2026', role: 'Data Analyst Intern',
      bullet1: 'Built the full registration → credit → disbursement → repayment funnel and risk/return monitoring system; tracked KPIs including CAC, disbursement rate, NPL rate, and CPS',
      bullet2: 'Built bad-debt prediction models in Python and ran multi-scenario simulations for asset-quality assessment',
      bullet3: 'Developed automated analysis tooling for disbursement volume, asset performance, and NPL rate, with auto data cleaning, pivoting, and Excel report generation',
      highlight: 'Significantly sped up weekly/monthly report turnaround'
    },
```

改为：

```js
    knGroup: {
      company: 'KN Group', period: 'Jun 2026 – Aug 2026', role: 'Data Analyst Intern',
      bullet1: 'Built the full registration → credit → disbursement → repayment funnel and risk/return monitoring system from scratch, continuously tracking KPIs including CAC, disbursement rate, NPL rate, and CPS to support real-time business decisions',
      bullet2: 'Built bad-debt prediction models in Python and ran multi-scenario simulations for asset-quality assessment, informing risk strategy adjustments',
      bullet3: 'Developed automated analysis tooling for disbursement volume, asset performance, and NPL rate, with auto data cleaning, pivoting, and Excel report generation, substantially cutting manual processing time',
      highlight: 'Significantly sped up weekly/monthly report turnaround'
    },
```

`CONTENT_EN.experience.nio`（第 162-169 行）从：

```js
    nio: {
      company: 'NIO Inc.', period: 'Jan 2026 – Jun 2026', role: 'Service Operations (Data Analytics) Intern',
      bullet1: 'Independently built a monthly operations reporting system, using SQL for data extraction, metric standardization, and visualization',
      bullet2: 'Tracked battery-swap station performance and VOC feedback, built an issue-classification framework and published thematic reports',
      bullet3: 'Supported Spring Festival and Labor Day energy-assurance projects with operations monitoring and post-mortem analysis',
      highlight: 'Kept operations data 100% accurate and on time',
      tagViz: 'Data Visualization'
    },
```

改为：

```js
    nio: {
      company: 'NIO Inc.', period: 'Jan 2026 – Jun 2026', role: 'Service Operations (Data Analytics) Intern',
      bullet1: 'Independently built a monthly operations reporting system, using SQL for data extraction, metric standardization, and visualization, giving cross-team reporting a single consistent data source',
      bullet2: 'Tracked battery-swap station performance and VOC feedback, built an issue-classification framework and published thematic reports, helping the operations team pinpoint high-frequency issues',
      bullet3: 'Supported Spring Festival and Labor Day energy-assurance projects with operations monitoring and post-mortem analysis, helping keep service stable during major holidays',
      highlight: 'Kept operations data 100% accurate and on time',
      tagViz: 'Data Visualization'
    },
```

`CONTENT_EN.experience.zhouji`（第 170-176 行）从：

```js
    zhouji: {
      company: 'Shanghai Zhouji Technology', period: 'Jan 2025 – May 2025', role: 'Data Analyst Intern',
      bullet1: 'Pulled transaction data from the CRM database via MySQL and summarized data characteristics using statistical methods',
      bullet2: 'Used Tableau to surface patterns, trends, and anomalies in the data',
      bullet3: 'Turned analysis into action by working directly with the business to fix root-cause issues',
      highlight: 'Lifted the transaction rate by 20% within three months'
    }
```

改为：

```js
    zhouji: {
      company: 'Shanghai Zhouji Technology', period: 'Jan 2025 – May 2025', role: 'Data Analyst Intern',
      bullet1: 'Pulled transaction data from the CRM database via MySQL and summarized data characteristics using statistical methods, identifying customer behavior patterns',
      bullet2: 'Used Tableau to surface patterns, trends, and anomalies in the data, building dashboards to support team decisions',
      bullet3: 'Turned analysis into action by working directly with the business to fix root-cause issues',
      highlight: 'Lifted the transaction rate by 20% within three months'
    }
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'timeline-photo-wrap' index.html
grep -c 'timeline-photo-scrim' index.html
for f in company-kngroup company-nio company-zhouji; do
  test -f "assets/images/$f.jpg" && echo "$f.jpg exists" || echo "MISSING $f.jpg"
done
```

Expected：`i18n.js OK`；两条 `grep -c` 都输出 `3`（3 段经历各一个）；3 行 `exists`。

- [ ] **Step 5: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,3200 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -o '<img class="timeline-photo"[^>]*>'
```

Expected：输出 3 个 img 标签，src 分别指向 3 张公司图。另外截图 `--screenshot=/tmp/portfolio-content-refresh-experience.png --window-size=1440,3200` 用 Read 工具查看，确认每张 timeline 卡片下半部分能看到公司照片若隐若现，文字依然清晰可读（不会被照片盖住看不清）。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Experience 板块描述扩写，三段经历配上真实公司背景图"
```

---

## Task 5: Projects 板块全部配图

**Files:**
- Modify: `index.html`（3 张纯 CSS 缩略图卡片改为 `<img>`）
- Modify: `css/style.css`（移除不再使用的 `.project-thumb--supply-chain`/`--insurance`/`--attendance` 渐变规则）

**Interfaces:**
- Consumes：Task 1 产出的 `assets/images/project-supplychain.png`、`project-insurance.jpg`、`project-automation.png`、`project-attendance.png`
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`，4 张卡片换真实图片**

将（第 223-224 行）：

```html
          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--supply-chain" aria-hidden="true"></div>
```

替换为：

```html
          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-supplychain.png" alt="供应链智能决策系统竞赛报告封面" loading="lazy">
```

将（第 233-234 行）：

```html
          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--insurance" aria-hidden="true"></div>
```

替换为：

```html
          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-insurance.jpg" alt="美国大学生数学建模竞赛 Honorable Mention 获奖证书" loading="lazy">
```

将（第 243-244 行）：

```html
          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--automation" aria-hidden="true"></div>
```

替换为：

```html
          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-automation.png" alt="业务自动化分析工具 Python 代码截图" loading="lazy">
```

将（第 262-263 行）：

```html
          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--attendance" aria-hidden="true"></div>
```

替换为：

```html
          <div class="card project-card" data-reveal>
            <img class="project-thumb" src="assets/images/project-attendance.png" alt="学生考勤管理系统个人考勤统计运行截图" loading="lazy">
```

- [ ] **Step 2: 修改 `css/style.css`，移除不再使用的渐变缩略图规则**

将（第 361-383 行，`.project-thumb--supply-chain` 到 `.project-thumb--automation::after` 结束）：

```css
.project-thumb--supply-chain {
  background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-violet));
}
.project-thumb--supply-chain::after {
  content: ''; position: absolute; inset: -20%;
  background: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 18px, rgba(255,255,255,0.14) 19px, rgba(255,255,255,0.14) 20px);
}
.project-thumb--insurance {
  background: linear-gradient(135deg, var(--color-accent-violet), var(--color-accent-orange));
}
.project-thumb--insurance::after {
  content: ''; position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 28px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 28px);
}
.project-thumb--automation {
  background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-orange));
}
.project-thumb--automation::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 10px, transparent 10px 24px);
}
```

以及紧接着的（Task 4 v2 已新增的）：

```css
.project-thumb--attendance {
  background: linear-gradient(135deg, var(--color-accent-violet), var(--color-accent-cyan) 50%, var(--color-accent-orange));
}
.project-thumb--attendance::after {
  content: ''; position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px);
}
```

全部删除（这些规则渲染的渐变纹理已经被真实图片取代，不再有任何元素引用这些类名）。`.project-thumb--website` 规则（v2 Task 4 新增，`img` 用，本轮不涉及）保留不动。

- [ ] **Step 3: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c '<img class="project-thumb"' index.html
grep -q "project-thumb--supply-chain\|project-thumb--insurance\|project-thumb--automation\|project-thumb--attendance" css/style.css && echo "STALE THUMB CSS FOUND (bug)" || echo "old gradient thumb CSS removed OK"
for f in project-supplychain.png project-insurance.jpg project-automation.png project-attendance.png; do
  test -f "assets/images/$f" && echo "$f exists" || echo "MISSING $f"
done
```

Expected：`i18n.js OK`；`grep -c` 输出 `4`；`old gradient thumb CSS removed OK`；4 行 `exists`。

- [ ] **Step 4: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-content-refresh-projects.png --window-size=1440,6000 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具查看截图（滚动到 Projects 区域），确认：5 张卡片全部显示真实图片（供应链封面、MCM 证书、代码截图、MyOffer 网页、考勤系统运行截图），没有任何一张还是纯色渐变纹理占位。

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: Projects 5 张卡片全部换上真实配图（PDF封面/获奖证书/代码截图/运行截图）"
```

---

## Task 6: Achievements 改版为列表式布局

**Files:**
- Modify: `index.html`（4 张卡片各自新增 `<ul class="achievement-list">`）
- Modify: `css/style.css`（新增 `.achievement-list` 样式，调整 `.achievement-card` 对齐方式）
- Modify: `js/i18n.js`（新增 `achievements.list.*` key，中英文）

**Interfaces:**
- Consumes：无（第 2 组"核心项目"列表复用 Task 5 之前就已存在的 `projects.*.title` key，不新增）
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`，4 张卡片各自新增列表**

将（第 278-295 行）：

```html
        <div class="achievements-grid">
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="3">3</span></p>
            <p class="achievement-label" data-i18n-key="achievements.internships">段数据分析实习经历</p>
          </div>
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="5">5</span></p>
            <p class="achievement-label" data-i18n-key="achievements.projects">个核心项目</p>
          </div>
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="3">3</span></p>
            <p class="achievement-label" data-i18n-key="achievements.awards">项国家级/国际级竞赛奖项</p>
          </div>
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="4" data-suffix="+">4+</span></p>
            <p class="achievement-label" data-i18n-key="achievements.kpis">项核心业务指标监控体系</p>
          </div>
        </div>
```

替换为：

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

- [ ] **Step 2: 修改 `css/style.css`，新增列表样式**

将（第 412-423 行）：

```css
.achievements-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.achievement-card { padding: var(--space-4) var(--space-3); text-align: center; }
.achievement-number {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}
.achievement-label { font-size: 14px; color: var(--color-text-muted); }
```

替换为：

```css
.achievements-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.achievement-card { padding: var(--space-4) var(--space-3); text-align: center; }
.achievement-number {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}
.achievement-label { font-size: 14px; color: var(--color-text-muted); margin-bottom: var(--space-2); }
.achievement-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.achievement-list li {
  font-size: 13px;
  color: var(--color-text-muted);
  padding-left: 16px;
  position: relative;
}
.achievement-list li::before { content: '—'; position: absolute; left: 0; color: var(--color-accent-cyan); }
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `achievements.list.*` key**

`CONTENT_ZH.achievements`（第 94-101 行）从：

```js
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: '成果',
    internships: '段数据分析实习经历',
    projects: '个核心项目',
    awards: '项国家级/国际级竞赛奖项',
    kpis: '项核心业务指标监控体系'
  },
```

改为：

```js
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: '成果',
    internships: '段数据分析实习经历',
    projects: '个核心项目',
    awards: '项国家级/国际级竞赛奖项',
    kpis: '项核心业务指标监控体系',
    list: {
      knGroup: 'KN Group',
      nio: '上海蔚来汽车有限公司',
      zhouji: '上海洲暨科技有限公司',
      award1: '全国大数据建模大赛一等奖',
      award2: '"华为杯"国家级数学建模竞赛三等奖',
      award3: '美国大学生数学建模竞赛 Honorable Mention',
      kpi1: '注册成本 / CAC',
      kpi2: '放款率与坏账率',
      kpi3: 'CPS',
      kpi4: '运营数据准确率'
    }
  },
```

`CONTENT_EN.achievements`（第 211-218 行）从：

```js
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: 'Achievements',
    internships: 'Data analytics internships',
    projects: 'Core projects delivered',
    awards: 'National / international competition awards',
    kpis: 'Core KPI monitoring systems built'
  },
```

改为：

```js
  achievements: {
    eyebrow: 'ACHIEVEMENTS',
    title: 'Achievements',
    internships: 'Data analytics internships',
    projects: 'Core projects delivered',
    awards: 'National / international competition awards',
    kpis: 'Core KPI monitoring systems built',
    list: {
      knGroup: 'KN Group',
      nio: 'NIO Inc.',
      zhouji: 'Shanghai Zhouji Technology',
      award1: '1st Prize, National Big Data Modeling Competition',
      award2: 'Huawei Cup National Mathematical Modeling Competition, 3rd Prize',
      award3: 'US MCM Honorable Mention',
      kpi1: 'CAC (Customer Acquisition Cost)',
      kpi2: 'Disbursement rate & NPL rate',
      kpi3: 'CPS',
      kpi4: 'Operations data accuracy'
    }
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'achievement-list' index.html
grep -q '"华为杯"' js/i18n.js && echo "huawei cup award listed OK"
grep -q "achievements.list" js/i18n.js && echo "list namespace present OK"
```

Expected：`i18n.js OK`；`grep -c` 输出 `4`；`huawei cup award listed OK`；`list namespace present OK`。

- [ ] **Step 5: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --window-size=1440,4200 --dump-dom "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html" 2>/dev/null | grep -o '<li data-i18n-key="achievements.list.award2">[^<]*'
```

Expected：能匹配到"华为杯"三等奖那一行文字（确认渲染出来了）。另外截图 `--screenshot=/tmp/portfolio-content-refresh-achievements.png --window-size=1440,4200` 用 Read 工具查看，确认 4 张卡片每张都是"大数字 + 下方左对齐小列表"的样式，不再是纯数字卡片。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Achievements 改版为列表式布局，补全华为杯三等奖等真实内容"
```

---

## Task 7: Gallery 尺寸调整

**Files:**
- Modify: `index.html`（`gallery-cell--wide` 从 travel/pilates 移除）
- Modify: `css/style.css`（`.gallery-grid` 改为显式 3 行网格定位）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`，移除 travel/pilates 的 wide 修饰类**

将（第 303 行）：

```html
          <div class="gallery-cell gallery-cell--travel gallery-cell--wide" data-reveal>
```

替换为：

```html
          <div class="gallery-cell gallery-cell--travel" data-reveal>
```

将（第 319 行）：

```html
          <div class="gallery-cell gallery-cell--pilates gallery-cell--wide" data-reveal>
```

替换为：

```html
          <div class="gallery-cell gallery-cell--pilates" data-reveal>
```

- [ ] **Step 2: 修改 `css/style.css`，改为显式网格定位**

将（第 433-437 行）：

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 140px;
  gap: var(--space-2);
}
```

替换为：

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 140px 350px 140px;
  gap: var(--space-2);
}
```

将（第 472 行）：

```css
.gallery-cell--wide { grid-column: span 2; }
```

替换为：

```css
.gallery-cell--travel   { grid-column: 1; grid-row: 1; }
.gallery-cell--reading  { grid-column: 2; grid-row: 1; }
.gallery-cell--swim     { grid-column: 3; grid-row: 1; }
.gallery-cell--friends  { grid-column: 4; grid-row: 1 / span 2; }
.gallery-cell--ukulele  { grid-column: 1; grid-row: 2; }
.gallery-cell--pilates  { grid-column: 2; grid-row: 2; }
.gallery-cell--award    { grid-column: 3; grid-row: 2; }
.gallery-cell--billiards{ grid-column: 1; grid-row: 3; }
```

将响应式断点规则（第 474-477 行）：

```css
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-cell--wide { grid-column: span 2; }
}
```

替换为（窄屏放弃精确网格定位，回退成简单的 2 列顺序堆叠，`friends` 仍然更高但不再跨列，保持移动端布局简单可靠）：

```css
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

- [ ] **Step 3: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -q "gallery-cell--wide" index.html && echo "STALE WIDE CLASS FOUND (bug)" || echo "wide class removed from HTML OK"
grep -q "grid-template-rows: 140px 350px 140px" css/style.css && echo "explicit 3-row grid OK"
grep -c "grid-row: 1 / span 2" css/style.css
```

Expected：`i18n.js OK`；`wide class removed from HTML OK`；`explicit 3-row grid OK`；`grep -c` 输出 `1`（只有 friends 一处跨行）。

- [ ] **Step 4: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-content-refresh-gallery.png --window-size=1440,7200 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具查看截图（滚动到 Gallery 区域），确认：旅行、普拉提两格现在和获奖时刻一样是普通小格（不再跨 2 列宽）；朋友时光格明显比其他格子高很多（约 2.5 倍）；台球格单独在第三行，同一行右侧 3 列是空白——这是预期的设计取舍，不是 bug。

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: Gallery 调整格子尺寸——旅行/普拉提改为普通格，朋友时光加高至 2.5 倍"
```

---

## Task 8: 全站最终验证

**Files:**
- 无新增文件；如发现问题在本任务里直接小修（记录改了什么）

**Interfaces:**
- Consumes：Task 1-7 的全部产出
- Produces：无（收尾验收任务）

- [ ] **Step 1: 全文件语法与结构复查**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && echo "ALL JS OK"
grep -c '<section id=' index.html
grep -o '<img[^>]*src="assets/images/[^"]*"' index.html | wc -l
```

Expected：`ALL JS OK`；`grep -c` 输出 `8`（8 个 section 不变）；`<img>` 引用数量应为 20（v2 的 10 张 + 本轮 Task 1 新增 7 张真实素材 + Task 5 里 supply-chain/insurance/automation 3 张原本是纯 CSS div 现在改成 img，累计：10 + 3(company) + 4(project 新图，注意 project-myoffer 已经算在 v2 的 10 张里，本轮新增 supplychain/insurance/automation/attendance 4 张) = 17，实际数字以 `grep` 结果为准，如与此处估算不同，以 Task 1-7 每个任务自己的验证结果为准，不要因为这个总数估算值和 grep 实际输出不一致就误判为 bug）。

- [ ] **Step 2: 确认所有引用的图片文件真实存在（没有断链）**

```bash
grep -o 'assets/images/[a-zA-Z0-9_.-]*\.\(jpg\|png\)' index.html | sort -u | while read -r p; do
  test -f "$p" && echo "OK: $p" || echo "MISSING: $p"
done
```

Expected：每一行都是 `OK: ...`，没有任何 `MISSING`。

- [ ] **Step 3: i18n key 完整性复查**

```bash
grep -o 'data-i18n-key="[a-zA-Z0-9_.]*"' index.html | sed -E 's/data-i18n-key="(.*)"/\1/' | sort -u > /tmp/portfolio-content-refresh-keys.txt
node -e "
global.window = {};
const fs = require('fs');
eval(fs.readFileSync('js/i18n.js', 'utf8'));
const keys = fs.readFileSync('/tmp/portfolio-content-refresh-keys.txt', 'utf8').trim().split('\n');
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

Expected：`missing count: 0`。这个 node 脚本方法在 v2 计划的 Task 6 里已经用过一次，是本项目验证 i18n 完整性最可靠的方式（比人工过一遍 grep 结果准确）。

- [ ] **Step 4: Skills 雷达图与环形卡数量一致性**

```bash
grep -c 'skill-ring-card' index.html
node -e "
var m = require('fs').readFileSync('js/visualizations.js','utf8').match(/var SKILLS = (\[[\s\S]*?\]);/);
console.log('SKILLS array length:', eval(m[1]).length);
"
```

Expected：两个数字都是 `8`，互相一致。

- [ ] **Step 5: 视觉总检查点（全站滚动截图）**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-content-refresh-final-full.png --window-size=1440,10500 "file:///Users/huiying.h.chen/portfolio/.claude/worktrees/portfolio-real-photos/index.html"
```

用 Read 工具通读这张全页截图（如果因为滚动淡入动画时序问题导致内容显得很淡，属于本代码库已知的截图局限，改用 `--dump-dom` 交叉确认结构，不必反复重截图纠结观感），从上到下确认：Hero 头像更大了、About 有引言段、Skills 是雷达图+8环形卡+熟悉工具行、Experience 3 张卡片都能看到背景公司图、Projects 5 张卡片全部是真实图片、Achievements 是数字+列表、Gallery 的旅行/普拉提变小台球单独一行朋友时光变高。

- [ ] **Step 6: 人工验收清单（需要用户在真实浏览器里完成）**

请双击打开 `index.html`，确认：

1. 无控制台报错
2. 深浅色切换后，Experience 公司背景图、Projects 5 张真实图片依然正常显示
3. 中英文切换后，About 引言段、Skills 熟悉工具标签、Achievements 列表内容都正确切换
4. Skills 板块的 8 个环形进度条动画正常（数字从 0 滚动到目标值），雷达图 8 个轴正确绘制
5. Experience 卡片背景图不会盖住文字，文字始终清晰可读
6. Gallery 里旅行/普拉提确认变成小格，朋友时光确认变高，滚动到 Gallery 时留意台球格右侧的留白是否可以接受（如果观感不满意，告诉我具体想怎么调整）

确认完成后告诉我结果；如果发现任何一项不符合预期，说明具体是哪一步、看到了什么，我再回来修。

- [ ] **Step 7: Commit（仅当 Step 1-4 期间有实际修改时才提交；若无修改可跳过）**

```bash
git status --short
```

若有变更：

```bash
git add -A
git commit -m "chore: 内容深化收尾复核"
```

若无变更，本任务到 Step 6 的人工确认为止即可。

---
