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
    await flushExportTask()

    expect(exportToPDF).toHaveBeenCalledTimes(1)
    expect(exportToPDF).toHaveBeenCalledWith(previewElement, 'Ada_Lovelace_resume.pdf')

    wrapper.unmount()
  })

  it('shows a visible PDF export error and allows retry', async () => {
    vi.mocked(exportToPDF)
      .mockRejectedValueOnce(new Error('render failed'))
      .mockResolvedValueOnce({
        blob: new Blob(['pdf'], { type: 'application/pdf' }),
        filename: 'Ada_Lovelace_resume.pdf',
        url: 'blob:test-pdf-retry',
      })
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

    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    await flushExportTask()

    expect(wrapper.get('[data-testid="export-pdf-error"]').text()).toContain('PDF 生成失败，请重试')
    expect(wrapper.get('[data-testid="export-pdf-button"]').attributes('disabled')).toBeUndefined()

    await wrapper.get('[data-testid="export-pdf-button"]').trigger('click')
    await flushExportTask()

    expect(wrapper.find('[data-testid="export-pdf-error"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('PDF 已生成')

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

  it('shows a visible DOCX export error and allows retry', async () => {
    vi.mocked(exportToDOCX)
      .mockRejectedValueOnce(new Error('zip failed'))
      .mockResolvedValueOnce({
        blob: new Blob(['docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        filename: 'Ada_Lovelace_resume.docx',
        url: 'blob:test-docx-retry',
      })
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

    expect(wrapper.get('[data-testid="export-docx-error"]').text()).toContain('DOCX 生成失败，请重试')
    expect(wrapper.get('[data-testid="export-docx-button"]').attributes('disabled')).toBeUndefined()

    await wrapper.get('[data-testid="export-docx-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="export-docx-error"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('DOCX 已生成')

    wrapper.unmount()
  })
})

async function flushExportTask() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}
