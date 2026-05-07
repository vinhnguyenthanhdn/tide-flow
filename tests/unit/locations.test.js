import { describe, test, expect } from 'vitest'
import { LOCATIONS } from '../../src/locations.js'

describe('LOCATIONS', () => {
  test('has 12 locations', () => {
    expect(LOCATIONS.length).toBe(12)
  })

  test('all locations have valid lat/lon for Vietnam', () => {
    LOCATIONS.forEach(loc => {
      expect(loc.lat).toBeGreaterThan(0)
      expect(loc.lat).toBeLessThan(25)
      expect(loc.lon).toBeGreaterThan(100)
      expect(loc.lon).toBeLessThan(115)
    })
  })

  test('Bai Rang exists with correct coordinates', () => {
    const baiRang = LOCATIONS.find(l => l.id === 'bai-rang')
    expect(baiRang).toBeDefined()
    expect(baiRang.lat).toBeCloseTo(15.48, 1)
    expect(baiRang.lon).toBeCloseTo(108.72, 1)
  })

  test('no duplicate location ids', () => {
    const ids = LOCATIONS.map(l => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('all locations have a non-empty Vietnamese name', () => {
    LOCATIONS.forEach(loc => {
      expect(loc.name).toBeTruthy()
      expect(loc.name.length).toBeGreaterThan(2)
    })
  })
})
