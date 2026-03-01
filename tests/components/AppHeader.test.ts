import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent, Suspense, h } from 'vue'
import AppHeader from '~/components/AppHeader.vue'

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
}

function mountWithSuspense(props = {}) {
  const wrapper = mount(
    defineComponent({
      setup() {
        return () => h(Suspense, null, {
          default: () => h(AppHeader, props),
        })
      },
    }),
    {
      global: { stubs, mocks: { $t: (k: string) => k } },
    }
  )
  return wrapper
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSupabaseClient).mockReturnValue({
      auth: { signOut: vi.fn().mockResolvedValue({}) },
    } as any)
    vi.mocked($fetch).mockResolvedValue({ isAdmin: false })
  })

  it('shows login/register links when not authenticated', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    const wrapper = mountWithSuspense()
    await flushPromises()

    expect(wrapper.text()).toContain('nav.login')
    expect(wrapper.text()).toContain('nav.register')
    expect(wrapper.text()).not.toContain('nav.logout')
  })

  it('shows profile/logout when authenticated', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref({ id: '123' }))

    const wrapper = mountWithSuspense()
    await flushPromises()

    expect(wrapper.text()).toContain('nav.profile')
    expect(wrapper.text()).toContain('nav.logout')
    expect(wrapper.text()).not.toContain('nav.register')
  })

  it('shows MojMajster brand', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    const wrapper = mountWithSuspense()
    await flushPromises()

    expect(wrapper.text()).toContain('MojMajster')
  })

  it('toggles mobile menu on button click', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    const wrapper = mountWithSuspense()
    await flushPromises()

    // Mobile menu should be hidden initially
    expect(wrapper.findAll('nav')).toHaveLength(1)

    // Click hamburger button
    const buttons = wrapper.findAll('button')
    const hamburger = buttons.find(b => b.classes().includes('md:hidden'))
    await hamburger!.trigger('click')

    // Mobile menu should be visible
    expect(wrapper.findAll('nav')).toHaveLength(2)
  })
})
