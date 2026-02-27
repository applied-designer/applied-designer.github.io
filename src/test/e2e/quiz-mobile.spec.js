import { test, expect } from 'playwright/test'
import { getFullQuizAnswers } from '../utils/archetypeTestUtils'

const fullQuizAnswers = getFullQuizAnswers()

test.describe('Quiz mobile flow', () => {
  test('applies deterministic panel color sequence with matching text styles', async ({ page }) => {
    await page.goto('/quiz')

    const styleSnapshot = await page.evaluate(() => {
      const normalizeColor = (color) => color.replace(/\s+/g, '')
      const questions = Array.from(document.querySelectorAll('.sd-question')).slice(0, 5)

      return questions.map(question => {
        const title = question.querySelector('.sd-title, .sd-question__title')
        const answer = question.querySelector('.sd-item__control-label, .sd-radioitem__control-label')

        return {
          classes: Array.from(question.classList),
          backgroundColor: normalizeColor(getComputedStyle(question).backgroundColor),
          titleColor: title ? normalizeColor(getComputedStyle(title).color) : null,
          answerColor: answer ? normalizeColor(getComputedStyle(answer).color) : null,
          titleFontSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : null,
          answerFontSize: answer ? Number.parseFloat(getComputedStyle(answer).fontSize) : null
        }
      })
    })

    const expected = [
      { cls: 'quiz-panel-blue', bg: 'rgb(25,117,161)', fg: 'rgb(255,255,255)' },
      { cls: 'quiz-panel-brown', bg: 'rgb(123,57,42)', fg: 'rgb(255,255,255)' },
      { cls: 'quiz-panel-green', bg: 'rgb(208,231,191)', fg: 'rgb(0,0,0)' },
      { cls: 'quiz-panel-yellow', bg: 'rgb(250,164,26)', fg: 'rgb(0,0,0)' },
      { cls: 'quiz-panel-purple', bg: 'rgb(137,58,105)', fg: 'rgb(255,255,255)' }
    ]

    styleSnapshot.forEach((question, index) => {
      expect(question.classes).toContain('quiz-panel')
      expect(question.classes).toContain(expected[index].cls)
      expect(question.backgroundColor).toBe(expected[index].bg)
      expect(question.titleColor).toBe(expected[index].fg)
      expect(question.answerColor).toBe(expected[index].fg)
      expect(question.titleFontSize).toBeGreaterThan(question.answerFontSize)
      expect(question.titleFontSize / question.answerFontSize).toBeGreaterThanOrEqual(1.9)
    })
  })

  test('completes quiz and shows ranked results with dimensions', async ({ page }) => {
    await page.goto('/quiz')

    const submitButton = page.getByRole('button', { name: 'Submit' })
    await expect(submitButton).toBeDisabled()

    for (const answer of fullQuizAnswers) {
      await page.getByText(answer, { exact: true }).click()
    }

    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await expect(page.getByRole('heading', { level: 1 })).toContainText('You are')
    await expect(page.getByText('Dimension breakdown:')).toBeVisible()
    await expect(page.getByText('Tie-break method:')).toBeVisible()
  })

  test('does not horizontally overflow on mobile viewport', async ({ page }) => {
    await page.goto('/quiz')

    const hasOverflow = await page.evaluate(() => {
      const root = document.documentElement
      return root.scrollWidth > root.clientWidth + 1
    })

    expect(hasOverflow).toBe(false)
  })
})
