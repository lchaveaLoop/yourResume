<template>
  <div class="panel-section" data-testid="resume-editor">
    <div class="section-header">
      <h3>编辑简历</h3>
      <button type="button" class="btn-reset" @click="handleReset">重新上传</button>
    </div>
    <p class="filename">📄 {{ filename }}</p>

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
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.section-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.filename {
  font-size: 12px;
  color: #64748b;
  background: #e2e8f0;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.btn-reset {
  font-size: 12px;
  color: #64748b;
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
}

.btn-reset:hover {
  color: #4a6cf5;
  border-color: #4a6cf5;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-editor h4 {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add {
  font-size: 11px;
  background: none;
  border: none;
  color: #4a6cf5;
  cursor: pointer;
  font-weight: 400;
}

.btn-add:hover {
  text-decoration: underline;
}

.field-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.field-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #1a1a2e;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #4a6cf5;
}

.field-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #1a1a2e;
  background: #fff;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.field-textarea:focus {
  border-color: #4a6cf5;
}

.block-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
}

.btn-remove {
  align-self: flex-end;
  font-size: 11px;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  text-decoration: underline;
}

.skills-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-remove-sm {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.photo-preview {
  width: 100px;
  height: 130px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.photo-input {
  font-size: 11px;
  color: #64748b;
}

.btn-remove-photo {
  font-size: 11px;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
</style>
