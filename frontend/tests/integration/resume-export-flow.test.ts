import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExportActions from '../../src/components/export/ExportActions.vue'
import { exportToPDF } from '../../src/utils/pdf'
import { exportToDOCX } from '../../src/utils/docx-export'

vi.mock('../../src/utils/pdf', () => ({
  exportToPDF: vi.fn(async () => ({
    blob: new Blob(['pdf'], { type: 'application/pdf' }),
    filename: 'Ada_Lovelace_resume.pdf',
    url: 'blob:test-pdf',
  })),
}))

vi.mock('../../src/utils/docx-export', () => ({
  exportToDOCX: vi.fn(async () => ({
    blob: new Blob(['docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    filename: 'Ada_Lovelace_resume.docx',
    url: 'blob:test-docx',
  })),
}))

describe('resume export flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
  })

  it('keeps PDF export wired to the rendered resume DOM', async () => {
    const previewElement = document.createElement('article')
    const wrapper = mount(ExportActions, {
      props: {
        getElement: () => previewElement,
        filename: 'Ada_Lovelace_resume.pdf',
        pageCount: 2,
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

    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    await flushPromises()

    expect(exportToPDF).toHaveBeenCalledTimes(1)
    expect(exportToPDF).toHaveBeenCalledWith(previewElement, 'Ada_Lovelace_resume.pdf')

    wrapper.unmount()
  })

  it('wires DOCX export to the resume data', async () => {
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

    expect(exportToDOCX).toHaveBeenCalledTimes(1)
    expect(exportToDOCX).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ada Lovelace' }), 'Ada_Lovelace_resume.pdf')

    wrapper.unmount()
  })
})
