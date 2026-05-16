import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import HomeView from '../../src/views/HomeView.vue'
import { loadDraft, saveDraft } from '../../src/utils/draft'
import { useResumeStore } from '../../src/stores/resume'
import { createTestResume } from '../helpers/create-test-resume'
import { setupPinia } from '../helpers/setup-pinia'

class TestResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('resume draft flow', () => {
  beforeEach(() => {
    setupPinia()
    window.localStorage.clear()
    vi.stubGlobal('ResizeObserver', TestResizeObserver)
    vi.useFakeTimers()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('restores a local draft on page mount', async () => {
    saveDraft(createTestResume({ name: '草稿候选人' }), window.localStorage)

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-editor-name"]').element).toHaveProperty('value', '草稿候选人')
    expect(wrapper.get('[data-testid="resume-preview"]').text()).toContain('草稿候选人')

    wrapper.unmount()
  })

  it('saves edited resume data and clears drafts after reset', async () => {
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const store = useResumeStore()
    store.setResume(createTestResume({ name: '待保存草稿' }))
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(loadDraft(window.localStorage)?.name).toBe('待保存草稿')

    store.reset()
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(loadDraft(window.localStorage)).toBeNull()

    wrapper.unmount()
  })
})
