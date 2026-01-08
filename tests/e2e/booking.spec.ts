import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can login and view movies', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'testuser123')
    await page.fill('input[name="password"]', 'Password1')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/my-tickets/)
  })

  test('user can view movie details', async ({ page }) => {
    await page.goto('/movies')
    await page.waitForSelector('a[href*="/movies/"]', { timeout: 5000 })

    const firstMovieLink = page.locator('a[href*="/movies/"]').first()
    await firstMovieLink.click()

    await expect(page).toHaveURL(/\/movies\/\d+/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('user can view cinema details', async ({ page }) => {
    await page.goto('/cinemas')
    await page.waitForSelector('a[href*="/cinemas/"]', { timeout: 5000 })

    const firstCinemaLink = page.locator('a[href*="/cinemas/"]').first()
    await firstCinemaLink.click()

    await expect(page).toHaveURL(/\/cinemas\/\d+/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('unauthenticated user cannot access my-tickets', async ({ page }) => {
    await page.goto('/my-tickets')
    await expect(page).toHaveURL(/\/login/)
  })

  test('user can navigate between pages', async ({ page }) => {
    await page.goto('/movies')
    await expect(page.locator('a[href="/movies"]')).toBeVisible()

    await page.click('a[href="/cinemas"]')
    await expect(page).toHaveURL('/cinemas')

    await page.click('a[href="/movies"]')
    await expect(page).toHaveURL('/movies')
  })
})

test.describe('Authentication Flow', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="username"]', `testuser${Date.now()}`)
    await page.fill('input[name="password"]', 'Password1')
    await page.fill('input[name="passwordConfirmation"]', 'Password1')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/my-tickets/)
  })

  test('registration shows validation errors', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="username"]', 'short')
    await page.fill('input[name="password"]', 'weak')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Минимум 8 символов')).toBeVisible()
  })
})
