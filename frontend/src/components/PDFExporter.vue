<template>
  <div class="pdf-actions">
    <button class="btn-pdf" :disabled="loading" @click="handleExport">
      <span v-if="loading">⏳ 生成中...</span>
      <span v-else>📥 导出 PDF</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportToPDF } from '../utils/pdf'

const props = defineProps<{ getElement: () => HTMLElement | null; filename?: string }>()
const loading = ref(false)

async function handleExport() {
  const el = props.getElement()
  if (!el) return
  loading.value = true
  try {
    await exportToPDF(el, props.filename || '简历.pdf')
  } catch (err) {
    console.error(err)
    alert('PDF 生成失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pdf-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-pdf {
  padding: 10px 20px;
  background: #4a6cf5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-pdf:hover:not(:disabled) {
  background: #3b5de7;
}

.btn-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
