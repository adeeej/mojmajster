import { vi } from 'vitest'

// ========== Server-side globals (Nuxt auto-imports) ==========
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  adminEmail: 'admin@mojmajster.sk',
  public: {
    siteUrl: 'https://mojmajster.sk',
    adminEmail: 'admin@mojmajster.sk',
  },
})))

vi.stubGlobal('createError', vi.fn((opts: { statusCode: number; message: string }) => {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
}))

vi.stubGlobal('defineEventHandler', vi.fn((handler: Function) => handler))
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('getQuery', vi.fn(() => ({})))
vi.stubGlobal('setResponseHeader', vi.fn())

// ========== Vue auto-imports ==========
import { ref, computed, reactive, watch, watchEffect, nextTick, toRef, toRefs } from 'vue'
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('watch', watch)
vi.stubGlobal('watchEffect', watchEffect)
vi.stubGlobal('nextTick', nextTick)
vi.stubGlobal('toRef', toRef)
vi.stubGlobal('toRefs', toRefs)

// ========== Client-side globals (Nuxt auto-imports) ==========
vi.stubGlobal('defineNuxtRouteMiddleware', vi.fn((handler: Function) => handler))
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('useSupabaseUser', vi.fn())
vi.stubGlobal('useSupabaseClient', vi.fn(() => ({
  from: vi.fn(),
  auth: { signOut: vi.fn().mockResolvedValue({}) },
})))
vi.stubGlobal('useFetch', vi.fn())
vi.stubGlobal('useAsyncData', vi.fn((_key: string, fn: Function) =>
  Promise.resolve({ data: ref(fn ? fn() : null) })
))
vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ isAdmin: false }))

// Mock $t for i18n (identity function - returns key)
vi.stubGlobal('$t', vi.fn((key: string) => key))
