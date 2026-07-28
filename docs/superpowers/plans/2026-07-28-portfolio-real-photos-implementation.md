# 真实图片补充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Gallery、Hero、Projects、Contact 里的 CSS 占位替换成真实照片/截图，Gallery"学习日常"格改名"台球"，Projects 新增一张真实课程项目卡片，Contact 移除微信占位。

**Architecture:** 在现有 index.html/css/style.css/js/i18n.js 的既有结构上做增量替换，不引入新文件类型或新机制；图片全部走 `<img>` + `alt` 文字（不用 CSS background-image），素材从用户提供的目录一次性拷贝+压缩进 `assets/images/`。

**Tech Stack:** 沿用 v1（纯 HTML/CSS/原生 JS，零依赖零构建）；素材准备阶段额外用到 macOS 自带的 `sips`（图片缩放）和 `swift` + Vision 框架（人像抠图），这两者只在准备素材时跑一次，不进入网站运行时。

## Global Constraints（继承自 v1 与 2026-07-28 design doc）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 不使用 `fetch()`；不使用 `<script type="module">`
- 配色仅用 `css/tokens.css` 定义的 CSS 变量，新样式不写死新颜色字面量（白色半透明纹理叠层 `rgba(255,255,255,0.12-0.14)` 属于 v1 已经确认接受的例外写法，本计划沿用同一手法，不算新增违例）
- 所有图片只用本地文件（`assets/images/` 下），不引用外部图床
- 所有动效响应 `prefers-reduced-motion: reduce`（本计划不新增动效，沿用现有全局规则即可）
- 内容锚定真实资料：新增的第 5 个项目文案来自用户提供的真实课程报告，不编造数据
- 图片必须用 `<img>` + 有意义的 `alt`，不用纯 CSS background-image（保持无障碍可读）
- 截图验证一律用 headless Chrome，不要用 `open` + `screencapture`（此环境下多 Space 会截错窗口）：
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=<输出路径> --window-size=<W>,<H> "file://<index.html 绝对路径>"
  ```

---

## Task 1: 素材准备（拷贝+压缩真实图片，生成 Hero 抠图头像）

**Files:**
- Create: `assets/images/gallery-travel.jpg`
- Create: `assets/images/gallery-reading.jpg`
- Create: `assets/images/gallery-swim.jpg`
- Create: `assets/images/gallery-ukulele.jpg`
- Create: `assets/images/gallery-pilates.jpg`
- Create: `assets/images/gallery-award.jpg`
- Create: `assets/images/gallery-billiards.jpg`
- Create: `assets/images/gallery-friends.jpg`
- Create: `assets/images/hero-avatar.png`
- Create: `assets/images/project-myoffer.png`

**Interfaces:**
- Consumes：无（本任务是素材准备，独立于后续任务）
- Produces：以上 10 个文件路径，供 Task 2/3/4 的 HTML `<img src="...">` 直接引用

- [ ] **Step 1: 拷贝并压缩 8 张 Gallery 照片**

源目录固定为 `/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片/`，全部用 `sips -Z 1200`（最长边不超过 1200px，只会缩小不会放大，本任务涉及的所有源图最长边都 > 1200px）：

```bash
cd /Users/huiying.h.chen/portfolio
SRC="/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片"
cp "$SRC/a785651af119130a82aa4d7cc535a2cd.jpg" assets/images/gallery-travel.jpg
cp "$SRC/87862568ab79538a3f5d7df21d55131f.jpg" assets/images/gallery-reading.jpg
cp "$SRC/d405bea7e93d9f4c853bda83486615ab.jpg" assets/images/gallery-swim.jpg
cp "$SRC/b12096eafea6185a4bf36ef6337079a0.jpg" assets/images/gallery-ukulele.jpg
cp "$SRC/7a2bdc67e23f560ac22198617ea45405.jpg" assets/images/gallery-pilates.jpg
cp "$SRC/1952742fbe445a67012093671b76f886.jpg" assets/images/gallery-award.jpg
cp "$SRC/58ece16371dd79d3b59146f1d57d8c78.jpg" assets/images/gallery-billiards.jpg
cp "$SRC/78f6e452af825919b74c3632a8760589.jpg" assets/images/gallery-friends.jpg
sips -Z 1200 assets/images/gallery-travel.jpg assets/images/gallery-reading.jpg assets/images/gallery-swim.jpg assets/images/gallery-ukulele.jpg assets/images/gallery-pilates.jpg assets/images/gallery-award.jpg assets/images/gallery-billiards.jpg assets/images/gallery-friends.jpg
```

注意：这是 `cp`（拷贝），不是 `mv`（移动）——`/Users/huiying.h.chen/Desktop/补充内容/` 下的原始文件必须保持原样不动。

- [ ] **Step 2: 拷贝并压缩 Projects 第 4 张的真实截图**

```bash
cp "/Users/huiying.h.chen/Desktop/补充内容/陈慧莹的项目/辅助投递简历网页/e413d18c78e5d8a8d9f6f87c109f67e3.png" assets/images/project-myoffer.png
sips -Z 1400 assets/images/project-myoffer.png
```

- [ ] **Step 3: 生成 Hero 头像抠图 PNG**

用 macOS Vision 框架做人像抠图（已验证可用的脚本内容如下）。先把脚本内容写到项目外的临时位置（不进 git 仓库，这是一次性素材处理工具，不是网站运行时代码）：

```bash
mkdir -p /tmp/portfolio-asset-prep
cat > /tmp/portfolio-asset-prep/cutout.swift << 'SWIFT_EOF'
import Foundation
import Vision
import CoreImage
import AppKit

