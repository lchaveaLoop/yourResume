import { expect, test } from '@playwright/test'
import { fixturePath } from '../helpers/file-upload'

test('edits basic fields and syncs the preview', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))

  await page.getByTestId('resume-editor-name').fill('李明')
  await page.getByTestId('resume-editor-email').fill('liming@example.com')
  await page.getByTestId('resume-editor-target-role').fill('市场经理')
  await page.getByTestId('resume-editor-summary').fill('负责品牌增长和内容营销。')

  await expect(page.getByTestId('resume-preview')).toContainText('李明')
  await expect(page.getByTestId('resume-preview')).toContainText('liming@example.com')
  await expect(page.getByTestId('resume-preview')).toContainText('市场经理')
  await expect(page.getByTestId('resume-preview')).toContainText('负责品牌增长和内容营销。')
})

test('edits skills and experience details', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-upload-input').setInputFiles(fixturePath('resumes', 'basic-resume.md'))
  await page.getByTestId('template-option-base').click()

  await page.getByTestId('resume-editor-add-skill').click()
  await page.getByTestId('resume-editor-skill-4').fill('自动化测试')
  await page.getByTestId('resume-editor-experience-0-details').fill('负责端到端测试\n提升交付稳定性')

  await expect(page.getByTestId('resume-preview')).toContainText('自动化测试')
  await expect(page.getByTestId('resume-preview')).toContainText('负责端到端测试')
})
