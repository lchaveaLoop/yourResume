import type { ResumeData } from '../types/resume'
import type { CareerTemplate } from '../types/resume'
import { normalizeResume, type ResumeInput } from './resume-normalizer'
import { normalizeCareerTemplate } from './templates'

export const RESUME_DRAFT_STORAGE_KEY = 'yourResume:draft:v1'
export const RESUME_DRAFT_VERSION = 1

export interface ResumeDraftEnvelope {
  version: number
  savedAt: string
  resume: ResumeData
  template?: CareerTemplate
  templateLocked?: boolean
}

export interface ResumeDraftMetadata {
  template?: CareerTemplate
  templateLocked?: boolean
}

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type UnknownRecord = Record<string, unknown>

export function saveDraft(
  resume: ResumeData,
  storage: DraftStorage | null = getBrowserStorage(),
  metadata: ResumeDraftMetadata = {},
): boolean {
  if (!storage) return false

  try {
    const payload = {
      version: RESUME_DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      resume: normalizeResume(resume),
      ...normalizeDraftMetadata(metadata),
    }
    storage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function loadDraft(
  storage: DraftStorage | null = getBrowserStorage(),
): ResumeData | null {
  return loadDraftEnvelope(storage)?.resume ?? null
}

export function loadDraftEnvelope(
  storage: DraftStorage | null = getBrowserStorage(),
): ResumeDraftEnvelope | null {
  if (!storage) return null

  try {
    const raw = storage.getItem(RESUME_DRAFT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const source = extractResumeInput(parsed)
    if (!source) return null

    const resume = normalizeResume(source)
    if (!hasResumeContent(resume)) return null

    return {
      version: extractVersion(parsed),
      savedAt: extractSavedAt(parsed),
      resume,
      ...normalizeDraftMetadata(parsed),
    }
  } catch {
    return null
  }
}

export function clearDraft(
  storage: DraftStorage | null = getBrowserStorage(),
): boolean {
  if (!storage) return false

  try {
    storage.removeItem(RESUME_DRAFT_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function hasDraft(
  storage: DraftStorage | null = getBrowserStorage(),
): boolean {
  return loadDraft(storage) !== null
}

export function hasResumeContent(resume: ResumeData): boolean {
  return Boolean(
    resume.name ||
    resume.email ||
    resume.phone ||
    resume.location ||
    resume.targetRole ||
    resume.summary ||
    resume.photo ||
    resume.education.length ||
    resume.experience.length ||
    resume.skills.length ||
    resume.projects.length,
  )
}

function getBrowserStorage(): DraftStorage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function extractResumeInput(value: unknown): ResumeInput | null {
  if (!isRecord(value)) return null

  if (isRecord(value.resume)) {
    return value.resume as ResumeInput
  }

  return value as ResumeInput
}

function extractVersion(value: unknown): number {
  if (!isRecord(value)) return 0
  return typeof value.version === 'number' ? value.version : 0
}

function extractSavedAt(value: unknown): string {
  if (!isRecord(value)) return ''
  return typeof value.savedAt === 'string' ? value.savedAt : ''
}

function normalizeDraftMetadata(value: unknown): ResumeDraftMetadata {
  if (!isRecord(value)) return {}

  const template = extractCareerTemplate(value.template)
  return {
    ...(template ? { template } : {}),
    ...(typeof value.templateLocked === 'boolean' ? { templateLocked: value.templateLocked } : {}),
  }
}

function extractCareerTemplate(value: unknown): CareerTemplate | undefined {
  return normalizeCareerTemplate(value)
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
