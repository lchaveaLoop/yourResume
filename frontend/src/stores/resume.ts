import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CareerTemplate, Education, Experience, Project, ResumeData } from '../types/resume'
import { inferCareerTemplate } from '../utils/career'
import { normalizeResume, type ResumeInput } from '../utils/resume-normalizer'

export const useResumeStore = defineStore('resume', () => {
  const data = ref<ResumeData>(normalizeResume())
  const template = ref<CareerTemplate>('ats')
  const templateLocked = ref(false)

  function setResume(resume: ResumeInput | null | undefined) {
    data.value = normalizeResume(resume)
    template.value = inferCareerTemplate(data.value)
    templateLocked.value = false
  }

  function restoreResumeDraft(
    resume: ResumeInput | null | undefined,
    restoredTemplate?: CareerTemplate,
    restoredTemplateLocked = false,
  ) {
    data.value = normalizeResume(resume)
    template.value = restoredTemplate ?? inferCareerTemplate(data.value)
    templateLocked.value = Boolean(restoredTemplate && restoredTemplateLocked)
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

  function setPhoto(photo?: string) {
    data.value.photo = photo?.trim() || undefined
  }

  function removePhoto() {
    data.value.photo = undefined
  }

  function addEducation(education: Partial<Education> = {}) {
    const entry = normalizeEducationEntry(education)
    data.value.education.push(entry)
    return entry
  }

  function updateEducation(index: number, patch: Partial<Education>) {
    const current = data.value.education[index]
    if (!current) return

    data.value.education[index] = normalizeEducationEntry({ ...current, ...patch })
  }

  function removeEducation(index: number) {
    removeAt(data.value.education, index)
  }

  function addExperience(experience: Partial<Experience> = {}) {
    const entry = normalizeExperienceEntry(experience)
    data.value.experience.push(entry)
    return entry
  }

  function updateExperience(index: number, patch: Partial<Experience>) {
    const current = data.value.experience[index]
    if (!current) return

    const next: Partial<Experience> = { ...current, ...patch }
    if ('details' in patch && !('detailsRaw' in patch)) {
      delete next.detailsRaw
    }

    data.value.experience[index] = normalizeExperienceEntry(next)
  }

  function updateExperienceDetails(index: number, details: string[] | string) {
    const current = data.value.experience[index]
    if (!current) return

    const next: Partial<Experience> = {
      ...current,
      details: Array.isArray(details) ? details : details.split(/\r?\n/),
    }
    delete next.detailsRaw

    data.value.experience[index] = normalizeExperienceEntry(next)
  }

  function setExperienceDetailsRaw(index: number, detailsRaw: string) {
    const current = data.value.experience[index]
    if (!current) return

    data.value.experience[index] = normalizeExperienceEntry({ ...current, detailsRaw })
  }

  function removeExperience(index: number) {
    removeAt(data.value.experience, index)
  }

  function addProject(project: Partial<Project> = {}) {
    const entry = normalizeProjectEntry(project)
    data.value.projects.push(entry)
    return entry
  }

  function updateProject(index: number, patch: Partial<Project>) {
    const current = data.value.projects[index]
    if (!current) return

    const next: Partial<Project> = { ...current, ...patch }
    if ('details' in patch && !('detailsRaw' in patch)) {
      delete next.detailsRaw
    }

    data.value.projects[index] = normalizeProjectEntry(next)
  }

  function updateProjectDetails(index: number, details: string[] | string) {
    const current = data.value.projects[index]
    if (!current) return

    const next: Partial<Project> = {
      ...current,
      details: Array.isArray(details) ? details : details.split(/\r?\n/),
    }
    delete next.detailsRaw

    data.value.projects[index] = normalizeProjectEntry(next)
  }

  function setProjectDetailsRaw(index: number, detailsRaw: string) {
    const current = data.value.projects[index]
    if (!current) return

    data.value.projects[index] = normalizeProjectEntry({ ...current, detailsRaw })
  }

  function removeProject(index: number) {
    removeAt(data.value.projects, index)
  }

  function addSkill(skill = '') {
    data.value.skills.push(skill)
    return data.value.skills.length - 1
  }

  function updateSkill(index: number, skill: string) {
    if (!isValidIndex(data.value.skills, index)) return
    data.value.skills[index] = skill
  }

  function removeSkill(index: number) {
    removeAt(data.value.skills, index)
  }

  function reset() {
    data.value = normalizeResume()
    template.value = 'ats'
    templateLocked.value = false
  }

  return {
    data,
    template,
    templateLocked,
    setResume,
    restoreResumeDraft,
    updateField,
    setTemplate,
    setPhoto,
    removePhoto,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    updateExperienceDetails,
    setExperienceDetailsRaw,
    removeExperience,
    addProject,
    updateProject,
    updateProjectDetails,
    setProjectDetailsRaw,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    reset,
  }
})

function normalizeEducationEntry(education: Partial<Education>): Education {
  return normalizeResume({ education: [education] }).education[0] ?? {
    school: '',
    degree: '',
    duration: '',
    details: '',
  }
}

function normalizeExperienceEntry(experience: Partial<Experience>): Experience {
  return normalizeResume({ experience: [experience] }).experience[0] ?? {
    company: '',
    title: '',
    duration: '',
    details: [],
    detailsRaw: '',
  }
}

function normalizeProjectEntry(project: Partial<Project>): Project {
  return normalizeResume({ projects: [project] }).projects[0] ?? {
    name: '',
    role: '',
    duration: '',
    details: [],
    detailsRaw: '',
  }
}

function removeAt<T>(items: T[], index: number) {
  if (!isValidIndex(items, index)) return
  items.splice(index, 1)
}

function isValidIndex<T>(items: T[], index: number) {
  return Number.isInteger(index) && index >= 0 && index < items.length
}
