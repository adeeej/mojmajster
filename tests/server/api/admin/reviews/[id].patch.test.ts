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

import handler from '~/server/api/admin/reviews/[id].patch'

describe('PATCH /api/admin/reviews/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getRouterParam).mockReturnValue('7')
    vi.mocked(readBody).mockResolvedValue({ status: 'approved' })
  })

  it('updates review status and returns success', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ update: updateMock })

    const result = await handler({} as any)

    expect(result).toEqual({ success: true })
    expect(updateMock).toHaveBeenCalledWith({ status: 'approved' })
    expect(eqMock).toHaveBeenCalledWith('id', '7')
  })

  it('throws 500 on error', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Error' } })
    mockClient.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: eqMock }),
    })

    await expect(handler({} as any)).rejects.toThrow('Error')
  })
})
