import type { ResumeData } from '../../src/types/resume'
import { normalizeResume } from '../../src/utils/resume-normalizer'

export function createTestResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return normalizeResume({
    name: '林一',
    email: 'lin.yi@example.com',
    phone: '13800000000',
    location: '上海',
    targetRole: '前端开发工程师',
    summary: '三年前端开发经验。',
    education: [
      {
        school: '复旦大学',
        degree: '软件工程 本科',
        duration: '2018-2022',
        details: '',
      },
    ],
    experience: [
      {
        company: '星河科技',
        title: '前端开发工程师',
        duration: '2022.07-至今',
        details: ['负责 Vue 组件库建设'],
      },
    ],
    skills: ['Vue', 'TypeScript'],
    projects: [
      {
        name: '简历生成平台',
        role: '前端负责人',
        duration: '2023.01-2023.09',
        details: ['设计简历编辑器'],
      },
    ],
    ...overrides,
  })
}
