// Tidal constituent angular speeds (degrees/hour)
const SPEEDS = {
  M2: 28.9841,
  S2: 30.0000,
  N2: 28.4397,
  K1: 15.0411,
  O1: 13.9430,
  M4: 57.9682,
}

// Hours since 2000-01-01 00:00:00 UTC
export function hoursFromEpoch(date) {
  const T0 = Date.UTC(2000, 0, 1, 0, 0, 0)
  return (date.getTime() - T0) / 3_600_000
}

// Format a Date using its local calendar day instead of UTC. Date pickers return
// local-midnight values, where toISOString() can otherwise shift the day back.
export function toLocalISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Compute tidal height at a given Date using harmonic constituents
export function computeTideLevel(constituents, date) {
  const t = hoursFromEpoch(date)
  let h = constituents.Z0 ?? 0
  for (const name of Object.keys(SPEEDS)) {
    if (!constituents[name]) continue
    const { A, phi } = constituents[name]
    const omega = SPEEDS[name]
    h += A * Math.cos((omega * t - phi) * Math.PI / 180)
  }
  return h
}

// Generate hourly tide data for a date range
export function generateHourlyData(constituents, startDate, endDate) {
  const result = []
  const start = new Date(`${startDate}T00:00:00+07:00`)
  const end = new Date(`${endDate}T23:00:00+07:00`)

  const cur = new Date(start)
  while (cur <= end) {
    result.push({ time: new Date(cur), height: computeTideLevel(constituents, cur) })
    cur.setTime(cur.getTime() + 3_600_000)
  }
  return result
}

// Find local maxima indices with optional minimum prominence filter
export function findLocalMaxima(data, { minProminence = 0 } = {}) {
  const peaks = []
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      const leftMin = Math.min(...data.slice(0, i))
      const rightMin = Math.min(...data.slice(i + 1))
      const prominence = data[i] - Math.max(leftMin, rightMin)
      if (prominence >= minProminence) peaks.push(i)
    }
  }
  return peaks
}

// Find local minima indices with optional minimum prominence filter
export function findLocalMinima(data, { minProminence = 0 } = {}) {
  const troughs = []
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] < data[i - 1] && data[i] < data[i + 1]) {
      const leftMax = Math.max(...data.slice(0, i))
      const rightMax = Math.max(...data.slice(i + 1))
      const prominence = Math.min(leftMax, rightMax) - data[i]
      if (prominence >= minProminence) troughs.push(i)
    }
  }
  return troughs
}

// Compute high tide times (hours in day) for a given date string 'YYYY-MM-DD'
export function computeHighTideTimes(constituents, dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z')
  const hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(date)
    d.setUTCHours(i)
    return computeTideLevel(constituents, d)
  })
  const peakIndices = findLocalMaxima(hours, { minProminence: 0.05 })
  return peakIndices.map(i => {
    // Refine the hourly peak with one-minute resolution.
    let best = i, bestH = hours[i]
    for (let m = 0; m <= 59; m++) {
      const d = new Date(date); d.setUTCHours(i); d.setUTCMinutes(m)
      const h = computeTideLevel(constituents, d)
      if (h > bestH) { bestH = h; best = i + m / 60 }
    }
    return best
  })
}