guard CommandLine.arguments.count >= 3 else {
    print("usage: cutout <input> <output>")
    exit(1)
}

let inputPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]

guard let inputImage = CIImage(contentsOf: URL(fileURLWithPath: inputPath)) else {
    print("failed to load image")
    exit(1)
}

let handler = VNImageRequestHandler(ciImage: inputImage, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()

do {
    try handler.perform([request])
} catch {
    print("vision request failed: \(error)")
    exit(1)
}

guard let result = request.results?.first else {
    print("no foreground instance found")
    exit(1)
}

let allInstances = result.allInstances

do {
    let maskPixelBuffer = try result.generateScaledMaskForImage(forInstances: allInstances, from: handler)
    let maskImage = CIImage(cvPixelBuffer: maskPixelBuffer)

    let context = CIContext()
    let filter = CIFilter(name: "CIBlendWithMask")!
    filter.setValue(inputImage, forKey: kCIInputImageKey)
    filter.setValue(CIImage(color: .clear).cropped(to: inputImage.extent), forKey: kCIInputBackgroundImageKey)
    filter.setValue(maskImage, forKey: kCIInputMaskImageKey)
    guard let maskedImage = filter.outputImage else {
        print("compositing failed")
        exit(1)
    }

    guard let cgImage = context.createCGImage(maskedImage, from: inputImage.extent) else {
        print("cgimage creation failed")
        exit(1)
    }

    let rep = NSBitmapImageRep(cgImage: cgImage)
    guard let pngData = rep.representation(using: .png, properties: [:]) else {
        print("png encoding failed")
        exit(1)
    }

    try pngData.write(to: URL(fileURLWithPath: outputPath))
    print("wrote \(outputPath)")
} catch {
    print("mask generation failed: \(error)")
    exit(1)
}
SWIFT_EOF
swift /tmp/portfolio-asset-prep/cutout.swift "/Users/huiying.h.chen/Desktop/补充内容/精彩瞬间的照片/2f70024ba57e8612445e5bc2ae783399.jpg" /tmp/portfolio-asset-prep/hero-avatar-raw.png
```

Expected：输出 `wrote /tmp/portfolio-asset-prep/hero-avatar-raw.png`。

- [ ] **Step 4: 压缩抠图结果并拷贝进项目**

```bash
sips -Z 800 /tmp/portfolio-asset-prep/hero-avatar-raw.png --out assets/images/hero-avatar.png
```

- [ ] **Step 5: 验证**

```bash
ls -la assets/images/
sips -g pixelWidth -g pixelHeight assets/images/hero-avatar.png
file assets/images/hero-avatar.png
```

Expected：`assets/images/` 下能看到全部 10 个新文件；`hero-avatar.png` 的 `file` 命令输出里包含 `RGBA`（确认是带透明通道的 PNG，不是拍平成白底的普通图）。

- [ ] **Step 6: 用 Read 工具目视确认抠图效果**

用 Read 工具查看 `assets/images/hero-avatar.png`，确认：人像轮廓完整（不缺头发/肩膀），背景透明（在浅色查看器背景下应该看不到原来的蓝色摄影棚背景色块）。如果抠图有明显瑕疵（比如缺了一大块肩膀），重新跑 Step 3（Vision 的分割结果每次运行应该是确定性的，如果有问题大概率是源图问题而不是随机性问题，不需要反复重试）。

- [ ] **Step 7: Commit**

```bash
git add assets/images/
git commit -m "chore: 新增 Gallery/Hero/Projects 真实图片素材"
```

---

## Task 2: Gallery 真实照片（含"学习日常"→"台球"改名）

**Files:**
- Modify: `index.html`（Gallery 8 个 `.gallery-cell` div）
- Modify: `css/style.css`（Gallery 样式：移除渐变背景规则，新增 `<img>` 覆盖层样式）
- Modify: `js/i18n.js`（`gallery.study` key 改名为 `gallery.billiards`，中英文都改）

**Interfaces:**
- Consumes：Task 1 产出的 `assets/images/gallery-*.jpg`
- Produces：无新增全局约定，`.gallery-cell` 结构变化（多了一层 `<img>` 和一层 `::after` 遮罩）仅影响本区块

- [ ] **Step 1: 修改 `index.html`，Gallery 8 格改用真实图片**

将 `index.html` 里的（第 296-303 行）：

```html
          <div class="gallery-cell gallery-cell--travel gallery-cell--wide" data-reveal><span data-i18n-key="gallery.travel">旅行</span></div>
          <div class="gallery-cell gallery-cell--reading" data-reveal><span data-i18n-key="gallery.reading">阅读</span></div>
          <div class="gallery-cell gallery-cell--swim" data-reveal><span data-i18n-key="gallery.swim">游泳</span></div>
          <div class="gallery-cell gallery-cell--ukulele" data-reveal><span data-i18n-key="gallery.ukulele">尤克里里</span></div>
          <div class="gallery-cell gallery-cell--pilates gallery-cell--wide" data-reveal><span data-i18n-key="gallery.pilates">普拉提</span></div>
          <div class="gallery-cell gallery-cell--award" data-reveal><span data-i18n-key="gallery.award">获奖时刻</span></div>
          <div class="gallery-cell gallery-cell--study" data-reveal><span data-i18n-key="gallery.study">学习日常</span></div>
          <div class="gallery-cell gallery-cell--friends" data-reveal><span data-i18n-key="gallery.friends">朋友时光</span></div>
```

替换为：

```html
          <div class="gallery-cell gallery-cell--travel gallery-cell--wide" data-reveal>
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
          <div class="gallery-cell gallery-cell--pilates gallery-cell--wide" data-reveal>
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
```

- [ ] **Step 2: 修改 `css/style.css`，Gallery 样式改为图片+遮罩**

将（第 451-467 行）：

```css
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
.gallery-cell--pilates { background: linear-gradient(135deg, var(--color-accent-violet), var(--color-accent-cyan)); }
.gallery-cell--award { background: linear-gradient(135deg, #c5661f, #7c5cff); }
.gallery-cell--study { background: linear-gradient(135deg, #18c8d9, #5b3df0); }
.gallery-cell--friends { background: linear-gradient(135deg, #7c5cff, #c5661f); }
```

替换为：

```css
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
.gallery-cell--wide { grid-column: span 2; }
```

（原来 8 个 `--travel`/`--reading`/... 渐变背景色规则整段删除，因为背景现在由 `<img>` 提供；`gallery-cell--billiards` 不需要新增背景规则，同理。）

- [ ] **Step 3: 修改 `js/i18n.js`，`gallery.study` 改名为 `gallery.billiards`**

`CONTENT_ZH.gallery`（第 97-102 行）从：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', study: '学习日常', friends: '朋友时光'
  },
```

改为：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: '生活',
    travel: '旅行', reading: '阅读', swim: '游泳', ukulele: '尤克里里',
    pilates: '普拉提', award: '获奖时刻', billiards: '台球', friends: '朋友时光'
  },
```

`CONTENT_EN.gallery`（第 211-216 行）从：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: 'Gallery',
    travel: 'Travel', reading: 'Reading', swim: 'Swimming', ukulele: 'Ukulele',
    pilates: 'Pilates', award: 'Award Moments', study: 'Study Life', friends: 'With Friends'
  },
```

改为：

```js
  gallery: {
    eyebrow: 'GALLERY',
    title: 'Gallery',
    travel: 'Travel', reading: 'Reading', swim: 'Swimming', ukulele: 'Ukulele',
    pilates: 'Pilates', award: 'Award Moments', billiards: 'Billiards', friends: 'With Friends'
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'gallery-cell-img' index.html
grep -q 'billiards' js/i18n.js && echo "billiards key OK"
grep -q '"gallery\.study"' index.html && echo "STALE KEY FOUND (bug)" || echo "no stale study key OK"
for f in gallery-travel gallery-reading gallery-swim gallery-ukulele gallery-pilates gallery-award gallery-billiards gallery-friends; do
  test -f "assets/images/$f.jpg" && echo "$f.jpg exists" || echo "MISSING $f.jpg"
done
```

Expected：`i18n.js OK`；`grep -c` 输出 `8`；`billiards key OK`；`no stale study key OK`；8 行 `exists`，没有任何 `MISSING`。

- [ ] **Step 5: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-photos-task2-gallery.png --window-size=1440,7200 "file:///Users/huiying.h.chen/portfolio/index.html"
```

用 Read 工具查看截图（滚动到 Gallery 区域附近），确认：8 个格子都显示真实照片而不是纯色渐变，每张照片底部有半透明黑色遮罩，遮罩上的白色文字清晰可读（旅行/阅读/游泳/尤克里里/普拉提/获奖时刻/台球/朋友时光），旅行和普拉提两格仍然是宽格（跨 2 列）。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Gallery 区块改用真实照片，学习日常格改名为台球"
```

---

## Task 3: Hero 头像抠图效果

**Files:**
- Modify: `index.html`（`.hero-avatar` 从空 div 改为 img）
- Modify: `css/style.css`（`.hero-avatar` 样式）

**Interfaces:**
- Consumes：Task 1 产出的 `assets/images/hero-avatar.png`
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`**

将（第 57 行）：

```html
            <div class="hero-avatar" aria-hidden="true"></div>
```

替换为：

```html
            <img class="hero-avatar" src="assets/images/hero-avatar.png" alt="陈慧莹的证件照" loading="lazy">
```

- [ ] **Step 2: 修改 `css/style.css`**

将（第 225-230 行）：

```css
.hero-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--gradient-primary);
}
```

替换为：

```css
.hero-avatar {
  height: 240px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(10, 15, 20, 0.28));
}
```

说明：不再用 `border-radius: 50%` 把照片裁成圆形——抠图本身已经是人像轮廓（透明背景），裁成圆形反而会丢失"抠图立体感"这个效果本身的意义；改用 `object-fit: contain` 保持完整轮廓，配合 `drop-shadow` 让人像看起来"浮"在玻璃卡片上，这正是用户要的"立体一点的抠图效果"。

- [ ] **Step 3: 验证**

```bash
grep -q 'hero-avatar.png' index.html && echo "hero avatar img OK"
grep -q 'drop-shadow' css/style.css && echo "drop-shadow OK"
test -f assets/images/hero-avatar.png && echo "asset exists OK"
```

Expected：三行都输出对应 OK。

- [ ] **Step 4: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-photos-task3-hero.png --window-size=1440,900 "file:///Users/huiying.h.chen/portfolio/index.html"
```

用 Read 工具查看截图，确认：Hero 右侧玻璃卡片里显示真实人像照片（不再是紫色渐变圆圈），人像下方能看到投影，四个技能标签（Python/SQL/Power BI/AI Tools）仍然正常悬浮在人像周围。

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: Hero 头像改用真实抠图照片，drop-shadow 增加立体感"
```

---

## Task 4: Projects 第 4 张换真实截图 + 新增第 5 张 + Achievements 数字同步

**Files:**
- Modify: `index.html`（Projects 第 4 张卡片、新增第 5 张卡片、Achievements 的"核心项目"计数）
- Modify: `css/style.css`（移除 `.project-thumb--pending` 相关规则，新增 `.project-thumb--attendance` 规则，`.project-thumb` 基础规则补充 `display`/`width`/`object-fit` 以兼容 `<img>` 用法）
- Modify: `js/i18n.js`（移除 `projects.website.pending` key，新增 `projects.attendance` key）

**Interfaces:**
- Consumes：Task 1 产出的 `assets/images/project-myoffer.png`
- Produces：无新增全局约定

**与 design doc 的一处措辞差异：** design doc 提到新项目要有独立的"工具标签: MySQL Python Tkinter Matplotlib"展示。但现有 Projects 卡片结构里从来没有过独立的标签行（这是 Experience 区块的 `.timeline-tags` 才有的模式）；前 3 张卡片的工具名都是直接写在 `project-desc` 的正文里（比如 automation 卡片写"基于 Python（Pandas、OpenPyXL）"）。为了不引入 Projects 卡片没有过的新 UI 元素，本任务把 Matplotlib 也直接写进 `attendance.desc` 正文（"并用 Matplotlib 提供..."），四个工具名（MySQL/Python/Tkinter/Matplotlib）依然都出现在文案里，只是延续现有卡片的写法，不新增标签行。

**背景说明（为什么要顺带改 Achievements）：** Achievements 区块的"4 个核心项目"这个数字，是根据 Projects 区块当时有 4 张卡片写死的静态数字（`data-target="4"`）。本任务给 Projects 新增第 5 张卡片后，如果不同步这个数字，会出现"网站说 4 个项目，但下面明明摆了 5 张"的自相矛盾——这不是新增需求，是新增第 5 个项目后必须跟着修的一致性问题，跟 v1 最终整分支评审时检查"数字必须和实际卡片数对得上"是同一类问题。

- [ ] **Step 1: 修改 `index.html`，Projects 第 4 张卡片换真实截图**

将（第 253-263 行）：

```html
          <div class="card project-card" data-reveal>
            <!-- 图片待补充：用户确认先留空位，等后续提供真实截图 -->
            <div class="project-thumb project-thumb--pending">
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

替换为（注意这一步同时插入了新增的第 5 张卡片）：

```html
          <div class="card project-card" data-reveal>
            <img class="project-thumb project-thumb--website" src="assets/images/project-myoffer.png" alt="MyOffer 求职进度追踪网页界面截图" loading="lazy">
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.website.badge">AI 实践</p>
              <h3 data-i18n-key="projects.website.title">个人展示网页 / 简历投递辅助工具</h3>
              <p class="project-desc" data-i18n-key="projects.website.desc">利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证</p>
            </div>
          </div>

          <div class="card project-card" data-reveal>
            <div class="project-thumb project-thumb--attendance" aria-hidden="true"></div>
            <div class="project-body">
              <p class="project-badge" data-i18n-key="projects.attendance.badge">大数据课程项目</p>
              <h3 data-i18n-key="projects.attendance.title">学生考勤管理系统</h3>
              <p class="project-desc" data-i18n-key="projects.attendance.desc">基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台，实现学生/班级/考勤信息增删改查，并用 Matplotlib 提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析</p>
              <p class="project-metric" data-i18n-key="projects.attendance.metric">覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 修改 `index.html`，同步 Achievements 的核心项目计数**

将（第 276-279 行）：

```html
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="4">4</span></p>
            <p class="achievement-label" data-i18n-key="achievements.projects">个核心项目</p>
          </div>
```

替换为：

```html
          <div class="card achievement-card" data-reveal>
            <p class="achievement-number"><span class="counter" data-target="5">5</span></p>
            <p class="achievement-label" data-i18n-key="achievements.projects">个核心项目</p>
          </div>
```

- [ ] **Step 3: 修改 `css/style.css`，移除 pending 规则、新增 attendance 规则、兼容 img 用法**

将（第 358-395 行）：

```css
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
```

替换为：

```css
.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.project-card { overflow: hidden; }
.project-thumb { display: block; width: 100%; height: 160px; position: relative; overflow: hidden; object-fit: cover; }
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
.project-thumb--attendance {
  background: linear-gradient(135deg, var(--color-accent-violet), var(--color-accent-cyan) 50%, var(--color-accent-orange));
}
.project-thumb--attendance::after {
  content: ''; position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 22px);
}
.project-body { padding: var(--space-3); }
```

（`.project-thumb` 基础规则新增了 `display: block; width: 100%; object-fit: cover;`——这三条对现有的 div 缩略图完全是无操作的默认值（div 本来就是 block、100% 宽度；`object-fit` 只对 `<img>`/`<video>` 这类可替换元素生效，对 div 无效），只是为了让第 4 张卡片新换上的 `<img class="project-thumb project-thumb--website">` 能正确铺满 160px 高的缩略图区域。`.project-thumb--pending` 和它的 `span` 规则整段删除，因为不再有任何元素使用这个类。）

- [ ] **Step 4: 修改 `js/i18n.js`，移除 pending key、新增 attendance key**

`CONTENT_ZH.projects.website`（第 82-87 行）从：

```js
    website: {
      badge: 'AI 实践',
      title: '个人展示网页 / 简历投递辅助工具',
      desc: '利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证',
      pending: '项目截图待补充'
    }
  },
```

改为（去掉 `pending`，新增 `attendance` 作为 `projects` 对象的新成员）：

```js
    website: {
      badge: 'AI 实践',
      title: '个人展示网页 / 简历投递辅助工具',
      desc: '利用 AI 完成个人展示网页及简历投递辅助工具开发，实现网页快速搭建与功能验证'
    },
    attendance: {
      badge: '大数据课程项目',
      title: '学生考勤管理系统',
      desc: '基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台，实现学生/班级/考勤信息增删改查，并用 Matplotlib 提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析',
      metric: '覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）'
    }
  },
