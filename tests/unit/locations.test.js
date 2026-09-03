import { describe, test, expect } from 'vitest'
import { LOCATIONS, emptyDataWarning } from '../../src/locations.js'
import { TIDAL_CONSTITUENTS } from '../../src/tide-constituents.js'

describe('LOCATIONS', () => {
  test('has 24 locations', () => {
    expect(LOCATIONS.length).toBe(24)
  })

  test('all locations have valid global coordinates', () => {
    LOCATIONS.forEach(loc => {
      expect(loc.lat).toBeGreaterThanOrEqual(-90)
      expect(loc.lat).toBeLessThanOrEqual(90)
      expect(loc.lon).toBeGreaterThanOrEqual(-180)
      expect(loc.lon).toBeLessThanOrEqual(180)
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

  test('every location has one demonstration coefficient set', () => {
    expect(Object.keys(TIDAL_CONSTITUENTS).sort()).toEqual(LOCATIONS.map(loc => loc.id).sort())
  })

  test('all locations have a non-empty display name', () => {
    LOCATIONS.forEach(loc => {
      expect(loc.name).toBeTruthy()
      expect(loc.name.length).toBeGreaterThan(2)
    })
  })

  test('all locations have an English country name and valid IANA timezone', () => {
    LOCATIONS.forEach(loc => {
      expect(loc.country.length).toBeGreaterThan(2)
      expect(() => new Intl.DateTimeFormat('en', { timeZone: loc.timeZone })).not.toThrow()
    })
  })

  test('includes internationally recognized locations across six continents', () => {
    const ids = new Set(LOCATIONS.map(loc => loc.id))
    expect(ids.has('bay-of-fundy')).toBe(true)
    expect(ids.has('london-thames')).toBe(true)
    expect(ids.has('new-york-harbor')).toBe(true)
    expect(ids.has('rio-de-janeiro')).toBe(true)
    expect(ids.has('cape-town')).toBe(true)
    expect(ids.has('sydney-harbour')).toBe(true)
    expect(ids.has('tokyo-bay')).toBe(true)
  })
})

describe('every offered location can actually be drawn', () => {
  // A location in the picker with no constituent set renders an empty chart and
  // dashes for every statistic. Nothing throws, so the only person who finds out
  // is the one looking at a blank curve — and they have nothing to report. These
  // two directions keep that state from existing rather than describing it.
  test('every location id has a harmonic constituent set', () => {
    const ids = LOCATIONS.map(loc => loc.id)
    expect(ids.length).toBeGreaterThan(0)
    const missing = ids.filter(id => !TIDAL_CONSTITUENTS[id])
    expect(missing).toEqual([])
  })

  test('every constituent set belongs to a location the picker offers', () => {
    const ids = new Set(LOCATIONS.map(loc => loc.id))
    const keys = Object.keys(TIDAL_CONSTITUENTS)
    expect(keys.length).toBeGreaterThan(0)
    const orphans = keys.filter(key => !ids.has(key))
    expect(orphans).toEqual([])
  })
})

describe('emptyDataWarning', () => {
  const location = { id: 'somewhere', name: 'Somewhere Bay' }

  test('says nothing when there is a curve to look at', () => {
    expect(emptyDataWarning(location, 24)).toBe('')
  })

  test('names the location and where to report when there is not', () => {
    const message = emptyDataWarning(location, 0)
    expect(message).toContain('Somewhere Bay')
    expect(message).toContain('github.com/vinhnguyenthanhdn/tide-flow/issues')
  })
})
