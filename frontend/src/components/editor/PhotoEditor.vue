<template>
  <h4>照片</h4>
  <div class="photo-upload">
    <img v-if="store.data.photo" :src="store.data.photo" class="photo-preview" alt="照片" />
    <input
      type="file"
      accept="image/*"
      class="photo-input"
      data-testid="resume-editor-photo-input"
      @change="handlePhotoUpload"
    />
    <button
      v-if="store.data.photo"
      type="button"
      class="btn-remove-photo"
      data-testid="resume-editor-photo-remove"
      @click="store.removePhoto()"
    >
      删除照片
    </button>
  </div>
</template>

<script setup lang="ts">
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
