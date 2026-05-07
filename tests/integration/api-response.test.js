import { describe, test, expect, vi } from 'vitest'
import { fetchTideData } from '../../src/tide-api.js'

describe('fetchTideData integration', () => {
  test('fallback to harmonic when API fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const data = await fetchTideData(16.0544, 108.2022, '2026-05-01', '2026-05-03', 'da-nang')
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('time')
    expect(data[0]).toHaveProperty('height')
    data.forEach(d => expect(d.height).not.toBeNaN())
  })

  test('fallback data covers full date range (hourly)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const data = await fetchTideData(16.0544, 108.2022, '2026-05-01', '2026-05-03', 'da-nang')
    // 3 days × 24 hours = 72 points
    expect(data.length).toBe(72)
  })
})