```

`CONTENT_EN.projects.website`（第 196-201 行）从：

```js
    website: {
      badge: 'AI Practice',
      title: 'Personal Site / Resume-Application Assistant Tool',
      desc: 'Built a personal showcase site and a resume-application assistant tool with AI-assisted development, from rapid scaffolding to feature validation',
      pending: 'Screenshot coming soon'
    }
  },
```

改为：

```js
    website: {
      badge: 'AI Practice',
      title: 'Personal Site / Resume-Application Assistant Tool',
      desc: 'Built a personal showcase site and a resume-application assistant tool with AI-assisted development, from rapid scaffolding to feature validation'
    },
    attendance: {
      badge: 'Big Data Course Project',
      title: 'Student Attendance Management System',
      desc: 'Built a MySQL + Python (Tkinter) attendance management platform with full CRUD for students/classes/attendance records, plus Matplotlib-powered analytics — class attendance-rate comparisons, attendance-type breakdowns, and individual student trends',
      metric: 'Covers 10 classes, 200 students, 600+ attendance records (simulated dataset)'
    }
  },
```

- [ ] **Step 5: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -c 'project-card' index.html
grep -q 'projects.attendance.title' index.html && echo "attendance card wired OK"
grep -q "pending:" js/i18n.js && echo "STALE pending KEY FOUND (bug)" || echo "no stale pending key OK"
grep -q 'data-target="5">5<' index.html && echo "achievements count synced OK"
test -f assets/images/project-myoffer.png && echo "project screenshot exists OK"
```

