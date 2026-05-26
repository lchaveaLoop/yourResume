<template>
  <div class="home">
    <header class="top-bar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">
          <FileText class="icon" />
        </span>
        <div>
          <h1 class="brand-title">yourResume</h1>
          <p class="brand-subtitle">本地解析 · 实时排版 · A4 导出</p>
        </div>
      </div>

      <div class="top-actions">
        <span v-if="showEditor" class="draft-status" data-testid="resume-draft-status">
          <CheckCircle2 class="icon" aria-hidden="true" />
          {{ draftStatusLabel }}
        </span>
        <TemplateSwitcher
          v-if="showEditor"
          :model-value="store.template"
          @update:model-value="store.setTemplate"
        />
        <ExportActions
          v-if="showEditor"
          :get-element="getPreviewEl"
          :filename="`${store.data.name || '简历'}_简历.pdf`"
          :page-count="estimatedPages"
          :resume="store.data"
        />
      </div>
    </header>

    <main class="main-content">
      <div class="workspace">
        <aside class="left-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Resume Studio</p>
              <h2>{{ showEditor ? '编辑简历' : '导入简历' }}</h2>
            </div>
            <span class="privacy-pill">仅本地处理</span>
          </div>

          <FileUpload
            v-if="!showEditor"
            @file-selected="handleFileSelected"
            @blank-selected="handleBlankSelected"
            @file-error="handleUploadError"
          />
          <p v-if="uploadError" class="upload-error" data-testid="resume-upload-error">
            {{ uploadError }}
          </p>
          <ResumeEditor v-else :filename="filename" @reset="handleEditorReset" />
        </aside>

        <section class="right-panel">
          <div class="preview-sticky">
            <div class="preview-toolbar">
              <div class="preview-title">
                <Eye class="icon" aria-hidden="true" />
                <div>
                  <strong>排版预览</strong>
                  <span>{{ currentTemplateLabel }} · A4 纵向</span>
                </div>
              </div>

              <div class="preview-meta">
                <span class="page-chip" data-testid="resume-page-estimate">
                  预计 {{ estimatedPages }} 页
                  <strong v-if="estimatedPages > 1">内容较长</strong>
                </span>
                <div class="zoom-group" aria-label="预览缩放">
                  <button
                    v-for="option in zoomOptions"
                    :key="option.value"
                    type="button"
                    class="zoom-button"
                    :class="{ active: previewZoomMode === option.value }"
                    @click="setPreviewZoom(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
                <span class="zoom-readout">{{ previewScalePercent }}%</span>
              </div>
            </div>

            <div ref="previewViewportRef" class="preview-scroll">
              <div class="preview-stage">
                <div
                  class="preview-wrap"
                  :style="{
                    transform: `scale(${previewScale})`,
                    height: `${previewFrameHeight}px`,
                  }"
                >
                  <ResumePreview ref="previewRef" :resume="store.data" :template="store.template" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Eye, FileText } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useToast } from '../composables/useToast'
import ExportActions from '../components/export/ExportActions.vue'
import ResumeEditor from '../components/editor/ResumeEditor.vue'
import ResumePreview from '../components/preview/ResumePreview.vue'
import TemplateSwitcher from '../components/preview/TemplateSwitcher.vue'
import FileUpload from '../components/upload/FileUpload.vue'
import { useResumeStore } from '../stores/resume'
import type { CareerTemplate } from '../types/resume'
import { clearDraft, hasResumeContent, loadDraftEnvelope, saveDraft } from '../utils/draft'
import { parseDocx } from '../utils/docx'
import { estimatePdfPages } from '../utils/pdf'
import { parsePdf } from '../utils/pdf-import'
import { parseMarkdown } from '../utils/parser'

type PreviewZoomMode = 'fit' | '75' | '90' | '100'

const store = useResumeStore()
const toast = useToast()
const previewRef = ref<InstanceType<typeof ResumePreview> | null>(null)
const previewViewportRef = ref<HTMLElement | null>(null)
const filename = ref('')
const estimatedPages = ref(1)
const previewZoomMode = ref<PreviewZoomMode>('fit')
const fitScale = ref(0.82)
const previewContentHeight = ref(1123)
const draftPersistenceReady = ref(false)
const editingStarted = ref(false)
const draftStatus = ref<'idle' | 'pending' | 'saved' | 'restored' | 'cleared' | 'unavailable'>('idle')
const lastDraftSavedAt = ref('')
const uploadError = ref('')

let previewResizeObserver: ResizeObserver | null = null
let draftSaveTimer: number | null = null

const DRAFT_SAVE_DELAY_MS = 300
const A4_WIDTH_PX = 794

const templateLabels: Record<CareerTemplate, string> = {
  base: '通用基础',
  tech: '技术研发',
  product: '产品增长',
  marketing: '商务出版',
  finance: '金融专业',
  education: '教育学术',
}

