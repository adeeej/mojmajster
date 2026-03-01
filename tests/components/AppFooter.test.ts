import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '~/components/AppFooter.vue'

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
}

describe('AppFooter', () => {
  it('shows MojMajster brand', () => {
    const wrapper = mount(AppFooter, {
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('MojMajster')
  })

  it('shows category links', () => {
    const wrapper = mount(AppFooter, {
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('footer.mason')
    expect(wrapper.text()).toContain('footer.roofer')
    expect(wrapper.text()).toContain('footer.electrician')
    expect(wrapper.text()).toContain('footer.plumber')
  })

  it('shows registration and login links', () => {
    const wrapper = mount(AppFooter, {
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('nav.register')
    expect(wrapper.text()).toContain('nav.login')
  })

  it('shows copyright with current year', () => {
    const wrapper = mount(AppFooter, {
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    const year = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(year)
    expect(wrapper.text()).toContain('MojMajster')
  })
})
