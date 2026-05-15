<template>
  <div class="pdf-actions">
    <button class="btn-pdf" :disabled="loading" @click="handleExport">
      <span v-if="loading">正在生成清晰 PDF...</span>
      <span v-else>导出 PDF</span>
    </button>
    <div v-if="pdfUrl" class="pdf-result">
      <span>PDF 已生成</span>
      <a :href="pdfUrl" :download="pdfFilename">再次下载</a>
      <a :href="pdfUrl" target="_blank" rel="noopener">打开预览</a>
    </div>
    <p v-if="pageCount > 1" class="pdf-note">预计 {{ pageCount }} 页，可继续导出。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { exportToPDF } from '../utils/pdf'

const props = defineProps<{ getElement: () => HTMLElement | null; filename?: string; pageCount?: number }>()
const loading = ref(false)
const pdfUrl = ref('')
const pdfFilename = ref('')

const pageCount = computed(() => props.pageCount ?? 1)

async function handleExport() {
  const el = props.getElement()
  if (!el) return
  loading.value = true
  try {
    revokeGeneratedPdf()
    const result = await exportToPDF(el, props.filename || '简历.pdf')
    pdfUrl.value = result.url
    pdfFilename.value = result.filename
  } catch (err) {
    console.error(err)
    alert('PDF 生成失败，请重试')
  } finally {
    loading.value = false
  }
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
  gap: 4px;
  justify-content: flex-end;
}

.btn-pdf {
  padding: 9px 18px;
  background: #0f2742;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-pdf:hover:not(:disabled) {
  background: #173a61;
}

.btn-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pdf-note {
  margin: 0;
  color: #64748b;
  font-size: 11px;
}

.pdf-result {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 11px;
}

.pdf-result a {
  color: #0f2742;
  font-weight: 650;
  text-decoration: none;
}

.pdf-result a:hover {
  text-decoration: underline;
}
</style>
