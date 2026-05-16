<template>
  <div class="home">
    <header class="top-bar">
      <div class="brand">
        <span class="brand-icon">📋</span>
        <h1 class="brand-title">yourResume</h1>
      </div>
      <div class="top-actions">
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
import { clearDraft, hasResumeContent, loadDraft, saveDraft } from '../utils/draft'
import { estimatePdfPages } from '../utils/pdf'
import FileUpload from '../components/upload/FileUpload.vue'
import ResumePreview from '../components/preview/ResumePreview.vue'
import TemplateSwitcher from '../components/preview/TemplateSwitcher.vue'
import ExportActions from '../components/export/ExportActions.vue'
import ResumeEditor from '../components/editor/ResumeEditor.vue'

const store = useResumeStore()
const previewRef = ref<InstanceType<typeof ResumePreview> | null>(null)
const filename = ref('')
const estimatedPages = ref(1)
const draftPersistenceReady = ref(false)
const editingStarted = ref(false)
let previewResizeObserver: ResizeObserver | null = null
let draftSaveTimer: number | null = null
const DRAFT_SAVE_DELAY_MS = 300

const hasData = computed(() => hasResumeContent(store.data))
const showEditor = computed(() => editingStarted.value || hasData.value)

async function handleFileSelected(content: string | File, fname: string) {
  editingStarted.value = true
  filename.value = fname
  let parsed
  if (content instanceof File) {
    parsed = await parseDocx(content)
  } else {
    parsed = parseMarkdown(content)
  }
  store.setResume(parsed)
}

function handleBlankSelected() {
  store.reset()
  filename.value = '新建简历'
  editingStarted.value = true
}

function handleEditorReset() {
  filename.value = ''
  editingStarted.value = false
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

  const draft = loadDraft()
  if (!draft) return

  filename.value = '本地草稿'
  editingStarted.value = true
  store.setResume(draft)
}

function scheduleDraftSave() {
  if (!draftPersistenceReady.value) return

  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
  }

  draftSaveTimer = window.setTimeout(() => {
    draftSaveTimer = null
    persistDraftNow()
  }, DRAFT_SAVE_DELAY_MS)
}

function persistDraftNow() {
  if (!draftPersistenceReady.value) return

  if (hasData.value) {
    saveDraft(store.data)
  } else {
    clearDraft()
  }
}

function flushDraftSave() {
  if (!draftSaveTimer) return

  window.clearTimeout(draftSaveTimer)
  draftSaveTimer = null
  persistDraftNow()
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

onMounted(() => {
  restoreDraft()
  draftPersistenceReady.value = true
  void updatePageEstimate()
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
