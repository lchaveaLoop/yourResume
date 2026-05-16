import { describe, expect, it } from 'vitest'
import { estimatePdfPages } from '../../../src/utils/pdf'

function createElement(width: number, scrollHeight: number, rectHeight: number) {
  const element = document.createElement('div')

  Object.defineProperty(element, 'clientWidth', { value: width })
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight })
  element.getBoundingClientRect = () => ({
    width,
    height: rectHeight,
    top: 0,
    left: 0,
    bottom: rectHeight,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })

  return element
}

describe('estimatePdfPages', () => {
  it('returns at least one page', () => {
    const info = estimatePdfPages(createElement(210, 0, 0))

    expect(info.pageCount).toBe(1)
  })

  it('uses the A4 ratio and larger content height', () => {
    const info = estimatePdfPages(createElement(210, 600, 900))

    expect(info.pageHeightPx).toBe(297)
    expect(info.contentHeightPx).toBe(900)
    expect(info.pageCount).toBe(4)
  })
})
