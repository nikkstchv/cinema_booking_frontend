import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can view movie details', async ({ page }) => {
    await page.goto('/movies')

    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid^="movie-link-"]', { timeout: 10000 })

    const firstMovieLink = page.getByTestId(/^movie-link-/).first()
    await expect(firstMovieLink).toBeVisible()
    await firstMovieLink.click()

    await expect(page).toHaveURL(/\/movies\/\d+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('user can view cinema details', async ({ page }) => {
    await page.goto('/cinemas')

    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid^="cinema-link-"]', { timeout: 10000 })

    const firstCinemaLink = page.getByTestId(/^cinema-link-/).first()
    await expect(firstCinemaLink).toBeVisible()
    await firstCinemaLink.click()

    await expect(page).toHaveURL(/\/cinemas\/\d+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('unauthenticated user cannot access my-tickets', async ({ page }) => {
    await page.goto('/my-tickets')
    await expect(page).toHaveURL(/\/login/)
  })

  test('user can navigate between pages', async ({ page }) => {
    await page.goto('/movies')

    const moviesLink = page.getByRole('link', { name: /фильмы/i })
    await expect(moviesLink).toBeVisible()

    const cinemasLink = page.getByRole('link', { name: /кинотеатры/i })
    await cinemasLink.click()
    await expect(page).toHaveURL('/cinemas')

    await moviesLink.click()
    await expect(page).toHaveURL('/movies')
  })
})