const zoomOptions: Array<{ label: string; value: PreviewZoomMode }> = [
  { label: '适应', value: 'fit' },
  { label: '75%', value: '75' },
  { label: '90%', value: '90' },
  { label: '100%', value: '100' },
]

const hasData = computed(() => hasResumeContent(store.data))
const showEditor = computed(() => editingStarted.value || hasData.value)
const currentTemplateLabel = computed(() => templateLabels[store.template])
const previewScale = computed(() =>
  previewZoomMode.value === 'fit' ? fitScale.value : Number(previewZoomMode.value) / 100
)
const previewScalePercent = computed(() => Math.round(previewScale.value * 100))
const previewFrameHeight = computed(() => Math.ceil(previewContentHeight.value * previewScale.value))
const draftStatusLabel = computed(() => {
  if (draftStatus.value === 'pending') return '草稿保存中...'
  if (draftStatus.value === 'saved') return lastDraftSavedAt.value ? `草稿已自动保存 ${lastDraftSavedAt.value}` : '草稿已自动保存'
  if (draftStatus.value === 'restored') return '已恢复本地草稿'
  if (draftStatus.value === 'cleared') return '草稿已清除'
  if (draftStatus.value === 'unavailable') return '草稿保存不可用'
  return '草稿会自动保存'
})

async function handleFileSelected(content: string | File, fname: string) {
  uploadError.value = ''
  try {
    const parsed = content instanceof File
      ? await parseUploadedFile(content, fname)
      : parseMarkdown(content)

    filename.value = fname
    editingStarted.value = true
    store.setResume(parsed)
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : '文件解析失败，请检查文件格式'
    uploadError.value = message
    toast.error(message)
  }
}

function handleBlankSelected() {
  uploadError.value = ''
  store.reset()
  filename.value = '新建简历'
  editingStarted.value = true
  clearPersistedDraft()
}

function handleUploadError(message: string) {
  uploadError.value = message
  toast.warning(message)
}

function handleEditorReset() {
  uploadError.value = ''
  clearPersistedDraft()
  filename.value = ''
  editingStarted.value = false
}

async function parseUploadedFile(file: File, fname: string) {
  if (isPdfFile(file, fname)) return parsePdf(file)
  if (isDocxFile(file, fname)) return parseDocx(file)
  throw new Error('暂不支持该文件格式，请上传 .md / .txt / .docx / .pdf 简历')
}

function isPdfFile(file: File, fname: string) {
  return file.type === 'application/pdf' || fname.toLowerCase().endsWith('.pdf')
}

function isDocxFile(file: File, fname: string) {
  return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fname.toLowerCase().endsWith('.docx')
}

function getPreviewEl() {
  return previewRef.value?.el() ?? null
}

function setPreviewZoom(value: PreviewZoomMode) {
  previewZoomMode.value = value
  void updatePreviewMetrics()
}

async function updatePreviewMetrics() {
  await nextTick()
  const el = getPreviewEl()
  if (!el) {
    estimatedPages.value = 1
    previewContentHeight.value = 1123
    return
  }

  const pageInfo = estimatePdfPages(el)
  estimatedPages.value = pageInfo.pageCount
  previewContentHeight.value = Math.max(pageInfo.contentHeightPx, 1123)

  const availableWidth = previewViewportRef.value?.clientWidth ?? 0
  if (availableWidth > 0) {
    fitScale.value = Math.min(1, Math.max(0.52, (availableWidth - 64) / A4_WIDTH_PX))
  }
  ensurePreviewObserver()
}

function ensurePreviewObserver() {
  if (previewResizeObserver) return

  previewResizeObserver = new ResizeObserver(() => {
    void updatePreviewMetrics()
  })

  const el = getPreviewEl()
  if (el) previewResizeObserver.observe(el)
  if (previewViewportRef.value) previewResizeObserver.observe(previewViewportRef.value)
}

function restoreDraft() {
  if (hasData.value) return

  const draft = loadDraftEnvelope()
  if (!draft) return

  filename.value = '本地草稿'
  editingStarted.value = true
  store.restoreResumeDraft(draft.resume, draft.template, draft.templateLocked)
  draftStatus.value = 'restored'
  lastDraftSavedAt.value = formatDraftSavedAt(draft.savedAt)
}

function scheduleDraftSave() {
  if (!draftPersistenceReady.value) return

  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
  }

  draftStatus.value = 'pending'
  draftSaveTimer = window.setTimeout(() => {
    draftSaveTimer = null
    persistDraftNow()
  }, DRAFT_SAVE_DELAY_MS)
}

