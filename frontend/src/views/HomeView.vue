<template>
  <div class="home">
    <header class="top-bar">
      <div class="brand">
        <span class="brand-icon">📋</span>
        <h1 class="brand-title">yourResume</h1>
      </div>
      <div class="top-actions">
        <span v-if="showEditor" class="draft-status" data-testid="resume-draft-status">
          {{ draftStatusLabel }}
        </span>
        <TemplateSwitcher v-if="showEditor" :model-value="store.template" @update:model-value="store.setTemplate" />
        <ExportActions v-if="showEditor" :get-element="getPreviewEl" :filename="`${store.data.name || '简历'}_简历.pdf`" :page-count="estimatedPages" :resume="store.data" />
      </div>
    </header>

    <main class="main-content">
      <div class="workspace">
        <!-- 左侧：上传区 -->
        <aside class="left-panel">
          <FileUpload v-if="!showEditor" @file-selected="handleFileSelected" @blank-selected="handleBlankSelected" />
          <ResumeEditor v-else :filename="filename" @reset="handleEditorReset" />
        </aside>

        <!-- 右侧：预览区 -->
        <section class="right-panel">
          <div class="preview-sticky">
            <div class="preview-label">
              <span>📺 预览</span>
              <span class="preview-hint" data-testid="resume-page-estimate">
                A4 尺寸 · 预计 {{ estimatedPages }} 页
                <strong v-if="estimatedPages > 1"> · 内容较长，建议压缩描述</strong>
              </span>
            </div>
            <div class="preview-scroll">
              <div class="preview-wrap">
                <ResumePreview ref="previewRef" :resume="store.data" :template="store.template" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useResumeStore } from '../stores/resume'
import { parseMarkdown } from '../utils/parser'
import { parseDocx } from '../utils/docx'
import { parsePdf } from '../utils/pdf-import'
import { clearDraft, hasResumeContent, loadDraftEnvelope, saveDraft } from '../utils/draft'
import { estimatePdfPages } from '../utils/pdf'
import { useToast } from '../composables/useToast'
import FileUpload from '../components/upload/FileUpload.vue'
import ResumePreview from '../components/preview/ResumePreview.vue'
import TemplateSwitcher from '../components/preview/TemplateSwitcher.vue'
import ExportActions from '../components/export/ExportActions.vue'
import ResumeEditor from '../components/editor/ResumeEditor.vue'

const store = useResumeStore()
const toast = useToast()
const previewRef = ref<InstanceType<typeof ResumePreview> | null>(null)
const filename = ref('')
const estimatedPages = ref(1)
const draftPersistenceReady = ref(false)
const editingStarted = ref(false)
const draftStatus = ref<'idle' | 'pending' | 'saved' | 'restored' | 'cleared' | 'unavailable'>('idle')
const lastDraftSavedAt = ref('')
let previewResizeObserver: ResizeObserver | null = null
let draftSaveTimer: number | null = null
const DRAFT_SAVE_DELAY_MS = 300

const hasData = computed(() => hasResumeContent(store.data))
const showEditor = computed(() => editingStarted.value || hasData.value)
const draftStatusLabel = computed(() => {
  if (draftStatus.value === 'pending') return '草稿保存中...'
  if (draftStatus.value === 'saved') return lastDraftSavedAt.value ? `草稿已自动保存 ${lastDraftSavedAt.value}` : '草稿已自动保存'
  if (draftStatus.value === 'restored') return '已恢复本地草稿'
  if (draftStatus.value === 'cleared') return '草稿已清除'
  if (draftStatus.value === 'unavailable') return '草稿保存不可用'
  return '草稿会自动保存'
})

async function handleFileSelected(content: string | File, fname: string) {
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
    toast.error(message)
  }
}

function handleBlankSelected() {
  store.reset()
  filename.value = '新建简历'
  editingStarted.value = true
  clearPersistedDraft()
}

function handleEditorReset() {
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

async function updatePageEstimate() {
  await nextTick()
  const el = getPreviewEl()
  if (!el) {
    estimatedPages.value = 1
    previewResizeObserver?.disconnect()
    previewResizeObserver = null
    return
  }
  estimatedPages.value = estimatePdfPages(el).pageCount
  ensurePreviewObserver()
}

function ensurePreviewObserver() {
  if (previewResizeObserver) return
  const el = getPreviewEl()
  if (!el) return

  previewResizeObserver = new ResizeObserver(() => {
    void updatePageEstimate()
  })
  previewResizeObserver.observe(el)
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
  () => [store.data, store.template],
  () => {
    void updatePageEstimate()
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
  void updatePageEstimate()
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
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 20px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.draft-status {
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.workspace {
  display: grid;
  grid-template-columns: 380px 1fr;
  height: 100%;
}

.left-panel {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-panel {
  background: #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-sticky {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1a1a2e;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.preview-hint {
  color: #94a3b8;
  font-weight: 400;
}

.preview-hint strong {
  color: #fbbf24;
  font-weight: 600;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.preview-wrap {
  transform-origin: top center;
}

</style>
