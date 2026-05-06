import JSZip from 'jszip'
import type { ResumeData } from '../types/resume'

/**
 * 解析 .docx 文件，返回结构化简历数据
 */
export async function parseDocx(file: File): Promise<ResumeData> {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) throw new Error('无法读取 docx 文档内容')

  // 提取照片（尝试获取 word/media/ 下的第一张小图，超时 2s 跳过）
  let photo: string | undefined
  const mediaFolder = zip.folder('word/media')
  if (mediaFolder) {
    const files = mediaFolder.files
    const imageNames = Object.keys(files)
      .filter(n => /\.(png|jpg|jpeg)$/i.test(n))
      .sort() // image1.png 优先
    
    for (const name of imageNames) {
      try {
        const file = files[name]
        if (!file || file.dir) continue
        
        // 超时 2s，防止过大图片卡死
        const blob = await Promise.race([
          file.async('base64'),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 2000)
          )
        ])
        
        const ext = name.split('.').pop()?.toLowerCase()
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        photo = `data:${mime};base64,${blob}`
        break // 只取第一张成功的
      } catch {
        // 超时或错误，尝试下一张
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

  const data = parseLines(lines)
  if (photo) data.photo = photo
  return data
}

type Section = 'base' | 'education' | 'experience' | 'projects'

const SECTION_KEYWORDS: Record<string, Section> = {
  教育背景: 'education', 教育: 'education', 学校: 'education', 教育经历: 'education',
  工作经历: 'experience', 工作: 'experience', 经历: 'experience', 工作经验: 'experience',
  项目经历: 'projects', 项目: 'projects', 项目经验: 'projects',
  技能: 'base', 专业技能: 'base', 技能特长: 'base',
  自我评价: 'base', 个人简介: 'base', 简介: 'base',
}

/** 判断行是否为章节标题 */
function isSectionHeader(line: string): Section | null {
  if (line in SECTION_KEYWORDS) return SECTION_KEYWORDS[line]
  if (line.length > 20) return null
  for (const [kw, sec] of Object.entries(SECTION_KEYWORDS)) {
    if (line.includes(kw)) return sec
  }
  return null
}

/** 提取行首的时间范围，返回 { duration, rest } */
function extractDuration(line: string): { duration: string; rest: string } {
  // 优先匹配：YYYY.MM-至今（用 indexOf 避免 regex unicode 问题）
  const endIdx = line.indexOf('至今')
  if (endIdx !== -1 && endIdx < 12) {
    const duration = line.substring(0, endIdx + 2)
    const rest = line.substring(endIdx + 2).trim()
    return { duration, rest }
  }
  // 标准区间：YYYY.MM-YYYY.MM 或 YYYY.M.MM-YYYY.M.MM
  const m2 = line.match(/^(\d{4}\.\d(?:\.\d)?)\s*-\s*(\d{4}\.\d(?:\.\d)?)(.*)/)
  if (m2) return { duration: `${m2[1]}-${m2[2]}`, rest: (m2[3] || '').trim() }
  return { duration: '', rest: line }
}

