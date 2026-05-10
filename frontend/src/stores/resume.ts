import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ResumeData } from '../types/resume'
import { defaultResume } from '../types/resume'

export const useResumeStore = defineStore('resume', () => {
  const data = ref<ResumeData>({ ...defaultResume })
  const template = ref<'classic' | 'modern' | 'minimal' | 'compact' | 'timeline' | 'bold'>('classic')

  function setResume(resume: ResumeData) {
    data.value = resume
  }

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    data.value[key] = value
  }

  function setTemplate(t: 'classic' | 'modern' | 'minimal' | 'compact' | 'timeline' | 'bold') {
    template.value = t
  }

  function reset() {
    data.value = { ...defaultResume }
  }

  return { data, template, setResume, updateField, setTemplate, reset }
})
