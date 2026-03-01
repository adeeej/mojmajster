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

import handler from '~/server/api/admin/categories/[id].delete'

describe('DELETE /api/admin/categories/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getRouterParam).mockReturnValue('5')
  })

  it('deletes a category and returns success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ delete: deleteMock })

    const result = await handler({} as any)

    expect(result).toEqual({ success: true })
    expect(mockClient.from).toHaveBeenCalledWith('categories')
    expect(eqMock).toHaveBeenCalledWith('id', '5')
  })

  it('throws 500 on error', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'FK constraint' } })
    mockClient.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    })

    await expect(handler({} as any)).rejects.toThrow('FK constraint')
  })
})
