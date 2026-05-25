import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeView from '../../src/views/HomeView.vue'
import { parseDocx } from '../../src/utils/docx'
import { parsePdf, PDF_OCR_UNSUPPORTED_MESSAGE } from '../../src/utils/pdf-import'
import { setupPinia } from '../helpers/setup-pinia'

vi.mock('../../src/utils/docx', () => ({
  parseDocx: vi.fn(),
}))

vi.mock('../../src/utils/pdf-import', () => ({
  PDF_OCR_UNSUPPORTED_MESSAGE: '未识别到可复制文本，扫描件 OCR 识别暂未支持。',
  parsePdf: vi.fn(),
}))

class TestResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('resume upload and parse errors', () => {
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

  it.each([
    {
      file: new File(['hello'], 'resume.exe', { type: 'application/octet-stream' }),
      message: '暂不支持该文件格式',
    },
    {
      file: new File([''], 'resume.md', { type: 'text/markdown' }),
      message: '文件内容为空',
    },
    {
      file: new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'resume.md', { type: 'text/markdown' }),
      message: '文件过大',
    },
  ])('shows a page error and stays on upload for $file.name', async ({ file, message }) => {
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    setInputFiles(wrapper.get<HTMLInputElement>('[data-testid="resume-upload-input"]').element, file)
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-upload-error"]').text()).toContain(message)
    expect(wrapper.find('[data-testid="resume-editor"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="resume-upload-zone"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('shows the parser error for damaged DOCX files', async () => {
    vi.mocked(parseDocx).mockRejectedValue(new Error('无法读取 docx 文档内容'))
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const file = new File(['not-docx'], 'broken.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    setInputFiles(wrapper.get<HTMLInputElement>('[data-testid="resume-upload-input"]').element, file)
    await flushPromises()

    expect(parseDocx).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="resume-upload-error"]').text()).toContain('无法读取 docx 文档内容')
    expect(wrapper.find('[data-testid="resume-editor"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('shows the OCR unsupported error for scanned PDFs', async () => {
    vi.mocked(parsePdf).mockRejectedValue(new Error(PDF_OCR_UNSUPPORTED_MESSAGE))
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const file = new File(['pdf'], 'scan.pdf', { type: 'application/pdf' })
    setInputFiles(wrapper.get<HTMLInputElement>('[data-testid="resume-upload-input"]').element, file)
    await flushPromises()

    expect(parsePdf).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="resume-upload-error"]').text()).toContain(PDF_OCR_UNSUPPORTED_MESSAGE)
    expect(wrapper.find('[data-testid="resume-editor"]').exists()).toBe(false)

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
