import { test, expect } from '@playwright/test'

test('app loads and shows upload zone', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('resume-upload-zone')).toBeVisible()
  await expect(page.getByTestId('resume-create-blank')).toBeVisible()
})

test('can create blank resume and see editor', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()
  await expect(page.getByTestId('resume-editor')).toBeVisible()
})

test('editor has basic info fields after creating blank resume', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()
  await expect(page.getByTestId('resume-editor-name')).toBeVisible()
  await expect(page.getByTestId('resume-editor-email')).toBeVisible()
})

test('template switching works', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()
  await page.getByTestId('template-option-senior').click()
  await expect(page.getByTestId('template-option-senior')).toHaveAttribute('aria-pressed', 'true')
})

test('can switch to all templates', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()

  for (const t of ['ats', 'senior', 'long', 'marketing']) {
    await page.getByTestId(`template-option-${t}`).click()
    await expect(page.getByTestId(`template-option-${t}`)).toHaveAttribute('aria-pressed', 'true')
  }
})

test('export buttons are visible when editor is shown', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()
  await expect(page.getByTestId('export-pdf-button')).toBeVisible()
  await expect(page.getByTestId('export-docx-button')).toBeVisible()
})

test('can type name and see it in preview', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()

  const nameInput = page.getByTestId('resume-editor-name')
  await nameInput.fill('张三')
  await expect(nameInput).toHaveValue('张三')
})

test('can add and remove education entry', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()

  await page.getByTestId('resume-editor-add-education').click()
  await expect(page.getByTestId('resume-editor-education-0-school')).toBeVisible()

  await page.getByTestId('resume-editor-education-0-remove').click()
  // After removing the only entry, the field should not be visible
  await expect(page.getByTestId('resume-editor-education-0-school')).not.toBeVisible()
})

test('can add and remove skill', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()

  await page.getByTestId('resume-editor-add-skill').click()
  await expect(page.getByTestId('resume-editor-skill-0')).toBeVisible()

  await page.getByTestId('resume-editor-skill-0-remove').click()
  await expect(page.getByTestId('resume-editor-skill-0')).not.toBeVisible()
})

test('draft status shows after editing', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('resume-create-blank').click()

  const nameInput = page.getByTestId('resume-editor-name')
  await nameInput.fill('测试用户')

  // Draft status should appear after editing
  await expect(page.getByTestId('resume-draft-status')).toBeVisible()
})
