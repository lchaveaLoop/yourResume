import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

async function expectPdfDownload(page: import('@playwright/test').Page, filenamePattern: RegExp) {
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(async error => {
    const errorText = await page.getByTestId('export-pdf-error').textContent({ timeout: 1000 }).catch(() => '')
    throw new Error(errorText || error.message)
  })
  await page.getByTestId('export-pdf-button').click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(filenamePattern)
  const path = await download.path()
  expect(path).toBeTruthy()
  await download.delete()
}

test('shows PDF export and DOCX export', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await expect(page.getByTestId('export-pdf-button')).toBeEnabled()
  await expect(page.getByTestId('export-docx-button')).toBeEnabled()
})

test('keeps PDF export available for a long resume', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'long-resume.md'))

  await expect(page.getByTestId('resume-page-estimate')).toContainText(/预计 \d+ 页/)
  await expect(page.getByTestId('export-pdf-button')).toBeEnabled()
})

test('exports real PDFs for primary PC templates', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await page.getByTestId('template-option-base').click()
  await expectPdfDownload(page, /林一_简历\.pdf/)

  await page.getByTestId('template-option-tech').click()
  await expectPdfDownload(page, /林一_简历\.pdf/)
})

test('exports a real PDF for long resumes', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'long-resume.md'))
  await page.getByTestId('template-option-base').click()

  await expect(page.getByTestId('resume-page-estimate')).toContainText(/预计 \d+ 页/)
  await expectPdfDownload(page, /周远_简历\.pdf/)
})

test('exports a real PDF after photo upload', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-base').click()
  await page.getByTestId('resume-editor-photo-input').setInputFiles(fixturePath('resumes', 'test-photo.png'))
  await expect(page.locator('[data-testid="resume-preview"] img[src^="data:"]')).toBeVisible()

  await expectPdfDownload(page, /林一_简历\.pdf/)
})
