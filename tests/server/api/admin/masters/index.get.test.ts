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

import handler from '~/server/api/admin/masters/index.get'

describe('GET /api/admin/masters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getQuery).mockReturnValue({})
  })

  it('returns masters with default pending status', async () => {
    const mastersData = [{ id: 1, name: 'Ján Novák', status: 'pending' }]
    const orderMock = vi.fn().mockResolvedValue({ data: mastersData, error: null })
    const eqMock = vi.fn().mockReturnValue({ order: orderMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ select: selectMock })

    const result = await handler({} as any)

    expect(result).toEqual({ data: mastersData })
    expect(eqMock).toHaveBeenCalledWith('status', 'pending')
  })

  it('uses query status parameter', async () => {
    vi.mocked(getQuery).mockReturnValue({ status: 'approved' })
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqMock = vi.fn().mockReturnValue({ order: orderMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ select: selectMock })

    await handler({} as any)

    expect(eqMock).toHaveBeenCalledWith('status', 'approved')
  })

  it('throws 500 on error', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const eqMock = vi.fn().mockReturnValue({ order: orderMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ select: selectMock })

    await expect(handler({} as any)).rejects.toThrow('DB error')
  })
})
