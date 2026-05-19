import JSZip from 'jszip'
import type { ResumeData } from '../types/resume'
import { parsePlainTextResume } from './plain-text-resume'

/**
 * 解析 .docx 文件，返回结构化简历数据
 */
export async function parseDocx(file: File): Promise<ResumeData> {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) throw new Error('无法读取 docx 文档内容')

  // 提取照片
  let photo: string | undefined
  const mediaFolder = zip.folder('word/media')
  if (mediaFolder) {
    const files = mediaFolder.files
    const imageNames = Object.keys(files)
      .filter(n => /\.(png|jpg|jpeg)$/i.test(n))
      .sort()
    for (const name of imageNames) {
      try {
        const file = files[name]
        if (!file || file.dir) continue
        const blob = await Promise.race([
          file.async('base64'),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 2000)
          )
        ])
        const ext = name.split('.').pop()?.toLowerCase()
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        photo = `data:${mime};base64,${blob}`
        break
      } catch {
        continue
      }
    }
  }

  // 提取所有段落文本
  const paras = xml.split(/<\/w:p>/)
  const lines: string[] = []
  for (const para of paras) {
    const ts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []
    const line = ts.map(m => m.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')).join('')
    if (line.trim()) lines.push(line.trim())
  }

  const data = parsePlainTextResume(lines)
  if (photo) data.photo = photo
  return data
}
