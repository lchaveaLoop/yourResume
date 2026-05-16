<template>
  <div class="export-actions" data-testid="export-actions">
    <PDFExporter :get-element="getElement" :filename="filename" :page-count="pageCount" />
    <DocxExporter :resume="resume" :filename="filename" />
  </div>
</template>

<script setup lang="ts">
import DocxExporter from './DocxExporter.vue'
import PDFExporter from './PDFExporter.vue'
import type { ResumeData } from '../../types/resume'

defineProps<{
  getElement: () => HTMLElement | null
  filename?: string
  pageCount?: number
  resume: ResumeData
}>()
</script>

<style scoped>
.export-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
</style>
