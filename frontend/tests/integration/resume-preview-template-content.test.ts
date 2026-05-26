import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResumePreview from '../../src/components/preview/ResumePreview.vue'
import type { CareerTemplate } from '../../src/types/resume'
import { createTestResume } from '../helpers/create-test-resume'

const templates: CareerTemplate[] = ['base', 'tech', 'product', 'marketing', 'finance', 'education']

describe('ResumePreview template content rendering', () => {
  it.each(templates)('renders incoming resume content without rewriting it in %s template', (template) => {
    const resume = createTestResume({
      name: 'Input Name',
      targetRole: 'Plain Engineer',
      summary: 'Original summary with 42% number.',
      skills: ['Skill-A', 'Skill-B'],
      experience: [
        {
          company: 'Input Company',
          title: 'Input Title',
          duration: '2020-2024',
          details: ['exp-detail-1', 'exp-detail-2', 'exp-detail-3', 'exp-detail-4', 'exp-detail-5'],
        },
      ],
      projects: [
        {
          name: 'Input Project',
          role: 'Input Role',
          duration: '2024',
          details: ['proj-detail-1', 'proj-detail-2', 'proj-detail-3', 'proj-detail-4', 'proj-detail-5'],
        },
      ],
    })

    const wrapper = mount(ResumePreview, {
      props: {
        resume,
        template,
      },
    })
    const text = wrapper.text()

    expect(text).toContain('Input Name')
    expect(text).toContain('Plain Engineer')
    expect(text).not.toContain('高级 Plain Engineer')
    expect(text).not.toContain('C/C++')
    expect(text).not.toContain('市场商务岗位')
    expect(text).not.toContain('目标岗位')

    expect(text).toContain('exp-detail-5')
    expect(text).toContain('proj-detail-5')
    expect(wrapper.find('.metric-card').exists()).toBe(false)
  })

  it('does not inject placeholder name or role when incoming fields are empty', () => {
    const resume = createTestResume({
      name: '',
      targetRole: '',
    })

    const wrapper = mount(ResumePreview, {
      props: {
        resume,
        template: 'base',
      },
    })
    const text = wrapper.text()

    expect(text).not.toContain('姓名')
    expect(text).not.toContain('目标岗位')
  })
})
