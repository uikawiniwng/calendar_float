# Calendar Float Source Structure

`src/calendar-float/` 是 Calendar Float 主脚本源码。它是 Tavern Helper 浏览器脚本，不是独立 Web App；`index.ts` 初始化 runtime，最终打包为 `dist/calendar-float/index.js`。

## Runtime 主线

新的产品主线应保持为：

```text
世界时间 + 固定事项 + 动态事项
            ↓
       Calendar Dataset
            ↓
      玩家月历 UI
            ↓
    到时 / 提前提醒 LLM
```

Calendar Float 不拥有任务、新闻、世界事件或剧情状态。模块是否应继续存在，优先按“是否服务于时间读取、时间展示或时间提醒”判断。

## 根文件

- `index.ts`：脚本主入口与 context-scoped lifecycle
- `constants.ts`：共享常量与 MVU 根路径
- `types.ts`：跨模块 Calendar 数据类型；新产品契约保持薄结构，旧事件字段仅供兼容
- `date.ts`：世界日期解析、格式化、范围判断
- `festival-date-range.ts`：固定事项月日范围、跨年和周期 resolver
- `runtime-context.ts`：当前角色 / 聊天 context 与软重启入口
- `host-adapter.ts`：外部宿主页桥接
- `form-service.ts`：玩家新增 / 编辑动态时间事项
- `event-normalizer.ts`：动态事项格式归一化与旧数据迁移
- `runtime-ui-dataset.ts`：widget 获取统一 dataset 的门面
- `runtime-chat-context.ts`：runtime 扫描需要的聊天文本上下文

## 子目录

### `profile/`

角色卡 Calendar 配置：世界时间路径、地点路径、纪元、月份别名与 profile 专属显示规则。

### `runtime-worldbook/`

发现并读取 `[fixed_event_index]` 与相关正文世界书内容，建立一次 operation 使用的 worldbook snapshot。

### `runtime-dataset/`

把固定事项、动态事项与必要的相关资料组装成 UI 使用的 `CalendarDataset`。这里是不同来源汇合的主要边界。

### `runtime-trigger-evaluator/`

判断固定事项是否处于日期窗口、提醒窗口或满足相关 runtime 条件。重构后这里的职责应收敛到“什么时候该显示 / 什么时候该提醒”，不要演化成剧情状态机。

### `storage/`

动态事项、脚本配置与迁移兼容。新的 persistence 是单一：

```text
stat_data.事件.月历.[事件ID]
```

`临时/重复` bucket 只可作为旧数据兼容与内部 view，不得继续作为新 persistence semantics。

### `widget/`

玩家可见的悬浮月历、日期详情、动态事项表单、设置与创作者工具入口。见 `widget/structure.md`。

### `fixed-event-index-editor/`

角色卡作者编辑 `[fixed_event_index]` 的结构化工具。见 `fixed-event-index-editor/structure.md`。

### `worldbook-manager/`

安装、诊断与维护 Calendar Float 使用的世界书基础设施，以及生成 LLM-facing 月历变量说明。

### `calendar-view-model/`

把 dataset 转换成月份格子、日程列表和 UI chip 等纯 view model。

### Legacy / compatibility surface

目前源码仍包含归档、旧可见性与《命定之诗》DLC 专用逻辑。重构期间：

- 不继续给这些 legacy 模块增加新的产品职责
- 新 MVU contract 不再暴露 `类型 / 完成后 / 重要度 / 可见性 / 回忆` 等旧事件管理概念
- 确认 UI 与 migration 不再依赖后，可逐步删除相应代码与 checks
- `dlc_ellia/` 等世界专用能力不得反向污染通用 Calendar core

## 修改路线

- 世界时间 / 日期解析：`date.ts`、`profile/`
- 固定日程来源：`runtime-worldbook/`、`fixed-event-index-editor/`
- 动态事项结构：`types.ts`、`event-normalizer.ts`、`storage/`、`form-service.ts`
- Dataset 合并：`runtime-dataset/`
- 到时提醒：`runtime-trigger-evaluator/` 与 reminder 注入路径
- 玩家 UI：`widget/`、`calendar-view-model/`
- LLM-facing 规则：`mvu_rules/`、`worldbook-manager/content.ts`

## 不要再做的事

- 不要让 Calendar 自行创造未来剧情
- 不要把任务进度、奖励、事件阶段、新闻内容复制进 Calendar
- 不要用现实电脑日期补救无法解析的世界时间
- 不要为了 UI 分类重新建立多层 persistence hierarchy
- 不要把《命定之诗》的地点、节庆或命名硬编码回通用模块
- 不要在 `widget/index.ts` 堆纯数据转换逻辑
- 不要在角色 / 聊天切换时使用 `window.location.reload()`
