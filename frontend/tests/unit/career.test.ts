import { describe, it, expect } from 'vitest'
import { extractTargetRoleFromLine, isTargetRoleLabel, inferCareerTemplate } from '../../src/utils/career'
import type { ResumeData } from '../../src/types/resume'

describe('extractTargetRoleFromLine', () => {
  it('extracts role from 求职意向: xxx', () => {
    expect(extractTargetRoleFromLine('求职意向：前端工程师')).toBe('前端工程师')
  })

  it('extracts role from 目标岗位: xxx', () => {
    expect(extractTargetRoleFromLine('目标岗位：后端开发')).toBe('后端开发')
  })

  it('extracts role from 意向岗位: xxx', () => {
    expect(extractTargetRoleFromLine('意向岗位: 产品经理')).toBe('产品经理')
  })

  it('extracts role from 应聘职位: xxx', () => {
    expect(extractTargetRoleFromLine('应聘职位：UI设计师')).toBe('UI设计师')
  })

  it('returns empty for non-matching lines', () => {
    expect(extractTargetRoleFromLine('这是普通文本')).toBe('')
  })
})

describe('isTargetRoleLabel', () => {
  it('detects 求职意向 as label', () => {
    expect(isTargetRoleLabel('求职意向')).toBe(true)
  })

  it('detects 目标岗位 as label', () => {
    expect(isTargetRoleLabel('目标岗位')).toBe(true)
  })

  it('returns false for non-label text', () => {
    expect(isTargetRoleLabel('前端工程师')).toBe(false)
  })
})

describe('inferCareerTemplate', () => {
  function makeResume(overrides: Partial<ResumeData> = {}): ResumeData {
    return {
      name: '', email: '', phone: '', location: '',
      targetRole: '', summary: '',
      education: [], experience: [], skills: [], projects: [],
      ...overrides,
    }
  }

  it('returns ats for IT-related resume', () => {
    const resume = makeResume({
      targetRole: '前端开发工程师',
      skills: ['Vue', 'React', 'TypeScript', 'Node.js'],
      experience: [{ company: 'X', title: '前端开发', duration: '2020-2023', details: ['开发Web应用'] }],
    })
    expect(inferCareerTemplate(resume)).toBe('ats')
  })

  it('returns ats for backend resume', () => {
    const resume = makeResume({
      targetRole: 'Java开发工程师',
      skills: ['Java', 'Spring Boot', 'MySQL'],
    })
    expect(inferCareerTemplate(resume)).toBe('ats')
  })

  it('returns marketing for marketing resume', () => {
    const resume = makeResume({
      targetRole: '市场经理',
      skills: ['品牌策划', '广告投放', 'SEO', 'SEM'],
      experience: [{ company: 'Y', title: '市场经理', duration: '2019-2022', details: ['品牌推广', '活动策划'] }],
    })
    expect(inferCareerTemplate(resume)).toBe('marketing')
  })

  it('returns ats for empty resume', () => {
    expect(inferCareerTemplate(makeResume())).toBe('ats')
  })
})
