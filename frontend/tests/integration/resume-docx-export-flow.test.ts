import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExportActions from '../../src/components/export/ExportActions.vue'

vi.mock('../../src/utils/docx-export', () => ({
  exportToDOCX: vi.fn(async () => ({
    blob: new Blob(['docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    filename: 'Ada_Lovelace_resume.docx',
    url: 'blob:test-docx',
  })),
}))

describe('resume docx export flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
  })

  it('shows DOCX download links after export', async () => {
    const wrapper = mount(ExportActions, {
      props: {
        getElement: () => document.createElement('article'),
        filename: 'Ada_Lovelace_resume.pdf',
        pageCount: 1,
        resume: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          phone: '',
          location: '',
          targetRole: 'Analyst',
          summary: '',
          education: [],
          experience: [],
          skills: [],
          projects: [],
        },
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-testid="export-docx-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('DOCX 已生成')
    expect(wrapper.text()).toContain('再次下载')

    wrapper.unmount()
  })
})
