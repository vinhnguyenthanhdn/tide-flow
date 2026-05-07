import { describe, test, expect } from 'vitest'
import { buildApiUrl, transformApiResponse } from '../../src/tide-api.js'

describe('buildApiUrl', () => {
  test('includes correct lat/lon and date range', () => {
    const url = buildApiUrl(16.0544, 108.2022, '2026-05-01', '2026-05-07')
    expect(url).toContain('latitude=16.0544')
    expect(url).toContain('longitude=108.2022')
    expect(url).toContain('start_date=2026-05-01')
    expect(url).toContain('end_date=2026-05-07')
    expect(url).toContain('timezone=Asia%2FHo_Chi_Minh')
  })

  test('throws when date range exceeds 30 days', () => {
    expect(() => buildApiUrl(16, 108, '2026-05-01', '2026-07-01'))
      .toThrow('Date range exceeds 30 days')
  })

  test('does not throw for exactly 30 days', () => {
    expect(() => buildApiUrl(16, 108, '2026-05-01', '2026-05-31')).not.toThrow()
  })
})

describe('transformApiResponse', () => {
  test('maps hourly times to Date objects', () => {
    const mock = {
      hourly: {
        time: ['2026-05-01T00:00', '2026-05-01T01:00'],
        wave_height: [0.5, 0.8],
      },
    }
    const result = transformApiResponse(mock)
    expect(result[0].time).toBeInstanceOf(Date)
    expect(result[0].height).toBe(0.5)
    expect(result[1].height).toBe(0.8)
  })

  test('filters out null wave_height entries', () => {
    const mock = {
      hourly: {
        time: ['2026-05-01T00:00', '2026-05-01T01:00', '2026-05-01T02:00'],
        wave_height: [0.5, null, 0.8],
      },
    }
    const result = transformApiResponse(mock)
    expect(result.length).toBe(2)
  })

  test('filters out undefined wave_height entries', () => {
    const mock = {
      hourly: {
        time: ['2026-05-01T00:00', '2026-05-01T01:00'],
        wave_height: [undefined, 0.9],
      },
    }
    const result = transformApiResponse(mock)
    expect(result.length).toBe(1)
    expect(result[0].height).toBe(0.9)
  })
})
