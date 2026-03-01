import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import guestMiddleware from '~/middleware/guest'

describe('guest middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /profil/upravit when user exists', () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref({ id: '123' }))

    guestMiddleware({} as any, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/profile/edit')
  })

  it('does not redirect when no user', () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    const result = guestMiddleware({} as any, {} as any)

    expect(navigateTo).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
