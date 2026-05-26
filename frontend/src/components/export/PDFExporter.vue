<template>
  <div class="pdf-actions">
    <button class="control-button primary export-button" data-testid="export-pdf-button" :disabled="loading" @click="handleExport">
      <Loader2 v-if="loading" class="icon spinning" aria-hidden="true" />
      <Download v-else class="icon" aria-hidden="true" />
      <span v-if="loading">正在生成 PDF...</span>
      <span v-else>导出 PDF</span>
    </button>
    <div v-if="pdfUrl" class="export-result">
      <span>
        <CheckCircle2 class="icon" aria-hidden="true" />
        PDF 已生成
      </span>
      <a :href="pdfUrl" :download="pdfFilename">再次下载</a>
      <a :href="pdfUrl" target="_blank" rel="noopener">
        打开预览
        <ExternalLink class="icon" aria-hidden="true" />
      </a>
    </div>
    <p v-if="exportError" class="export-error" data-testid="export-pdf-error">{{ exportError }}</p>
    <p v-if="pageCount > 1" class="export-note">预计 {{ pageCount }} 页，可继续导出。</p>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Download, ExternalLink, Loader2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useToast } from '../../composables/useToast'
import { exportToPDF } from '../../utils/pdf'

const props = defineProps<{ getElement: () => HTMLElement | null; filename?: string; pageCount?: number }>()
const loading = ref(false)
const pdfUrl = ref('')
const pdfFilename = ref('')
const exportError = ref('')
const toast = useToast()

const pageCount = computed(() => props.pageCount ?? 1)

async function handleExport() {
  const el = props.getElement()
  exportError.value = ''
  if (!el) {
    showExportError('未找到可导出的简历预览，请刷新后重试')
    return
  }
  loading.value = true
  try {
    await waitForNextTask()
    revokeGeneratedPdf()
    const result = await exportToPDF(el, props.filename || '简历.pdf')
    pdfUrl.value = result.url
    pdfFilename.value = result.filename
  } catch (err) {
    console.error(err)
    showExportError('PDF 生成失败，请重试')
  } finally {
    loading.value = false
  }
}

function showExportError(message: string) {
  exportError.value = message
  toast.error(message)
}

function waitForNextTask() {
  return new Promise(resolve => window.setTimeout(resolve, 0))
}

function revokeGeneratedPdf() {
  if (!pdfUrl.value) return
  URL.revokeObjectURL(pdfUrl.value)
  pdfUrl.value = ''
  pdfFilename.value = ''
}

onBeforeUnmount(() => {
  revokeGeneratedPdf()
})
</script>

<style scoped>
.pdf-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  justify-content: flex-end;
}

.export-button {
  min-width: 112px;
}

.export-note {
  margin: 0;
  color: var(--color-warning);
  font-size: 11px;
  font-weight: 700;
}

.export-error {
  margin: 0;
  color: var(--color-danger);
  font-size: 11px;
  font-weight: 750;
  text-align: right;
}

.export-result {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: var(--color-muted);
  font-size: 11px;
  white-space: nowrap;
}

.export-result span,
.export-result a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.export-result span {
  color: var(--color-success);
  font-weight: 800;
}

.export-result .icon {
  width: 13px;
  height: 13px;
}

.export-result a {
  color: var(--color-brand);
  font-weight: 750;
  text-decoration: none;
}

.export-result a:hover {
  text-decoration: underline;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
