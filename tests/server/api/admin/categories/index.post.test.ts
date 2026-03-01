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

import handler from '~/server/api/admin/categories/index.post'

describe('POST /api/admin/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(readBody).mockResolvedValue({ name: 'Maliar', slug: 'maliar', icon: 'paintbrush' })
  })

  it('creates a category and returns success', async () => {
    mockClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })

    const result = await handler({} as any)

    expect(result).toEqual({ success: true })
    expect(mockClient.from).toHaveBeenCalledWith('categories')
  })

  it('uses wrench as default icon', async () => {
    vi.mocked(readBody).mockResolvedValue({ name: 'Test', slug: 'test' })
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mockClient.from.mockReturnValue({ insert: insertMock })

    await handler({} as any)

    expect(insertMock).toHaveBeenCalledWith({
      name: 'Test',
      slug: 'test',
      icon: 'wrench',
    })
  })

  it('throws 500 on error', async () => {
    mockClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'Duplicate' } }),
    })

    await expect(handler({} as any)).rejects.toThrow('Duplicate')
  })
})
