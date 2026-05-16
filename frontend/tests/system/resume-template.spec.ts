import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

test('switches templates and updates preview class', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await page.getByTestId('template-option-senior').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-senior/)

  await page.getByTestId('template-option-long').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-long/)

  await page.getByTestId('template-option-marketing').click()
  await expect(page.locator('[data-testid="resume-preview"] article')).toHaveClass(/template-marketing/)
})
