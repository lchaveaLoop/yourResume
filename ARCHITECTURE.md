# ARCHITECTURE.md - yourResume 系统架构文档

## 1. 技术选型

### 前端
- **框架**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: Tailwind CSS + 自定义 CSS 变量
- **PDF 导出**: html2pdf.js / jsPDF + html2canvas
- **富文本编辑**: contenteditable 或轻量级编辑组件

### 后端
- **框架**: Python FastAPI
- **文件解析**: python-docx（docx 解析）、自定义 MD parser（Markdown 解析）
- **CORS**: FastAPI CORSMiddleware
- **部署**: 单进程，可 Docker 化

### 通信方式
- 前端通过 HTTP 上传文件 / 获取解析结果
- 建议：小规模阶段可考虑纯前端（jszip + markitdown）做 MD 解析，减少后端依赖
- **本架构采用前端为主、后端为辅的方案**，降低部署复杂度

---

## 2. 简历解析方案

### docx 解析

**方案**: `python-docx` + 智能区块识别

```
docx XML 结构分析：
  paragraph.style.name → 判断是否为标题（Heading 1/2）
  标题 + 内容 → 识别为区块
  支持的区块关键词：
    - 教育背景 / Education / 教育
    - 工作经历 / Experience / 工作经历
    - 项目经历 / Projects / 项目
    - 技能 / Skills / 专业技能
    - 个人信息 / Personal Info
```

**中间转换**: docx → JSON（见 SPEC.md 输出格式）

### Markdown 解析

**方案**: 自定义解析器（正则 + 行级别状态机）

- `#` 一级标题 → 姓名
- `- ` 列表 → 联系方式 / 技能列表
- `## ` 二级标题 → 区块识别
- 空行 → 区块分隔

---

## 3. PDF 生成方案

### 方案选择：html2canvas + jsPDF（前端方案）

**理由**:
- 零后端依赖，用户本地即可生成
- 渲染效果与网页预览一致
- 支持自定义字体、颜色、布局

**缺点**:
- 复杂表格/多列布局可能出现截断
- 需要处理跨页问题

### 备选方案：后端 WeasyPrint

- 如果前端方案在复杂模板下表现不佳，切换为后端渲染
- 输入：HTML 字符串
- 输出：PDF 二进制流

### 实施步骤
1. 使用 `html2canvas` 将目标 DOM 渲染为 Canvas
2. 使用 `jsPDF` 将 Canvas 转为 PDF
3. 处理分页（A4, 210mm x 297mm）
4. 触发浏览器下载

---

## 4. 目录结构设计

```
yourResume/
├── frontend/                  # Vue 3 前端项目
│   ├── src/
│   │   ├── components/        # Vue 组件
│   │   │   ├── FileUpload.vue
│   │   │   ├── ResumePreview.vue
│   │   │   ├── ResumeEditor.vue
│   │   │   ├── TemplateSwitcher.vue
│   │   │   └── PDFExporter.vue
│   │   ├── views/
│   │   │   └── HomeView.vue
│   │   ├── stores/
│   │   │   └── resume.ts      # Pinia store
│   │   ├── types/
│   │   │   └── resume.ts      # TypeScript 接口
│   │   ├── utils/
│   │   │   ├── parser.ts      # 解析工具（前端 MD 解析）
│   │   │   └── pdf.ts         # PDF 导出工具
│   │   ├── styles/
│   │   │   └── templates/     # CSS 模板样式
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                   # Python FastAPI 后端项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 入口
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── resume.py      # 简历解析 API
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── docx_parser.py
│   │   │   └── md_parser.py
│   │   └── models/
│   │       └── resume.py      # Pydantic 模型
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                     # 文档（本目录）
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── adr/
│   └── TODO.md
│
└── README.md
```

---

## 5. 模块职责划分

### 前端模块

| 模块 | 职责 |
|------|------|
| `FileUpload` | 文件拖拽/选择，格式校验，触发解析 |
| `ResumePreview` | 根据模板渲染简历数据，响应式展示 |
| `ResumeEditor` | 各字段 inline 编辑，实时更新 store |
| `TemplateSwitcher` | 切换 CSS 模板类，切换预览风格 |
| `PDFExporter` | 调用 html2canvas + jsPDF 生成下载 |
| `resume store` | 全局简历 JSON 状态，跨组件共享 |

### 后端模块（如果启用）

| 模块 | 职责 |
|------|------|
| `docx_parser` | 解析 .docx 文件，返回标准 JSON |
| `md_parser` | 解析 .md 文件，返回标准 JSON |
| `resume.py API` | 暴露 `/parse/docx` 和 `/parse/md` 接口 |
| `models/resume` | Pydantic 请求/响应模型定义 |

---

## 6. 部署考量

- **纯前端优先**: MVP 阶段前端独立运行，无需后端
- **后端按需引入**: 当 docx 解析复杂度超出前端能力时，再引入后端
- **环境变量**: API 地址等通过 `.env` 配置
- **跨域**: 前端 5173 (dev) / 后端 8000，通过 CORS 解耦

---

## 7. 核心问题：格式渲染一致性

这是本项目最关键的技术风险。

**问题描述**: 
网页预览的字体、间距、颜色与最终 PDF 导出的结果存在差异。

**应对策略**:
1. PDF 渲染直接基于网页 DOM（html2canvas），而非重新渲染
2. 所有模板样式使用标准 Web Font，避免字体回退不一致
3. 预设尺寸容器（A4 比例 1:1.414），让 PDF 生成时截取区域明确
4. 上线前进行多模板 x 多浏览器的交叉测试

---

*文档版本: v0.1.0 | 最后更新: 2026-05-05*
