# 个人品牌官网 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用纯 HTML/CSS/原生 JS 实现设计文档 `docs/superpowers/specs/2026-07-27-portfolio-website-design.md` 描述的单页个人品牌官网，可双击 `index.html` 直接在浏览器打开使用。

**Architecture:** 单页滚动站点，8 个 `<section>` + sticky 导航；`css/tokens.css` 定义深浅色两套 CSS 变量，`css/style.css` 承载所有布局/组件/动效样式；`js/i18n.js` 存放中英文文案字典，`js/main.js` 负责主题/语言切换、导航高亮、滚动进入动画、移动端菜单、Achievements 数字滚动，`js/visualizations.js` 负责 Skills 板块的雷达图与环形进度条。

**Tech Stack:** 纯 HTML5 / CSS3（含 CSS 变量、Grid、Flexbox） / 原生 JavaScript（ES5 风格函数声明，不用 ES module）。零第三方库、零构建步骤。

## Global Constraints

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤（用户在技术方案讨论中明确选择，放弃了推荐的 React 方案）
- 必须支持双击 `index.html` 以 `file://` 协议直接打开使用，不依赖本地服务器
- 不使用 `fetch()` 读取本地数据文件；不使用 `<script type="module">`（两者在 `file://` 协议下均可能被浏览器 CORS 拦截）
- 默认「浅色模式 + 中文」，用户切换后写入 `localStorage`，下次打开保持
- 配色仅用 Electric Ink 方案：浅色 `bg #f5fbfc / surface #ffffff / text #0a0f14 / text-muted rgba(10,15,20,.65) / border rgba(0,0,0,.08) / cyan #0891a8 / violet #5b3df0 / orange #c5661f`；深色 `bg #0a0f14 / surface #10161c / text #f2f6f7 / text-muted rgba(242,246,247,.65) / border rgba(255,255,255,.12) / cyan #18c8d9 / violet #7c5cff / orange #ff8a3d`
- 字体仅用系统字体栈 `-apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`，不引入外部字体文件
- 所有图片占位一律用 CSS 渐变/内联 SVG 实现，不引用可能 404 的外部图片文件
- 所有动效须响应 `prefers-reduced-motion: reduce`
- Achievements 数字、Experience/Projects 描述内容锚定简历原文与本轮对话确认信息，不得编造未确认数据
- Contact 板块不放电话号码、不放 GitHub/LinkedIn 链接（用户已明确选择不放）
- 姓名「陈慧莹」及专业术语（Python/SQL/Power BI 等）中英文版本保持原词不译

---

## Task 1: 项目骨架、设计令牌与导航栏（含深浅色 + 中英文切换机制）

**Files:**
- Create: `index.html`
- Create: `css/tokens.css`
- Create: `css/style.css`
- Create: `js/i18n.js`
- Create: `js/main.js`

**Interfaces:**
- Consumes: 无（本任务是第一个任务）
- Produces:
  - CSS 变量命名空间（`--color-bg`、`--color-surface`、`--color-text`、`--color-text-muted`、`--color-border`、`--color-accent-cyan`、`--color-accent-violet`、`--color-accent-orange`、`--gradient-primary`、`--color-bg-translucent`、`--radius-card`、`--radius-pill`、`--space-1`~`--space-6`、`--font-sans`、`--shadow-card`、`--shadow-card-hover`、`--transition-fast`、`--transition-medium`），后续所有任务的 CSS 都基于这些变量
  - 通用 CSS 类：`.container`、`.section`、`.section-eyebrow`、`.section-title`、`.card`、`.btn`/`.btn-primary`/`.btn-outline`、`[data-reveal]`/`.is-revealed`
  - `js/i18n.js`：全局对象 `window.CONTENT_ZH`、`window.CONTENT_EN`（本任务只含 `nav` key，后续任务往里加 key）
  - `js/main.js`：`data-i18n-key="a.b.c"` 属性约定（点分路径查字典）、`data-reveal` 属性约定（滚动进入动画）、`#theme-toggle`/`#lang-toggle`/`#nav-toggle`/`#nav-menu` 元素 id 约定
  - `index.html`：8 个 section 占位（`id="hero"` `id="about"` `id="skills"` `id="experience"` `id="projects"` `id="achievements"` `id="gallery"` `id="contact"`），每个内部只有一行注释标注由哪个 Task 填充，供后续任务按 id 定位替换
  - **`.js` 类约定**：`<head>` 里的内联脚本给 `<html>` 加 `.js` class。CSS 里凡是"只有 JS 正常工作才应该生效"的隐藏态（`[data-reveal]` 初始透明、移动端导航菜单默认收起）都必须写成 `.js [data-reveal]`、`.js .nav-menu` 这种带 `.js` 前缀的选择器，never 裸写 `[data-reveal] { opacity: 0; }`。后续任务如果新增"先隐藏、JS 触发后显示"的效果，必须沿用这个前缀约定，否则 JS 报错或被禁用时内容会永久不可见——这是本任务 Step 2 自查时发现并修复的真实 bug，不是可选风格

- [ ] **Step 1: 创建 `css/tokens.css`**

```css
:root {
  --color-bg: #f5fbfc;
  --color-bg-translucent: rgba(245, 251, 252, 0.82);
  --color-surface: #ffffff;
  --color-text: #0a0f14;
  --color-text-muted: rgba(10, 15, 20, 0.65);
  --color-border: rgba(0, 0, 0, 0.08);
  --color-accent-cyan: #0891a8;
  --color-accent-violet: #5b3df0;
  --color-accent-orange: #c5661f;
  --gradient-primary: linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-violet));

  --radius-card: 22px;
  --radius-pill: 999px;

  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 40px;
  --space-5: 64px;
  --space-6: 96px;

  --font-sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;

  --shadow-card: 0 1px 3px rgba(10, 15, 20, 0.06);
  --shadow-card-hover: 0 20px 40px rgba(10, 15, 20, 0.12);

  --transition-fast: 200ms ease;
  --transition-medium: 300ms ease;
}

[data-theme="dark"] {
  --color-bg: #0a0f14;
  --color-bg-translucent: rgba(10, 15, 20, 0.82);
  --color-surface: #10161c;
  --color-text: #f2f6f7;
  --color-text-muted: rgba(242, 246, 247, 0.65);
  --color-border: rgba(255, 255, 255, 0.12);
  --color-accent-cyan: #18c8d9;
  --color-accent-violet: #7c5cff;
  --color-accent-orange: #ff8a3d;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.24);
  --shadow-card-hover: 0 20px 40px rgba(0, 0, 0, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: 创建 `css/style.css`**

```css
/* ===== Reset & Base ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  transition: background var(--transition-medium), color var(--transition-medium);
  overflow-x: hidden;
}
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }
button { font-family: inherit; }

.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

.section { padding: var(--space-6) 0; }

.section-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent-violet);
  margin-bottom: var(--space-2);
}

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-medium), box-shadow var(--transition-medium);
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card-hover); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.btn:hover { transform: translateY(-2px); }
.btn-primary { background: var(--gradient-primary); color: #ffffff; }
[data-theme="dark"] .btn-primary { color: #05060a; }
.btn-outline { border-color: var(--color-border); background: transparent; color: var(--color-text); }
.btn-outline:hover { border-color: var(--color-accent-violet); }

/* data-reveal 默认可见（无 JS 兜底）；只有 <html> 带上 .js（由 index.html 里的内联脚本添加）
   时才进入"先隐藏、滚动到可视区域再淡入"的动画状态，避免 JS 未执行/报错时内容永久不可见 */
