import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockGetDocument = vi.fn()
const mockGetPage = vi.fn()
const mockGetTextContent = vi.fn()

vi.mock('pdfjs-dist', () => ({
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  GlobalWorkerOptions: {} as Record<string, unknown>,
}))

import { parsePdf, PDF_OCR_UNSUPPORTED_MESSAGE } from '../../../src/utils/pdf-import'

describe('parsePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts text from a text PDF and parses it into resume data', async () => {
    mockGetDocument.mockReturnValue({
      promise: {
        numPages: 1,
        getPage: mockGetPage,
      },
    })
    mockGetPage.mockResolvedValue({
      getTextContent: mockGetTextContent,
    })
    mockGetTextContent.mockResolvedValue({
      items: [
        { str: '林一', transform: [1, 0, 0, 1, 50, 780] },
        { str: 'lin.yi@example.com', transform: [1, 0, 0, 1, 50, 756] },
        { str: '13800000000', transform: [1, 0, 0, 1, 50, 732] },
        { str: '求职意向：前端开发工程师', transform: [1, 0, 0, 1, 50, 708] },
        { str: '工作经历', transform: [1, 0, 0, 1, 50, 660] },
        { str: '2022.07-2024.05 星河科技 | 前端开发工程师', transform: [1, 0, 0, 1, 50, 636] },
        { str: '负责 Vue 组件库建设', transform: [1, 0, 0, 1, 70, 612] },
        { str: '技能', transform: [1, 0, 0, 1, 50, 564] },
        { str: 'Vue TypeScript', transform: [1, 0, 0, 1, 50, 540] },
      ],
    })

    const file = new File(['fake pdf'], 'text-resume.pdf', { type: 'application/pdf' })
    const resume = await parsePdf(file)

    expect(resume.name).toBe('林一')
    expect(resume.email).toBe('lin.yi@example.com')
    expect(resume.phone).toBe('13800000000')
    expect(resume.targetRole).toBe('前端开发工程师')
  })

  it('reports OCR unsupported when a PDF has no extractable text', async () => {
    mockGetDocument.mockReturnValue({
      promise: {
        numPages: 1,
        getPage: mockGetPage,
      },
    })
    mockGetPage.mockResolvedValue({
      getTextContent: mockGetTextContent,
    })
    mockGetTextContent.mockResolvedValue({
      items: [],
    })

    const file = new File(['fake pdf'], 'empty.pdf', { type: 'application/pdf' })
    await expect(parsePdf(file)).rejects.toThrow(PDF_OCR_UNSUPPORTED_MESSAGE)
  })
})