Expected：`i18n.js OK`；`grep -c` 输出 `5`；`attendance card wired OK`；`no stale pending key OK`；`achievements count synced OK`；`project screenshot exists OK`。

- [ ] **Step 6: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-photos-task4-projects.png --window-size=1440,6000 "file:///Users/huiying.h.chen/portfolio/index.html"
```

用 Read 工具查看截图（滚动到 Projects 区域），确认：现在是 5 张卡片（2 列网格，第 5 张单独占一整行是预期效果，不是 bug）；第 4 张显示真实的 MyOffer 网页截图而不是虚线占位；第 5 张（学生考勤管理系统）显示一个新的渐变纹理缩略图（紫→青→橙三色+斜纹），与前 3 张的纹理明显不同。

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: Projects 第4张换真实截图，新增学生考勤管理系统项目卡，同步 Achievements 计数"
```

---

## Task 5: Contact 移除微信占位

**Files:**
- Modify: `index.html`（移除微信卡片）
- Modify: `css/style.css`（`.contact-grid` 3 列改 2 列，移除微信相关规则）
- Modify: `js/i18n.js`（移除 `contact.wechatLabel`/`contact.wechatPending` key）

**Interfaces:**
- Consumes：无
- Produces：无新增全局约定

- [ ] **Step 1: 修改 `index.html`，移除微信卡片**

