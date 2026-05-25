<template>
  <div class="docx-actions">
    <button class="control-button export-button" data-testid="export-docx-button" :disabled="loading" @click="handleExport">
      <Loader2 v-if="loading" class="icon spinning" aria-hidden="true" />
      <FileDown v-else class="icon" aria-hidden="true" />
      <span v-if="loading">正在生成 DOCX...</span>
      <span v-else>导出 DOCX</span>
    </button>
    <div v-if="docxUrl" class="export-result">
      <span>
        <CheckCircle2 class="icon" aria-hidden="true" />
        DOCX 已生成
      </span>
      <a :href="docxUrl" :download="docxFilename">再次下载</a>
      <a :href="docxUrl" target="_blank" rel="noopener">
        打开文件
        <ExternalLink class="icon" aria-hidden="true" />
      </a>
    </div>
    <p v-if="exportError" class="export-error" data-testid="export-docx-error">{{ exportError }}</p>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, ExternalLink, FileDown, Loader2 } from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
import { useToast } from '../../composables/useToast'
import type { ResumeData } from '../../types/resume'
import { exportToDOCX } from '../../utils/docx-export'

const props = defineProps<{
  resume: ResumeData
  filename?: string
}>()

const loading = ref(false)
const docxUrl = ref('')
const docxFilename = ref('')
const exportError = ref('')
const toast = useToast()

async function handleExport() {
  exportError.value = ''
  loading.value = true
  try {
    revokeGeneratedDocx()
    const result = await exportToDOCX(props.resume, props.filename || '简历.docx')
    docxUrl.value = result.url
    docxFilename.value = result.filename
  } catch (err) {
    console.error(err)
    showExportError('DOCX 生成失败，请重试')
  } finally {
    loading.value = false
  }
}

function showExportError(message: string) {
  exportError.value = message
  toast.error(message)
}

function revokeGeneratedDocx() {
  if (!docxUrl.value) return
  URL.revokeObjectURL(docxUrl.value)
  docxUrl.value = ''
  docxFilename.value = ''
}

onBeforeUnmount(() => {
  revokeGeneratedDocx()
})
</script>

<style scoped>
.docx-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.export-button {
  min-width: 116px;
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

.export-error {
  margin: 0;
  color: var(--color-danger);
  font-size: 11px;
  font-weight: 750;
  text-align: right;
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
