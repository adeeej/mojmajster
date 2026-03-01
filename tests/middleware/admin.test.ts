import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import adminMiddleware from '~/middleware/admin'

describe('admin middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /prihlasenie when no user', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref(null))

    await adminMiddleware({} as any, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('redirects to / when user is not admin', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref({ id: '123' }))
    vi.mocked(useFetch).mockResolvedValue({ data: ref({ isAdmin: false }) } as any)

    await adminMiddleware({} as any, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('allows admin through', async () => {
    vi.mocked(useSupabaseUser).mockReturnValue(ref({ id: '123' }))
    vi.mocked(useFetch).mockResolvedValue({ data: ref({ isAdmin: true }) } as any)

    await adminMiddleware({} as any, {} as any)

    // First call is for login check (if no user), second would be for admin block
    // With admin user, navigateTo should not be called
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
