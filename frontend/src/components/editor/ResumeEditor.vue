<template>
  <div class="panel-section" data-testid="resume-editor">
    <div class="section-header">
      <div>
        <h3>编辑简历</h3>
        <p class="section-subtitle">修改字段后，右侧预览会自动更新。</p>
      </div>
      <button type="button" class="control-button ghost reset-button btn-reset" @click="handleReset">
        <RotateCcw class="icon" aria-hidden="true" />
        重新上传
      </button>
    </div>

    <p class="filename">
      <FileText class="icon" aria-hidden="true" />
      {{ filename }}
    </p>

    <div class="field-editor">
      <BasicInfoEditor />
      <PhotoEditor />
      <EducationEditor />
      <ExperienceEditor />
      <ProjectEditor />
      <SkillsEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, RotateCcw } from 'lucide-vue-next'
import { useResumeStore } from '../../stores/resume'
import BasicInfoEditor from './BasicInfoEditor.vue'
import EducationEditor from './EducationEditor.vue'
import ExperienceEditor from './ExperienceEditor.vue'
import PhotoEditor from './PhotoEditor.vue'
import ProjectEditor from './ProjectEditor.vue'
import SkillsEditor from './SkillsEditor.vue'

defineProps<{
  filename: string
}>()

const store = useResumeStore()
const emit = defineEmits<{ (e: 'reset'): void }>()

function handleReset() {
  store.reset()
  emit('reset')
}
</script>

<style>
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.section-header h3 {
  color: var(--color-ink-strong);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 4px;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.45;
}

.reset-button {
  min-height: 32px;
  padding: 7px 10px;
  flex-shrink: 0;
}

.filename {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--color-muted);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  font-size: 12px;
  font-weight: 750;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.filename .icon {
  color: var(--color-brand-2);
  flex-shrink: 0;
}

.field-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.editor-group {
  padding: 14px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.editor-group h4,
.field-editor > h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  color: var(--color-ink-strong);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.field-pair {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 800;
}

.field-input,
.field-textarea {
  width: 100%;
  color: var(--color-ink);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.field-input {
  min-height: 38px;
  padding: 8px 10px;
  font-size: 13px;
}

.field-textarea {
  min-height: 86px;
  padding: 9px 10px;
  resize: vertical;
  font-size: 13px;
  line-height: 1.55;
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: #a1acba;
}

.field-input:focus,
.field-textarea:focus {
  border-color: rgba(31, 77, 115, 0.58);
  box-shadow: 0 0 0 3px rgba(31, 77, 115, 0.1);
}

.btn-add,
.btn-remove,
.btn-remove-sm,
.btn-remove-photo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 28px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.btn-add {
  padding: 5px 8px;
  color: var(--color-brand-2);
  background: #fff;
  border: 1px solid var(--color-border);
}

.btn-add:hover {
  color: var(--color-brand);
  border-color: var(--color-border-strong);
}

.block-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 10px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.btn-remove {
  align-self: flex-end;
  padding: 5px 8px;
  color: var(--color-danger);
  background: #fff;
  border: 1px solid rgba(180, 35, 24, 0.2);
}

.btn-remove:hover,
.btn-remove-photo:hover {
  background: #fff4f2;
  border-color: rgba(180, 35, 24, 0.36);
}

.skills-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-row {
  display: flex;
  gap: 7px;
  align-items: center;
}

.btn-remove-sm {
  width: 34px;
  min-width: 34px;
  color: var(--color-danger);
  background: #fff;
  border: 1px solid rgba(180, 35, 24, 0.2);
}

.photo-upload {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.photo-preview,
.photo-placeholder {
  width: 92px;
  height: 116px;
  object-fit: cover;
  background: var(--color-panel-strong);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.photo-placeholder {
  display: grid;
  place-items: center;
  color: var(--color-muted);
}

.photo-placeholder .icon {
  width: 24px;
  height: 24px;
}

.photo-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.photo-input-label {
  position: relative;
  overflow: hidden;
}

.photo-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.photo-hint {
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.5;
}

.btn-remove-photo {
  padding: 5px 8px;
  color: var(--color-danger);
  background: #fff;
  border: 1px solid rgba(180, 35, 24, 0.2);
}
</style>
