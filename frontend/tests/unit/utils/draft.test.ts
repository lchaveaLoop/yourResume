import { describe, expect, it } from 'vitest'
import {
  clearDraft,
  hasDraft,
  loadDraft,
  loadDraftEnvelope,
  RESUME_DRAFT_STORAGE_KEY,
  RESUME_DRAFT_VERSION,
  saveDraft,
} from '../../../src/utils/draft'
import { createTestResume } from '../../helpers/create-test-resume'

describe('draft adapter', () => {
  it('saves a versioned normalized resume draft', () => {
    const storage = createMemoryStorage()
    const resume = createTestResume({
      name: '  林一  ',
      skills: ['Vue', '', ' TypeScript '],
    })

    expect(saveDraft(resume, storage)).toBe(true)

    const raw = storage.getItem(RESUME_DRAFT_STORAGE_KEY)
    expect(raw).toBeTruthy()

    const parsed = JSON.parse(raw ?? '')
    expect(parsed.version).toBe(RESUME_DRAFT_VERSION)
    expect(typeof parsed.savedAt).toBe('string')
    expect(parsed.resume.name).toBe('林一')
    expect(parsed.resume.skills).toEqual(['Vue', 'TypeScript'])
  })

  it('loads draft data through normalization', () => {
    const storage = createMemoryStorage()
    storage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify({
      version: RESUME_DRAFT_VERSION,
      savedAt: '2026-05-16T00:00:00.000Z',
      resume: {
        name: '  Ada  ',
        experience: [{ company: 'Analytical Engines', detailsRaw: '  设计计算流程  \n\n验证输出 ' }],
        skills: [' Math ', ''],
      },
    }))

    const draft = loadDraftEnvelope(storage)

    expect(draft?.version).toBe(RESUME_DRAFT_VERSION)
    expect(draft?.savedAt).toBe('2026-05-16T00:00:00.000Z')
    expect(draft?.resume.name).toBe('Ada')
    expect(draft?.resume.experience[0].details).toEqual(['设计计算流程', '验证输出'])
    expect(draft?.resume.skills).toEqual(['Math'])
  })

  it('supports legacy raw resume JSON payloads', () => {
    const storage = createMemoryStorage()
    storage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify({
      name: '林一',
      skills: ['Vue'],
    }))

    expect(loadDraft(storage)?.name).toBe('林一')
    expect(loadDraftEnvelope(storage)?.version).toBe(0)
  })

  it('clears drafts and reports existence from loadable content', () => {
    const storage = createMemoryStorage()

    expect(hasDraft(storage)).toBe(false)

    saveDraft(createTestResume(), storage)
    expect(hasDraft(storage)).toBe(true)

    expect(clearDraft(storage)).toBe(true)
    expect(hasDraft(storage)).toBe(false)
  })

  it('isolates malformed JSON and storage failures', () => {
    const storage = createMemoryStorage()
    storage.setItem(RESUME_DRAFT_STORAGE_KEY, '{bad-json')

    expect(loadDraft(storage)).toBeNull()
    expect(saveDraft(createTestResume(), null)).toBe(false)
    expect(clearDraft(null)).toBe(false)
  })
})

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}
