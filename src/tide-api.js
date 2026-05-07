import { generateHourlyData } from './tide-math.js'
import { TIDAL_CONSTITUENTS } from './tide-constituents.js'

const MAX_DAYS = 30
const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine'

export function buildApiUrl(lat, lon, startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')
  const diffDays = (end - start) / (1000 * 60 * 60 * 24)
  if (diffDays > MAX_DAYS) throw new Error('Date range exceeds 30 days')

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'wave_height',
    start_date: startDate,
    end_date: endDate,
    timezone: 'Asia/Ho_Chi_Minh',
  })
  return `${BASE_URL}?${params.toString()}`
}

export function transformApiResponse(raw) {
  const times = raw.hourly.time
  const heights = raw.hourly.wave_height
  const result = []
  for (let i = 0; i < times.length; i++) {
    if (heights[i] == null) continue
    result.push({ time: new Date(times[i]), height: heights[i] })
  }
  return result
}

export async function fetchTideData(lat, lon, startDate, endDate, locationId) {
  try {
    const url = buildApiUrl(lat, lon, startDate, endDate)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return transformApiResponse(json)
  } catch {
    // Fallback: harmonic model
    const constituents = locationId && TIDAL_CONSTITUENTS[locationId]
    if (constituents) {
      return generateHourlyData(constituents, startDate, endDate)
    }
    // Generic harmonic fallback with average VN parameters
    const fallback = {
      Z0: 0, M2: { A: 0.5, phi: 120 }, S2: { A: 0.18, phi: 155 },
      N2: { A: 0.10, phi: 95 }, K1: { A: 0.30, phi: 225 }, O1: { A: 0.22, phi: 200 },
    }
    return generateHourlyData(fallback, startDate, endDate)
  }
}