.js [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.js [data-reveal].is-revealed { opacity: 1; transform: translateY(0); }

/* ===== Nav ===== */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: var(--color-bg-translucent);
  border-bottom: 1px solid var(--color-border);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1120px;
  margin: 0 auto;
}
.nav-logo {
  font-weight: 800;
  font-size: 16px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.nav-menu { display: flex; align-items: center; gap: 28px; }
.nav-menu a {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}
.nav-menu a.is-active, .nav-menu a:hover { color: var(--color-text); }
.nav-controls { display: flex; align-items: center; gap: 12px; }
.nav-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-text);
}
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
.nav-toggle span { width: 20px; height: 2px; background: var(--color-text); transition: transform var(--transition-fast), opacity var(--transition-fast); }
.nav-toggle.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-toggle.is-open span:nth-child(2) { opacity: 0; }
.nav-toggle.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 768px) {
  /* 无 .js（JS 未执行）时移动端导航保持常驻展开的纵向列表，仍可正常点击跳转；
     只有确认 JS 正常运行才切换成"汉堡按钮收起/展开"的交互形式 */
  .js .nav-menu {
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    padding: 24px;
    gap: 20px;
    transform: translateY(-150%);
    opacity: 0;
    transition: transform var(--transition-medium), opacity var(--transition-medium);
  }
  .js .nav-menu.is-open { transform: translateY(0); opacity: 1; }
  .nav-menu { flex-direction: column; align-items: flex-start; gap: 12px; padding: 12px 0; }
  .js .nav-toggle { display: flex; }
}
```

- [ ] **Step 3: 创建 `js/i18n.js`**

```js
window.CONTENT_ZH = {
  nav: {
    about: '关于我',
    skills: '技能',
    experience: '经历',
    projects: '项目',
    achievements: '成果',
    gallery: '生活',
    contact: '联系'
  }
};

window.CONTENT_EN = {
  nav: {
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    achievements: 'Achievements',
    gallery: 'Gallery',
    contact: 'Contact'
  }
};
```

- [ ] **Step 4: 创建 `js/main.js`**

```js
(function () {
  'use strict';

  function initTheme() {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }
  }

  function setLang(lang) {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    var dict = lang === 'en' ? window.CONTENT_EN : window.CONTENT_ZH;
    document.querySelectorAll('[data-i18n-key]').forEach(function (el) {
      var path = el.getAttribute('data-i18n-key').split('.');
      var value = dict;
      for (var i = 0; i < path.length; i++) {
        value = value && value[path[i]];
      }
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = lang === 'zh' ? 'EN' : '中';
    }
  }

  function initLang() {
    var stored = localStorage.getItem('lang');
    var lang = (stored === 'en' || stored === 'zh') ? stored : 'zh';
    setLang(lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'zh';
        var next = current === 'zh' ? 'en' : 'zh';
        setLang(next);
        localStorage.setItem('lang', next);
      });
    }
  }

  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
      });
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('is-open');
          toggle.classList.remove('is-open');
        });
      });
    }
  }

  function initNavHighlight() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('#nav-menu a[href^="#"]');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initLang();
    initMobileMenu();
    initNavHighlight();
    initScrollReveal();
  });
})();
```

- [ ] **Step 5: 创建 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>陈慧莹 · 数据分析师 | Data Analyst Portfolio</title>
  <meta name="description" content="陈慧莹的个人品牌官网 — 数据分析、风险分析、AI 应用与自动化实践">
  <script>document.documentElement.classList.add('js');</script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo">陈慧莹</a>
      <ul id="nav-menu" class="nav-menu">
        <li><a href="#about" data-i18n-key="nav.about">关于我</a></li>
        <li><a href="#skills" data-i18n-key="nav.skills">技能</a></li>
        <li><a href="#experience" data-i18n-key="nav.experience">经历</a></li>
        <li><a href="#projects" data-i18n-key="nav.projects">项目</a></li>
        <li><a href="#achievements" data-i18n-key="nav.achievements">成果</a></li>
        <li><a href="#gallery" data-i18n-key="nav.gallery">生活</a></li>
        <li><a href="#contact" data-i18n-key="nav.contact">联系</a></li>
      </ul>
      <div class="nav-controls">
        <button id="lang-toggle" class="nav-icon-btn" aria-label="Switch language">EN</button>
        <button id="theme-toggle" class="nav-icon-btn" aria-label="Toggle theme">◐</button>
        <button id="nav-toggle" class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>

  <main>
    <section id="hero" class="hero"><!-- Task 2 --></section>
    <section id="about" class="section"><!-- Task 3 --></section>
    <section id="skills" class="section"><!-- Task 4 --></section>
    <section id="experience" class="section"><!-- Task 5 --></section>
    <section id="projects" class="section"><!-- Task 6 --></section>
    <section id="achievements" class="section"><!-- Task 7 --></section>
    <section id="gallery" class="section"><!-- Task 8 --></section>
    <section id="contact" class="section"><!-- Task 9 --></section>
  </main>

  <footer class="footer"><!-- Task 9 --></footer>

  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 6: 结构与语法验证**

```bash
node --check js/main.js && echo "main.js OK"
node --check js/i18n.js && echo "i18n.js OK"
grep -c '<section id=' index.html
grep -q 'data-theme="dark"' css/tokens.css && echo "dark tokens OK"
grep -q 'CONTENT_ZH' js/i18n.js && grep -q 'CONTENT_EN' js/i18n.js && echo "i18n dict OK"
grep -q "classList.add('js')" index.html && echo "js-detection script OK"
grep -q '\.js \[data-reveal\]' css/style.css && echo "scoped data-reveal OK"
```

Expected：`main.js OK`、`i18n.js OK` 各一行；`grep -c` 输出 `8`；`dark tokens OK`；`i18n dict OK`；`js-detection script OK`；`scoped data-reveal OK`。

- [ ] **Step 7: 视觉检查点（导航栏渲染）**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task1-nav.png
```

用 Read 工具查看 `/tmp/portfolio-task1-nav.png`，确认：顶部导航栏正常显示（姓名 logo 渐变字、7 个锚点文字、EN/主题切换圆按钮），下方主体区域此时为空白（Hero 等板块要到后续任务才有内容，空白是预期状态，不是 bug）。

- [ ] **Step 8: Commit**

```bash
git add index.html css/tokens.css css/style.css js/i18n.js js/main.js
git commit -m "feat: 项目骨架、设计令牌与导航栏（深浅色+中英文切换机制）"
```

---

## Task 2: Hero 区块

**Files:**
- Modify: `index.html`（替换 `<section id="hero">` 内容）
- Modify: `css/style.css`（追加 Hero 样式）
- Modify: `js/i18n.js`（`CONTENT_ZH`/`CONTENT_EN` 新增 `hero` key）
- Modify: `js/main.js`（新增 `initParticles`，加入 `DOMContentLoaded` 调用列表）

**Interfaces:**
- Consumes：Task 1 的 `.container`、`.btn`/`.btn-primary`/`.btn-outline`、`[data-reveal]`、`data-i18n-key` 机制、`--gradient-primary` 等 CSS 变量
- Produces：`#particles` canvas 元素与 `initParticles()` 函数（后续任务不依赖它，仅 Hero 自用）；`assets/resume/` 目录路径约定（下载简历按钮先指向该路径，实际文件由 Task 9 放入 —— 本任务先让链接指向正确路径，文件缺失不影响本任务的验收范围）

- [ ] **Step 1: 修改 `index.html`，替换 Hero 占位**

将：

```html
    <section id="hero" class="hero"><!-- Task 2 --></section>
```

替换为：

