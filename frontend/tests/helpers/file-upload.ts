import path from 'node:path'

export function fixturePath(...segments: string[]) {
  return path.resolve(process.cwd(), 'tests', 'fixtures', ...segments)
}
