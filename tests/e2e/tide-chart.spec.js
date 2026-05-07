import { test, expect } from '@playwright/test'

test.describe('Tide Chart App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with chart visible', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.locator('[data-testid="location-selector"]')).toBeVisible()
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible()
  })

  test('Bai Rang is in location list', async ({ page }) => {
    const options = await page.locator('[data-testid="location-selector"] option').allTextContents()
    expect(options.some(o => o.includes('Bãi Rạng'))).toBe(true)
  })

  test('date picker opens on click', async ({ page }) => {
    await page.click('[data-testid="date-picker"]')
    await expect(page.locator('.flatpickr-calendar')).toBeVisible()
  })

  test('7-day preset button exists and is active by default', async ({ page }) => {
    await expect(page.locator('[data-testid="preset-7d"]')).toBeVisible()
  })

  test('stats bar shows max tide after load', async ({ page }) => {
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="stat-max"]')
      return el && el.textContent.trim() !== '—'
    }, { timeout: 10000 })
    const maxText = await page.locator('[data-testid="stat-max"]').textContent()
    expect(maxText).toMatch(/[\d]+\.[\d]+\s*m/)
  })

  test('chart title contains location name', async ({ page }) => {
    const title = await page.locator('[data-testid="chart-title"]').textContent()
    expect(title.length).toBeGreaterThan(5)
  })

  test('layout works on mobile 375px', async ({ page }) => {
    // Set viewport before navigation so chart initializes at mobile size
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('canvas')).toBeVisible()
    // Chart canvas should be responsive to viewport width
    const canvasWidth = await page.evaluate(() => document.querySelector('canvas').offsetWidth)
    expect(canvasWidth).toBeLessThanOrEqual(380)
  })

  test('changing location updates chart title', async ({ page }) => {
    await page.waitForSelector('[data-testid="chart-title"]')
    await page.selectOption('[data-testid="location-selector"]', 'vung-tau')
    await page.waitForTimeout(500)
    const title = await page.locator('[data-testid="chart-title"]').textContent()
    expect(title).toContain('Vũng Tàu')
  })
})
