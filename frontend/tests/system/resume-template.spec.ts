import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

test('switches templates and updates preview class', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await page.getByTestId('template-option-tech').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-tech/)

  await page.getByTestId('template-option-product').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-product/)

  await page.getByTestId('template-option-marketing').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-marketing/)

  await page.getByTestId('template-option-finance').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-finance/)

  await page.getByTestId('template-option-education').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-education/)
})
