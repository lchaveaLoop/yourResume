<template>
  <div class="input-entry">
    <div
      class="upload-zone"
      data-testid="resume-upload-zone"
      :class="{ dragging: isDragging }"
      role="button"
      tabindex="0"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
      @keydown.enter.prevent="triggerInput"
      @keydown.space.prevent="triggerInput"
    >
      <input
        ref="fileInput"
        data-testid="resume-upload-input"
        type="file"
        accept=".md,.txt,.docx,.pdf"
        class="hidden-input"
        @change="handleFileChange"
      />
      <div class="upload-content">
        <span class="upload-icon" aria-hidden="true">
          <UploadCloud class="icon" />
        </span>
        <div>
          <p class="upload-title">拖入简历文件</p>
          <p class="upload-text">支持 Markdown、TXT、DOCX 和文本型 PDF，所有解析都在浏览器本地完成。</p>
        </div>
      </div>
      <div class="upload-footer">
        <span>.md</span>
        <span>.txt</span>
        <span>.docx</span>
        <span>.pdf</span>
      </div>
    </div>

    <button class="blank-entry-button" type="button" data-testid="resume-create-blank" @click="emit('blank-selected')">
      <FilePlus2 class="icon" aria-hidden="true" />
      新建空白简历
    </button>
  </div>
</template>

<script setup lang="ts">
import { FilePlus2, UploadCloud } from 'lucide-vue-next'
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'file-selected', content: string | File, filename: string): void
  (e: 'blank-selected'): void
  (e: 'file-error', message: string): void
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
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['md', 'txt', 'docx', 'pdf'].includes(ext)) {
    emit('file-error', '暂不支持该文件格式，请上传 .md / .txt / .docx / .pdf 简历')
    return
  }
  if (file.size === 0) {
    emit('file-error', '文件内容为空，请上传包含简历内容的文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    emit('file-error', '文件过大，请控制在 5MB 以内')
    return
  }
  if (ext === 'docx' || ext === 'pdf') {
    emit('file-selected', file, file.name)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    emit('file-selected', text, file.name)
  }
  reader.onerror = () => {
    emit('file-error', '文件读取失败，请重试')
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.input-entry {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 26px;
  min-height: 260px;
  padding: 24px;
  color: var(--color-ink);
  background:
    linear-gradient(#fff, #fff) padding-box,
    linear-gradient(145deg, rgba(31, 77, 115, 0.42), rgba(167, 121, 61, 0.52)) border-box;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.upload-zone:hover,
.upload-zone.dragging {
  transform: translateY(-2px);
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.13);
}

.upload-zone.dragging {
  background:
    linear-gradient(#f7fbff, #f7fbff) padding-box,
    linear-gradient(145deg, var(--color-brand-2), var(--color-accent)) border-box;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.upload-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  color: var(--color-brand);
  background: var(--color-panel-strong);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  flex-shrink: 0;
}

.upload-icon .icon {
  width: 25px;
  height: 25px;
}

.upload-title {
  color: var(--color-ink-strong);
  font-size: 22px;
  font-weight: 850;
  line-height: 1.18;
}

.upload-text {
  margin-top: 8px;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.7;
}

.upload-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-footer span {
  padding: 5px 9px;
  color: var(--color-brand-2);
  background: #f5f8fb;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.blank-entry-button {
  width: 100%;
}
</style>
