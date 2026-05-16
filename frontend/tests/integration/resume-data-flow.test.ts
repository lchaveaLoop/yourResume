import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { useResumeStore } from '../../src/stores/resume'
import { parseMarkdown } from '../../src/utils/parser'
import { normalizeResume } from '../../src/utils/resume-normalizer'
import { fixturePath } from '../helpers/file-upload'
import { setupPinia } from '../helpers/setup-pinia'

describe('resume data flow', () => {
  beforeEach(() => {
    setupPinia()
  })

  it('moves markdown parser output through normalization into the store', () => {
    const markdown = readFileSync(fixturePath('resumes', 'basic-resume.md'), 'utf8')
    const parsed = parseMarkdown(markdown)
    const normalized = normalizeResume(parsed)
    const store = useResumeStore()

    store.setResume(parsed)

    expect(store.data).toEqual(normalized)
    expect(store.data.experience[0].detailsRaw).toBe('负责 Vue 组件库建设\n将核心页面首屏时间降低 35%')
    expect(store.template).toBe('ats')
  })

  it('preserves longer resume lists and details', () => {
    const markdown = readFileSync(fixturePath('resumes', 'long-resume.md'), 'utf8')
    const store = useResumeStore()

    store.setResume(parseMarkdown(markdown))

    expect(store.data.experience.length).toBe(2)
    expect(store.data.projects.length).toBe(2)
    expect(store.data.experience[0].details.length).toBeGreaterThan(1)
  })
})
