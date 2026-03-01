import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serverSupabaseUser } from '#supabase/server'
import handler from '~/server/api/admin/check.get'

const mockEvent = {} as any

describe('GET /api/admin/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns isAdmin: true for admin user', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue({ email: 'admin@mojmajster.sk' } as any)

    const result = await handler(mockEvent)

    expect(result).toEqual({ isAdmin: true })
  })

  it('returns isAdmin: false for non-admin user', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue({ email: 'user@example.com' } as any)

    const result = await handler(mockEvent)

    expect(result).toEqual({ isAdmin: false })
  })

  it('returns isAdmin: false when no user', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    const result = await handler(mockEvent)

    expect(result).toEqual({ isAdmin: false })
  })
})
