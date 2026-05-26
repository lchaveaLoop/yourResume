import { expect, test, type Page } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

const SCREENSHOT_OPTIONS = { maxDiffPixels: 100 }

test.use({ viewport: { width: 1440, height: 1400 } })

async function expectStablePageScreenshot(page: Page, name: string) {
  await expect(page.getByTestId('resume-preview')).toHaveScreenshot(name, SCREENSHOT_OPTIONS)
}

test('base template renders correctly with standard resume', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-base').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-base.png')
})

test('tech template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-tech').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-tech.png')
})

test('product template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-product').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-product.png')
})

test('marketing template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-marketing').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-marketing.png')
})

test('finance template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-finance').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-finance.png')
})

test('education template renders correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-education').click()
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-education.png')
})

test('long resume shows page estimate and multi-page warning', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'long-resume.md'))
  await page.getByTestId('template-option-base').click()
  await expect(page.getByTestId('resume-page-estimate')).toContainText(/预计 \d+ 页/)
  await expect(page.getByTestId('resume-preview')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-long-resume.png')
})

test('photo upload renders in preview', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-base').click()
  // Upload a small test image
  await page.getByTestId('resume-editor-photo-input').setInputFiles(fixturePath('resumes', 'test-photo.png'))
  await expect(page.locator('[data-testid="resume-preview"] img[src^="data:"]')).toBeVisible()
  await expectStablePageScreenshot(page, 'template-photo.png')
})
