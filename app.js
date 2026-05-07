// tide-flow app — Alpine.js global component
// All src/ imports done inline; CDN scripts loaded before this file

import { LOCATIONS } from './src/locations.js'
import { TIDAL_CONSTITUENTS } from './src/tide-constituents.js'
import { computeTideLevel, generateHourlyData, findLocalMaxima, findLocalMinima } from './src/tide-math.js'

const MAX_DAYS = 30
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine'

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function formatDate(d) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Format ngày có thứ: "T5, 07/05"
function formatDateShort(d) {
  return `${THU[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function formatTime(date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Chuyển đổi dương lịch → âm lịch Việt Nam
// Dựa trên bảng ngày sóc (UTC+7) chính xác từ dữ liệu thiên văn, 2020-2032
// Mỗi phần tử: [năm, tháng DL, ngày DL] = ngày đầu tháng âm lịch tương ứng
// Tháng âm lịch 1 của năm AL = sóc sau Đông Chí năm trước
const _NEW_MOONS = [
  // 2020
  [2020,1,25],[2020,2,23],[2020,3,24],[2020,4,23],[2020,5,23],[2020,6,21],
  [2020,7,21],[2020,8,19],[2020,9,17],[2020,10,17],[2020,11,15],[2020,12,15],
  // 2021
  [2021,1,13],[2021,2,12],[2021,3,13],[2021,4,12],[2021,5,11],[2021,6,10],
  [2021,7,10],[2021,8,8],[2021,9,7],[2021,10,6],[2021,11,5],[2021,12,4],
  // 2022
  [2022,1,3],[2022,2,1],[2022,3,3],[2022,4,1],[2022,5,1],[2022,5,30],
  [2022,6,29],[2022,7,29],[2022,8,27],[2022,9,26],[2022,10,25],[2022,11,24],[2022,12,23],
  // 2023
  [2023,1,22],[2023,2,20],[2023,3,22],[2023,4,20],[2023,5,19],[2023,6,18],
  [2023,7,17],[2023,8,16],[2023,9,15],[2023,10,15],[2023,11,13],[2023,12,13],
  // 2024
  [2024,1,11],[2024,2,10],[2024,3,10],[2024,4,9],[2024,5,8],[2024,6,6],
  [2024,7,6],[2024,8,4],[2024,9,3],[2024,10,3],[2024,11,1],[2024,12,1],[2024,12,31],
  // 2025
  [2025,1,29],[2025,2,28],[2025,3,29],[2025,4,28],[2025,5,27],[2025,6,25],
  [2025,7,25],[2025,8,23],[2025,9,22],[2025,10,21],[2025,11,20],[2025,12,20],
  // 2026
  [2026,1,18],[2026,2,17],[2026,3,18],[2026,4,17],[2026,5,16],[2026,6,15],
  [2026,7,14],[2026,8,12],[2026,9,11],[2026,10,11],[2026,11,9],[2026,12,9],
  // 2027
  [2027,1,7],[2027,2,6],[2027,3,8],[2027,4,6],[2027,5,6],[2027,6,4],
  [2027,7,4],[2027,8,2],[2027,9,1],[2027,9,30],[2027,10,30],[2027,11,28],[2027,12,28],
  // 2028
  [2028,1,26],[2028,2,25],[2028,3,26],[2028,4,24],[2028,5,24],[2028,6,22],
  [2028,7,22],[2028,8,20],[2028,9,18],[2028,10,18],[2028,11,16],[2028,12,16],
  // 2029
  [2029,1,14],[2029,2,13],[2029,3,14],[2029,4,13],[2029,5,12],[2029,6,11],
  [2029,7,10],[2029,8,9],[2029,9,7],[2029,10,7],[2029,11,5],[2029,12,5],
  // 2030
  [2030,1,3],[2030,2,2],[2030,3,4],[2030,4,2],[2030,5,2],[2030,5,31],
  [2030,6,30],[2030,7,29],[2030,8,28],[2030,9,26],[2030,10,26],[2030,11,24],[2030,12,24],
  // 2031
  [2031,1,22],[2031,2,21],[2031,3,23],[2031,4,21],[2031,5,21],[2031,6,19],
  [2031,7,19],[2031,8,17],[2031,9,16],[2031,10,15],[2031,11,14],[2031,12,13],
]

// Ánh xạ ngày sóc → tháng âm lịch
// Tháng 1 AL của mỗi năm là sóc đầu tiên sau Đông Chí (khoảng 21/12 năm trước)
// Bảng offset: index trong _NEW_MOONS → tháng AL (1-12, hoặc tháng nhuận âm)
// Cách đơn giản: đếm sóc từ sóc tháng 11 AL đầu năm
const _LUNAR_MONTH_1 = {
  2020: [2020,1,25], 2021: [2021,2,12], 2022: [2022,2,1],
  2023: [2023,1,22], 2024: [2024,2,10], 2025: [2025,1,29],
  2026: [2026,2,17], 2027: [2027,2,6],  2028: [2028,2,25],
  2029: [2029,1,26], 2030: [2030,2,2],  2031: [2031,2,11],
}

function _toTimestamp(arr) {
  return new Date(arr[0], arr[1] - 1, arr[2]).getTime()
}

function solarToLunar(date) {
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  // Tìm sóc gần nhất trước hoặc bằng ngày đang xét
  let monthIdx = -1
  for (let i = _NEW_MOONS.length - 1; i >= 0; i--) {
    if (_toTimestamp(_NEW_MOONS[i]) <= t) { monthIdx = i; break }
  }
  if (monthIdx < 0) return { day: 1, month: 1 }

  const monthStartT = _toTimestamp(_NEW_MOONS[monthIdx])
  const lunarDay = Math.round((t - monthStartT) / 86400000) + 1

  // Tìm tháng 1 AL của năm hiện tại
  const yy = date.getFullYear()
  const m1Entry = _LUNAR_MONTH_1[yy] || _LUNAR_MONTH_1[yy - 1]
  if (!m1Entry) return { day: lunarDay, month: 1 }

  const m1T = _toTimestamp(m1Entry)

  // Đếm số sóc từ tháng 1 AL đến monthStart
  let diff = 0
  for (let i = 0; i < _NEW_MOONS.length; i++) {
    if (_toTimestamp(_NEW_MOONS[i]) === m1T) {
      // tìm monthIdx trong bảng
      for (let j = i; j < _NEW_MOONS.length; j++) {
        if (_toTimestamp(_NEW_MOONS[j]) === monthStartT) { diff = j - i; break }
      }
      break
    }
  }

  let lunarMonth = (diff % 12) + 1

  return { day: lunarDay, month: lunarMonth }
}

function lunarLabel(date) {
  const { day, month } = solarToLunar(date)
  return `${day}/${month} ÂL`
}

function buildTideUrl(lat, lon, startDate, endDate) {
  const p = new URLSearchParams({
    latitude: lat, longitude: lon,
    hourly: 'wave_height',
    start_date: startDate, end_date: endDate,
    timezone: 'Asia/Ho_Chi_Minh',
  })
  return `${MARINE_BASE}?${p}`
}

async function loadTideData(lat, lon, startDate, endDate, locationId) {
  try {
    const url = buildTideUrl(lat, lon, startDate, endDate)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const times = json.hourly.time
    const heights = json.hourly.wave_height
    const data = []
    for (let i = 0; i < times.length; i++) {
      if (heights[i] == null) continue
      data.push({ time: new Date(times[i]), height: heights[i] })
    }
    return data
  } catch {
    const c = TIDAL_CONSTITUENTS[locationId]
    return c ? generateHourlyData(c, startDate, endDate) : []
  }
}

function computeStats(data) {
  if (!data.length) return { max: null, min: null, avg: null, range: null, maxTime: '', minTime: '' }
  const heights = data.map(d => d.height)
  const maxH = Math.max(...heights)
  const minH = Math.min(...heights)
  const maxIdx = heights.indexOf(maxH)
  const minIdx = heights.indexOf(minH)
  const avg = heights.reduce((a, b) => a + b, 0) / heights.length
  return {
    max: maxH, min: minH, avg, range: maxH - minH,
    maxTime: formatTime(data[maxIdx].time),
    minTime: formatTime(data[minIdx].time),
  }
}

// Kept outside Alpine's reactive scope so Chart.js and Flatpickr proxies aren't wrapped
let _chart = null
let _fp = null

function tideAppFactory() {
  return {
    locations: LOCATIONS,
    selectedLocationId: 'bai-rang',
    startDate: null,
    endDate: null,
    activePreset: 7,
    loading: false,
    chartReady: false,
    dateWarning: '',
    stats: { max: null, min: null, avg: null, range: null, maxTime: '', minTime: '' },

    get selectedLocation() {
      return this.locations.find(l => l.id === this.selectedLocationId)
    },

    get dateRangeLabel() {
      if (!this.startDate || !this.endDate) return 'Chọn ngày...'
      return `${formatDateShort(this.startDate)}  →  ${formatDateShort(this.endDate)}`
    },

    get chartTitle() {
      if (!this.selectedLocation || !this.startDate || !this.endDate) return ''
      const days = Math.round((this.endDate - this.startDate) / 86400000) + 1
      const ls = lunarLabel(this.startDate)
      const le = lunarLabel(this.endDate)
      return `${this.selectedLocation.name} · ${formatDateShort(this.startDate)} (${ls}) → ${formatDateShort(this.endDate)} (${le}) · ${days} ngày`
    },

    init() {
      const today = new Date()
      this.startDate = today
      this.endDate = addDays(today, 6)
      this.activePreset = 7

      _fp = flatpickr('#date-range-picker', {
        mode: 'range',
        dateFormat: 'd/m/Y',
        defaultDate: [this.startDate, this.endDate],
        showMonths: window.innerWidth >= 768 ? 2 : 1,
        onClose: (selectedDates) => {
          if (selectedDates.length === 2) {
            const [s, e] = selectedDates
            const diff = Math.round((e - s) / 86400000)
            if (diff > MAX_DAYS) {
              this.dateWarning = `Tối đa ${MAX_DAYS} ngày`
              this.endDate = addDays(s, MAX_DAYS)
              _fp.setDate([s, this.endDate])
              return
            }
            this.dateWarning = ''
            this.startDate = s
            this.endDate = e
            this.activePreset = null
            this.fetchAndRender()
          }
        }
      })

      this.initChart()
      this.fetchAndRender()
    },

    openDatePicker() {
      _fp && _fp.open()
    },

    setPreset(days) {
      const today = new Date()
      this.startDate = today
      this.endDate = addDays(today, days - 1)
      this.activePreset = days
      this.dateWarning = ''
      _fp && _fp.setDate([this.startDate, this.endDate])
      this.fetchAndRender()
    },

    onLocationChange() {
      this.fetchAndRender()
    },

    initChart() {
      if (_chart) { _chart.destroy(); _chart = null }
      const ctx = document.getElementById('tideChart').getContext('2d')
      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.35)')
      gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)')

      _chart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{
          label: 'Mực nước (m)',
          data: [],
          borderColor: '#0EA5E9',
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#0EA5E9',
        }]},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
              borderWidth: 1,
              titleColor: '#94A3B8',
              bodyColor: '#F1F5F9',
              titleFont: { family: 'Fira Code', size: 11 },
              bodyFont: { family: 'Fira Code', size: 13 },
              callbacks: {
                title: (items) => {
                  const d = new Date(items[0].label)
                  if (isNaN(d)) return items[0].label
                  return `${THU[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}  ${String(d.getUTCHours()).padStart(2,'0')}:00`
                },
                afterTitle: (items) => {
                  const d = new Date(items[0].label)
                  if (isNaN(d)) return ''
                  return lunarLabel(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
                },
                label: (item) => ` ${item.parsed.y.toFixed(2)} m`,
              },
            },
            zoom: {
              zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
              pan: { enabled: true, mode: 'x' },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#64748B',
                font: { family: 'Fira Code', size: 10 },
                maxRotation: 0,
                maxTicksLimit: 10,
                callback(val) {
                  const label = this.getLabelForValue(val)
                  const d = new Date(label)
                  if (isNaN(d)) return ''
                  // Chỉ hiện label tại đầu mỗi ngày UTC (00:00 UTC)
                  if (d.getUTCHours() === 0) {
                    const thu = THU[d.getUTCDay()]
                    const ngay = `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`
                    const { day: lunarDay, month: lunarMonth } = solarToLunar(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
                    return [`${thu} ${ngay}`, `${lunarDay}/${lunarMonth} ÂL`]
                  }
                  return ''
                },
              },
              grid: { color: '#1E293B' },
            },
            y: {
              ticks: { color: '#64748B', font: { family: 'Fira Code', size: 11 } },
              grid: { color: '#1E293B' },
              title: {
                display: true,
                text: 'Mực nước (m)',
                color: '#64748B',
                font: { family: 'Fira Sans', size: 11 },
              },
            },
          },
        },
      })
      this.chartReady = true
    },

    async fetchAndRender() {
      if (!this.startDate || !this.endDate || !_chart) return
      this.loading = true
      const loc = this.selectedLocation
      const s = toISODate(this.startDate)
      const e = toISODate(this.endDate)

      try {
        const data = await loadTideData(loc.lat, loc.lon, s, e, loc.id)
        this.stats = computeStats(data)
        _chart.data.labels = data.map(d => d.time.toISOString())
        _chart.data.datasets[0].data = data.map(d => d.height)
        if (_chart.resetZoom) _chart.resetZoom()
        _chart.update('none')
      } finally {
        this.loading = false
      }
    },
  }
}

// Expose as global so Alpine x-data="tideApp()" can find it
window.tideApp = tideAppFactory
