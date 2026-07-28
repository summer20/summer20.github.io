# 真实图片补充 Design

> 基础文档：`docs/superpowers/specs/2026-07-27-portfolio-website-design.md`（v1 设计）与 `docs/superpowers/plans/2026-07-27-portfolio-website-implementation.md`（v1 实施计划，已合并到 master）。本文档只描述 v1 之后的增量变更。

**Goal:** 把 Gallery、Hero、Projects、Contact 里的 CSS 占位替换成真实照片/截图，并在 Projects 里新增一个真实课程项目。

**素材来源：** `/Users/huiying.h.chen/Desktop/补充内容/`（用户提供，包含 `精彩瞬间的照片/` 14 张生活照、`陈慧莹的项目/` 6 个项目文件夹）。

## Global Constraints（继承自 v1，本次变更依然适用）

- 纯 HTML/CSS/原生 JS，零第三方依赖，零构建步骤；必须支持 `file://` 直接打开
- 配色仅用 `css/tokens.css` 里的 Electric Ink token
- 图片只用本地文件（`assets/images/`），不引用外部图床
- 所有动效响应 `prefers-reduced-motion: reduce`
- 内容锚定真实资料，不编造未确认数据

## 1. 图片嵌入方式

用 `<img>` 标签 + 有意义的 `alt` 文字，而不是纯 CSS `background-image`——保持与 Task 6 里修复 `aria-hidden` 问题时确立的无障碍取向一致（内容性图片必须能被屏幕阅读器感知）。文字标签通过绝对定位叠加在图片上，图片外层加一层线性渐变遮罩（黑色到透明）以保证文字在任意照片上都可读。

图片处理：所有素材先用系统自带 `sips` 压缩/限宽（最长边 ≤ 1200px）再拷贝进 `assets/images/`，避免仓库体积过大。Hero 头像走单独的抠图流程（见第 3 节）。

## 2. Gallery（8 格真实照片）

现有 8 个 `.gallery-cell--*` 类名与文案保持不变，只替换背景为 `<img>`；`学习日常`（`--study`）改名为`台球`（`--billiards`），因为素材里没有真实的"学习日常"照片，但有台球照片（用户确认的真实爱好）。

| Cell class | 原标签 | 新标签 | 源文件 |
|---|---|---|---|
| `--travel`（宽） | 旅行 | 旅行 | `a785651af119130a82aa4d7cc535a2cd.jpg`（茶园草帽照）|
| `--reading` | 阅读 | 阅读 | `87862568ab79538a3f5d7df21d55131f.jpg`（书本合影）|
| `--swim` | 游泳 | 游泳 | `d405bea7e93d9f4c853bda83486615ab.jpg`（泳池照）|
| `--ukulele` | 尤克里里 | 尤克里里 | `b12096eafea6185a4bf36ef6337079a0.jpg`（弹尤克里里自拍）|
| `--pilates`（宽） | 普拉提 | 普拉提 | `7a2bdc67e23f560ac22198617ea45405.jpg`（镜子自拍）|
| `--award` | 获奖时刻 | 获奖时刻 | `1952742fbe445a67012093671b76f886.jpg`（颁奖典礼合影）|
| `--study` → `--billiards` | 学习日常 | 台球 | `58ece16371dd79d3b59146f1d57d8c78.jpg`（台球照，构图更聚焦、背景更干净，优先于同素材里的 `95084551eed52abb02f15b2081ae24a0.jpg`）|
| `--friends` | 朋友时光 | 朋友时光 | `78f6e452af825919b74c3632a8760589.jpg`（草坪野餐拼图）|

`js/i18n.js` 的 `gallery.study` key 改名为 `gallery.billiards`（中文"台球"/英文"Billiards"），`index.html` 对应 `data-i18n-key` 同步改名。

## 3. Hero 头像

