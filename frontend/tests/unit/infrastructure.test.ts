import { describe, expect, it } from 'vitest'

describe('test infrastructure', () => {
  it('runs Vitest outside the production source tree', () => {
    expect(1 + 1).toBe(2)
  })
})