```html
    <section id="hero" class="hero">
      <div class="hero-bg" aria-hidden="true">
        <span class="hero-blob hero-blob--cyan"></span>
        <span class="hero-blob hero-blob--violet"></span>
        <canvas id="particles" class="hero-particles"></canvas>
      </div>
      <div class="container hero-inner">
        <div class="hero-copy" data-reveal>
          <p class="section-eyebrow" data-i18n-key="hero.eyebrow">DATA ANALYST · AI 实践者</p>
          <h1 class="hero-name">陈慧莹</h1>
          <p class="hero-slogan" data-i18n-key="hero.slogan">用数据解决问题，用 AI 提升效率，把创意变成真正可落地的产品。</p>
          <div class="hero-actions">
            <a href="#projects" class="btn btn-primary" data-i18n-key="hero.ctaProjects">查看项目</a>
            <a href="assets/resume/陈慧莹_数据分析简历.pdf" download class="btn btn-outline" data-i18n-key="hero.ctaResume">下载简历</a>
            <a href="#contact" class="btn btn-outline" data-i18n-key="hero.ctaContact">联系我</a>
          </div>
        </div>
        <div class="hero-visual" data-reveal>
          <div class="hero-card">
            <div class="hero-avatar" aria-hidden="true"></div>
          </div>
          <span class="hero-chip hero-chip--1">Python</span>
          <span class="hero-chip hero-chip--2">SQL</span>
          <span class="hero-chip hero-chip--3">Power BI</span>
          <span class="hero-chip hero-chip--4">AI Tools</span>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Hero 样式**

```css
/* ===== Hero ===== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: var(--space-5);
}
.hero-bg { position: absolute; inset: 0; z-index: 0; }
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.35;
}
.hero-blob--cyan { width: 420px; height: 420px; background: var(--color-accent-cyan); top: -120px; right: 8%; }
.hero-blob--violet { width: 360px; height: 360px; background: var(--color-accent-violet); bottom: -100px; left: 4%; opacity: 0.28; }
.hero-particles { position: absolute; inset: 0; width: 100%; height: 100%; }

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--space-5);
  align-items: center;
}
.hero-name {
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: var(--space-2);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-slogan {
  font-size: 18px;
  color: var(--color-text-muted);
  max-width: 480px;
  margin-bottom: var(--space-4);
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }

.hero-visual { position: relative; height: 360px; }
.hero-card {
  position: absolute;
  inset: 20px;
  border-radius: var(--radius-card);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}
.hero-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--gradient-primary);
}
.hero-chip {
  position: absolute;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
}
.hero-chip--1 { top: 6%; left: -4%; }
.hero-chip--2 { top: 28%; right: -8%; }
.hero-chip--3 { bottom: 22%; left: -8%; }
.hero-chip--4 { bottom: 2%; right: 2%; }

@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero-actions { justify-content: center; }
  .hero-slogan { margin-left: auto; margin-right: auto; }
  .hero-visual { height: 280px; margin-top: var(--space-3); }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，为 `CONTENT_ZH` 和 `CONTENT_EN` 新增 `hero` key**

在 `CONTENT_ZH` 的 `nav: { ... },` 后面新增（注意逗号）：

```js
  hero: {
    eyebrow: 'DATA ANALYST · AI 实践者',
    slogan: '用数据解决问题，用 AI 提升效率，把创意变成真正可落地的产品。',
    ctaProjects: '查看项目',
    ctaResume: '下载简历',
    ctaContact: '联系我'
  },
```

在 `CONTENT_EN` 的 `nav: { ... },` 后面新增：

```js
  hero: {
    eyebrow: 'DATA ANALYST · AI PRACTITIONER',
    slogan: 'Solving problems with data, boosting efficiency with AI, turning ideas into products that actually ship.',
    ctaProjects: 'View Projects',
    ctaResume: 'Download Resume',
    ctaContact: 'Contact Me'
  },
```

- [ ] **Step 4: 修改 `js/main.js`，新增粒子背景动效**

在 `initScrollReveal` 函数后面（`})();` 之前的 `document.addEventListener(...)` 之前）插入：

```js
  function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var particles = [];
    var count = window.innerWidth < 768 ? 18 : 36;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.5 + 0.5
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 92, 255, 0.35)';
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', function () { resize(); seed(); });
    resize();
    seed();
    tick();
  }
```

并把 `document.addEventListener('DOMContentLoaded', function () {` 那一块里追加一行 `initParticles();`（放在 `initScrollReveal();` 之后）。

- [ ] **Step 5: 验证**

```bash
node --check js/main.js && echo "main.js OK"
node --check js/i18n.js && echo "i18n.js OK"
grep -q "hero:" js/i18n.js && echo "hero i18n OK"
grep -q "hero-particles" css/style.css && echo "hero css OK"
```

Expected：四行均输出对应 OK。

- [ ] **Step 6: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task2-hero.png
```

用 Read 工具查看 `/tmp/portfolio-task2-hero.png`，确认：左侧渐变姓名+slogan+三按钮，右侧玻璃卡片头像占位+四个悬浮技能标签，背景可见极光渐变色块与细小粒子点，整体是"左文右图"的不对称布局（Split Asymmetric，与可视化脑暴工具中确认的方案一致）。

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/i18n.js js/main.js
git commit -m "feat: Hero 区块（Split Asymmetric 布局 + 极光背景粒子动效）"
```

---

## Task 3: About 区块

**Files:**
- Modify: `index.html`（替换 `<section id="about">` 内容）
- Modify: `css/style.css`（追加 About 样式）
- Modify: `js/i18n.js`（新增 `about` key）

**Interfaces:**
- Consumes：`.container`、`.section`、`.section-eyebrow`、`.section-title`、`.card`、`[data-reveal]`、`data-i18n-key`
- Produces：无新增全局约定，供 Task 4 起参考同样的"卡片网格"写法即可

- [ ] **Step 1: 修改 `index.html`，替换 About 占位**

将：

```html
    <section id="about" class="section"><!-- Task 3 --></section>
```

替换为：

```html
    <section id="about" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="about.eyebrow">ABOUT ME</p>
        <h2 class="section-title" data-i18n-key="about.title">关于我</h2>
        <div class="about-grid">
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelName">姓名</p>
            <p class="about-value">陈慧莹</p>
          </div>
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelCity">所在城市</p>
            <p class="about-value" data-i18n-key="about.valueCity">上海</p>
          </div>
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelEducation">学历</p>
            <p class="about-value" data-i18n-key="about.valueEducation">东华大学 · 应用统计硕士（211，27届毕业生）</p>
          </div>
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelFocus">职业方向</p>
            <p class="about-value" data-i18n-key="about.valueFocus">数据分析 · 风险分析</p>
          </div>
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelResearch">研究方向</p>
            <p class="about-value" data-i18n-key="about.valueResearch">经营分析、风险建模、预测建模</p>
          </div>
          <div class="card about-card" data-reveal>
            <p class="about-label" data-i18n-key="about.labelHobbies">兴趣爱好</p>
            <p class="about-value" data-i18n-key="about.valueHobbies">阅读、普拉提、游泳、尤克里里、旅行</p>
          </div>
        </div>
        <div class="card about-travel" data-reveal>
          <p data-i18n-key="about.travelNote">旅行是我和朋友们的固定节目：轮流组队当"导游"，那一次由导游全权安排行程，其余人无条件跟随——目前已经轮了好几轮。</p>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 About 样式**

```css
/* ===== About ===== */
.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.about-card { padding: var(--space-3); }
.about-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.about-value { font-size: 16px; font-weight: 600; }
.about-travel {
  padding: var(--space-3);
  font-size: 15px;
  color: var(--color-text-muted);
  border-left: 3px solid var(--color-accent-violet);
  border-radius: var(--radius-card);
}

