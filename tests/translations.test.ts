import { describe, it, expect } from 'vitest'
import sk from '../locales/sk.json'

// Recursively collect all leaf key paths from a nested object
function getLeafKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getLeafKeys(value, path)
    }
    return [path]
  })
}

// Resolve a dot-path value from a nested object
function resolve(obj: Record<string, any>, path: string): unknown {
  return path.split('.').reduce((acc, k) => (acc as any)?.[k], obj)
}

describe('sk.json — translation integrity', () => {
  const allKeys = getLeafKeys(sk)

  it('has no empty string values', () => {
    const empty = allKeys.filter(k => resolve(sk, k) === '')
    expect(empty, `Empty translation keys:\n  ${empty.join('\n  ')}`).toHaveLength(0)
  })

  it('has no null or undefined values', () => {
    const bad = allKeys.filter(k => resolve(sk, k) == null)
    expect(bad, `Null/undefined keys:\n  ${bad.join('\n  ')}`).toHaveLength(0)
  })

  it('has all required top-level sections', () => {
    const required = [
      'home', 'hero', 'nav', 'search', 'master', 'contact',
      'profile', 'admin', 'stats', 'leads', 'why', 'trust', 'seo', 'footer', 'common',
    ]
    for (const section of required) {
      expect(sk, `Missing section: "${section}"`).toHaveProperty(section)
    }
  })

  it('has more than 50 translation keys (sanity check against empty file)', () => {
    expect(allKeys.length).toBeGreaterThan(50)
  })
})
