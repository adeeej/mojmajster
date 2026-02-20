import { describe, it, expect } from 'vitest'
import { generateSlug, formatDate } from '../utils/strings'

describe('generateSlug', () => {
  it('converts name to lowercase slug', () => {
    expect(generateSlug('Ján Kováč')).toBe('jan-kovac')
  })

  it('strips leading and trailing hyphens', () => {
    expect(generateSlug('  Štefan Žák  ')).toBe('stefan-zak')
  })

  it('replaces multiple spaces with single hyphen', () => {
    expect(generateSlug('Murár   Čadca')).toBe('murar-cadca')
  })

  it('handles already clean input', () => {
    expect(generateSlug('jan-novak')).toBe('jan-novak')
  })

  it('removes special characters', () => {
    expect(generateSlug('Elektrikár & Inštalatér s.r.o.')).toBe('elektrikar-instalater-s-r-o')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for valid ISO date', () => {
    const result = formatDate('2024-01-15T10:00:00Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('contains the year', () => {
    const result = formatDate('2024-06-20T00:00:00Z')
    expect(result).toContain('2024')
  })
})
