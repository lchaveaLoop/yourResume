# ADR-001: 技术栈选择

## Status
Accepted

## Context
yourResume 需要一套完整的前后端技术方案，能够：
1. 解析用户上传的 .docx / .md 简历文件
2. 将解析结果以高颜值网页形式渲染
3. 导出与预览一致的 PDF 文件
4. MVP 优先，渐进增强，不过度工程化

## Decision
**前端**: Vue 3 (Composition API) + TypeScript + Vite + Tailwind CSS + Pinia  
**后端**: Python FastAPI（按需引入，MVP 阶段可纯前端运行）

**选型理由**:

### 前端选型
- **Vue 3**: 生态成熟，学习曲线低，组件化思路清晰，适合快速开发
- **TypeScript**: 简历数据结构清晰，TS 接口可明确约束字段类型，减少运行时错误
- **Vite**: 开发体验好，热更新快，与 Vue 3 官方标配
- **Tailwind CSS**: 快速实现多模板样式切换，不需要维护多套 CSS 文件
- **Pinia**: Vue 3 官方推荐状态管理库，比 Vuex 轻量，TypeScript 支持好

### 后端选型
- **FastAPI**: 轻量、现代化、Python 原生，简历解析核心逻辑用 Python 更自然（python-docx）
- **按需引入**: MVP 阶段可纯前端实现（jszip + markitdown），降低部署复杂度
- 后端仅在 docx 解析复杂度超出前端能力时引入

## Consequences

### Positive
- 前端技术栈主流，学习成本低，易于招募/交接
- Vite + Tailwind 开发效率高，样式迭代快
- Python 后端处理 docx 天然优势，代码共享方便
- 前后端分离，接口清晰，可独立迭代

### Negative
- 引入两套语言栈，前端需了解基本 Python/FastAPI
- PDF 生成依赖前端 html2canvas，复杂布局可能有兼容性问题
- 纯前端方案对 docx 复杂嵌套表格支持有限（但 MVP 简历格式通常不复杂）

### Neutral
- 技术栈不新颖，但足够稳定，踩坑少
- 未来扩展 AI 功能时，Python 后端更容易集成大模型 API

## Alternatives Considered

### 方案 B：Next.js (React) + Node.js
- React 社区更大，但 Vue 对本项目复杂度来说更轻量
- Next.js 的 SSR 功能对简历工具非必需
- **未选**：学习曲线稍高，配置更重

### 方案 C：纯前端（无后端）
- docx 解析依赖 jszip + 手动 XML 解析，复杂度高且脆弱
- **未选**：解析可靠性不足，影响核心体验

### 方案 D：React + Spring Boot (Java)
- Java 生态重，部署麻烦
- **未选**：过重，不符合 MVP 原则
