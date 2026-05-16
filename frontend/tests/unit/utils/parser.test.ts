import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../../src/utils/parser'
import { fixturePath } from '../../helpers/file-upload'

describe('parseMarkdown', () => {
  it('parses basic resume fields and sections', () => {
    const markdown = readFileSync(fixturePath('resumes', 'basic-resume.md'), 'utf8')
    const resume = parseMarkdown(markdown)

    expect(resume.name).toBe('林一')
    expect(resume.email).toBe('lin.yi@example.com')
    expect(resume.phone).toBe('13800000000')
    expect(resume.targetRole).toBe('前端开发工程师')
    expect(resume.education[0].school).toBe('复旦大学')
    expect(resume.experience[0].company).toBe('星河科技')
    expect(resume.projects[0].name).toBe('简历生成平台')
    expect(resume.skills).toContain('Vue')
  })

  it('parses target role from an inline label', () => {
    const resume = parseMarkdown(`# 张三
目标岗位：市场经理
## 技能
- 品牌策划`)

    expect(resume.targetRole).toBe('市场经理')
  })
})
