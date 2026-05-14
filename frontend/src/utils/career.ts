import type { CareerTemplate, ResumeData } from '../types/resume'

const targetRoleLabels = [
  '求职意向',
  '目标岗位',
  '意向岗位',
  '应聘职位',
  '职业方向',
  '目标职位',
  '目标行业',
]

const itKeywords = [
  'it',
  '互联网',
  '软件',
  '硬件',
  '开发',
  '工程师',
  '前端',
  '后端',
  '全栈',
  'java',
  'python',
  'c++',
  'go',
  'golang',
  '算法',
  '数据',
  '架构',
  '运维',
  'devops',
  'vue',
  'react',
  'node',
  'typescript',
  '数据库',
  '测试',
  '研发',
  '程序员',
]

const marketingKeywords = [
  '市场',
  '营销',
  '品牌',
  '增长',
  '投放',
  '广告',
  '公关',
  '活动',
  '渠道',
  '商务',
  '运营',
  'campaign',
  'branding',
  'seo',
  'sem',
  '内容',
  '媒介',
  '用户增长',
  '市场经理',
  '品牌经理',
]

export function extractTargetRoleFromLine(line: string): string {
  const normalized = normalizeTargetRoleLine(line)

  for (const label of targetRoleLabels) {
    const match = normalized.match(new RegExp(`^${label}\\s*[:：|｜-]?\\s*(.+)$`, 'i'))
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return ''
}

export function isTargetRoleLabel(line: string): boolean {
  const normalized = normalizeTargetRoleLine(line).replace(/[:：|｜-]\s*$/, '')
  return targetRoleLabels.some(label => normalized === label)
}

export function inferCareerTemplate(resume: ResumeData): CareerTemplate {
  const weightedText = [
    resume.targetRole,
    resume.targetRole,
    resume.targetRole,
    resume.summary,
    ...resume.experience.flatMap(item => [item.title, item.company, ...item.details]),
    ...resume.projects.flatMap(item => [item.role, item.name, ...item.details]),
    ...resume.skills,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const itScore = scoreKeywords(weightedText, itKeywords)
  const marketingScore = scoreKeywords(weightedText, marketingKeywords)

  return marketingScore > itScore ? 'marketing' : 'it'
}

function normalizeTargetRoleLine(line: string): string {
  return line
    .replace(/^[-*•·]\s*/, '')
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .trim()
}

function scoreKeywords(text: string, keywords: string[]): number {
  return keywords.reduce((score, keyword) => {
    const normalized = keyword.toLowerCase()
    return text.includes(normalized) ? score + 1 : score
  }, 0)
}