function persistDraftNow() {
  if (!draftPersistenceReady.value) return

  if (hasData.value) {
    const saved = saveDraft(store.data, undefined, {
      template: store.template,
      templateLocked: store.templateLocked,
    })
    draftStatus.value = saved ? 'saved' : 'unavailable'
    lastDraftSavedAt.value = saved ? formatDraftSavedAt(new Date().toISOString()) : ''
  } else {
    const cleared = clearDraft()
    draftStatus.value = cleared ? 'cleared' : 'unavailable'
    lastDraftSavedAt.value = ''
  }
}

function flushDraftSave() {
  if (!draftSaveTimer) return

  window.clearTimeout(draftSaveTimer)
  draftSaveTimer = null
  persistDraftNow()
}

function clearPersistedDraft() {
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
    draftSaveTimer = null
  }

  const cleared = clearDraft()
  draftStatus.value = cleared ? 'cleared' : 'unavailable'
  lastDraftSavedAt.value = ''
}

function formatDraftSavedAt(value: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

watch(
  () => [store.data, store.template, previewZoomMode.value],
  () => {
    void updatePreviewMetrics()
  },
  { deep: true }
)

watch(
  () => store.data,
  () => {
    scheduleDraftSave()
  },
  { deep: true }
)

watch(
  () => [store.template, store.templateLocked],
  () => {
    scheduleDraftSave()
  }
)

onMounted(async () => {
  restoreDraft()
  void updatePreviewMetrics()
  await nextTick()
  draftPersistenceReady.value = true
})

onBeforeUnmount(() => {
  flushDraftSave()
  previewResizeObserver?.disconnect()
  previewResizeObserver = null
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 72px;
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(217, 224, 234, 0.92);
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px);
  flex-shrink: 0;
  z-index: 3;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: #fff;
  background: linear-gradient(145deg, var(--color-brand), #244f73);
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(16, 38, 63, 0.22);
}

.brand-title {
  color: var(--color-ink-strong);
  font-size: 19px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0;
}

.brand-subtitle {
  margin-top: 4px;
  color: var(--color-muted);
  font-size: 12px;
}

.top-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  min-width: 0;
}

.draft-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-success);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.draft-status .icon {
  width: 15px;
  height: 15px;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  min-height: 0;
  padding: 24px;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(247, 249, 252, 0.94)),
    var(--color-panel);
  border-right: 1px solid var(--color-border);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-heading h2 {
  margin-top: 3px;
  color: var(--color-ink-strong);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.13em;
  line-height: 1;
  text-transform: uppercase;
}

.privacy-pill {
  flex-shrink: 0;
  padding: 5px 9px;
  color: var(--color-brand-2);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 750;
}

.upload-error {
  padding: 10px 12px;
  color: var(--color-danger);
  background: #fff4f2;
  border: 1px solid rgba(180, 35, 24, 0.22);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.right-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(16, 38, 63, 0.055) 0 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 140px),
    linear-gradient(180deg, #dfe6ee, #f2f5f8);
  background-size: 36px 36px, auto, auto;
}

.preview-sticky {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 9px 22px;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(199, 208, 220, 0.8);
  backdrop-filter: blur(14px);
  flex-shrink: 0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.preview-title > .icon {
  color: var(--color-brand-2);
}

.preview-title strong,
.preview-title span {
  display: block;
}

.preview-title strong {
  color: var(--color-ink-strong);
  font-size: 13px;
  font-weight: 800;
}

.preview-title span {
  margin-top: 2px;
  color: var(--color-muted);
  font-size: 11px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.page-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 6px 10px;
  color: var(--color-brand);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
}

.page-chip strong {
  color: var(--color-warning);
  font-weight: 800;
}

.zoom-group {
  display: flex;
  padding: 3px;
  background: var(--color-panel-strong);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.zoom-button {
  min-width: 44px;
  height: 25px;
  padding: 0 8px;
  color: var(--color-muted);
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-sm) - 2px);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.zoom-button.active {
  color: #fff;
  background: var(--color-brand);
  box-shadow: 0 8px 18px rgba(16, 38, 63, 0.18);
}

.zoom-readout {
  min-width: 38px;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 750;
  text-align: right;
}

.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.preview-stage {
  display: flex;
  justify-content: center;
  min-width: max-content;
  min-height: 100%;
  padding: 30px 36px 48px;
  background:
    radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.66), transparent 220px);
}

.preview-wrap {
  width: var(--resume-width);
  transform-origin: top center;
  transition: transform 0.18s ease, height 0.18s ease;
}

@media (max-width: 1120px) {
  .top-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .top-actions {
    justify-content: flex-start;
    width: 100%;
    flex-wrap: wrap;
  }

  .workspace {
    grid-template-columns: 330px minmax(0, 1fr);
  }
}

@media (max-width: 860px) {
  .home {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .main-content,
  .workspace,
  .right-panel,
  .preview-sticky {
    overflow: visible;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .left-panel {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .preview-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-meta {
    width: 100%;
    flex-wrap: wrap;
  }

  .preview-scroll {
    max-height: none;
  }
}
</style>
