import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRequireAdmin, mockClient } = vi.hoisted(() => {
  const mockClient = { from: vi.fn() }
  return {
    mockClient,
    mockRequireAdmin: vi.fn().mockResolvedValue(mockClient),
  }
})

vi.mock('~/server/utils/admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

import handler from '~/server/api/admin/categories/index.get'

describe('GET /api/admin/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns categories list', async () => {
    const data = [{ id: 1, name: 'Elektrikár', slug: 'elektrikar', icon: 'zap' }]
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    })

    const result = await handler({} as any)

    expect(result).toEqual({ data })
    expect(mockClient.from).toHaveBeenCalledWith('categories')
  })

  it('throws 500 on supabase error', async () => {
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })

    await expect(handler({} as any)).rejects.toThrow('DB error')
  })
})
