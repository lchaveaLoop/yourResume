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

const productKeywords = [
  '产品',
  '产品经理',
  '用户研究',
  '需求',
  '增长',
  '转化',
  '数据分析',
  '原型',
  'roadmap',
  'prd',
  'ab测试',
  'a/b',
  '体验',
  '策略',
  '用户',
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

const financeKeywords = [
  '金融',
  '银行',
  '证券',
  '基金',
  '投研',
  '风控',
  '审计',
  '财务',
  '会计',
  '税务',
  '估值',
  '投资',
  '资产',
  '合规',
  'cfa',
  'cpa',
]

const educationKeywords = [
  '教育',
  '教师',
  '教研',
  '课程',
  '培训',
  '教学',
  '学术',
  '研究',
  '论文',
  '课题',
  '导师',
  '班主任',
  '学生',
  '高校',
  '讲师',
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

  const scores: Array<{ template: CareerTemplate; score: number }> = [
    { template: 'tech', score: scoreKeywords(weightedText, itKeywords) },
    { template: 'product', score: scoreKeywords(weightedText, productKeywords) },
    { template: 'marketing', score: scoreKeywords(weightedText, marketingKeywords) },
    { template: 'finance', score: scoreKeywords(weightedText, financeKeywords) },
    { template: 'education', score: scoreKeywords(weightedText, educationKeywords) },
  ]

  const best = scores.reduce((current, next) => next.score > current.score ? next : current)
  return best.score > 0 ? best.template : 'base'
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
