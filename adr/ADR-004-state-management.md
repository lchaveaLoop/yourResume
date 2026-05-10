# ADR-004: 前端状态管理方案

## Status
Accepted

## Context
yourResume 前端需要管理以下状态：
- 简历原始数据（JSON）
- 用户编辑后的简历数据
- 当前选中的模板风格
- 文件上传状态（loading / success / error）
- PDF 导出状态

这些状态需要在多个组件之间共享（上传组件 → 解析结果 → 预览组件 → 编辑组件 → PDF 导出组件）。

## Decision

### 主方案：Pinia（Vue 3 官方推荐）

```
store/resume.ts 结构：
- state: { rawData, editedData, template, uploadStatus, ... }
- actions: setResume(), updateField(), setTemplate(), ...
- getters: formattedEducation, formattedExperience, ...
```

**选型理由**:
- Vue 3 官方推荐，与 Composition API 深度整合
- 比 Vuex 轻量，TypeScript 支持更好（自动补全类型）
- 学习成本低，API 直观

### 备选：Reactivity API（Vue 3 响应式直接共享）

```
在 utils/store.ts 中 export 一个 reactive() 实例
组件中 import { resumeStore } from '@/utils/store'
```

- 优点：比 Pinia 更轻量，无需额外依赖
- 缺点：缺少 Pinia 的 DevTools 支持和严格的状态管理约束
- **备选**: 可作为 MVP 极简阶段的过渡方案

---

## Consequences

### Positive
- Pinia 与 Vue 3 深度整合，响应式数据天然跨组件共享
- DevTools 支持好，便于调试状态变更
- TypeScript 友好，store 类型自动推导
- 持久化插件（pinia-plugin-persistedstate）可轻松支持草稿保存

### Negative
- 引入额外状态管理层，增加理解成本（但很低）
- 对于简单页面可能过度设计

### Neutral
- 状态管理方案不影响 UI 渲染性能
- 未来如果引入 AI 功能，状态复杂度上升时 Pinia 可扩展

---

## Alternatives Considered

### 方案 B：Vuex
- Vuex 是 Vue 2 时代的主流方案，但 Vue 3 已不再推荐
- API 较冗长，需要 mutation/action 分层
- **未选**: Pinia 是 Vue 官方推荐的进化方案

### 方案 C：React Hooks 风格（provide/inject）
- 利用 Vue 3 provide/inject + composition API 共享状态
- 优点：无需额外依赖
- 缺点：状态流不如 Pinia 清晰，DevTools 支持弱
- **未选**: 调试成本高，团队协作不友好

### 方案 D：Redux 思想（nanostores）
- 跨框架状态管理库
- 优点：可以同时给 React/Vue 使用
- 缺点：对本项目来说过于通用，Vue 场景下不如 Pinia 原生
- **未选**: 增加不必要抽象
