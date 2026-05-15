# ADR-001: 技术栈选择

## Status
Accepted

## Context

yourResume 需要支持用户上传 `.docx` / `.md` 简历，解析为结构化数据，在线编辑和预览，并导出与预览一致的 PDF。项目当前优先级是隐私、部署简单和核心流程稳定。

## Decision

采用纯前端技术栈：

- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS / scoped CSS
- Pinia
- JSZip
- html2canvas + jsPDF

当前不引入后端服务、爬虫脚本或服务端解析 API。

## Consequences

### Positive

- 用户简历默认不离开浏览器，隐私边界清晰。
- 部署简单，只需要静态前端产物。
- 前端解析、编辑、预览和 PDF 导出在同一数据模型内完成，调试成本低。
- 没有 Python/FastAPI/Scrapy/Playwright 等运行时依赖，环境更轻。

### Negative

- `.docx` 解析依赖前端 OOXML 文本提取，对复杂表格、文本框、图片化内容支持有限。
- AI 润色、分享链接、云端版本管理等能力未来若落地，需要重新设计服务端边界。
- PDF 生成依赖浏览器 canvas，实现质量受浏览器渲染能力影响。

### Neutral

- 纯前端方案适合当前 MVP 和本地隐私优先场景。
- 后续可以通过新增 ADR 再引入独立后端能力，但不得默认恢复爬虫或服务端上传链路。

## Alternatives Considered

### Vue 3 + FastAPI

- 优点：服务端解析 docx 更稳定，未来 AI API 集成更自然。
- 缺点：部署复杂度上升，隐私边界变重，当前核心流程不需要。
- 结论：暂不采用。

### Next.js / React

- 优点：生态大，工程能力强。
- 缺点：SSR 对本项目没有明显收益，当前 Vue 实现已经稳定。
- 结论：不切换。

### 服务端 PDF 渲染

- 优点：分页和复杂 CSS 支持可能更稳定。
- 缺点：增加后端部署和网络链路，违背当前本地导出目标。
- 结论：保留为未来备选。
