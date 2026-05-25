export interface PdfPageInfo {
  pageCount: number
  pageHeightPx: number
  contentHeightPx: number
}

export interface PdfExportResult {
  blob: Blob
  filename: string
  url: string
}

export function estimatePdfPages(element: HTMLElement): PdfPageInfo {
  const rect = element.getBoundingClientRect()
  const elementWidth = firstFinitePositive(element.clientWidth, rect.width, 794)
  const pageHeightPx = elementWidth * (297 / 210)
  const contentHeightPx = firstFinitePositive(
    Math.max(element.scrollHeight, rect.height),
    element.scrollHeight,
    rect.height,
    pageHeightPx,
  )

  return {
    pageCount: Math.max(1, Math.ceil(contentHeightPx / pageHeightPx)),
    pageHeightPx,
    contentHeightPx,
  }
}

function firstFinitePositive(...values: number[]) {
  return values.find(value => Number.isFinite(value) && value > 0) ?? 1
}

/**
 * 将 DOM 元素导出为 PDF 文件
 */
export async function exportToPDF(element: HTMLElement, filename = 'resume.pdf'): Promise<PdfExportResult> {
  await waitForRenderAssets(element)
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(element, {
    scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // 单页直接渲染
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  } else {
    // 多页：按 A4 高度分页
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft)
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
  }

  const blob = pdf.output('blob')
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)

  return { blob, filename, url }
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

async function waitForRenderAssets(element: HTMLElement) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(images.map(waitForImage))
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve()
  }

  return new Promise(resolve => {
    const done = () => resolve()
    image.addEventListener('load', done, { once: true })
    image.addEventListener('error', done, { once: true })
  })
}
