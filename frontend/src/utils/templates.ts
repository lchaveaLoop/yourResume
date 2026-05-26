import type { AnyCareerTemplate, CareerTemplate } from '../types/resume'

export const careerTemplates = ['base', 'tech', 'product', 'marketing', 'finance', 'education'] as const

export function normalizeCareerTemplate(value: unknown): CareerTemplate | undefined {
  if (isCareerTemplate(value)) return value
  if (value === 'ats' || value === 'long') return 'base'
  if (value === 'senior') return 'tech'
  return undefined
}

export function isCareerTemplate(value: unknown): value is CareerTemplate {
  return typeof value === 'string' && careerTemplates.includes(value as CareerTemplate)
}

export function isKnownCareerTemplate(value: unknown): value is AnyCareerTemplate {
  return normalizeCareerTemplate(value) !== undefined
}
