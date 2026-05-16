import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

test('uploads a Markdown resume and renders the editor and preview', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await expect(page.getByTestId('resume-editor-name')).toHaveValue('林一')
  await expect(page.getByTestId('resume-preview')).toContainText('林一')
  await expect(page.getByTestId('resume-preview')).toContainText('前端开发工程师')
  await expect(page.getByTestId('resume-preview')).toContainText('Vue')
})
