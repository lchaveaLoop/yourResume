import type { ResumeData } from '../types/resume'
import { normalizeResume } from './resume-normalizer'

export interface DocxExportResult {
  blob: Blob
  filename: string
  url: string
}

interface DocumentParagraph {
  text?: string
  style?: 'Title' | 'Heading1' | 'Normal' | 'ListParagraph'
  bullet?: boolean
}

export async function exportToDOCX(
  resume: ResumeData,
  filename = 'resume.docx',
): Promise<DocxExportResult> {
  const normalized = normalizeResume(resume)
  const docx = await createDocxBlob(normalized)
  const resolvedFilename = normalizeDocxFilename(filename)
  const url = URL.createObjectURL(docx)
  triggerDownload(url, resolvedFilename)

  return {
    blob: docx,
    filename: resolvedFilename,
    url,
  }
}

export async function createDocxBlob(resume: ResumeData): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const normalized = normalizeResume(resume)

  zip.file('[Content_Types].xml', contentTypesXml())
  zip.folder('_rels')?.file('.rels', packageRelsXml())
  zip.folder('docProps')?.file('core.xml', corePropsXml(normalized))
  zip.folder('docProps')?.file('app.xml', appPropsXml())

  const word = zip.folder('word')
  word?.file('document.xml', documentXml(normalized))
  word?.file('styles.xml', stylesXml())
  word?.file('numbering.xml', numberingXml())
  word?.folder('_rels')?.file('document.xml.rels', documentRelsXml())

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  })
}

export function normalizeDocxFilename(filename: string): string {
  const trimmed = filename.trim() || 'resume.docx'
  const withoutPdf = trimmed.replace(/\.pdf$/i, '')
  return /\.docx$/i.test(withoutPdf) ? withoutPdf : `${withoutPdf}.docx`
}

function documentXml(resume: ResumeData): string {
  const paragraphs = buildResumeParagraphs(resume)
    .map(paragraphXml)
    .join('')

  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`)
}

function buildResumeParagraphs(resume: ResumeData): DocumentParagraph[] {
  const paragraphs: DocumentParagraph[] = []
  const contact = [resume.location, resume.phone, resume.email].filter(Boolean).join(' | ')

  paragraphs.push({ text: resume.name || '姓名', style: 'Title' })
  if (resume.targetRole) paragraphs.push({ text: resume.targetRole })
  if (contact) paragraphs.push({ text: contact })

  addSection(paragraphs, '职业摘要', resume.summary ? [{ text: resume.summary }] : [])
  addSection(paragraphs, '核心技能', resume.skills.length ? [{ text: resume.skills.join(' | ') }] : [])
  addSection(
    paragraphs,
    '工作经历',
    resume.experience.flatMap(item => [
      { text: joinParts([item.company, item.title, item.duration]), style: 'Normal' as const },
      ...item.details.map(detail => ({ text: detail, bullet: true, style: 'ListParagraph' as const })),
    ]),
  )
  addSection(
    paragraphs,
    '项目经历',
    resume.projects.flatMap(item => [
      { text: joinParts([item.name, item.role, item.duration]), style: 'Normal' as const },
      ...item.details.map(detail => ({ text: detail, bullet: true, style: 'ListParagraph' as const })),
    ]),
  )
  addSection(
    paragraphs,
    '教育经历',
    resume.education.map(item => ({
      text: joinParts([item.school, item.degree, item.duration, item.details]),
    })),
  )

  return paragraphs
}

function addSection(
  paragraphs: DocumentParagraph[],
  title: string,
  content: DocumentParagraph[],
) {
  if (!content.length) return

  paragraphs.push({ text: title, style: 'Heading1' })
  paragraphs.push(...content.filter(item => item.text))
}

function paragraphXml(paragraph: DocumentParagraph): string {
  const styleXml = paragraph.style ? `<w:pStyle w:val="${paragraph.style}"/>` : ''
  const bulletXml = paragraph.bullet ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : ''
  const properties = styleXml || bulletXml ? `<w:pPr>${styleXml}${bulletXml}</w:pPr>` : ''

  return `<w:p>${properties}<w:r><w:t xml:space="preserve">${escapeXml(paragraph.text ?? '')}</w:t></w:r></w:p>`
}

function stylesXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Aptos" w:eastAsia="Microsoft YaHei" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="160"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/><w:rFonts w:ascii="Aptos Display" w:eastAsia="Microsoft YaHei"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="174A78"/><w:sz w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
  </w:style>
</w:styles>`)
}

function contentTypesXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`)
}

function packageRelsXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`)
}

function documentRelsXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`)
}

function corePropsXml(resume: ResumeData): string {
  const title = resume.name ? `${resume.name} Resume` : 'Resume'
  const created = new Date().toISOString()

  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>yourResume</dc:creator>
  <cp:lastModifiedBy>yourResume</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified>
</cp:coreProperties>`)
}

function appPropsXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>yourResume</Application>
</Properties>`)
}

function numberingXml(): string {
  return xmlDocument(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`)
}

function joinParts(parts: Array<string | undefined>): string {
  return parts.map(part => part?.trim()).filter(Boolean).join(' | ')
}

function normalizeDocxText(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

function escapeXml(value: string): string {
  return normalizeDocxText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function xmlDocument(xml: string): string {
  return xml.trim()
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
