import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockServerSupabaseUser, mockServerSupabaseClient, mockClient } = vi.hoisted(() => {
  const mockClient = { from: vi.fn() }
  return {
    mockClient,
    mockServerSupabaseUser: vi.fn(),
    mockServerSupabaseClient: vi.fn().mockResolvedValue(mockClient),
  }
})

vi.mock('#supabase/server', () => ({
  serverSupabaseUser: mockServerSupabaseUser,
  serverSupabaseClient: mockServerSupabaseClient,
}))

import handler from '~/server/api/masters/me.delete'

describe('DELETE /api/masters/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws 401 when not authenticated', async () => {
    mockServerSupabaseUser.mockResolvedValue(null)

    await expect(handler({} as any)).rejects.toThrow('Unauthorized')
  })

  it('deletes the master profile and returns success', async () => {
    mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })

    const eqMock = vi.fn().mockResolvedValue({ error: null })
    const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockClient.from.mockReturnValue({ delete: deleteMock })

    const result = await handler({} as any)

    expect(result).toEqual({ success: true })
    expect(mockClient.from).toHaveBeenCalledWith('masters')
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('throws 500 on supabase error', async () => {
    mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })

    const eqMock = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    mockClient.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    })

    await expect(handler({} as any)).rejects.toThrow('DB error')
  })
})
