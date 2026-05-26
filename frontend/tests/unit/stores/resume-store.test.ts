import { describe, expect, it, beforeEach } from 'vitest'
import { useResumeStore } from '../../../src/stores/resume'
import { setupPinia } from '../../helpers/setup-pinia'

describe('resume store', () => {
  beforeEach(() => {
    setupPinia()
  })

  it('normalizes resume data and infers template on setResume', () => {
    const store = useResumeStore()

    store.setResume({
      name: ' 林一 ',
      targetRole: '市场品牌经理',
      skills: [' 品牌策划 ', ''],
      experience: [{ detailsRaw: '投放增长\n品牌活动' }],
    })

    expect(store.data.name).toBe('林一')
    expect(store.data.skills).toEqual(['品牌策划'])
    expect(store.data.experience[0].details).toEqual(['投放增长', '品牌活动'])
    expect(store.template).toBe('marketing')
    expect(store.templateLocked).toBe(false)
  })

  it('does not override a manually locked template when target role changes', () => {
    const store = useResumeStore()

    store.setTemplate('finance')
    store.updateField('targetRole', '市场经理')

    expect(store.template).toBe('finance')
    expect(store.templateLocked).toBe(true)
  })

  it('restores draft data with a manually selected template', () => {
    const store = useResumeStore()

    store.restoreResumeDraft({
      name: '林一',
      targetRole: '前端开发工程师',
    }, 'senior', true)

    expect(store.data.name).toBe('林一')
    expect(store.template).toBe('tech')
    expect(store.templateLocked).toBe(true)

    store.updateField('targetRole', '市场品牌经理')

    expect(store.template).toBe('tech')
  })

  it('infers template for drafts without locked template metadata', () => {
    const store = useResumeStore()

    store.restoreResumeDraft({
      targetRole: '市场品牌经理',
    })

    expect(store.template).toBe('marketing')
    expect(store.templateLocked).toBe(false)
  })

  it('supports photo and list editing actions while preserving temporary empty rows', () => {
    const store = useResumeStore()

    store.setPhoto(' data:image/png;base64,abc ')
    const education = store.addEducation()
    const experience = store.addExperience()
    const project = store.addProject()
    const skillIndex = store.addSkill('')

    expect(store.data.photo).toBe('data:image/png;base64,abc')
    expect(education.school).toBe('')
    expect(experience.details).toEqual([])
    expect(project.details).toEqual([])
    expect(store.data.skills[skillIndex]).toBe('')

    store.updateEducation(0, { school: '复旦大学' })
    store.updateExperience(0, { company: '星河科技', title: '前端开发工程师' })
    store.setExperienceDetailsRaw(0, '负责组件库\n优化性能')
    store.updateProject(0, { name: '简历平台' })
    store.setProjectDetailsRaw(0, '设计编辑器')
    store.updateSkill(skillIndex, 'Vue')

    expect(store.data.education[0].school).toBe('复旦大学')
    expect(store.data.experience[0].details).toEqual(['负责组件库', '优化性能'])
    expect(store.data.projects[0].details).toEqual(['设计编辑器'])
    expect(store.data.skills).toEqual(['Vue'])

    store.removeEducation(0)
    store.removeExperience(0)
    store.removeProject(0)
    store.removeSkill(0)
    store.removePhoto()

    expect(store.data.education).toEqual([])
    expect(store.data.experience).toEqual([])
    expect(store.data.projects).toEqual([])
    expect(store.data.skills).toEqual([])
    expect(store.data.photo).toBeUndefined()
  })
})
