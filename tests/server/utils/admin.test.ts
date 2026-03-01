import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '~/server/utils/admin'

const mockEvent = {} as any

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws 401 when no user', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(requireAdmin(mockEvent)).rejects.toThrow('Unauthorized')
  })

  it('throws 403 when user is not admin', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue({ email: 'user@example.com' } as any)

    await expect(requireAdmin(mockEvent)).rejects.toThrow('Forbidden')
  })

  it('returns service role client for admin', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue({ email: 'admin@mojmajster.sk' } as any)
    const mockClient = { from: vi.fn() }
    vi.mocked(serverSupabaseServiceRole).mockResolvedValue(mockClient as any)

    const result = await requireAdmin(mockEvent)

    expect(result).toBe(mockClient)
    expect(serverSupabaseServiceRole).toHaveBeenCalledWith(mockEvent)
  })
})
