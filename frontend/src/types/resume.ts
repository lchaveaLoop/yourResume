export interface Education {
  school: string
  degree: string
  duration: string
  details: string
}

export interface Experience {
  company: string
  title: string
  duration: string
  details: string[]
  detailsRaw?: string
}

export interface Project {
  name: string
  role: string
  duration: string
  details: string[]
  detailsRaw?: string
}

export interface ResumeData {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  photo?: string  // base64 data URL
  education: Education[]
  experience: Experience[]
  skills: string[]
  projects: Project[]
}

export const defaultResume: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  photo: undefined,
  education: [],
  experience: [],
  skills: [],
  projects: [],
}
