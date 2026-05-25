# PROJECT_STATUS.md - 当前项目状态

## 状态摘要

截至 2026-05-17，yourResume 是一个纯前端简历工具。后端目录、竞品爬虫脚本和服务端 API 已移除，当前交付目标集中在浏览器本地完成简历解析、编辑、预览和 PDF 导出。

## 已完成

- 支持 `.md`、`.txt`、`.docx` 和文本型 `.pdf` 简历上传。
- 支持解析姓名、联系方式、求职意向、摘要、教育经历、工作经历、项目经历和技能。
- 支持左侧字段编辑、增加/删除经历和技能。
- 支持照片上传并在模板中展示。
- 支持 ATS、高级工程师、长简历、市场商务四类模板。
- 支持基于目标岗位和关键词自动推断模板。
- 支持 A4 PDF 导出和多页长简历导出。
- 支持 localStorage 单份草稿自动保存、页面打开自动恢复、重新上传时清除旧草稿。
- 文本型 PDF 通过 `pdfjs-dist` 在浏览器本地提取文字；扫描件 OCR 暂不支持。
- 已生成布局预览资料，见 `docs/layout-previews/`。

## 当前架构边界

- 简历文件不上传到服务端。
- 不运行 Python / FastAPI / Scrapy / Playwright。
- 不保留 `backend/` 目录。
- PDF 导出基于浏览器 DOM、`html2canvas` 和 `jsPDF`。
- PDF 上传识别仅使用本地 PDF.js 文本提取，不引入 OCR 或云解析。

## 待处理

- 上传、解析、导出错误提示优化。
- 真实浏览器 PDF 视觉回归。
- PDF 相关依赖动态加载，降低首屏 bundle 体积。

## PC-only 发布门禁

当前商业化上线目标只覆盖 PC 桌面浏览器，移动端适配不作为发布门禁。上线前必须在 `frontend/` 下通过：

- `npm run test`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run build`
- `npx playwright test --config playwright.config.ts --workers=1`

门禁要求：

- 模板只负责排版和 UI 美化，不改写、截断或派生传入简历内容。
- 上传、解析、PDF/DOCX 导出失败必须同时显示页面内错误和 toast。
- 真实 PDF 导出覆盖标准模板、长简历和照片场景。
- 构建结果保持 PDF/PDF.js/DOCX 相关依赖动态加载，避免首屏主 chunk 继续膨胀。
