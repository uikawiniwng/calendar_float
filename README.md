# 月历悬浮球（Calendar Float）

一个面向 **SillyTavern / 酒馆助手** 的月历悬浮组件项目。

它把“世界时间”“节庆资料”“读物资料”和“玩家自定义日程”整合成一个可直接在酒馆界面中使用的悬浮月历，并支持：

- 月历视图与当月事件总览
- 临时 / 重复事件的新增、编辑、删除与归档
- 节庆提醒与进行中事件高亮
- 关联读物展示
- 托管 worldbook backend 条目的安装、重装与卸载
- GitHub Actions 自动构建与模板同步

> 当前仓库基于酒馆助手前端/脚本模板组织，但核心内容已经聚焦到 `calendar-float` 这个功能模块。

---

## 功能特性

### 1. 悬浮月历 UI

主入口位于 `src/calendar-float/index.ts`，初始化时会：

- 检查并确保所需的托管 worldbook 条目存在
- 启动悬浮球与面板 UI
- 在全局暴露手动安装 / 卸载 backend 条目的调试方法

实际交互界面由 `src/calendar-float/widget.ts` 驱动，包含：

- 可开合的悬浮球
- 月历网格视图
- 当月日程列表
- 单日详情面板
- 新增 / 编辑事件表单
- 亮色 / 暗色主题切换
- 桌面端拖拽定位与移动端侧栏适配

### 2. 官方节庆与读物索引

项目把结构化数据与正文内容拆开管理：

- 节庆 / 读物元数据：`calendar/data/official/index.yaml`
- 节庆正文：`calendar/content/events/`
- 读物正文：`calendar/content/books/`

构建前会执行同步脚本，把 YAML 索引整理为前端可直接消费的内容映射，供组件读取。

### 3. 托管 worldbook backend 条目

项目会为月历功能生成并维护一组 backend worldbook 条目，用于：

- 注入节庆正文
- 注入读物正文
- 注入活动提醒
- 注入变量展示内容
- 注入 EJS 控制器内容
- 维护变量更新规则

相关内容主要集中在：

- `src/calendar-float/managed-worldbook.ts`
- `src/calendar-float/managed-worldbook-content.ts`
- `calendar/worldbook/entries/`

### 4. 玩家事件管理

除了官方节庆，项目还支持用户维护自己的日历事件：

- 临时事件
- 重复事件（每天 / 每周 / 每月 / 每年 / 工作日 / 节假日）
- 已完成事件归档
- 归档恢复与彻底删除

这些逻辑依赖 MVU 变量与本地归档存储协同工作。

---

## 适用场景

这个项目适合用于：

- 角色卡 / 世界书拥有明确时间线的长期跑团或剧情档
- 需要把“世界内节庆活动”自动提示给 LLM 的设定集
- 希望给 SillyTavern 添加一个更直观时间管理界面的脚本项目
- 需要在 GitHub 上持续发布可自动更新脚本资源的仓库

---

## 项目结构

```text
.
├─ src/
│  └─ calendar-float/              # 月历悬浮球核心源码
├─ calendar/
│  ├─ content/
│  │  ├─ events/                   # 节庆正文
│  │  └─ books/                    # 读物正文
│  ├─ data/official/               # 官方索引与同步脚本
│  └─ worldbook/entries/           # worldbook backend 相关条目模板
├─ dist/                           # 构建产物
├─ .github/workflows/              # 自动构建、依赖更新、模板同步
├─ tavern_sync.yaml                # 酒馆资源打包配置
└─ webpack.config.ts               # 多入口构建配置
```

---

## 环境要求

建议环境：

- Node.js 22+
- pnpm 10+
- Windows / Linux / macOS 任一可运行 Node.js 的环境
- 已安装并可使用 SillyTavern / 酒馆助手

> GitHub Actions 中目前同时使用了 Node.js 22 与 24；本地开发建议优先使用较新的 LTS 或与仓库 CI 接近的版本。

---

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地开发监听

```bash
pnpm watch
```

这个命令会自动执行：

- 同步官方索引
- 启动 webpack watch
- 在监听模式下推送 iframe / 脚本更新事件
- 联动 `tavern_sync` 的 watch 流程

### 3. 生产构建

```bash
pnpm build
```

构建前会先执行：

```bash
pnpm calendar:sync
```

用于同步 `calendar/data/official/index.yaml` 对应的生成内容。

### 4. 代码格式化与检查

```bash
pnpm format
pnpm lint
```

---

## 可用脚本

`package.json` 中定义的常用脚本如下：

