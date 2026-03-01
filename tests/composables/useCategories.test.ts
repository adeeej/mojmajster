import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCategories, categoryIconMap } from '~/composables/useCategories'

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchCategories queries supabase correctly', async () => {
    const categoriesData = [
      { id: 1, name: 'Elektrikár', slug: 'elektrikar', icon: 'zap' },
      { id: 2, name: 'Murár', slug: 'murar', icon: 'brick-wall' },
    ]

    const orderMock = vi.fn().mockResolvedValue({ data: categoriesData, error: null })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    const fromMock = vi.fn().mockReturnValue({ select: selectMock })
    vi.mocked(useSupabaseClient).mockReturnValue({ from: fromMock } as any)

    const { fetchCategories } = useCategories()
    const result = await fetchCategories()

    expect(fromMock).toHaveBeenCalledWith('categories')
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(orderMock).toHaveBeenCalledWith('name')
    expect(result).toEqual(categoriesData)
  })

  it('fetchCategories throws on error', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed' } })
    const selectMock = vi.fn().mockReturnValue({ order: orderMock })
    const fromMock = vi.fn().mockReturnValue({ select: selectMock })
    vi.mocked(useSupabaseClient).mockReturnValue({ from: fromMock } as any)

    const { fetchCategories } = useCategories()

    await expect(fetchCategories()).rejects.toEqual({ message: 'Failed' })
  })
})

describe('categoryIconMap', () => {
  it('has 15 entries', () => {
    expect(Object.keys(categoryIconMap)).toHaveLength(15)
  })

  it('maps known icons correctly', () => {
    expect(categoryIconMap['brick-wall']).toBe('🧱')
    expect(categoryIconMap['zap']).toBe('⚡')
    expect(categoryIconMap['wrench']).toBe('🔧')
  })
})
