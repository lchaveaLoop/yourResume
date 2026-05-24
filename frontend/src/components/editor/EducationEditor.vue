<template>
  <section class="editor-group">
    <h4>
      教育经历
      <button type="button" class="btn-add" data-testid="resume-editor-add-education" @click="store.addEducation()">
        <Plus class="icon" aria-hidden="true" />
        添加
      </button>
    </h4>

    <div v-for="(education, index) in store.data.education" :key="index" class="block-card">
      <input
        class="field-input"
        :data-testid="`resume-editor-education-${index}-school`"
        :value="education.school"
        placeholder="学校"
        @input="store.updateEducation(index, { school: ($event.target as HTMLInputElement).value })"
      />
      <input
        class="field-input"
        :data-testid="`resume-editor-education-${index}-degree`"
        :value="education.degree"
        placeholder="学历 · 专业"
        @input="store.updateEducation(index, { degree: ($event.target as HTMLInputElement).value })"
      />
      <input
        class="field-input"
        :data-testid="`resume-editor-education-${index}-duration`"
        :value="education.duration"
        placeholder="时间"
        @input="store.updateEducation(index, { duration: ($event.target as HTMLInputElement).value })"
      />
      <button
        type="button"
        class="btn-remove"
        :data-testid="`resume-editor-education-${index}-remove`"
        @click="store.removeEducation(index)"
      >
        <Trash2 class="icon" aria-hidden="true" />
        删除
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { useResumeStore } from '../../stores/resume'

const store = useResumeStore()
</script>