| 命令                 | 说明                                       |
| -------------------- | ------------------------------------------ |
| `pnpm calendar:sync` | 同步官方节庆 / 读物索引生成文件            |
| `pnpm build:dev`     | 开发模式构建                               |
| `pnpm build`         | 生产模式构建                               |
| `pnpm watch`         | 本地监听开发                               |
| `pnpm format`        | 格式化 `src/` 下常见前端文件               |
| `pnpm lint`          | 执行 ESLint 检查                           |
| `pnpm lint:fix`      | 自动修复部分 ESLint 问题                   |
| `pnpm dump`          | 扫描并导出 schema 文件                     |
| `pnpm sync`          | 调用 `tavern_sync.mjs` 进行资源打包 / 同步 |

---

## 数据与内容维护

### 维护节庆与读物索引

编辑以下文件：

- `calendar/data/official/index.yaml`
- `calendar/content/events/*.txt`
- `calendar/content/books/*.txt`

其中：

- `index.yaml` 维护结构化索引、起止日期、提醒配置、关键词配置
- 正文 `.txt` 文件维护最终注入 worldbook / UI 的展示文本

### 占位内容说明

当前部分节庆和读物正文仍是占位文本，仓库已经保留好对应条目与触发逻辑，后续只需要补正文即可。

---

## 在 SillyTavern / 酒馆助手中的工作方式

该项目的月历系统主要依赖两部分：

### 1. 前端脚本层

负责：

- 渲染悬浮月历 UI
- 读取当前世界时间
- 管理玩家创建的日历事件
- 展示节庆、提醒与关联读物

### 2. worldbook backend 层

负责：

- 将节庆、读物、提醒等内容以条目方式注入主 worldbook
- 依据时间、地点、聊天提及关键词触发对应内容
- 为脚本提供统一的数据与规则载体

这也是为什么项目中既有前端源码，又有 `calendar/worldbook/entries/` 与托管 worldbook 生成逻辑。

---

## GitHub 发布建议

如果你准备把这个项目放到 GitHub 并长期维护，推荐按下面的方式使用。

### 1. 启用 GitHub Actions 权限

进入仓库：

`Settings -> Actions -> General`

建议设置：

- `Workflow permissions` = `Read and write permissions`
- 勾选 `Allow GitHub Actions to create and approve pull requests`

### 2. 主要工作流

仓库内已经提供三个工作流：

#### `.github/workflows/bundle.yaml`

用途：

- 自动执行构建
- 自动提交最新 `dist/` 产物
- 非模板上游仓库中自动打 tag，以提升 jsDelivr 刷新速度

#### `.github/workflows/bump_deps.yaml`

用途：

- 定期更新依赖
- 拉取最新 `@types/` 参考定义
- 更新 `tavern_sync.mjs`

#### `.github/workflows/sync_template.yaml`

用途：

- 与模板上游保持同步
- 在检测到模板更新后自动创建 PR

如果你后续已经大量定制仓库结构，可以视情况保留或移除模板同步流程。

---

## jsDelivr 分发

如果你的仓库公开且包含构建后的 `dist/` 目录，就可以直接通过 jsDelivr 分发脚本产物。

典型形式如下：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/<owner>/<repo>/dist/calendar-float/index.js"></script>
```

如果你依赖 tag 版本缓存刷新，也可以使用：

```text
https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/dist/calendar-float/index.js
```

---

## 开发注意事项

### 1. `dist/` 冲突

这个模板体系倾向于把构建产物一并提交到仓库，因此多人协作或分支切换时，`dist/` 可能频繁产生冲突。

可以执行一次：

```bash
git config --global merge.ours.driver true
```

仓库还配合 `.gitattributes` 处理部分构建产物冲突策略。

### 2. `.vscode/launch.json`

如果你本地在 `launch.json` 中填写了私有酒馆地址，建议按需忽略其变更，避免误提交：

```bash
git update-index --skip-worktree .vscode/launch.json
```

### 3. 示例目录

仓库仍保留了 `示例/` 与 `初始模板/` 目录。这些文件对继续使用模板生态、让 AI 参考项目写法、以及后续扩展其他酒馆资源功能仍有帮助。

如果你只想专注当前月历模块，可以在打包配置中按需裁剪，但不建议在完全确认前直接删除。

---

## 后续可扩展方向

这个项目目前已经具备可用的核心框架，后续可以继续扩展：

- 完善占位节庆 / 读物正文
- 为节庆加入更多阶段信息与剧情钩子
- 增加更多世界地点联动关键词
- 扩展归档策略、可见性策略与提醒等级
- 为月历加入导出 / 导入能力
- 拆分更多可复用 UI 子模块并补充测试

---

## 相关文件入口

- 核心入口：`src/calendar-float/index.ts`
- 主界面逻辑：`src/calendar-float/widget.ts`
- 托管 worldbook 内容生成：`src/calendar-float/managed-worldbook-content.ts`
- 官方节庆 / 读物索引：`calendar/data/official/index.yaml`
- 构建配置：`webpack.config.ts`
- 酒馆资源打包配置：`tavern_sync.yaml`

---

## 许可证

本项目采用 [Aladdin License](LICENSE)。
