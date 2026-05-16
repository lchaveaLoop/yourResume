# Web Resume Editor Architecture

## Purpose

This document records the target architecture for the web-based resume editing capability. It is meant to guide the next implementation phase: modularizing the current editor, preparing PDF/DOCX output boundaries, and keeping the data flow readable and stable.

The current project should remain a browser-first resume tool. User resume data is parsed, edited, previewed, and exported locally unless a later ADR explicitly introduces server-side capabilities.

## Layered Architecture

```text
Input layer
  File upload
  Web form editing
  Future draft restore

Input adapter layer
  Markdown parser
  DOCX parser
  Editor actions
  Draft loader

Data normalization layer
  Fill defaults
  Clean empty values
  Normalize arrays
  Convert editor-friendly fields into canonical fields
  Preserve compatibility with old drafts or parser output

Unified data model
  ResumeData

State layer
  Pinia resume store

Output adapter layer
  Web preview
  PDF export
  DOCX export
  Draft persistence
  Future AI/share/export integrations
```

## Data Flow

```mermaid
flowchart LR
  Upload["File upload<br/>.md / .docx"] --> InputParser["Input adapters<br/>parser.ts / docx.ts"]
  WebForm["Web form editing"] --> EditorActions["Editor actions"]
  Draft["Future draft restore"] --> DraftLoader["draft.ts"]

  InputParser --> Normalizer["Data normalization<br/>normalizeResume()"]
  EditorActions --> Normalizer
  DraftLoader --> Normalizer

  Contract["Data contract<br/>types/resume.ts"] -.constrains.-> InputParser
  Contract -.constrains.-> EditorActions
  Contract -.constrains.-> Normalizer

  Normalizer --> Model["Unified model<br/>ResumeData"]
  Model --> Store["State layer<br/>Pinia resume store"]

  Store --> Preview["Preview adapter<br/>ResumePreview.vue"]
  Preview --> DomPreview["A4 DOM preview"]
  DomPreview --> PdfExport["PDF output<br/>pdf.ts"]

  Store --> DocxExport["DOCX output<br/>docx-export.ts"]
  Store --> DraftSave["Draft persistence<br/>draft.ts / localStorage"]
  Store --> FutureOutputs["Future outputs<br/>AI / share / JSON"]

  Contract -.constrains.-> Preview
  Contract -.constrains.-> PdfExport
  Contract -.constrains.-> DocxExport
  Contract -.constrains.-> DraftSave
```

## Data Contract Module

The data contract module defines the standard shape of resume data. In the current project this is `frontend/src/types/resume.ts`.

Its responsibility is to answer one question: what does a valid standard resume object look like inside the application?

It should contain stable type definitions such as:

```text
ResumeData
Education
Experience
Project
CareerTemplate
```

It may contain small constants that are part of the contract, but it should not contain runtime data processing. It should not parse Markdown, inspect DOCX XML, manipulate DOM, generate PDF/DOCX files, compress images, or manage localStorage.

Every input and output module should depend on this contract instead of depending on each other. That keeps the system extensible: Markdown, DOCX, web form editing, preview, PDF, DOCX, drafts, and future integrations all speak the same internal language.

## Data Normalization Module

The data normalization module is separate from the data contract. A future file such as `frontend/src/utils/resume-normalizer.ts` should own this responsibility.

Its job is to convert incomplete, dirty, legacy, or source-specific data into a clean `ResumeData` object. Typical responsibilities:

- Fill missing fields with defaults.
- Ensure list fields are always arrays.
- Remove empty skills or empty detail lines.
- Trim user-entered text where appropriate.
- Convert editor-friendly fields into canonical fields, for example `detailsRaw` into `details`.
- Normalize parser output before it enters the store.
- Normalize restored drafts before they are displayed or exported.

This distinction matters:

```text
Data contract defines the standard.
Data normalization makes real input conform to the standard.
```

For the first refactor, it is acceptable to keep `detailsRaw` in `ResumeData` to reduce migration risk. A later cleanup can split pure resume data from editor-only state if the editor grows more complex.

## Module Split Target

The current `HomeView.vue` should become a page composition layer. It should coordinate upload parsing, preview references, page estimation, and top-level layout, but it should not own all editor fields and list mutation logic.

Recommended component boundaries:

```text
frontend/src/views/
  HomeView.vue

frontend/src/components/upload/
  FileUpload.vue

frontend/src/components/editor/
  ResumeEditor.vue
  BasicInfoEditor.vue
  PhotoEditor.vue
  EducationEditor.vue
  ExperienceEditor.vue
  ProjectEditor.vue
  SkillsEditor.vue

frontend/src/components/preview/
  ResumePreview.vue
  TemplateSwitcher.vue

frontend/src/components/export/
  ExportActions.vue
  PDFExporter.vue
  DocxExporter.vue
```

`ResumeEditor.vue` should compose the editor sections. Section components should focus on rendering and dispatching edit actions. The Pinia store should centralize list mutations and detail synchronization so that components do not scatter `push`, `splice`, and data cleanup behavior.

## Output Boundaries

PDF and DOCX exports should use different adapters because they have different goals.

PDF should continue to use the rendered A4 DOM preview as its source. This keeps the exported PDF visually aligned with the web preview.

DOCX should be generated from `ResumeData`, not from the DOM. DOCX output should prioritize editable, ATS-friendly structure. It does not need to match every visual detail of the web preview in the first version.

Draft persistence should also consume normalized `ResumeData`. Draft loading should pass through the normalization layer before entering the store.

## Implementation Guidance

When implementing the next phase:

- Keep `ResumeData` as the single normalized internal model.
- Introduce `resume-normalizer.ts` before adding more input or output paths.
- Move editor list operations into store actions.
- Keep `HomeView.vue` as orchestration, not business logic storage.
- Add `ExportActions.vue` as the stable place for PDF now and DOCX later.
- Do not introduce a backend for this refactor.
- Record larger architectural decisions in ADRs when the refactor begins.
