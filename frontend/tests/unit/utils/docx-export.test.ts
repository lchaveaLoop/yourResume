import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { createDocxBlob, normalizeDocxFilename } from '../../../src/utils/docx-export'
import { createTestResume } from '../../helpers/create-test-resume'

describe('docx export adapter', () => {
  it('normalizes DOCX filenames from export names', () => {
    expect(normalizeDocxFilename('林一_简历.pdf')).toBe('林一_简历.docx')
    expect(normalizeDocxFilename('Ada.docx')).toBe('Ada.docx')
    expect(normalizeDocxFilename('')).toBe('resume.docx')
  })

  it('generates a DOCX package from ResumeData', async () => {
    const blob = await createDocxBlob(createTestResume({
      name: '林一',
      targetRole: '前端开发工程师',
      summary: '三年前端开发经验。',
      skills: ['Vue', 'TypeScript'],
    }))
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const documentXml = await zip.file('word/document.xml')?.async('string')

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    expect(zip.file('[Content_Types].xml')).toBeTruthy()
    expect(zip.file('word/styles.xml')).toBeTruthy()
    expect(documentXml).toContain('林一')
    expect(documentXml).toContain('前端开发工程师')
    expect(documentXml).toContain('核心技能')
    expect(documentXml).toContain('Vue | TypeScript')
  })

  it('escapes XML-sensitive resume text', async () => {
    const blob = await createDocxBlob(createTestResume({
      name: 'A&B <工程师>',
      summary: '"安全" 与 \'兼容\'',
    }))
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const documentXml = await zip.file('word/document.xml')?.async('string')

    expect(documentXml).toContain('A&amp;B &lt;工程师&gt;')
    expect(documentXml).toContain('&quot;安全&quot; 与 &apos;兼容&apos;')
  })
})
