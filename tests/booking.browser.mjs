import { createServer } from 'vite'
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
const server = await createServer({
	server: { host: '127.0.0.1', port: 0, open: false, proxy: {} },
})
let browser
try {
	await server.listen()
	const url = server.resolvedUrls.local[0]
	browser = await chromium.launch({
		executablePath:
			process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
		headless: true,
	})
	for (const [label, width, height] of [
		['Android', 393, 851],
		['iPhone', 390, 844],
		['Keyboard viewport', 390, 360],
	]) {
		const context = await browser.newContext({
			viewport: { width, height },
			isMobile: true,
			hasTouch: true,
		})
		const page = await context.newPage()
		let requests = 0
		await page.route('**/*', (route) => {
			const u = new URL(route.request().url())
			if (u.pathname === '/__fixture/appointment/create') {
				requests++
				return route.fulfill({ status: 400, body: 'fixture' })
			}
			if (u.hostname === '127.0.0.1') return route.continue()
			return route.abort()
		})
		await page.goto(url + 'tests/booking-fixture.html')
		const button = page.getByRole('button', { name: 'Подтвердить запись', exact: true })
		await button.click()
		assert.equal(requests, 0)
		await page.waitForFunction(() => document.activeElement?.id === 'booking-lastName')
		await page.waitForFunction(() => {
			const r = document.querySelector('#booking-lastName').getBoundingClientRect()
			return r.y >= 0 && r.bottom <= window.innerHeight
		})
		const bounds = await page.locator('#booking-lastName').boundingBox()
		assert(bounds.y >= 0 && bounds.y + bounds.height <= height)
		await page.locator('#booking-lastName').fill('Family')
		await page.locator('#booking-firstName').fill('Given')
		await button.click()
		await page.getByText('Тестовая ошибка сервера').waitFor()
		assert.equal(requests, 1)
		assert.equal(await page.locator('#booking-firstName').inputValue(), 'Given')
		await button.scrollIntoViewIfNeeded()
		const b = await button.boundingBox()
		assert(b.y >= 0 && b.y + b.height <= height)
		assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
		console.log(
			'PASS ' +
				label +
				': invalid names blocked, focus visible, API error preserves form, confirm reachable',
		)
		await context.close()
	}
} finally {
	await browser?.close()
	await server.close()
}