将（第 311-325 行）：

```html
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
```

替换为：

```html
        <div class="contact-grid">
          <a class="card contact-card" href="mailto:chenhuiying567@163.com" data-reveal>
            <p class="contact-label" data-i18n-key="contact.emailLabel">邮箱</p>
            <p class="contact-value">chenhuiying567@163.com</p>
          </a>
          <a class="card contact-card" href="assets/resume/陈慧莹_数据分析简历.pdf" download data-reveal>
            <p class="contact-label" data-i18n-key="contact.resumeLabel">简历</p>
            <p class="contact-value btn btn-primary" data-i18n-key="contact.resumeCta">下载简历</p>
          </a>
        </div>
```

- [ ] **Step 2: 修改 `css/style.css`**

将（第 476-504 行）：

```css
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
```

替换为：

```css
.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
```

- [ ] **Step 3: 修改 `js/i18n.js`，移除微信相关 key**

`CONTENT_ZH.contact`（第 103-111 行）从：

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
```

改为：

```js
  contact: {
    eyebrow: 'CONTACT',
    title: '联系我',
    emailLabel: '邮箱',
    resumeLabel: '简历',
    resumeCta: '下载简历'
  },
```

`CONTENT_EN.contact`（第 217-225 行）从：

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
```

改为：

```js
  contact: {
    eyebrow: 'CONTACT',
    title: 'Contact Me',
    emailLabel: 'Email',
    resumeLabel: 'Resume',
    resumeCta: 'Download Resume'
  },
```

