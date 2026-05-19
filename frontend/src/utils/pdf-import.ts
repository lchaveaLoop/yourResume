import type { ResumeData } from '../types/resume'
import { parsePlainTextResume } from './plain-text-resume'

export const PDF_OCR_UNSUPPORTED_MESSAGE =
  '未识别到可复制文本，扫描件 OCR 识别暂未支持。'

type PdfTextItem = {
  str?: string
  transform?: number[]
}

type PdfJsModule = typeof import('pdfjs-dist')

let workerConfigured = false

export async function parsePdf(file: File): Promise<ResumeData> {
  const pdfjs = await loadPdfJs()
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const lines: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    lines.push(...itemsToLines(content.items as PdfTextItem[]))
  }

  if (!lines.some(line => line.trim())) {
    throw new Error(PDF_OCR_UNSUPPORTED_MESSAGE)
  }

  return parsePlainTextResume(lines)
}

async function loadPdfJs(): Promise<PdfJsModule> {
  const pdfjs = await import('pdfjs-dist')

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = await resolvePdfWorkerSrc()
    workerConfigured = true
  }

  return pdfjs
}

async function resolvePdfWorkerSrc() {
  const processLike = (globalThis as typeof globalThis & {
    process?: { cwd?: () => string; env?: Record<string, string | undefined> }
  }).process

  if (processLike?.env?.VITEST && processLike.cwd) {
    const cwd = processLike.cwd().replace(/\\/g, '/')
    return `file:///${cwd}/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
  }

  const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  return workerUrl.default
}

function itemsToLines(items: PdfTextItem[]): string[] {
  const rows = new Map<number, Array<{ x: number; text: string }>>()

  for (const item of items) {
    const text = item.str?.trim()
    const transform = item.transform
    if (!text || !transform || transform.length < 6) continue

    const x = transform[4]
    const y = Math.round(transform[5])
    const row = rows.get(y) ?? []
    row.push({ x, text })
    rows.set(y, row)
  }

  return Array.from(rows.entries())
    .sort(([a], [b]) => b - a)
    .map(([, row]) => row
      .sort((a, b) => a.x - b.x)
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
}
