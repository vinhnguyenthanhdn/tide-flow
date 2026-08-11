// tide-flow app — Alpine.js global component
// All src/ imports done inline; CDN scripts loaded before this file

import { LOCATIONS } from './src/locations.js'
import { TIDAL_CONSTITUENTS } from './src/tide-constituents.js'
import { generateHourlyData, toLocalISODate } from './src/tide-math.js'

const MAX_DAYS = 30

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Short date with weekday: "Thu, 07/05"
function formatDateShort(d) {
  return `${WEEKDAYS[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDateTime(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} · ${formatTime(date)}`
}

function loadTideData(locationId, startDate, endDate) {
  const c = TIDAL_CONSTITUENTS[locationId]
  return c ? generateHourlyData(c, startDate, endDate) : []
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
    maxTime: formatDateTime(data[maxIdx].time),
    minTime: formatDateTime(data[minIdx].time),
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
    dateWarning: '',
    stats: { max: null, min: null, avg: null, range: null, maxTime: '', minTime: '' },

    get selectedLocation() {
      return this.locations.find(l => l.id === this.selectedLocationId)
    },

    get dateRangeLabel() {
      if (!this.startDate || !this.endDate) return 'Choose dates...'
      return `${formatDateShort(this.startDate)}  →  ${formatDateShort(this.endDate)}`
    },

    get chartTitle() {
      if (!this.selectedLocation || !this.startDate || !this.endDate) return ''
      const days = Math.round((this.endDate - this.startDate) / 86400000) + 1
      return `${this.selectedLocation.name} · ${formatDateShort(this.startDate)} → ${formatDateShort(this.endDate)} · ${days} days`
    },

    get chartMinWidth() {
      if (!this.startDate || !this.endDate) return 640
      const days = Math.round((this.endDate - this.startDate) / 86400000) + 1
      return Math.max(640, days * 104)
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
            if (diff >= MAX_DAYS) {
              this.dateWarning = `Maximum range: ${MAX_DAYS} days`
              this.endDate = addDays(s, MAX_DAYS - 1)
              _fp.setDate([s, this.endDate])
              this.startDate = s
              this.activePreset = null
              this.fetchAndRender()
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
          label: 'Relative level (m)',
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
                  return `${WEEKDAYS[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}  ${String(d.getHours()).padStart(2,'0')}:00`
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
                autoSkip: false,
                callback(val) {
                  const label = this.getLabelForValue(val)
                  const d = new Date(label)
                  if (isNaN(d)) return ''
                  if (d.getHours() !== 0) return ''
                  const weekday = WEEKDAYS[d.getDay()]
                  const date = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
                  return `${weekday} ${date}`
                },
              },
              grid: { color: '#1E293B' },
            },
            y: {
              ticks: { color: '#64748B', font: { family: 'Fira Code', size: 11 } },
              grid: { color: '#1E293B' },
              title: {
                display: true,
                text: 'Relative level (m)',
                color: '#64748B',
                font: { family: 'Fira Sans', size: 11 },
              },
            },
          },
        },
      })
    },

    fetchAndRender() {
      if (!this.startDate || !this.endDate || !_chart) return
      const loc = this.selectedLocation
      const s = toLocalISODate(this.startDate)
      const e = toLocalISODate(this.endDate)

      const data = loadTideData(loc.id, s, e)
      this.stats = computeStats(data)
      _chart.data.labels = data.map(d => d.time.toISOString())
      _chart.data.datasets[0].data = data.map(d => d.height)
      if (_chart.resetZoom) _chart.resetZoom()
      _chart.update('none')
      requestAnimationFrame(() => _chart.resize())
    },
  }
}

// Expose as global so Alpine x-data="tideApp()" can find it
window.tideApp = tideAppFactory
