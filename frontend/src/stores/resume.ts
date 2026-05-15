import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CareerTemplate, ResumeData } from '../types/resume'
import { defaultResume } from '../types/resume'
import { inferCareerTemplate } from '../utils/career'

export const useResumeStore = defineStore('resume', () => {
  const data = ref<ResumeData>({ ...defaultResume })
  const template = ref<CareerTemplate>('ats')
  const templateLocked = ref(false)

  function setResume(resume: ResumeData) {
    data.value = { ...defaultResume, ...resume }
    template.value = inferCareerTemplate(data.value)
    templateLocked.value = false
  }

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    data.value[key] = value
    if (!templateLocked.value && key === 'targetRole') {
      template.value = inferCareerTemplate(data.value)
    }
  }

  function setTemplate(t: CareerTemplate) {
    template.value = t
    templateLocked.value = true
  }

  function reset() {
    data.value = { ...defaultResume }
    template.value = 'ats'
    templateLocked.value = false
  }

  return { data, template, templateLocked, setResume, updateField, setTemplate, reset }
})