- [ ] **Step 4: 验证**

```bash
node --check js/i18n.js && echo "i18n.js OK"
grep -qi 'wechat\|微信' index.html js/i18n.js css/style.css && echo "STALE WECHAT REFERENCE FOUND (bug)" || echo "wechat fully removed OK"
grep -c 'contact-card' index.html
```

Expected：`i18n.js OK`；`wechat fully removed OK`；`grep -c` 输出 `2`。

- [ ] **Step 5: 视觉检查点**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-photos-task5-contact.png --window-size=1440,8500 "file:///Users/huiying.h.chen/portfolio/index.html"
```

用 Read 工具查看截图（滚动到页面最底部），确认：只剩两张卡片（邮箱、下载简历），横向并排两列布局，没有中间空缺或布局错位。

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/i18n.js
git commit -m "feat: 移除 Contact 微信占位卡片，联系方式改为两列布局"
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
node --check js/main.js && node --check js/i18n.js && node --check js/visualizations.js && echo "ALL JS OK"
grep -c '<section id=' index.html
grep -o '<img[^>]*src="assets/images/[^"]*"' index.html | wc -l
```

Expected：`ALL JS OK`；`grep -c` 输出 `8`（8 个 section 不变）；`<img>` 引用 `assets/images/` 的数量应为 10（8 张 Gallery + 1 张 Hero 头像 + 1 张 Projects 截图）。

