import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

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
