# ADR-002: 简历解析方案

## Status
Accepted

## Context

简历输入格式为 `.pdf`、`.docx` 和 `.md`，需要统一转换为 `ResumeData`。项目当前不保留后端，因此解析必须在浏览器端完成。

## Decision

### Markdown 解析

使用前端自定义解析器，基于正则和行级状态机：

```text
# 一级标题          → 姓名
## 二级标题         → 教育 / 工作 / 项目 / 技能等区块
### 三级标题        → 公司 / 项目标题行
- 列表项            → 技能或经历详情
求职意向/目标岗位    → targetRole
```

### docx 解析

使用 JSZip 解压 `.docx`，读取 OOXML 文本内容并按段落、区块关键词和常见简历格式提取字段。

### PDF 解析

使用 `pdfjs-dist` 在浏览器本地读取文本型 `.pdf`，逐页提取可复制文本，再复用纯文本行级解析器转换为 `ResumeData`。

扫描件、图片化 PDF 和无可复制文本的 PDF 暂不做 OCR。解析为空时提示用户上传文本型 PDF、DOCX 或 Markdown。

解析输出统一写入：

- `name`
- `email`
- `phone`
- `location`
- `targetRole`
- `summary`
- `education`
- `experience`
- `skills`
- `projects`
- `photo`

## Consequences

### Positive

- 不需要服务端，隐私和部署边界清晰。
- `.pdf`、`.md` 和 `.docx` 最终落到同一个前端数据结构，模板层无需关心输入来源。
- 解析结果可以立即进入编辑器，用户可修正不完整字段。

### Negative

- 前端 docx 解析无法覆盖所有 Word 排版能力，复杂表格、文本框和图片化简历可能识别不足。
- PDF 解析仅覆盖文本型文件，扫描件需要后续 OCR 能力。
- 解析器需要持续积累真实简历样本来优化关键词和边缘 case。

### Neutral

- 对普通文本型简历和文本型 PDF，前端解析足以支撑 MVP 和当前版本。
- 对高复杂度企业模板，可以先通过手动编辑兜底。

## Alternatives Considered

### 后端 python-docx

- 优点：解析能力成熟，对复杂文档更稳定。
- 缺点：需要后端部署和上传用户简历，违背当前纯前端隐私优先方向。
- 结论：暂不采用。

### mammoth docx → HTML

- 优点：成熟库，能较好保留 Word 文档结构。
- 缺点：转 HTML 后仍需二次解析为 `ResumeData`，引入额外复杂度。
- 结论：后续如 docx 兼容性成为主要瓶颈再评估。

### OCR / 云解析 API

- 优点：可处理扫描件和图片简历。
- 缺点：隐私、成本和延迟都不适合当前阶段。
- 结论：不纳入当前范围；当前仅保留明确提示和后续扩展边界。
