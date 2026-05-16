import { describe, expect, it } from 'vitest'
import { normalizeResume } from '../../../src/utils/resume-normalizer'

describe('normalizeResume', () => {
  it('fills missing resume fields with defaults and fresh arrays', () => {
    const resume = normalizeResume()

    expect(resume.name).toBe('')
    expect(resume.education).toEqual([])
    expect(resume.experience).toEqual([])
    expect(resume.projects).toEqual([])
    expect(resume.skills).toEqual([])

    const another = normalizeResume()
    expect(another.skills).not.toBe(resume.skills)
  })

  it('trims strings and filters empty skills', () => {
    const resume = normalizeResume({
      name: '  林一  ',
      skills: [' Vue ', '', '  ', 'TypeScript'],
    })

    expect(resume.name).toBe('林一')
    expect(resume.skills).toEqual(['Vue', 'TypeScript'])
  })

  it('converts detailsRaw to normalized details for experience and projects', () => {
    const resume = normalizeResume({
      experience: [{ company: 'A', detailsRaw: ' 第一条 \n\n 第二条 ' }],
      projects: [{ name: 'P', detailsRaw: '  项目一\r\n项目二  ' }],
    })

    expect(resume.experience[0].details).toEqual(['第一条', '第二条'])
    expect(resume.experience[0].detailsRaw).toBe('第一条\n第二条')
    expect(resume.projects[0].details).toEqual(['项目一', '项目二'])
    expect(resume.projects[0].detailsRaw).toBe('项目一\n项目二')
  })

  it('fills detailsRaw from details when raw text is not provided', () => {
    const resume = normalizeResume({
      experience: [{ details: [' 负责组件库 ', '', '优化性能'] }],
    })

    expect(resume.experience[0].details).toEqual(['负责组件库', '优化性能'])
    expect(resume.experience[0].detailsRaw).toBe('负责组件库\n优化性能')
  })

  it('keeps photo as an optional data value and is idempotent', () => {
    const first = normalizeResume({
      photo: ' data:image/png;base64,abc ',
      skills: ['Vue', ''],
      experience: [{ detailsRaw: 'A\nB' }],
    })
    const second = normalizeResume(first)

    expect(first.photo).toBe('data:image/png;base64,abc')
    expect(second).toEqual(first)
  })
})
