// tide-flow app — Alpine.js global component
// All src/ imports done inline; CDN scripts loaded before this file

import { LOCATIONS } from './src/locations.js'
import { TIDAL_CONSTITUENTS } from './src/tide-constituents.js'
import { computeTideLevel, generateHourlyData, findLocalMaxima, findLocalMinima } from './src/tide-math.js'

const MAX_DAYS = 30
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine'

function formatDate(d) {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
      return `${formatDate(this.startDate)} – ${formatDate(this.endDate)}`
    },

    get chartTitle() {
      if (!this.selectedLocation || !this.startDate || !this.endDate) return ''
      const days = Math.round((this.endDate - this.startDate) / 86400000) + 1
      return `${this.selectedLocation.name} — ${formatDate(this.startDate)} đến ${formatDate(this.endDate)} (${days} ngày)`
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
                  return isNaN(d) ? items[0].label : formatTime(d)
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
                maxTicksLimit: 8,
                callback(val) {
                  const label = this.getLabelForValue(val)
                  const d = new Date(label)
                  if (isNaN(d)) return ''
                  if (d.getHours() === 0) {
                    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
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
        _chart.update('active')
      } finally {
        this.loading = false
      }
    },
  }
}

// Expose as global so Alpine x-data="tideApp()" can find it
window.tideApp = tideAppFactory
