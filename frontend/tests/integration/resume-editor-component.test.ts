import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ResumeEditor from '../../src/components/editor/ResumeEditor.vue'
import { useResumeStore } from '../../src/stores/resume'
import { createTestResume } from '../helpers/create-test-resume'
import { setupPinia } from '../helpers/setup-pinia'

describe('ResumeEditor component', () => {
  beforeEach(() => {
    setupPinia()
  })

  it('updates store state through editor actions', async () => {
    const store = useResumeStore()
    store.setResume(createTestResume({
      targetRole: '',
      summary: '',
      experience: [{
        company: '',
        title: '',
        duration: '',
        details: [],
      }],
      projects: [],
      skills: ['协作', '表达'],
    }))

    const wrapper = mount(ResumeEditor, {
      props: {
        filename: 'basic-resume.md',
      },
    })

    expect(wrapper.get('[data-testid="resume-editor"]').text()).toContain('basic-resume.md')

    await wrapper.get('[data-testid="resume-editor-target-role"]').setValue('市场品牌经理')
    await wrapper.get('[data-testid="resume-editor-experience-0-details"]').setValue('负责端到端测试\n提升交付稳定性')
    await wrapper.get('[data-testid="resume-editor-add-skill"]').trigger('click')
    await wrapper.get('[data-testid="resume-editor-skill-2"]').setValue('Playwright')

    expect(store.data.targetRole).toBe('市场品牌经理')
    expect(store.template).toBe('marketing')
    expect(store.data.experience[0].details).toEqual(['负责端到端测试', '提升交付稳定性'])
    expect(store.data.skills).toEqual(['协作', '表达', 'Playwright'])
  })

  it('resets resume state from the editor shell', async () => {
    const store = useResumeStore()
    store.setResume(createTestResume())

    const wrapper = mount(ResumeEditor, {
      props: {
        filename: 'basic-resume.md',
      },
    })

    await wrapper.get('.btn-reset').trigger('click')

    expect(store.data.name).toBe('')
    expect(store.data.experience).toEqual([])
    expect(store.template).toBe('ats')
    expect(store.templateLocked).toBe(false)
  })
})
