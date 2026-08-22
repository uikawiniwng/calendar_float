# Project Structure

本文件只描述当前仓库结构与模块边界。产品定位与玩家价值见 `README.md`。

## 当前产品边界

Calendar Float 是**时间可视化与提醒层**：

- 读取角色卡的世界时间
- 读取固定世界日程与动态时间事项
- 统一解析并渲染 Calendar UI
- 在预定时间到达时提供 reminder

它不拥有任务进度、新闻内容、世界事件状态、隐藏剧情策划或回忆数据库。

## 根目录

- `README.md`：面向玩家与角色卡作者的产品说明
- `structure.md`：当前文件，维护者快速定位入口
- `AGENTS.md`：Agent 修改本仓库前必须遵守的协作规则入口
- `package.json`：构建、格式化、lint、同步命令与依赖
- `webpack.config.ts`：Tavern Helper 浏览器脚本打包配置
- `tsconfig.json`：TypeScript 配置
- `tavern_sync.mjs`：酒馆同步与开发辅助
- `节庆_索引.latest.yaml`：固定事件索引参考样本

## 主要目录

- `src/calendar-float/`：Calendar Float 主脚本源码，见 `src/calendar-float/structure.md`
- `dist/calendar-float/index.js`：打包产物
- `docs/superpowers/specs/`：仍有参考价值的专项设计说明；过时设计应直接更新或删除，不继续堆叠历史版本
- `checks/calendar-float/`：手写 smoke / regression checks
- `@types/`：Tavern Helper、SillyTavern、MVU 等运行时全局接口类型
- `util/`：共享工具函数
- `svg/`：固定事件分组可用的 SVG 图标
- `.cursor/rules/`：项目协作与运行环境规则来源

## 核心数据源

### 当前世界时间

由 profile 配置 MVU/stat_data 路径。任何日期判断必须基于世界时间；解析失败时不得回退现实电脑日期。

### 固定事项

`[fixed_event_index]` 是创作者随角色卡分发的固定时间资料源，适合课程、节庆、纪念日、比赛、固定周期活动和相关正文资料。

### 动态事项

新结构统一写入：

```text
stat_data.事件.月历.[事件ID]
```

`临时/重复` bucket 只保留旧资料读取兼容，不再是 persistence semantics。

## 常用修改入口

- 修改主 UI：`src/calendar-float/widget/`
- 修改固定事件索引编辑器：`src/calendar-float/fixed-event-index-editor/`
- 修改 profile / 世界时间路径 / 纪元解析：`src/calendar-float/profile/`
- 修改世界书 runtime 读取：`src/calendar-float/runtime-worldbook/`
- 修改 dataset 组装：`src/calendar-float/runtime-dataset/`
- 修改动态事项持久化与兼容迁移：`src/calendar-float/storage/`、`event-normalizer.ts`
- 修改到时提醒判定：`src/calendar-float/runtime-trigger-evaluator/`
- 修改 LLM-facing 月历变量规则：`src/calendar-float/mvu_rules/` 与 `src/calendar-float/worldbook-manager/content.ts`
- 修改启动与 context lifecycle：`src/calendar-float/index.ts`、`runtime-context.ts`

## 重构原则

- Calendar dataset 只表达时间事项，不复制其他系统的业务状态
- 固定事项优先留在 `[fixed_event_index]`，不要无意义复制进 MVU
- 动态事项保持薄结构；新功能优先判断是否真的属于“显示时间 / 判断时间 / 提醒时间”
- UI 可以为渲染方便建立内部 view model，但不要把内部分类反向变成 persistence hierarchy
- 旧 `可见性`、`类型`、`完成后`、`重要度`、回忆与归档行为只作为迁移期 legacy surface，不能继续扩张成产品能力
- 通用脚本主体不能硬编码《命定之诗》的节庆、地点或命名风格
- profile 负责角色卡差异，固定事件索引负责可分发的世界 Calendar 配置

## Check 文件规则

- `src/` 只放运行时代码、类型和模块资源
- `.check.ts` 统一放在 `checks/calendar-float/`
- 新增 check 时保留目标模块相对路径
- check 可以 import `src/`，`src/` 不得 import `checks/`

## 基础检查

```powershell
git diff --check
pnpm run build:dev
```
