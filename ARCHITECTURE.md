# ARCHITECTURE.md - yourResume 系统架构文档

## 1. 架构定位

yourResume 当前采用纯前端架构。项目不保留后端服务、爬虫脚本或服务端解析 API，所有简历处理默认在浏览器本地完成。

核心链路：

```text
用户文件 (.pdf/.docx/.md)
  → FileUpload
  → parsePdf / parseDocx / parseMarkdown
  → Pinia resume store
  → ResumePreview
  → exportToPDF
```

---

## 2. 技术选型

### 前端

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: Tailwind CSS + 组件内 scoped CSS
- **docx 解析**: JSZip + OOXML 文本提取
- **PDF 输入解析**: pdfjs-dist + 文本内容提取
- **Markdown 解析**: 自定义行级状态机
- **PDF 导出**: html2canvas + jsPDF

### 不在当前架构内

- FastAPI / Python 后端
- Scrapy / Playwright 爬虫
- 服务端 PDF 渲染
- 云端简历存储

如后续重新引入服务端能力，需要新增 ADR 明确边界、隐私策略、部署方式和与前端的数据契约。

---

## 3. 目录结构

```text
yourResume/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.vue
│   │   │   ├── PDFExporter.vue
│   │   │   ├── ResumePreview.vue
│   │   │   └── TemplateSwitcher.vue
│   │   ├── stores/
│   │   │   └── resume.ts
│   │   ├── types/
│   │   │   └── resume.ts
│   │   ├── utils/
│   │   │   ├── career.ts
│   │   │   ├── docx.ts
│   │   │   ├── pdf-import.ts
│   │   │   ├── plain-text-resume.ts
│   │   │   ├── parser.ts
│   │   │   └── pdf.ts
│   │   ├── views/
│   │   │   └── HomeView.vue
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── layout-previews/
├── adr/
├── SPEC.md
├── TODO.md
└── ARCHITECTURE.md
```

---

## 4. 模块职责

| 模块 | 职责 |
|------|------|
| `FileUpload.vue` | 接收 `.pdf` / `.docx` / `.md` / `.txt` 文件，读取内容并交给解析器 |
| `parser.ts` | 解析 Markdown 简历，提取姓名、联系方式、区块内容和目标岗位 |
| `docx.ts` | 解压并解析 docx 内部 XML，输出统一 `ResumeData` |
| `pdf-import.ts` | 动态加载 PDF.js，提取文本型 PDF 内容并输出统一 `ResumeData` |
| `plain-text-resume.ts` | 解析 DOCX/PDF 提取出的纯文本行 |
| `career.ts` | 识别目标岗位、推断职业模板 |
| `resume.ts` store | 保存简历数据、当前模板和模板锁定状态 |
| `HomeView.vue` | 组织上传、编辑、预览、页数估算与照片上传 |
| `TemplateSwitcher.vue` | 切换通用基础、技术研发、产品增长、市场品牌、金融专业、教育学术模板 |
| `ResumePreview.vue` | 基于统一骨架和模板皮肤渲染 A4 简历 |
| `pdf.ts` | 等待字体/图片资源后，将 DOM 导出为 PDF |
| `PDFExporter.vue` | 管理导出按钮、生成状态、下载链接和预览链接 |

---

## 5. 数据流

1. 用户上传文件。
2. `FileUpload` 根据文件类型读取文本或 File 对象。
3. `HomeView` 调用 `parseMarkdown`、`parseDocx` 或 `parsePdf`。
4. `store.setResume()` 合并默认字段，并调用 `inferCareerTemplate()` 选择初始模板。
5. 用户在左侧编辑区修改字段，Pinia 状态更新。
6. `ResumePreview` 读取最新状态并渲染。
7. `PDFExporter` 获取预览 DOM，调用 `exportToPDF()` 生成并下载 PDF。

---

## 6. PDF 生成策略

- PDF 直接基于预览 DOM 生成，保证网页预览和导出内容使用同一套 HTML/CSS。
- 导出前等待 `document.fonts.ready` 和图片加载完成，避免字体或照片缺失。
- 长简历通过整张 canvas 按 A4 高度分页写入 jsPDF。
- `estimatePdfPages()` 用预览元素高度估算页数，并在界面上提示。

---

## 7. 当前风险

1. **docx 兼容性**: 前端 XML 解析对复杂表格、文本框、图片化简历不如服务端专业解析库稳定。
2. **PDF 输入兼容性**: 当前只支持文本型 PDF，扫描件和图片化 PDF 需要后续 OCR 能力。
3. **PDF 体积**: 高倍率 canvas 导出会增加 PDF 文件体积和内存占用。
4. **移动端编辑**: 现有布局以桌面工作台为主，移动端需要单独验证。
5. **构建体积**: PDF 导出和 PDF 输入依赖都较重，需要保持动态加载边界。

---

*文档版本: v0.2.0 | 最后更新: 2026-05-15*