- [ ] **Step 2: 确认所有引用的图片文件真实存在（没有断链）**

```bash
grep -o 'assets/images/[a-zA-Z0-9_.-]*\.\(jpg\|png\)' index.html | sort -u | while read -r p; do
  test -f "$p" && echo "OK: $p" || echo "MISSING: $p"
done
```

Expected：每一行都是 `OK: ...`，没有任何 `MISSING`。

- [ ] **Step 3: i18n key 完整性复查**

```bash
grep -o 'data-i18n-key="[a-zA-Z0-9_.]*"' index.html | sed -E 's/data-i18n-key="(.*)"/\1/' | sort -u > /tmp/portfolio-photos-keys.txt
wc -l < /tmp/portfolio-photos-keys.txt
```

用 Read 工具打开 `js/i18n.js`，对照 `/tmp/portfolio-photos-keys.txt` 里列出的每个 key（比如 `gallery.billiards`、`projects.attendance.title`、`projects.attendance.metric`），确认在 `CONTENT_ZH` 和 `CONTENT_EN` 里都能找到对应字段，且不存在 `contact.wechatLabel`、`gallery.study`、`projects.website.pending` 这些已经删除的旧 key。

- [ ] **Step 4: 深色模式下 Gallery/Projects 遮罩与文字对比度检查**

