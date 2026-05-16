import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
})

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:test-url')
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn()
}
