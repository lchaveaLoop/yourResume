<template>
  <div class="input-entry">
    <div
      class="upload-zone"
      data-testid="resume-upload-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input ref="fileInput" data-testid="resume-upload-input" type="file" accept=".md,.txt,.docx,.pdf" class="hidden-input" @change="handleFileChange" />
      <div class="upload-content">
        <div class="upload-icon">📄</div>
        <p class="upload-text">拖拽简历文件到这里，或点击选择文件</p>
        <p class="upload-hint">支持 .md / .txt / .docx / .pdf 格式</p>
      </div>
    </div>

    <button class="blank-entry-button" type="button" data-testid="resume-create-blank" @click="emit('blank-selected')">
      新建空白简历
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'file-selected', content: string | File, filename: string): void
  (e: 'blank-selected'): void
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
  if (!ext || !['md', 'txt', 'docx', 'pdf'].includes(ext)) {
    alert('暂不支持该文件格式，请上传 .md / .txt / .docx / .pdf 简历')
    return
  }
  // docx / pdf 传递 File 对象，由父组件按类型解析
  if (ext === 'docx' || ext === 'pdf') {
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
.input-entry {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.blank-entry-button {
  width: 100%;
  padding: 10px 14px;
  color: #0f2742;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.blank-entry-button:hover {
  color: #173a61;
  background: #f8fafc;
  border-color: #94a3b8;
}
</style>
