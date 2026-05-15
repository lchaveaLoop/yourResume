import type { ResumeData } from '../types/resume'
import { extractTargetRoleFromLine, isTargetRoleLabel } from './career'

/**
 * 解析 Markdown 格式简历文本，提取结构化数据
 */
export function parseMarkdown(text: string): ResumeData {
  const lines = text.split('\n')
  const data: ResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
  }

  let currentSection: keyof Pick<ResumeData, 'education' | 'experience' | 'skills' | 'projects'> | null = null
  let currentBlock: any = {}
  let expectTargetRole = false

  const sectionKeywords: Record<string, 'education' | 'experience' | 'skills' | 'projects'> = {
    '教育背景': 'education',
    '教育': 'education',
    '工作经历': 'experience',
    '工作': 'experience',
    '经历': 'experience',
    '项目经历': 'projects',
    '项目': 'projects',
    '技能': 'skills',
    '专业技能': 'skills',
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    if (expectTargetRole) {
      if (line.startsWith('## ')) {
        expectTargetRole = false
      } else {
        data.targetRole = line.replace(/^[-*•·]\s*/, '').trim()
        expectTargetRole = false
        continue
      }
    }

    const targetRole = extractTargetRoleFromLine(line)
    if (targetRole && !data.targetRole) {
      data.targetRole = targetRole
      continue
    }

    if (isTargetRoleLabel(line)) {
      expectTargetRole = true
      continue
    }

    // 一级标题 = 姓名
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      data.name = line.slice(2).trim()
      continue
    }

    // 联系方式行 - 邮箱
    if (line.includes('@') && !data.email) {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/)
      if (emailMatch) data.email = emailMatch[0]
    }

    // 联系方式行 - 电话
    if (!data.phone && /\d{3}[-\s]?\d{4}[-\s]?\d{4}/.test(line)) {
      const phoneMatch = line.match(/\d{3}[-\s]?\d{4}[-\s]?\d{4}|\d{11}/)
      if (phoneMatch) data.phone = phoneMatch[0]
    }

    // 二级标题 = 区块
    if (line.startsWith('## ')) {
      // 保存上一个 block
      if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
        flushBlock(data, currentSection, currentBlock)
      }

      const keyword = line.slice(3).trim()
      currentSection = sectionKeywords[keyword] || null
      currentBlock = {}
      continue
    }

    // 三级标题 = 公司/项目标题行 (### XXX - YYY - ZZZ)
    if (line.startsWith('### ')) {
      if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
        flushBlock(data, currentSection, currentBlock)
      }
      currentBlock = {}

      const parts = line.slice(4).trim().split(' - ')
      if (currentSection === 'experience') {
        currentBlock.company = parts[0] || ''
        currentBlock.title = parts[1] || ''
        currentBlock.duration = parts.slice(2).join(' - ') || ''
      } else if (currentSection === 'projects') {
        currentBlock.name = parts[0] || ''
        currentBlock.role = parts[1] || ''
        currentBlock.duration = parts.slice(2).join(' - ') || ''
      }
      continue
    }

    // 列表项
    if (line.startsWith('- ')) {
      const content = line.slice(2).trim()
      if (currentSection === 'skills') {
        data.skills.push(content)
      } else if (currentSection === 'education') {
        // 教育列表项: 学校 - 专业 · 学历 - 时间
        const parts = content.split(' - ')
        if (parts.length >= 2) {
          data.education.push({
            school: parts[0].trim(),
            degree: parts[1].trim(),
            duration: parts[2]?.trim() || '',
            details: '',
          })
        }
      } else if (currentSection) {
        currentBlock.details = currentBlock.details
          ? currentBlock.details + '\n' + content
          : content
      }
      continue
    }

    // 姓名行（非标题但可能是名字）
    if (!data.name && /^[\u4e00-\u9fa5]{2,4}(\s[\u4e00-\u9fa5]+)*$/.test(line)) {
      data.name = line
    }

    // 摘要/自我介绍
    if (line.startsWith('**摘要**') || line.startsWith('**简介**') || line.startsWith('**个人总结**')) {
      data.summary = line.replace(/^\*\*.*?\*\*[:：]?\s*/, '').trim()
      continue
    }

    // 公司/学校/项目名 检测
    if (currentSection && /^[「\"\'【《『]?[\u4e00-\u9fa5]{2,20}[\"\'】》』]?$/.test(line)) {
      if (currentSection === 'education' && !currentBlock.school) {
        currentBlock.school = line.replace(/[「」\"\'【】『』《》]/g, '')
      } else if (currentSection === 'experience' && !currentBlock.company) {
        currentBlock.company = line.replace(/[「」\"\'【】『』《》]/g, '')
      } else if (currentSection === 'projects' && !currentBlock.name) {
        currentBlock.name = line.replace(/[「」\"\'【】『』《》]/g, '')
      }
    }
  }

  // flush 最后一块
  if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
    flushBlock(data, currentSection, currentBlock)
  }

  return data
}

function hasBlockContent(block: Record<string, string>): boolean {
  return Object.values(block).some(v => v && v.trim().length > 0)
}

function flushBlock(
  data: ResumeData,
  section: keyof Pick<ResumeData, 'education' | 'experience' | 'projects'>,
  block: Record<string, string>
) {
  const details = block.details
    ? block.details.split('\n').filter(Boolean)
    : []

  if (section === 'education') {
    data.education.push({
      school: block.school || '',
      degree: block.degree || details[0] || '',
      duration: block.duration || '',
      details: details.slice(1).join('；'),
    })
  } else if (section === 'experience') {
    data.experience.push({
      company: block.company || '',
      title: block.title || details[0] || '',
      duration: block.duration || '',
      details,
    })
  } else if (section === 'projects') {
    data.projects.push({
      name: block.name || '',
      role: block.role || details[0] || '',
      duration: block.duration || '',
      details,
    })
  }
}
