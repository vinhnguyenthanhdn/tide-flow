import { test, expect } from '@playwright/test'

test.describe('Tide Chart App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with chart visible', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.getByLabel('Choose a location')).toBeVisible()
    await expect(page.getByLabel('Choose a date range')).toBeVisible()
    await expect(page.getByTestId('model-warning')).toContainText('Never use them for navigation')
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
    await expect(page.getByTestId('preset-7d')).toHaveAttribute('aria-pressed', 'true')
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
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('canvas')).toBeVisible()
    await expect(page.getByText('Swipe horizontally to explore')).toBeVisible()

    const chart = page.locator('.chart-scroll')
    const dimensions = await chart.evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth)

    await page.getByLabel('Choose a date range').click()
    await expect(page.locator('.flatpickr-month')).toHaveCount(1)
  })

  test('changing location updates chart title', async ({ page }) => {
    await page.waitForSelector('[data-testid="chart-title"]')
    await page.selectOption('[data-testid="location-selector"]', 'vung-tau')
    const title = await page.locator('[data-testid="chart-title"]').textContent()
    expect(title).toContain('Vũng Tàu')
  })

  test('30-day preset shows a complete date on peak summaries', async ({ page }) => {
    await page.getByTestId('preset-30d').click()
    await expect(page.getByTestId('chart-title')).toContainText('30 days')
    await expect(page.getByTestId('stat-max').locator('..').locator('p').last()).toHaveText(/\d{2}\/\d{2} · \d{2}:\d{2}/)
  })

  test('GitHub contribution links are available', async ({ page }) => {
    const links = page.getByRole('link', { name: /Star on GitHub|Contribute or leave a star/ })
    await expect(links.first()).toHaveAttribute('href', 'https://github.com/vinhnguyenthanhdn/tide-flow')
  })

  test('runtime assets load only from the application origin', async ({ page }) => {
    const externalOrigins = new Set()
    page.on('request', request => {
      const url = new URL(request.url())
      if (url.origin !== 'http://127.0.0.1:3000') externalOrigins.add(url.origin)
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
    expect([...externalOrigins]).toEqual([])
  })

  test('social sharing metadata includes a large preview image', async ({ page }) => {
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.png$/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  })
})
