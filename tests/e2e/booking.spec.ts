import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can login and view movies', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Логин').fill('testuser123')
    await page.getByLabel('Пароль').fill('Password1')
    await page.getByRole('button', { name: /войти/i }).click()

    await expect(page).toHaveURL(/\/my-tickets/)
  })

  test('user can view movie details', async ({ page }) => {
    await page.goto('/movies')

    const firstMovieLink = page.getByRole('link', { name: /фильм/i }).first()
    await expect(firstMovieLink).toBeVisible()
    await firstMovieLink.click()

    await expect(page).toHaveURL(/\/movies\/\d+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('user can view cinema details', async ({ page }) => {
    await page.goto('/cinemas')

    const firstCinemaLink = page.getByRole('link', { name: /кинотеатр/i }).first()
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

test.describe('Authentication Flow', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Логин').fill(`testuser${Date.now()}`)
    await page.getByLabel('Пароль').fill('Password1')
    await page.getByLabel('Подтверждение пароля').fill('Password1')
    await page.getByRole('button', { name: /зарегистрироваться/i }).click()

    await expect(page).toHaveURL(/\/my-tickets/)
  })

  test('registration shows validation errors', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Логин').fill('short')
    await page.getByLabel('Пароль').fill('weak')
    await page.getByRole('button', { name: /зарегистрироваться/i }).click()

    await expect(page.getByText('Минимум 8 символов')).toBeVisible()
  })
})
