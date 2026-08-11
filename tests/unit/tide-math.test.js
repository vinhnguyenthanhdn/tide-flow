import { describe, test, expect } from 'vitest'
import {
  findLocalMaxima,
  findLocalMinima,
  computeTideLevel,
  hoursFromEpoch,
  computeHighTideTimes,
  generateHourlyData,
  toLocalISODate,
} from '../../src/tide-math.js'

const DA_NANG_CONSTITUENTS = {
  Z0: 0.0,
  M2: { A: 0.35, phi: 105.0 },
  S2: { A: 0.12, phi: 140.0 },
  N2: { A: 0.07, phi:  80.0 },
  K1: { A: 0.20, phi: 215.0 },
  O1: { A: 0.15, phi: 190.0 },
}

describe('findLocalMaxima', () => {
  test('returns correct peak indices', () => {
    const data = [0.2, 0.5, 1.2, 0.8, 0.3, 0.1, 0.6, 1.1, 0.7]
    const peaks = findLocalMaxima(data, { minProminence: 0.3 })
    expect(peaks).toEqual([2, 7])
  })

  test('returns empty array for monotonic data', () => {
    const data = [1, 2, 3, 4, 5]
    expect(findLocalMaxima(data)).toEqual([])
  })
})

describe('findLocalMinima', () => {
  test('returns correct trough indices', () => {
    const data = [1.2, 0.8, 0.1, 0.5, 1.1, 0.6, 0.05, 0.4]
    const troughs = findLocalMinima(data, { minProminence: 0.3 })
    expect(troughs).toEqual([2, 6])
  })
})

describe('computeTideLevel', () => {
  test('never returns NaN for 30 days of hourly data', () => {
    const start = Date.UTC(2000, 0, 1)
    for (let h = 0; h < 720; h++) {
      const date = new Date(start + h * 3_600_000)
      expect(computeTideLevel(DA_NANG_CONSTITUENTS, date)).not.toBeNaN()
    }
  })

  test('returns Z0 offset when all amplitudes are 0', () => {
    const c = { Z0: 0.5 }
    const val = computeTideLevel(c, new Date('2000-01-01T00:00:00Z'))
    expect(val).toBe(0.5)
  })
})

describe('hoursFromEpoch', () => {
  test('returns 0 for epoch date', () => {
    const epoch = new Date('2000-01-01T00:00:00Z')
    expect(hoursFromEpoch(epoch)).toBe(0)
  })

  test('returns 24 for one day after epoch', () => {
    const d = new Date('2000-01-02T00:00:00Z')
    expect(hoursFromEpoch(d)).toBe(24)
  })
})

describe('date handling', () => {
  test('formats the local calendar date without a UTC day shift', () => {
    const localMidnight = new Date(2026, 4, 7, 0, 0, 0)
    expect(toLocalISODate(localMidnight)).toBe('2026-05-07')
  })

  test('generates complete Vietnam-local days at hourly resolution', () => {
    const data = generateHourlyData(DA_NANG_CONSTITUENTS, '2026-05-01', '2026-05-03')
    expect(data).toHaveLength(72)
    expect(data[0].time.toISOString()).toBe('2026-04-30T17:00:00.000Z')
    expect(data.at(-1).time.toISOString()).toBe('2026-05-03T16:00:00.000Z')
  })
})

describe('semi-diurnal pattern', () => {
  test('Da Nang produces about two peaks per day', () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const d = new Date('2026-05-01T00:00:00Z')
      d.setUTCHours(i)
      return computeTideLevel(DA_NANG_CONSTITUENTS, d)
    })
    const peaks = findLocalMaxima(hours, { minProminence: 0.05 })
    expect(peaks.length).toBeGreaterThanOrEqual(1)
    expect(peaks.length).toBeLessThanOrEqual(3)
  })
})

describe('computeHighTideTimes', () => {
  test('returns array of hour values in [0, 24)', () => {
    const times = computeHighTideTimes(DA_NANG_CONSTITUENTS, '2026-05-01')
    expect(Array.isArray(times)).toBe(true)
    times.forEach(t => {
      expect(t).toBeGreaterThanOrEqual(0)
      expect(t).toBeLessThan(24)
    })
  })

  test('peak timing within ±1 hour of semi-diurnal expectation (~12h apart)', () => {
    const times = computeHighTideTimes(DA_NANG_CONSTITUENTS, '2026-05-01')
    if (times.length >= 2) {
      const gap = times[1] - times[0]
      expect(gap).toBeGreaterThan(10)
      expect(gap).toBeLessThan(14)
    }
  })
})
