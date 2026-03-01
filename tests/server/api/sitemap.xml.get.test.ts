import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serverSupabaseClient } from '#supabase/server'

describe('GET /api/sitemap.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates valid sitemap XML', async () => {
    const mockClient = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'masters') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ slug: 'jan-novak', updated_at: '2025-01-01' }],
              }),
            }),
          }
        }
        if (table === 'categories') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ slug: 'murar' }],
            }),
          }
        }
      }),
    }
    vi.mocked(serverSupabaseClient).mockResolvedValue(mockClient as any)

    // Import dynamically to get fresh handler
    const mod = await import('~/server/api/sitemap.xml.get')
    const handler = mod.default
    const result = await handler({} as any)

    expect(result).toContain('<?xml version="1.0"')
    expect(result).toContain('<urlset')
    expect(result).toContain('https://mojmajster.sk/')
    expect(result).toContain('https://mojmajster.sk/search')
    expect(result).toContain('https://mojmajster.sk/search?category=murar')
    expect(result).toContain('https://mojmajster.sk/master/jan-novak')
    expect(setResponseHeader).toHaveBeenCalledWith({}, 'content-type', 'application/xml')
  })
})
