import { test, expect } from '@playwright/test'

async function selectCustomRange(page, startLabel, endLabel) {
  const picker = page.getByLabel('Choose a date range')
  await picker.click()
  await picker.evaluate(element => element._flatpickr.jumpToDate(new Date(2026, 0, 1)))
  await page.locator(`.flatpickr-day[aria-label="${startLabel}"]:not(.prevMonthDay):not(.nextMonthDay)`).click()
  await page.locator(`.flatpickr-day[aria-label="${endLabel}"]:not(.prevMonthDay):not(.nextMonthDay)`).click()
}

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

  test('Vietnamese and international locations are in the location list', async ({ page }) => {
    const options = await page.locator('[data-testid="location-selector"] option').allTextContents()
    expect(options.some(o => o.includes('Bãi Rạng'))).toBe(true)
    expect(options.some(o => o.includes('Bay of Fundy — Canada'))).toBe(true)
    expect(options.some(o => o.includes('Sydney Harbour — Australia'))).toBe(true)
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

  test('resets chart zoom with an accessible keyboard control', async ({ page }) => {
    const chart = page.getByRole('img', { name: 'Approximate hourly tide chart' })
    const chartRegion = page.getByRole('region', { name: 'Scrollable tide chart' })
    const resetZoom = page.getByRole('button', { name: 'Reset zoom' })

    await expect(resetZoom).toBeHidden()
    await chart.hover()
    await page.mouse.wheel(0, -400)
    await expect.poll(() => chart.evaluate(canvas => Chart.getChart(canvas).isZoomedOrPanned())).toBe(true)
    await expect(resetZoom).toBeVisible()

    await chartRegion.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(resetZoom).toBeFocused()
    await expect.poll(() => resetZoom.evaluate(button => {
      const style = getComputedStyle(button)
      return [style.outlineStyle, style.outlineWidth, style.outlineOffset]
    })).toEqual(['solid', '2px', '2px'])
    await page.keyboard.press('Enter')

    await expect.poll(() => chart.evaluate(canvas => Chart.getChart(canvas).isZoomedOrPanned())).toBe(false)
    await expect(resetZoom).toBeHidden()
  })

  test('pans a zoomed chart sideways without changing how much it shows', async ({ page }) => {
    // README lists pan next to zoom, and app.js enables it with an onPanComplete that is
    // what makes the Reset zoom button appear. Nothing exercised it: deleting the whole
    // pan block left this suite green.
    //
    // Pan needs a zoom first, and that is why it is easy to leave uncovered. The x scale
    // is a category scale whose default view already spans every hour in the range, so a
    // drag on an unzoomed chart is clamped to exactly where it started -- correct, and
    // indistinguishable from a pan that does nothing at all.
    const chart = page.getByRole('img', { name: 'Approximate hourly tide chart' })
    const resetZoom = page.getByRole('button', { name: 'Reset zoom' })
    const xBounds = () => chart.evaluate(canvas => {
      const scale = Chart.getChart(canvas).scales.x
      return [scale.min, scale.max]
    })

    await chart.hover()
    await page.mouse.wheel(0, -400)
    await expect.poll(() => chart.evaluate(canvas => Chart.getChart(canvas).isZoomedOrPanned())).toBe(true)
    const zoomed = await xBounds()

    const box = await chart.boundingBox()
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 16 })
    await page.mouse.up()

    await expect.poll(async () => (await xBounds())[0]).toBeGreaterThan(zoomed[0])
    const panned = await xBounds()

    // Both edges move the same way: that is what separates a pan from a second zoom,
    // which would move them towards each other. Without this the case passes on any
    // drag that happens to change the view at all.
    expect(panned[1]).toBeGreaterThan(zoomed[1])
    expect(panned[1] - panned[0]).toBe(zoomed[1] - zoomed[0])

    // A pan must not clear the control, which is the only part of onPanComplete this
    // app can observe: reaching pan at all requires a zoom, and that zoom has already
    // set the flag through onZoomComplete. Stubbing onPanComplete out entirely leaves
    // this green for that reason; writing the wrong value into it turns it red.
    await expect(resetZoom).toBeVisible()
    await resetZoom.click()
    await expect.poll(() => chart.evaluate(canvas => Chart.getChart(canvas).isZoomedOrPanned())).toBe(false)
    await expect(resetZoom).toBeHidden()
  })

  test('changing location updates chart title', async ({ page }) => {
    await page.waitForSelector('[data-testid="chart-title"]')
    await page.selectOption('[data-testid="location-selector"]', 'new-york-harbor')
    const title = await page.locator('[data-testid="chart-title"]').textContent()
    expect(title).toContain('New York Harbor, United States')
  })

  test('30-day preset shows a complete date on peak summaries', async ({ page }) => {
    await page.getByTestId('preset-30d').click()
    await expect(page.getByTestId('chart-title')).toContainText('30 days')
    await expect(page.getByTestId('stat-max').locator('..').locator('p').last()).toHaveText(/\d{2}\/\d{2} · \d{2}:\d{2}/)
  })

  test('accepts a 30-day inclusive custom range without warning', async ({ page }) => {
    await selectCustomRange(page, 'January 1, 2026', 'January 30, 2026')

    await expect(page.getByTestId('date-picker')).toHaveValue(/01\/01.*30\/01/)
    await expect(page.getByTestId('chart-title')).toContainText('30 days')
    await expect(page.getByTestId('date-warning')).toBeHidden()
  })

  test('caps a longer custom range and announces the warning', async ({ page }) => {
    await selectCustomRange(page, 'January 1, 2026', 'January 31, 2026')

    await expect(page.getByTestId('date-picker')).toHaveValue(/01\/01.*30\/01/)
    await expect(page.getByTestId('chart-title')).toContainText('30 days')
    await expect(page.getByRole('status')).toHaveText('Maximum range: 30 days')
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
