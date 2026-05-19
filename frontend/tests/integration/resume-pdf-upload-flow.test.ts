import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeView from '../../src/views/HomeView.vue'
import { parsePdf, PDF_OCR_UNSUPPORTED_MESSAGE } from '../../src/utils/pdf-import'
import { createTestResume } from '../helpers/create-test-resume'
import { setupPinia } from '../helpers/setup-pinia'

vi.mock('../../src/utils/pdf-import', () => ({
  PDF_OCR_UNSUPPORTED_MESSAGE: '未识别到可复制文本，扫描件 OCR 识别暂未支持。',
  parsePdf: vi.fn(),
}))

class TestResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('resume PDF upload flow', () => {
  beforeEach(() => {
    setupPinia()
    window.localStorage.clear()
    vi.stubGlobal('ResizeObserver', TestResizeObserver)
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('uploads a text PDF resume into the editor and preview', async () => {
    vi.mocked(parsePdf).mockResolvedValue(createTestResume({ name: 'PDF 候选人' }))

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const input = wrapper.get<HTMLInputElement>('[data-testid="resume-upload-input"]')
    const file = new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })
    setInputFiles(input.element, file)
    await flushPromises()

    expect(parsePdf).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="resume-editor-name"]').element).toHaveProperty('value', 'PDF 候选人')
    expect(wrapper.get('[data-testid="resume-preview"]').text()).toContain('PDF 候选人')

    wrapper.unmount()
  })

  it('shows an OCR unsupported error and stays on upload for image PDFs', async () => {
    vi.mocked(parsePdf).mockRejectedValue(new Error(PDF_OCR_UNSUPPORTED_MESSAGE))

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const input = wrapper.get<HTMLInputElement>('[data-testid="resume-upload-input"]')
    const file = new File(['pdf'], 'scan.pdf', { type: 'application/pdf' })
    setInputFiles(input.element, file)
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-upload-error"]').text()).toContain(PDF_OCR_UNSUPPORTED_MESSAGE)
    expect(wrapper.find('[data-testid="resume-editor"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="resume-upload-zone"]').exists()).toBe(true)

    wrapper.unmount()
  })
})

function setInputFiles(input: HTMLInputElement, ...files: File[]) {
  Object.defineProperty(input, 'files', {
    value: files,
    writable: false,
    configurable: true,
  })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