用 `2f70024ba57e8612445e5bc2ae783399.jpg`（白衬衣蓝背景自拍）通过 macOS Vision 框架的 `VNGenerateForegroundInstanceMaskRequest` 做人像抠图，生成透明背景 PNG，替换 `.hero-avatar` 现有的纯色渐变圆圈。抠图脚本为一次性素材处理脚本（不进仓库，只有产物 PNG 进仓库），因为项目零构建约束只针对网站运行时，不针对图片素材的一次性准备工作。保留 `.hero-card` 现有的玻璃卡片背景与 `box-shadow`，图片本身加 `filter: drop-shadow(...)` 提升立体感。

## 4. Projects 板块

### 4.1 第 4 张卡片（个人展示网页/简历投递辅助工具）
用 `e413d18c78e5d8a8d9f6f87c109f67e3.png`（MyOffer 网页截图）替换 `.project-thumb--pending` 的虚线占位（`<img>` + `alt`），移除"项目截图待补充"文案与相关 i18n key。

### 4.2 新增第 5 张卡片（学生考勤管理系统）
内容来自 `陈慧莹的项目/项目一考勤系统/大数据_..._陈慧莹_..._陈思诺_..._郑子美.doc`（团队课程报告，已读取原文，内容真实非编造）：

- Badge（中/英）: `大数据课程项目` / `Big Data Course Project`
- Title: `学生考勤管理系统` / `Student Attendance Management System`
- Desc（中）: `基于 MySQL + Python(Tkinter) 搭建的学生考勤管理平台，实现学生/班级/考勤信息增删改查，并提供班级出勤率对比、考勤类型占比、个人考勤趋势等多维度可视化分析`
- Desc（英）: `Built a MySQL + Python (Tkinter) attendance management platform with full CRUD for students/classes/attendance records, plus multi-dimensional analytics — class attendance-rate comparisons, attendance-type breakdowns, and individual student trends`
- Metric（中）: `覆盖 10 个班级、200 名学生、600+ 条考勤记录（模拟数据集）`
- Metric（英）: `Covers 10 classes, 200 students, 600+ attendance records (simulated dataset)`
- 工具标签: `MySQL` `Python` `Tkinter` `Matplotlib`（不译）
- 缩略图：无真实截图，沿用前 3 张已有的 CSS 渐变纹理写法（第 4 种配色/纹理组合，复用 `--color-accent-*` token，不新增字面量颜色）

`.projects-grid` 从 4 卡片变成 5 卡片，网格布局需要重新检查（当前 `repeat(2, 1fr)` 两列布局下 5 张会产生末尾单卡占一整行；这是可接受的默认网格行为，不需要特殊处理）。

## 5. Contact 板块

移除微信占位卡片（`.contact-card--wechat` 及其 `.wechat-qr-placeholder`），`.contact-grid` 从 `repeat(3, 1fr)` 改为 `repeat(2, 1fr)`，只保留邮箱卡片和简历下载卡片。`js/i18n.js` 里 `contact.wechatLabel`/`contact.wechatPending` key 一并移除。

## 6. 验证

- 全部 JS 文件 `node --check` 通过
- `grep` 确认 `wechat` 字样从 index.html/i18n.js 中完全移除
- `grep` 确认新增的 5 张项目卡片、5 项 Gallery 真实图片路径、Hero 头像图片路径都指向 `assets/images/` 下实际存在的文件
- 用无头 Chrome 截图分别检查 Gallery、Projects（5 卡片）、Hero、Contact（2 列）四处改动
- 深浅色模式下遮罩文字对比度目视检查（遮罩渐变需要在深色模式下也保证可读，复用同一套 CSS 渐变，不随主题变化——因为遮罩是黑到透明的固定渐变，用于压暗照片底部而非跟随主题色，这点点与主题 token 无关，不违反"颜色只用 var()"的约束，因为遮罩渐变本身用的是 `rgba(0,0,0,...)` 黑色而非某个具体的强调色，这是行业通用的图文叠加做法）
