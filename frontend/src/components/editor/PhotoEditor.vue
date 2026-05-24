<template>
  <section class="editor-group">
    <h4>照片</h4>
    <div class="photo-upload">
      <img v-if="store.data.photo" :src="store.data.photo" class="photo-preview" alt="照片" />
      <div v-else class="photo-placeholder" aria-hidden="true">
        <ImageIcon class="icon" />
      </div>

      <div class="photo-controls">
        <label class="control-button photo-input-label">
          <Upload class="icon" aria-hidden="true" />
          上传照片
          <input
            type="file"
            accept="image/*"
            class="photo-input"
            data-testid="resume-editor-photo-input"
            @change="handlePhotoUpload"
          />
        </label>
        <p class="photo-hint">建议使用正面证件照或职业头像，导出时会嵌入简历版式。</p>
        <button
          v-if="store.data.photo"
          type="button"
          class="btn-remove-photo"
          data-testid="resume-editor-photo-remove"
          @click="store.removePhoto()"
        >
          <Trash2 class="icon" aria-hidden="true" />
          删除照片
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Image as ImageIcon, Trash2, Upload } from 'lucide-vue-next'
import { useResumeStore } from '../../stores/resume'

const store = useResumeStore()

function handlePhotoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    store.setPhoto(reader.result as string)
  }
  reader.readAsDataURL(file)
}
</script>