Gallery 的图片遮罩、Projects 缩略图的渐变纹理都不跟随主题变化（这是设计文档里明确说明的：遮罩用的是纯黑半透明，不是某个具体的强调色 token，本身与深浅色主题无关），所以理论上深浅色模式下这两处视觉不会有差异。用 Read 工具查看 Task 2/Task 4 已经拍过的截图确认这一点即可，不需要重新截图。

- [ ] **Step 5: 视觉总检查点（全站滚动截图）**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot=/tmp/portfolio-photos-final-full.png --window-size=1440,9500 "file:///Users/huiying.h.chen/portfolio/index.html"
```

用 Read 工具通读这张全页截图，从上到下确认：Hero 头像真实照片、About/Skills/Experience 不受影响、Projects 5 张卡片、Achievements 显示 5 个核心项目、Gallery 8 张真实照片、Contact 只剩 2 张卡片、Footer 正常。

- [ ] **Step 6: 人工验收清单（需要用户在真实浏览器里完成）**

请双击打开 `index.html`，确认：

1. 无控制台报错
2. 深浅色切换后 Gallery/Projects/Hero 的真实图片依然正常显示（不会因为主题切换而消失或报 404）
3. 中英文切换后 Gallery"台球"格、Projects 第 5 张卡片文案正确切换
4. 点击 Hero 的"下载简历"按钮，确认简历文件仍能正常下载（本次改动没有碰简历文件路径，但需要确认没有被间接影响）
5. 缩小浏览器宽度，确认 Gallery/Projects/Contact 在窄屏下没有图片拉伸变形或布局错乱

确认完成后告诉我结果；如果发现任何一项不符合预期，说明具体是哪一步、看到了什么，我再回来修。

- [ ] **Step 7: Commit（仅当 Step 1-4 期间有实际修改时才提交；若无修改可跳过）**

```bash
git status --short
```

若有变更：

```bash
git add -A
git commit -m "chore: 真实图片补充收尾复核"
```

若无变更，本任务到 Step 6 的人工确认为止即可。

---
