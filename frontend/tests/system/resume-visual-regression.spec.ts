import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

const SCREENSHOT_OPTIONS = { fullPage: true, maxDiffPixels: 100 }

test('ATS template renders correctly with standard resume', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-ats').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expect(page).toHaveScreenshot('template-ats.png', SCREENSHOT_OPTIONS)
})

test('senior engineer template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-senior').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expect(page).toHaveScreenshot('template-senior.png', SCREENSHOT_OPTIONS)
})

test('marketing template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-marketing').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expect(page).toHaveScreenshot('template-marketing.png', SCREENSHOT_OPTIONS)
})

test('long resume shows page estimate and multi-page warning', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'long-resume.md'))
  await page.getByTestId('template-option-long').click()
  await expect(page.getByTestId('resume-page-estimate')).toContainText(/预计 \d+ 页/)
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expect(page).toHaveScreenshot('template-long-resume.png', SCREENSHOT_OPTIONS)
})

test('photo upload renders in preview', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-ats').click()
  // Upload a small test image
  await page.getByTestId('resume-editor-photo-input').setInputFiles(fixturePath('resumes', 'test-photo.png'))
  await expect(page.locator('[data-testid="resume-preview"] img[src^="data:"]')).toBeVisible()
  await expect(page).toHaveScreenshot('template-photo.png', SCREENSHOT_OPTIONS)
})
