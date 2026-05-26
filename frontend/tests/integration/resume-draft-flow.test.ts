import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import HomeView from '../../src/views/HomeView.vue'
import { loadDraft, loadDraftEnvelope, saveDraft } from '../../src/utils/draft'
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
    window.localStorage.setItem('yourResume:draft:v1', JSON.stringify({
      version: 1,
      savedAt: '2026-05-25T00:00:00.000Z',
      resume: createTestResume({ name: '草稿候选人' }),
      template: 'long',
      templateLocked: true,
    }))

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-editor-name"]').element).toHaveProperty('value', '草稿候选人')
    expect(wrapper.get('[data-testid="resume-preview"]').text()).toContain('草稿候选人')
    expect(wrapper.get('[data-testid="resume-draft-status"]').text()).toContain('已恢复本地草稿')

    const store = useResumeStore()
    expect(store.template).toBe('base')
    expect(store.templateLocked).toBe(true)

    wrapper.unmount()
  })

  it('auto-saves edited resume data and selected template metadata', async () => {
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    const store = useResumeStore()
    store.setResume(createTestResume({ name: '待保存草稿' }))
    store.setTemplate('tech')
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(loadDraft(window.localStorage)?.name).toBe('待保存草稿')
    expect(loadDraftEnvelope(window.localStorage)).toMatchObject({
      template: 'tech',
      templateLocked: true,
    })
    expect(wrapper.get('[data-testid="resume-draft-status"]').text()).toContain('草稿已自动保存')

    wrapper.unmount()
  })

  it('clears drafts after reset', async () => {
    saveDraft(createTestResume({ name: '需要清除的草稿' }), window.localStorage)

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    await wrapper.get('.btn-reset').trigger('click')
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(loadDraft(window.localStorage)).toBeNull()
    expect(wrapper.find('[data-testid="resume-upload-zone"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('clears stale drafts when starting a blank resume', async () => {
    saveDraft(createTestResume({ name: '旧草稿' }), window.localStorage)

    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    await wrapper.get('.btn-reset').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="resume-create-blank"]').trigger('click')
    await flushPromises()

    expect(loadDraft(window.localStorage)).toBeNull()
    expect(wrapper.get('[data-testid="resume-editor"]').text()).toContain('新建简历')

    wrapper.unmount()
  })
})
