import type { Education, Experience, Project, ResumeData } from '../types/resume'
import { defaultResume } from '../types/resume'

export type ResumeInput = Partial<Omit<ResumeData, 'education' | 'experience' | 'projects' | 'skills'>> & {
  education?: unknown
  experience?: unknown
  projects?: unknown
  skills?: unknown
}

type MaybeResumeInput = ResumeInput | null | undefined
type UnknownRecord = Record<string, unknown>

export function normalizeResume(input: MaybeResumeInput | unknown = {}): ResumeData {
  const source = isRecord(input) ? input : {}
  const photo = normalizeOptionalString(source.photo)

  return {
    name: normalizeString(source.name, defaultResume.name),
    email: normalizeString(source.email, defaultResume.email),
    phone: normalizeString(source.phone, defaultResume.phone),
    location: normalizeString(source.location, defaultResume.location),
    targetRole: normalizeString(source.targetRole, defaultResume.targetRole),
    summary: normalizeString(source.summary, defaultResume.summary),
    photo,
    education: normalizeEducationList(source.education),
    experience: normalizeExperienceList(source.experience),
    skills: normalizeStringArray(source.skills),
    projects: normalizeProjectList(source.projects),
  }
}

function normalizeEducationList(value: unknown): Education[] {
  return normalizeRecordList(value).map(item => ({
    school: normalizeString(item.school),
    degree: normalizeString(item.degree),
    duration: normalizeString(item.duration),
    details: normalizeString(item.details),
  }))
}

function normalizeExperienceList(value: unknown): Experience[] {
  return normalizeRecordList(value).map(item => {
    const details = normalizeDetails(item)

    return {
      company: normalizeString(item.company),
      title: normalizeString(item.title),
      duration: normalizeString(item.duration),
      details,
      detailsRaw: details.join('\n'),
    }
  })
}

function normalizeProjectList(value: unknown): Project[] {
  return normalizeRecordList(value).map(item => {
    const details = normalizeDetails(item)

    return {
      name: normalizeString(item.name),
      role: normalizeString(item.role),
      duration: normalizeString(item.duration),
      details,
      detailsRaw: details.join('\n'),
    }
  })
}

function normalizeDetails(item: UnknownRecord): string[] {
  const raw = normalizeString(item.detailsRaw)
  if (raw) {
    return splitDetailLines(raw)
  }

  if (typeof item.details === 'string') {
    return splitDetailLines(item.details)
  }

  return normalizeStringArray(item.details)
}

function normalizeRecordList(value: unknown): UnknownRecord[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord)
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map(item => normalizeString(item))
    .filter(Boolean)
}

function splitDetailLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
}

function normalizeString(value: unknown, fallback = ''): string {
  if (value == null) return fallback

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value).trim()
  }

  return fallback
}

function normalizeOptionalString(value: unknown): string | undefined {
  const normalized = normalizeString(value)
  return normalized || undefined
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