@media (max-width: 900px) {
  .about-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .about-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `about` key**

`CONTENT_ZH` 中 `hero: { ... },` 后追加：

```js
  about: {
    eyebrow: 'ABOUT ME',
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

`CONTENT_EN` 中 `hero: { ... },` 后追加：

```js
  about: {
    eyebrow: 'ABOUT ME',
    title: 'About Me',
    labelName: 'Name',
    labelCity: 'City',
    valueCity: 'Shanghai, China',
    labelEducation: 'Education',
    valueEducation: 'Donghua University · M.S. Applied Statistics (Class of 2027)',
    labelFocus: 'Focus',
    valueFocus: 'Data Analysis · Risk Analytics',
    labelResearch: 'Research Interests',
    valueResearch: 'Business Analytics, Risk Modeling, Forecasting',
    labelHobbies: 'Hobbies',
    valueHobbies: 'Reading, Pilates, Swimming, Ukulele, Travel',
    travelNote: 'Travel is a running tradition with my friends: we take turns being the "tour guide" for a trip — that person plans everything, and everyone else follows without question. We\'ve been through several rounds already.'
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -q "about:" js/i18n.js && echo "about i18n OK"
grep -c 'data-i18n-key="about\.' index.html
```

Expected：`i18n.js OK`、`about i18n OK`；第三条 grep 输出 `14`（eyebrow、title、6 组 label/value 共 12 个、travelNote，加起来 14 个带 key 的元素；"姓名"卡片的值 陈慧莹 本身不翻译，故意不带 key，不计入）。

- [ ] **Step 5: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task3-about.png
```

用 Read 工具查看 `/tmp/portfolio-task3-about.png`（需要先手动滚动到 About 区域再截图，或直接用浏览器打开后滚动一屏；若截图仍是 Hero 画面，说明滚动未生效，可改用键盘 `End`/`Page Down` 前先用 `osascript` 模拟滚动，或退回结构检查即可，不强求）。确认：6 张信息卡片按 3 列网格排列，下方有单独一张旅行趣事卡片。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: About 区块（卡片式个人信息 + 旅行趣事）"
```

---

## Task 4: Skills 区块（雷达图 + 环形进度卡片）

**Files:**
- Modify: `index.html`（替换 `<section id="skills">` 内容）
- Modify: `css/style.css`（追加 Skills 样式）
- Modify: `js/i18n.js`（新增 `skills` key，仅标题/eyebrow，六项技能名称中英通用不需要翻译）
- Create: `js/visualizations.js`
- Modify: `index.html`（`</body>` 前新增 `<script src="js/visualizations.js"></script>`）

**Interfaces:**
- Consumes：`.card`、`[data-reveal]`、CSS 变量
- Produces：`js/visualizations.js` 独立文件，只负责 Skills 的雷达图与环形进度动画，不影响其他任务

- [ ] **Step 1: 修改 `index.html`，替换 Skills 占位**

将：

```html
    <section id="skills" class="section"><!-- Task 4 --></section>
```

替换为：

```html
    <section id="skills" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="skills.eyebrow">SKILLS</p>
        <h2 class="section-title" data-i18n-key="skills.title">技能</h2>
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
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Skills 样式**

```css
/* ===== Skills ===== */
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
.radar-chart-mount { width: 100%; max-width: 320px; min-height: 260px; }
/* min-height 避免 JS 未执行、SVG 未被注入时这张卡片直接塌成 0 高度——
   雷达图本身没有实用的纯 CSS 静态替代，属于设计文档里"JS 增强型"的可视化，
   保留卡片占位尺寸即可，不强求无 JS 时也画出完整雷达图 */
.radar-grid { fill: none; stroke: var(--color-border); stroke-width: 1; }
.radar-data {
  fill: rgba(91, 61, 240, 0.28);
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
}
@media (max-width: 560px) {
  .skills-grid { grid-template-columns: 1fr; }
  .skills-radar-card { grid-column: span 1; }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `skills` key**

`CONTENT_ZH` 中 `about: { ... },` 后追加：

```js
  skills: { eyebrow: 'SKILLS', title: '技能' },
```

`CONTENT_EN` 中 `about: { ... },` 后追加：

```js
  skills: { eyebrow: 'SKILLS', title: 'Skills' },
```

- [ ] **Step 4: 创建 `js/visualizations.js`**

```js
(function () {
  'use strict';

  var SKILLS = [
    { label: 'Data Analysis', value: 95 },
    { label: 'Python', value: 90 },
    { label: 'SQL', value: 85 },
    { label: 'AI Tools', value: 82 },
    { label: 'Machine Learning', value: 78 },
    { label: 'Power BI', value: 70 }
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

  function animateRings() {
    var rings = document.querySelectorAll('.skill-ring-progress');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rings.forEach(function (ring) {
      var target = parseFloat(ring.getAttribute('data-value'));
      var r = parseFloat(ring.getAttribute('r'));
      var circumference = 2 * Math.PI * r;
      ring.style.strokeDasharray = circumference.toFixed(2);
      var card = ring.closest('.skill-ring-card');
      var counter = card ? card.querySelector('.skill-ring-value') : null;

      if (reduceMotion) {
        ring.style.strokeDashoffset = (circumference * (1 - target / 100)).toFixed(2);
        if (counter) counter.textContent = target + '%';
        return;
      }

      ring.style.strokeDashoffset = circumference.toFixed(2);
      if (counter) counter.textContent = '0%';
      requestAnimationFrame(function () {
        ring.style.transition = 'stroke-dashoffset 1.1s ease';
        ring.style.strokeDashoffset = (circumference * (1 - target / 100)).toFixed(2);
      });

      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        if (counter) counter.textContent = Math.round(progress * target) + '%';
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function initSkills() {
    renderRadar();
    var section = document.getElementById('skills');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      animateRings();
      return;
    }
    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          animateRings();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  document.addEventListener('DOMContentLoaded', initSkills);
})();
```

- [ ] **Step 5: 修改 `index.html`，引入新脚本**

将 `</body>` 前的：

```html
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
</body>
```

替换为：

```html
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
  <script src="js/visualizations.js"></script>
</body>
```

- [ ] **Step 6: 验证**

```bash
node --check js/visualizations.js && echo "visualizations.js OK"
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'skill-ring-card' index.html
grep -q 'radar-chart-mount' index.html && echo "radar mount OK"
grep -c 'stroke-dashoffset:' index.html
grep -q '>95%<' index.html && echo "static fallback percentages OK"
```

Expected：`visualizations.js OK`、`i18n.js OK`；第三条 grep 输出 `6`；`radar mount OK`；第五条 grep（`stroke-dashoffset:` 内联样式）输出 `6`（每个环形进度条一个，确认无 JS 时也能显示正确进度而非空心圆）；`static fallback percentages OK`。

- [ ] **Step 7: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task4-skills.png
```

用 Read 工具查看截图（若停留在 Hero 画面属正常，因为 Skills 在下方；重点确认页面整体无 JS 报错导致的空白崩溃）。另外打开浏览器开发者工具（Cmd+Option+I）手动滚动到 Skills 区域，确认：六边形雷达图正常绘制、六个环形进度卡片围绕展示，鼠标滚动进入视口时数字从 0 滚动到目标值、圆环同步描边——这一步交互效果需要人工在真实浏览器中滚动查看，静态截图无法完全验证，作为本任务的已知验证局限记录在案。

- [ ] **Step 8: Commit**

```bash
git add index.html css/style.css js/i18n.js js/visualizations.js
git commit -m "feat: Skills 区块（雷达图 + 环形进度卡片组合）"
```

---

## Task 5: Experience 区块

**Files:**
- Modify: `index.html`（替换 `<section id="experience">` 内容）
- Modify: `css/style.css`（追加 Experience 样式）
- Modify: `js/i18n.js`（新增 `experience` key）

**Interfaces:**
- Consumes：`.card`、`[data-reveal]`、`data-i18n-key`
- Produces：`.timeline`/`.timeline-item` 类名，无后续任务依赖

- [ ] **Step 1: 修改 `index.html`，替换 Experience 占位**

将：

```html
    <section id="experience" class="section"><!-- Task 5 --></section>
```

替换为：

```html
    <section id="experience" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="experience.eyebrow">EXPERIENCE</p>
        <h2 class="section-title" data-i18n-key="experience.title">经历</h2>
        <div class="timeline">
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
              <span>SQL</span><span>Excel</span><span>数据可视化</span>
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
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Experience 样式**

```css
/* ===== Experience ===== */
.timeline { display: flex; flex-direction: column; gap: var(--space-3); }
.timeline-item { padding: var(--space-3); }
.timeline-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
.timeline-head h3 { font-size: 20px; font-weight: 800; }
.timeline-period { font-size: 13px; color: var(--color-text-muted); font-weight: 600; }
.timeline-role { font-size: 14px; color: var(--color-accent-violet); font-weight: 700; margin: 4px 0 var(--space-2); }
.timeline-bullets { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-2); }
.timeline-bullets li { font-size: 14px; color: var(--color-text-muted); padding-left: 16px; position: relative; }
.timeline-bullets li::before { content: '—'; position: absolute; left: 0; color: var(--color-accent-cyan); }
.timeline-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: var(--space-2); }
.timeline-tags span {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}
.timeline-highlight { font-size: 14px; font-weight: 700; color: var(--color-accent-orange); }
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `experience` key**

`CONTENT_ZH` 中 `skills: { ... },` 后追加：

```js
  experience: {
    eyebrow: 'EXPERIENCE',
    title: '经历',
    knGroup: {
      company: 'KN Group', period: '2026.06 – 2026.08', role: '数据分析实习生',
      bullet1: '搭建注册→授信→放款→还款全链路转化漏斗及风险收益监控体系，跟踪注册成本、放款率、坏账率、CPS 等核心指标',
      bullet2: '基于 Python 搭建坏账预测模型，完成多版本情景模拟及资产质量测算',
      bullet3: '开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成',
      highlight: '大幅提升周报/月报产出效率'
    },
    nio: {
      company: '上海蔚来汽车有限公司', period: '2026.01 – 2026.06', role: '服务运营（数据分析方向）实习生',
      bullet1: '独立搭建月度运营数据报表体系，基于 SQL 完成业务数据提取、指标口径统一及数据可视化',
      bullet2: '跟踪换电站运营表现及 VOC 用户反馈，构建问题分类体系并输出专题分析报告',
      bullet3: '深度参与春节、五一能源保障项目，负责运营数据监控与复盘分析',
      highlight: '保障运营数据 100% 准确及时输出'
    },
    zhouji: {
      company: '上海洲暨科技有限公司', period: '2025.01 – 2025.05', role: '数据分析实习生',
      bullet1: '利用 MySQL 从 CRM 系统数据库获取交易数据，通过统计方法总结数据特征',
      bullet2: '使用 Tableau 发现数据中的模式、趋势和异常数据',
      bullet3: '通过数据分析发现业务中的潜在问题或机会，推动业务优化',
      highlight: '交易率较三个月前提升 20%'
    }
  },
```

`CONTENT_EN` 中 `skills: { ... },` 后追加：

```js
  experience: {
    eyebrow: 'EXPERIENCE',
    title: 'Experience',
    knGroup: {
      company: 'KN Group', period: 'Jun 2026 – Aug 2026', role: 'Data Analyst Intern',
      bullet1: 'Built the full registration → credit → disbursement → repayment funnel and risk/return monitoring system; tracked KPIs including CAC, disbursement rate, NPL rate, and CPS',
      bullet2: 'Built bad-debt prediction models in Python and ran multi-scenario simulations for asset-quality assessment',
      bullet3: 'Developed automated analysis tooling for disbursement volume, asset performance, and NPL rate, with auto data cleaning, pivoting, and Excel report generation',
      highlight: 'Significantly sped up weekly/monthly report turnaround'
    },
    nio: {
      company: 'NIO Inc.', period: 'Jan 2026 – Jun 2026', role: 'Service Operations (Data Analytics) Intern',
      bullet1: 'Independently built a monthly operations reporting system, using SQL for data extraction, metric standardization, and visualization',
      bullet2: 'Tracked battery-swap station performance and VOC feedback, built an issue-classification framework and published thematic reports',
      bullet3: 'Supported Spring Festival and Labor Day energy-assurance projects with operations monitoring and post-mortem analysis',
      highlight: 'Kept operations data 100% accurate and on time'
    },
    zhouji: {
      company: 'Shanghai Zhouji Technology', period: 'Jan 2025 – May 2025', role: 'Data Analyst Intern',
      bullet1: 'Pulled transaction data from the CRM database via MySQL and summarized data characteristics using statistical methods',
      bullet2: 'Used Tableau to surface patterns, trends, and anomalies in the data',
      bullet3: 'Turned analysis into action by working directly with the business to fix root-cause issues',
      highlight: 'Lifted the transaction rate by 20% within three months'
    }
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'timeline-item' index.html
grep -q 'knGroup' js/i18n.js && grep -q 'zhouji' js/i18n.js && echo "experience i18n OK"
```

Expected：`i18n.js OK`；第二条 grep 输出 `3`（每张卡片 `card timeline-item` 算一次匹配，实际字符串在 class 属性里出现 3 次）；`experience i18n OK`。

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Experience 区块（三段实习时间轴卡片）"
```

---

## Task 6: Featured Projects 区块

**Files:**
- Modify: `index.html`（替换 `<section id="projects">` 内容）
- Modify: `css/style.css`（追加 Projects 样式，含 3 种 CSS-only 抽象缩略图 + 1 种"待补充截图"占位）
- Modify: `js/i18n.js`（新增 `projects` key）

**Interfaces:**
- Consumes：`.card`、`[data-reveal]`、`data-i18n-key`
- Produces：`.project-thumb--*` 缩略图类名，仅本区块使用

- [ ] **Step 1: 修改 `index.html`，替换 Projects 占位**

将：

```html
    <section id="projects" class="section"><!-- Task 6 --></section>
```

替换为：

```html
    <section id="projects" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="projects.eyebrow">FEATURED PROJECTS</p>
        <h2 class="section-title" data-i18n-key="projects.title">项目</h2>
        <div class="projects-grid">
          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--supply-chain" aria-hidden="true"></div>
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.supplyChain.badge">国竞一等奖</p>
              <h3 data-i18n-key="projects.supplyChain.title">爆品供应链全渠道库存优化与风险建模研究</h3>
              <p class="project-desc" data-i18n-key="projects.supplyChain.desc">构建 ARIMAX+TCN 需求预测模型，完成分渠道/分区域 13 周预测与风险区间测算；设计 MPC 动态库存优化框架，基于 XGBoost-SHAP 搭建风险传导模型</p>
              <p class="project-metric" data-i18n-key="projects.supplyChain.metric">库存周转率 +241.2% · 总成本 -25% · 服务水平 98.83%</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--insurance" aria-hidden="true"></div>
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.insurance.badge">美国 MCM Honorable Mention</p>
              <h3 data-i18n-key="projects.insurance.title">保险公司承保评级系统</h3>
              <p class="project-desc" data-i18n-key="projects.insurance.desc">基于巨灾模型计算保险公司预期损失，通过泊松分布仿真模拟随机生成损失总价值和极端天气发生概率，采用空间分析技术构建 Bankruptcy Index Model</p>
              <p class="project-metric" data-i18n-key="projects.insurance.metric">覆盖 146 个国家、16 万条数据</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--automation" aria-hidden="true"></div>
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.automation.badge">KN Group 实习产出</p>
              <h3 data-i18n-key="projects.automation.title">业务自动化分析工具</h3>
              <p class="project-desc" data-i18n-key="projects.automation.desc">基于 Python（Pandas、OpenPyXL）开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成</p>
              <p class="project-metric" data-i18n-key="projects.automation.metric">大幅提升周报/月报产出效率</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <!-- 图片待补充：用户确认先留空位，等后续提供真实截图 -->
            <div class="project-thumb project-thumb--pending" aria-hidden="true">
              <span data-i18n-key="projects.website.pending">项目截图待补充</span>
            </div>
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.website.badge">AI 实践</p>
              <h3 data-i18n-key="projects.website.title">个人展示网页 / 简历投递辅助工具</h3>
              <p class="project-desc" data-i18n-key="projects.website.desc">利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Projects 样式**

```css
/* ===== Projects ===== */
.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.project-card { overflow: hidden; }
.project-thumb { height: 160px; position: relative; overflow: hidden; }
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
.project-thumb--pending {
  border: 1px dashed var(--color-border);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.project-thumb--pending span {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}
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

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `projects` key**

`CONTENT_ZH` 中 `experience: { ... },` 后追加：

```js
  projects: {
    eyebrow: 'FEATURED PROJECTS',
    title: '项目',
    supplyChain: {
      badge: '国竞一等奖',
      title: '爆品供应链全渠道库存优化与风险建模研究',
      desc: '构建 ARIMAX+TCN 需求预测模型，完成分渠道/分区域 13 周预测与风险区间测算；设计 MPC 动态库存优化框架，基于 XGBoost-SHAP 搭建风险传导模型',
      metric: '库存周转率 +241.2% · 总成本 -25% · 服务水平 98.83%'
    },
    insurance: {
      badge: '美国 MCM Honorable Mention',
      title: '保险公司承保评级系统',
      desc: '基于巨灾模型计算保险公司预期损失，通过泊松分布仿真模拟随机生成损失总价值和极端天气发生概率，采用空间分析技术构建 Bankruptcy Index Model',
      metric: '覆盖 146 个国家、16 万条数据'
    },
    automation: {
      badge: 'KN Group 实习产出',
      title: '业务自动化分析工具',
      desc: '基于 Python（Pandas、OpenPyXL）开发自动化数据分析工具，实现放款金额、资产表现、坏账率等多维数据自动清洗、透视统计及 Excel 报表生成',
      metric: '大幅提升周报/月报产出效率'
    },
    website: {
      badge: 'AI 实践',
      title: '个人展示网页 / 简历投递辅助工具',
      desc: '利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证',
      pending: '项目截图待补充'
    }
  },
```

`CONTENT_EN` 中 `experience: { ... },` 后追加：

```js
  projects: {
    eyebrow: 'FEATURED PROJECTS',
    title: 'Projects',
    supplyChain: {
      badge: '1st Prize, National Competition',
      title: 'Omni-Channel Inventory Optimization & Risk Modeling for Hero SKUs',
      desc: 'Built an ARIMAX+TCN demand forecasting model with 13-week forecasts and risk intervals by channel/region; designed an MPC dynamic inventory framework and an XGBoost-SHAP risk propagation model',
      metric: 'Inventory turnover +241.2% · Total cost -25% · Service level 98.83%'
    },
    insurance: {
      badge: 'US MCM Honorable Mention',
      title: 'Insurance Underwriting Rating System',
      desc: 'Estimated insurer expected losses via catastrophe modeling, simulated loss severity and extreme-weather probability with Poisson processes, and built a spatial Bankruptcy Index Model',
      metric: 'Covered 146 countries, 160K+ data points'
    },
    automation: {
      badge: 'KN Group Internship Output',
      title: 'Business Automation Analytics Tool',
      desc: 'Built automated analysis tooling in Python (Pandas, OpenPyXL) that auto-cleans, pivots, and generates Excel reports across disbursement, asset performance, and NPL data',
      metric: 'Significantly sped up weekly/monthly reporting'
    },
    website: {
      badge: 'AI Practice',
      title: 'Personal Site / Resume-Application Assistant Tool',
      desc: 'Built a personal showcase site and a resume-application assistant tool with AI-assisted development, from rapid scaffolding to feature validation',
      pending: 'Screenshot coming soon'
    }
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'project-card' index.html
grep -q 'project-thumb--pending' index.html && echo "pending placeholder OK"
```

Expected：`i18n.js OK`；第二条 grep 输出 `4`；`pending placeholder OK`。

- [ ] **Step 5: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task6-projects.png
```

用 Read 工具查看截图，重点确认（若页面较长需手动滚动）：前 3 张卡片的缩略图是不同的抽象几何渐变（青紫圆点纹理 / 紫橙网格纹理 / 青橙斜纹纹理），第 4 张卡片缩略图明显是虚线边框+"项目截图待补充"文字，与前 3 张形成清晰区分，不会让人误以为是同类型的正式配图。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Featured Projects 区块（4 张项目卡片，含占位缩略图）"
```

---

## Task 7: Achievements 区块（数字滚动）

**Files:**
- Modify: `index.html`（替换 `<section id="achievements">` 内容）
- Modify: `css/style.css`（追加 Achievements 样式）
- Modify: `js/i18n.js`（新增 `achievements` key）
- Modify: `js/main.js`（新增 `initAchievements`/`animateCounters`，加入 `DOMContentLoaded` 调用列表）

**Interfaces:**
- Consumes：`.card`、`[data-reveal]`、`data-i18n-key`
- Produces：`.counter[data-target][data-suffix]` 约定，供本区块专用，不影响其他任务

- [ ] **Step 1: 修改 `index.html`，替换 Achievements 占位**

将：

```html
    <section id="achievements" class="section"><!-- Task 7 --></section>
```

替换为：

```html
    <section id="achievements" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="achievements.eyebrow">ACHIEVEMENTS</p>
        <h2 class="section-title" data-i18n-key="achievements.title">成果</h2>
        <div class="achievements-grid">
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="3">3</span></p>
            <p class="achievement-label" data-i18n-key="achievements.internships">段数据分析实习经历</p>
          </div>
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="4">4</span></p>
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
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Achievements 样式**

```css
/* ===== Achievements ===== */
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

@media (max-width: 900px) {
  .achievements-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .achievements-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `achievements` key**

`CONTENT_ZH` 中 `projects: { ... },` 后追加：

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

`CONTENT_EN` 中 `projects: { ... },` 后追加：

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

- [ ] **Step 4: 修改 `js/main.js`，新增数字滚动逻辑**

在 `initParticles` 函数后面插入：

```js
  function animateCounters() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.counter').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      el.textContent = '0' + suffix;
      var start = null;
      var duration = 1200;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(progress * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function initAchievements() {
    var section = document.getElementById('achievements');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      animateCounters();
      return;
    }
    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }
```

并把 `document.addEventListener('DOMContentLoaded', function () {` 那一块追加一行 `initAchievements();`（放在 `initParticles();` 之后）。

- [ ] **Step 5: 验证**

```bash
node --check js/main.js && echo "main.js OK"
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'achievement-card' index.html
grep -q 'data-suffix="+"' index.html && echo "suffix OK"
grep -q 'data-target="3">3<' index.html && echo "static fallback numbers OK"
```

Expected：`main.js OK`、`i18n.js OK`；第三条 grep 输出 `4`；`suffix OK`；`static fallback numbers OK`（确认 HTML 默认展示的就是真实数字而不是 0，无 JS 时数字也是对的，只是不会有滚动动画）。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js js/main.js
git commit -m "feat: Achievements 区块（数字滚动动画）"
```

---

## Task 8: Gallery 区块（Bento 照片墙占位）

**Files:**
- Modify: `index.html`（替换 `<section id="gallery">` 内容）
- Modify: `css/style.css`（追加 Gallery 样式）
- Modify: `js/i18n.js`（新增 `gallery` key）

**Interfaces:**
- Consumes：`[data-reveal]`、`data-i18n-key`
- Produces：`.gallery-cell--*` 主题类名，仅本区块使用

- [ ] **Step 1: 修改 `index.html`，替换 Gallery 占位**

将：

```html
    <section id="gallery" class="section"><!-- Task 8 --></section>
```

替换为：

```html
    <section id="gallery" class="section">
      <div class="container">
        <p class="section-eyebrow" data-i18n-key="gallery.eyebrow">GALLERY</p>
        <h2 class="section-title" data-i18n-key="gallery.title">生活</h2>
        <div class="gallery-grid">
          <div class="gallery-cell gallery-cell--travel gallery-cell--wide" data-reveal><span data-i18n-key="gallery.travel">旅行</span></div>
          <div class="gallery-cell gallery-cell--reading" data-reveal><span data-i18n-key="gallery.reading">阅读</span></div>
          <div class="gallery-cell gallery-cell--swim" data-reveal><span data-i18n-key="gallery.swim">游泳</span></div>
          <div class="gallery-cell gallery-cell--ukulele" data-reveal><span data-i18n-key="gallery.ukulele">尤克里里</span></div>
          <div class="gallery-cell gallery-cell--pilates gallery-cell--wide" data-reveal><span data-i18n-key="gallery.pilates">普拉提</span></div>
          <div class="gallery-cell gallery-cell--award" data-reveal><span data-i18n-key="gallery.award">获奖时刻</span></div>
          <div class="gallery-cell gallery-cell--study" data-reveal><span data-i18n-key="gallery.study">学习日常</span></div>
          <div class="gallery-cell gallery-cell--friends" data-reveal><span data-i18n-key="gallery.friends">朋友时光</span></div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 在 `css/style.css` 末尾追加 Gallery 样式**

```css
/* ===== Gallery ===== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 140px;
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
.gallery-cell span {
  position: relative;
  z-index: 1;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.gallery-cell--wide { grid-column: span 2; }
.gallery-cell--travel { background: linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-violet)); }
.gallery-cell--reading { background: linear-gradient(135deg, #6d5bf6, #a78bfa); }
.gallery-cell--swim { background: linear-gradient(135deg, #0891a8, #18c8d9); }
.gallery-cell--ukulele { background: linear-gradient(135deg, var(--color-accent-orange), #f0b06b); }
.gallery-cell--pilates { background: linear-gradient(135deg, #5b3df0, #0891a8); }
.gallery-cell--award { background: linear-gradient(135deg, #c5661f, #7c5cff); }
.gallery-cell--study { background: linear-gradient(135deg, #18c8d9, #5b3df0); }
.gallery-cell--friends { background: linear-gradient(135deg, #7c5cff, #c5661f); }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-cell--wide { grid-column: span 2; }
}
```

- [ ] **Step 3: 修改 `js/i18n.js`，新增 `gallery` key**

`CONTENT_ZH` 中 `achievements: { ... },` 后追加：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', study: '学习日常', friends: '朋友时光'
  },
```

`CONTENT_EN` 中 `achievements: { ... },` 后追加：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: 'Gallery',
    travel: 'Travel', reading: 'Reading', swim: 'Swimming', ukulele: 'Ukulele',
    pilates: 'Pilates', award: 'Award Moments', study: 'Study Life', friends: 'With Friends'
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'gallery-cell' index.html
```

Expected：`i18n.js OK`；第二条 grep 输出 `8`（`grep -c` 统计的是匹配的行数，不是子串出现次数——每个格子的 `class` 属性里 `gallery-cell` 虽然作为子串出现了 2-3 次，但整个 `div` 写在同一行上，所以每个格子只算 1 行；8 个格子对应 8 行）。

- [ ] **Step 5: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task8-gallery.png
```

用 Read 工具查看截图（需滚动到 Gallery 区域），确认：8 个色块按 Bento 网格排列（其中"旅行"和"普拉提"两格更宽），每格中央或底部有对应的中文主题文字，颜色各不相同但都在 Electric Ink 色系内，视觉上协调统一。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Gallery 区块（Bento 照片墙占位）"
```

---

## Task 9: Contact 区块、页脚与简历文件

**Files:**
- Modify: `index.html`（替换 `<section id="contact">` 与 `<footer>` 内容）
- Modify: `css/style.css`（追加 Contact/Footer 样式）
- Modify: `js/i18n.js`（新增 `contact`/`footer` key）
- Create: `assets/resume/陈慧莹_数据分析简历.pdf`（从用户 Downloads 目录复制）

**Interfaces:**
- Consumes：`.card`、`[data-reveal]`、`data-i18n-key`、Task 2 中 Hero 已写好的下载链接路径 `assets/resume/陈慧莹_数据分析简历.pdf`（本任务把对应文件真正放进去，让链接生效）
- Produces：无后续任务依赖

- [ ] **Step 1: 复制简历 PDF 到项目资源目录，并预留生活照文件夹**

v1 里所有占位视觉（Hero 头像、Gallery 8 格、Projects 前 3 张缩略图）都是纯 CSS 渐变实现，不引用任何图片文件，所以目前项目里还没有 `assets/images/` 目录。这里先把它建出来并放一个 `.gitkeep`（git 不追踪空目录），方便你以后有真实照片时直接把文件拖进去，不需要再手动建目录。

```bash
mkdir -p assets/resume assets/images
touch assets/images/.gitkeep
cp "/Users/huiying.h.chen/Downloads/陈慧莹_应用统计硕士_数据分析简历 (4).pdf" "assets/resume/陈慧莹_数据分析简历.pdf"
ls -la assets/resume/ assets/images/
```

Expected：`assets/resume/陈慧莹_数据分析简历.pdf` 存在且文件大小恰好 702191 字节（与源文件 `/Users/huiying.h.chen/Downloads/陈慧莹_应用统计硕士_数据分析简历 (4).pdf` 一致，这个字节数已在写计划前用 `ls -la` 核实过）；`assets/images/.gitkeep` 存在。

- [ ] **Step 2: 修改 `index.html`，替换 Contact 占位**

将：

```html
    <section id="contact" class="section"><!-- Task 9 --></section>
```

替换为：

```html
    <section id="contact" class="section">
      <div class="container contact-inner">
        <p class="section-eyebrow" data-i18n-key="contact.eyebrow">CONTACT</p>
        <h2 class="section-title" data-i18n-key="contact.title">联系我</h2>
        <div class="contact-grid">
          <a class="card contact-card" href="mailto:chenhuiying567@163.com" data-reveal>
            <p class="contact-label" data-i18n-key="contact.emailLabel">邮箱</p>
            <p class="contact-value">chenhuiying567@163.com</p>
          </a>
          <div class="card contact-card contact-card--wechat" data-reveal>
            <p class="contact-label" data-i18n-key="contact.wechatLabel">微信</p>
            <div class="wechat-qr-placeholder">
              <span data-i18n-key="contact.wechatPending">二维码待替换</span>
            </div>
          </div>
          <a class="card contact-card" href="assets/resume/陈慧莹_数据分析简历.pdf" download data-reveal>
            <p class="contact-label" data-i18n-key="contact.resumeLabel">简历</p>
            <p class="contact-value btn btn-primary" data-i18n-key="contact.resumeCta">下载简历</p>
          </a>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: 修改 `index.html`，替换 Footer 占位**

将：

```html
  <footer class="footer"><!-- Task 9 --></footer>
```

替换为：

```html
  <footer class="footer">
    <div class="container">
      <p class="footer-slogan" data-i18n-key="footer.slogan">Let's Build Something Amazing Together.</p>
      <p class="footer-copy">© 2026 陈慧莹</p>
    </div>
  </footer>
```

- [ ] **Step 4: 在 `css/style.css` 末尾追加 Contact/Footer 样式**

```css
/* ===== Contact ===== */
.contact-inner { text-align: center; }
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  text-align: left;
}
.contact-card { display: block; padding: var(--space-3); }
.contact-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.contact-value { font-size: 16px; font-weight: 700; }
.contact-card--wechat { text-align: center; }
.wechat-qr-placeholder {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.wechat-qr-placeholder span { font-size: 12px; color: var(--color-text-muted); text-align: center; padding: 0 10px; }

/* ===== Footer ===== */
.footer { padding: var(--space-5) 0; text-align: center; border-top: 1px solid var(--color-border); }
.footer-slogan {
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: var(--space-2);
}
.footer-copy { font-size: 13px; color: var(--color-text-muted); }

@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: 修改 `js/i18n.js`，新增 `contact`/`footer` key**

`CONTENT_ZH` 中 `gallery: { ... },` 后追加：

```js
  contact: {
    eyebrow: 'CONTACT',
    title: '联系我',
    emailLabel: '邮箱',
    wechatLabel: '微信',
    wechatPending: '二维码待替换',
    resumeLabel: '简历',
    resumeCta: '下载简历'
  },
  footer: { slogan: '一起创造点了不起的东西。' },
```

`CONTENT_EN` 中 `gallery: { ... },` 后追加：

```js
  contact: {
    eyebrow: 'CONTACT',
    title: 'Contact Me',
    emailLabel: 'Email',
    wechatLabel: 'WeChat',
    wechatPending: 'QR code coming soon',
    resumeLabel: 'Resume',
    resumeCta: 'Download Resume'
  },
  footer: { slogan: "Let's Build Something Amazing Together." },
```

- [ ] **Step 6: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
test -f "assets/resume/陈慧莹_数据分析简历.pdf" && echo "resume file OK"
grep -q 'mailto:chenhuiying567@163.com' index.html && echo "email link OK"
grep -qi '电话\|phone' index.html && echo "FOUND PHONE (should not print)" || echo "no phone number OK"
grep -qi 'github\|linkedin' index.html && echo "FOUND SOCIAL (should not print)" || echo "no github/linkedin OK"
```

Expected：`i18n.js OK`；`resume file OK`；`email link OK`；`no phone number OK`；`no github/linkedin OK`（后两条刻意反向检查，确认全站没有意外泄露电话号码或不存在的社交链接）。

- [ ] **Step 7: 视觉检查点**

```bash
open index.html
sleep 2
screencapture -x /tmp/portfolio-task9-contact.png
```

用 Read 工具查看截图（滚动到页面最底部），确认：三张联系方式卡片（邮箱/微信占位/下载简历）横向排列，微信卡片是明显的虚线占位框而非仿真二维码图案，页脚居中显示渐变标语。

- [ ] **Step 8: Commit**

```bash
git add index.html css/style.css js/i18n.js assets/resume/ assets/images/.gitkeep
git commit -m "feat: Contact 区块、页脚与简历下载文件"
```

---

## Task 10: 全站响应式收尾、reduced-motion 复核与最终人工验收

**Files:**
- Modify: `css/style.css`（补充遗漏的窄屏断点，如有）
- 无新增文件

**Interfaces:**
- Consumes：前 9 个任务产出的全部文件
- Produces：无（本任务是收尾验收，不产出新接口）

- [ ] **Step 1: 全文件语法复查**

```bash
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && echo "ALL JS OK"
```

Expected：`ALL JS OK`。

- [ ] **Step 2: 结构完整性复查**

```bash
grep -c 'data-reveal' index.html
grep -c 'data-i18n-key' index.html
grep -o '<section id="[a-z]*"' index.html
```

Expected：`data-reveal` 出现次数为 `38`（Hero 2 处 + About 7 处 + Skills 7 处 + Experience 3 处 + Projects 4 处 + Achievements 4 处 + Gallery 8 处 + Contact 3 处，每处都各自独占一行，`grep -c` 按行计数与按次计数在这里结果一致）；`data-i18n-key` 出现次数 ≥ 60（贯穿导航、Hero、About、Experience 各公司三条要点、Projects 四张卡片等，精确值不重要，只需确认远大于 0 且不是集中在某一个区块）；`grep -o` 那行应输出 8 个 `<section id="...">` 片段，分别对应 hero/about/skills/experience/projects/achievements/gallery/contact。

- [ ] **Step 3: 深色模式截图检查**

```bash
open index.html
sleep 2
osascript -e 'tell application "System Events" to keystroke "j" using {command down}' 2>/dev/null || true
screencapture -x /tmp/portfolio-task10-light.png
```

用 Read 工具查看 `/tmp/portfolio-task10-light.png`，确认浅色默认模式下 Hero 区域清晰可读、无色块错位、无文字对比度过低的问题。这一步只做浅色默认态的最终视觉确认；深色模式切换、双语切换、移动端窄屏这三项属于强交互/强状态操作，静态截图无法完整覆盖，需要在下一步由用户在真实浏览器里手动完成。

- [ ] **Step 4: 人工验收清单（需要你本人在浏览器里完成，无法由自动化步骤代劳）**

请双击打开 `index.html`（或运行 `open index.html`），按设计文档中的验证清单逐项确认：

1. 无控制台报错（右键页面→检查→Console 面板看一眼）
2. 点击右上角圆按钮，深浅色切换正常、刷新页面后保持上次选择的模式
3. 点击 EN/中 按钮，全站文案正确切换为对应语言、专业术语（Python/SQL 等）保持不译、刷新后保持上次选择
4. 缩小浏览器窗口宽度（或用开发者工具的设备模拟），确认桌面宽屏/平板/手机三种宽度下没有横向滚动条、没有元素重叠
5. 从 Hero 滚动到 Contact，确认每个区块进入视口时有淡入动效、Skills 雷达图与环形进度条正确画出、Achievements 数字从 0 滚动到目标值
6. 系统偏好设置里开启"减少动态效果"（macOS: 系统设置 → 辅助功能 → 显示 → 减弱动态效果），刷新页面确认动效基本消失但内容仍完整可读
7. 点击"下载简历"按钮，确认下载的是正确的 PDF 文件且能正常打开

确认完成后告诉我结果；如果发现任何一项不符合预期，说明具体是哪一步、看到了什么，我再回来修。

- [ ] **Step 5: Commit（仅当 Step 1–3 期间有实际修改时才提交；若无修改可跳过本步）**

```bash
git add -A
git status
```

若 `git status` 显示有变更，执行：

```bash
git commit -m "chore: 全站响应式与 reduced-motion 收尾复核"
```

若无变更，本任务到 Step 4 的人工确认为止即可，不需要空提交。
