import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeView from '../../src/views/HomeView.vue'
import { setupPinia } from '../helpers/setup-pinia'

class TestResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('resume web entry flow', () => {
  beforeEach(() => {
    setupPinia()
    window.localStorage.clear()
    vi.stubGlobal('ResizeObserver', TestResizeObserver)
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('starts a blank resume from the upload entry and edits it in the browser', async () => {
    const wrapper = mount(HomeView, {
      attachTo: document.body,
    })
    await flushPromises()

    await wrapper.get('[data-testid="resume-create-blank"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-editor"]').text()).toContain('新建简历')
    expect(wrapper.get('[data-testid="resume-editor-name"]').element).toHaveProperty('value', '')

    await wrapper.get('[data-testid="resume-editor-name"]').setValue('林一')
    await flushPromises()

    expect(wrapper.get('[data-testid="resume-preview"]').text()).toContain('林一')

    await wrapper.get('.btn-reset').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="resume-upload-zone"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
