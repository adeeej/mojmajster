import { vi } from 'vitest'

export interface MockQueryResult {
  data: unknown
  error: null | { message: string }
}

/**
 * Creates a chainable Supabase query mock.
 * Supports: from().select().insert().update().delete().eq().order()
 */
export function createSupabaseMock(result: MockQueryResult = { data: [], error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}

  const createChain = (): Record<string, ReturnType<typeof vi.fn>> => {
    const self = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue(result),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn((col: string) => {
        // If the previous call was update or delete, resolve the promise
        return self as unknown
      }),
      order: vi.fn().mockResolvedValue(result),
    }

    // Make eq resolve when it's the last in chain
    self.eq = vi.fn().mockImplementation(() => {
      // Return self for further chaining, but also make it thenable
      const proxy = {
        ...self,
        then: (resolve: (val: MockQueryResult) => void) => resolve(result),
      }
      return proxy
    })

    // select resolves when called without further chaining
    self.select = vi.fn().mockImplementation(() => {
      const proxy = {
        ...self,
        then: (resolve: (val: MockQueryResult) => void) => resolve(result),
      }
      return proxy
    })

    return self
  }

  const queryChain = createChain()
  const from = vi.fn().mockReturnValue(queryChain)

  return { from, _chain: queryChain, _result: result }
}
