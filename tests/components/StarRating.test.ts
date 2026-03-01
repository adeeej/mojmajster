import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from '~/components/StarRating.vue'

describe('StarRating', () => {
  it('renders 5 star buttons', () => {
    const wrapper = mount(StarRating)

    expect(wrapper.findAll('button')).toHaveLength(5)
  })

  it('highlights correct number of stars', () => {
    const wrapper = mount(StarRating, {
      props: { modelValue: 3 },
    })

    const svgs = wrapper.findAll('svg')
    const filled = svgs.filter(svg => svg.classes().includes('text-yellow-400'))
    expect(filled).toHaveLength(3)
  })

  it('emits update:modelValue when interactive and clicked', async () => {
    const wrapper = mount(StarRating, {
      props: { interactive: true },
    })

    await wrapper.findAll('button')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([3])
  })

  it('does not emit when not interactive', async () => {
    const wrapper = mount(StarRating, {
      props: { interactive: false },
    })

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('shows count when showCount is true', () => {
    const wrapper = mount(StarRating, {
      props: { showCount: true, count: 42 },
    })

    expect(wrapper.text()).toContain('(42)')
  })

  it('hides count when showCount is false', () => {
    const wrapper = mount(StarRating, {
      props: { showCount: false, count: 42 },
    })

    expect(wrapper.text()).not.toContain('42')
  })
})