function parseLines(lines: string[]): ResumeData {
  const data: ResumeData = {
    name: '', email: '', phone: '', location: '', summary: '',
    education: [], experience: [], skills: [], projects: [],
  }

  let section: Section = 'base'
  let currentEdu = { school: '', degree: '', duration: '', details: '' }
  let currentExp = { company: '', title: '', duration: '', details: [] as string[], detailsRaw: '' }
  let currentProj = { name: '', role: '', duration: '', details: [] as string[], detailsRaw: '' }
  let pendingExpDetails: string[] = []
  let pendingProjDetails: string[] = []
  let skipNext = false

  function flushEdu() {
    if (currentEdu.school || currentEdu.degree) data.education.push({ ...currentEdu })
    currentEdu = { school: '', degree: '', duration: '', details: '' }
  }

  function flushExp() {
    if (currentExp.company || currentExp.title) {
      currentExp.details = pendingExpDetails.filter(Boolean)
      currentExp.detailsRaw = currentExp.details.join('\n')
      data.experience.push({ ...currentExp })
    }
    currentExp = { company: '', title: '', duration: '', details: [], detailsRaw: '' }
    pendingExpDetails = []
  }

  function flushProj() {
    if (currentProj.name || currentProj.role) {
      currentProj.details = pendingProjDetails.filter(Boolean)
      currentProj.detailsRaw = currentProj.details.join('\n')
      data.projects.push({ ...currentProj })
    }
    currentProj = { name: '', role: '', duration: '', details: [], detailsRaw: '' }
    pendingProjDetails = []
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw.trim()) continue

    // 章节标题检测
    const hdr = isSectionHeader(raw)
    if (hdr) {
      if (section === 'education') flushEdu()
      if (section === 'experience') flushExp()
      if (section === 'projects') flushProj()
      section = hdr
      continue
    }

    // ===== base 区块 =====
    if (section === 'base') {
      if (!data.name) { data.name = raw; continue }
      const em = raw.match(/[\w.-]+@[\w.-]+\.\w+/)
      if (em && !data.email) data.email = em[0]
      const ph = raw.match(/\d{11}/)
      if (ph && !data.phone) data.phone = ph[0]
      // 只把纯短文本（<15字，无日期，无分隔符）作为 summary
      if (raw.length < 15 && !/\d{4}/.test(raw) && !raw.includes('|') && !data.summary) {
        data.summary = raw
      }
    }

    // ===== 教育经历 =====
    if (section === 'education') {
      const { duration, rest } = extractDuration(raw)
      if (duration) {
        flushEdu()
        currentEdu.duration = duration
        if (rest.includes('|')) {
          const parts = rest.split('|')
          currentEdu.school = parts[0].trim()
          currentEdu.degree = parts.slice(1).join('|').trim()
        } else {
          currentEdu.school = rest
        }
        continue
      }
      // 没有 duration 的行，可能是学历行
      if (raw.includes('|') || /大专|本科|硕士|博士/.test(raw)) {
        // 如果已经有 school，补充 degree；否则整个作为 school
        if (currentEdu.school) currentEdu.degree = raw.replace(/\s+/g, ' ')
        else currentEdu.school = raw
        continue
      }
      if (currentEdu.school && !currentEdu.degree) {
        currentEdu.degree = raw
      } else if (currentEdu.school) {
        currentEdu.details = currentEdu.details ? currentEdu.details + '；' + raw : raw
      }
    }

    // ===== 工作经历 =====
    if (section === 'experience') {
      // 跳过标记：遇到 duration 行后，下一行作为 title 但跳过，下下行继续
      if (skipNext) { skipNext = false; continue }

      const { duration, rest } = extractDuration(raw)
      if (duration) {
        flushExp()
        currentExp.duration = duration
        // rest 可能是"公司名" 或 "公司名|职位"
        if (rest.includes('|')) {
          const parts = rest.split('|')
          currentExp.company = parts[0].trim()
          currentExp.title = parts.slice(1).join('|').trim()
        } else if (rest.trim()) {
          currentExp.company = rest.trim()
          // 尝试从下一行取职位（下一行没有 duration 且不是列表项才取）
          const next = lines[i + 1]
          if (next && !isSectionHeader(next) && !extractDuration(next).duration && !/^\d+\./.test(next)) {
            if (next.includes('|')) {
              const tParts = next.split('|')
              currentExp.title = tParts[0].trim()
            } else {
              currentExp.title = next.trim()
            }
            skipNext = true // 下下行不要当 title 再处理
          }
        }
        continue
      }

      // 没有 duration 的行
      if (!currentExp.company && !currentExp.title) {
        if (raw.includes('|')) {
          const parts = raw.split('|')
          currentExp.company = parts[0].trim()
          currentExp.title = parts.slice(1).join('|').trim()
        } else {
          currentExp.company = raw
        }
        continue
      }

      // 编号列表项 → 工作内容
      if (/^\d+\./.test(raw)) {
        pendingExpDetails.push(raw.replace(/^\d+\./, '').trim())
        continue
      }

      // 其他内容 → 工作内容
      pendingExpDetails.push(raw)
    }

    // ===== 项目经历 =====
    if (section === 'projects') {
      if (skipNext) { skipNext = false; continue }

      const { duration, rest } = extractDuration(raw)
      if (duration) {
        flushProj()
        currentProj.duration = duration
        // rest: 项目名 [角色]
        if (rest.includes('|')) {
          const parts = rest.split('|')
          currentProj.name = parts[0].trim()
          currentProj.role = parts.slice(1).join('|').trim()
        } else {
          currentProj.name = rest
        }
        // 下一行可能是角色
        const next = lines[i + 1]
        if (next && !isSectionHeader(next) && !extractDuration(next).duration) {
          if (/主要开发人员|主要负责人|独立开发|参与/.test(next)) {
            currentProj.role = next.trim()
            skipNext = true
          }
        }
        continue
      }

      // 日期后面的行：可能是项目名、角色、或内容
      if (!currentProj.name) {
        if (/主要开发人员|主要负责人|独立开发|参与/.test(raw)) {
          currentProj.role = raw
        } else {
          currentProj.name = raw
        }
        continue
      }

      if (!currentProj.role && /主要开发人员|主要负责人|独立开发|参与/.test(raw)) {
        currentProj.role = raw
        continue
      }

      // 技术栈/平台行（冒号格式）
      if (/^[\u4e00-\u9fa5]{2,6}：/.test(raw) || /^开发/.test(raw)) {
        pendingProjDetails.push(raw)
        continue
      }

      // 工作内容 / 问题描述
      if (currentProj.name) {
        pendingProjDetails.push(raw)
      }
    }
  }

  if (section === 'education') flushEdu()
  if (section === 'experience') flushExp()
  if (section === 'projects') flushProj()

  return data
}
