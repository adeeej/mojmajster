import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import authMiddleware from '~/middleware/auth'

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /prihlasenie when no user', () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    authMiddleware({} as any, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('does not redirect when user exists', () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref({ id: '123', email: 'user@test.com' }))

    const result = authMiddleware({} as any, {} as any)

    expect(navigateTo).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
