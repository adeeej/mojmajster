import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MasterCard from '~/components/MasterCard.vue'

const baseMaster = {
  id: 1,
  user_id: 'u1',
  name: 'Ján Novák',
  business_name: null,
  slug: 'jan-novak',
  category_id: 1,
  description: null,
  phone: null,
  email: null,
  website: null,
  city: 'Čadca',
  region: 'Kysuce',
  lat: null,
  lng: null,
  service_radius_km: 30,
  languages: ['sk'],
  ico: null,
  verified: false,
  status: 'approved' as const,
  photo_url: null,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
  category: { id: 1, name: 'Murár', slug: 'murar', icon: 'brick-wall', created_at: '2025-01-01' },
}

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
  UiCard: { template: '<div class="card"><slot /></div>', props: ['class'] },
  UiBadge: { template: '<span class="badge"><slot /></span>', props: ['variant', 'class'] },
  StarRating: { template: '<span class="star-rating"></span>', props: ['modelValue'] },
}

describe('MasterCard', () => {
  it('renders master name', () => {
    const wrapper = mount(MasterCard, {
      props: { master: baseMaster },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('Ján Novák')
  })

  it('renders category and city', () => {
    const wrapper = mount(MasterCard, {
      props: { master: baseMaster },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('Murár')
    expect(wrapper.text()).toContain('Čadca')
  })

  it('shows verified badge when verified', () => {
    const wrapper = mount(MasterCard, {
      props: { master: { ...baseMaster, verified: true } },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.find('.badge').exists()).toBe(true)
  })

  it('hides verified badge when not verified', () => {
    const wrapper = mount(MasterCard, {
      props: { master: baseMaster },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.find('.badge').exists()).toBe(false)
  })

  it('shows emoji fallback when no photo', () => {
    const wrapper = mount(MasterCard, {
      props: { master: baseMaster },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('🧱')
  })

  it('shows img when photo_url exists', () => {
    const wrapper = mount(MasterCard, {
      props: { master: { ...baseMaster, photo_url: 'https://example.com/photo.jpg' } },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/photo.jpg')
  })

  it('shows rating when avg_rating exists', () => {
    const wrapper = mount(MasterCard, {
      props: {
        master: { ...baseMaster, avg_rating: 4.5, review_count: 12 },
      },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    expect(wrapper.text()).toContain('(12)')
  })

  it('links to master detail page', () => {
    const wrapper = mount(MasterCard, {
      props: { master: baseMaster },
      global: { stubs, mocks: { $t: (k: string) => k } },
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/master/jan-novak')
  })
})
