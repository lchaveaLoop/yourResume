<template>
  <div class="upload-zone" :class="{ dragging: isDragging }" @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false" @drop.prevent="handleDrop" @click="triggerInput">
    <input ref="fileInput" type="file" accept=".md,.docx,.txt" class="hidden-input" @change="handleFileChange" />
    <div class="upload-content">
      <div class="upload-icon">📄</div>
      <p class="upload-text">拖拽简历文件到这里，或点击选择文件</p>
      <p class="upload-hint">支持 .md / .docx 格式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'file-selected', content: string | File, filename: string): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerInput() {
  fileInput.value?.click()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    alert('文件过大，请控制在 5MB 以内')
    return
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  // docx 传递 File 对象，由父组件用 jszip 解析
  if (ext === 'docx') {
    emit('file-selected', file, file.name)
    return
  }
  // md / txt 读取为文本
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    emit('file-selected', text, file.name)
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.upload-zone:hover,
.dragging {
  border-color: #4a6cf5;
  background: #eff6ff;
}

.hidden-input {
  display: none;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 13px;
  color: #94a3b8;
}
</style>
