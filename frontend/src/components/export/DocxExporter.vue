<template>
  <div class="docx-actions">
    <button class="btn-docx" data-testid="export-docx-button" :disabled="loading" @click="handleExport">
      <span v-if="loading">正在生成 DOCX...</span>
      <span v-else>导出 DOCX</span>
    </button>
    <div v-if="docxUrl" class="docx-result">
      <span>DOCX 已生成</span>
      <a :href="docxUrl" :download="docxFilename">再次下载</a>
      <a :href="docxUrl" target="_blank" rel="noopener">打开文件</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { ResumeData } from '../../types/resume'
import { exportToDOCX } from '../../utils/docx-export'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  resume: ResumeData
  filename?: string
}>()

const loading = ref(false)
const docxUrl = ref('')
const docxFilename = ref('')
const toast = useToast()

async function handleExport() {
  loading.value = true
  try {
    revokeGeneratedDocx()
    const result = await exportToDOCX(props.resume, props.filename || '简历.docx')
    docxUrl.value = result.url
    docxFilename.value = result.filename
  } catch (err) {
    console.error(err)
    toast.error('DOCX 生成失败，请重试')
  } finally {
    loading.value = false
  }
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
  gap: 4px;
}

.btn-docx {
  padding: 9px 18px;
  color: #0f2742;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-docx:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-docx:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.docx-result {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 11px;
}

.docx-result a {
  color: #0f2742;
  font-weight: 650;
  text-decoration: none;
}

.docx-result a:hover {
  text-decoration: underline;
}
</style>
