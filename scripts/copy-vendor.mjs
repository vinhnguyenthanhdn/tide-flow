import { copyFile, mkdir } from 'node:fs/promises'

const vendorDir = new URL('../assets/vendor/', import.meta.url)

const files = [
  ['alpinejs/dist/module.esm.min.js', 'alpine.esm.min.js'],
  ['chart.js/dist/chart.umd.min.js', 'chart.umd.min.js'],
  ['flatpickr/dist/flatpickr.min.css', 'flatpickr.min.css'],
  ['flatpickr/dist/flatpickr.min.js', 'flatpickr.min.js'],
  ['hammerjs/hammer.min.js', 'hammer.min.js'],
  ['chartjs-plugin-zoom/dist/chartjs-plugin-zoom.min.js', 'chartjs-plugin-zoom.min.js'],
]

await mkdir(vendorDir, { recursive: true })

for (const [source, target] of files) {
  await copyFile(new URL(`../node_modules/${source}`, import.meta.url), new URL(target, vendorDir))
}
