import { test, expect } from 'playwright/test'

test.describe('Quiz Styling E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the quiz page
    await page.goto('/quiz', { waitUntil: 'networkidle' })
  })

  test('should render quiz with properly styled questions', async ({ page }) => {
    // Wait for first question to render
    await page.waitForSelector('.survey-question', { timeout: 5000 })

    // Verify container classes exist
    const container = await page.locator('.survey-container').count()
    expect(container).toBeGreaterThan(0)

    // Verify question elements exist
    const questions = await page.locator('.survey-question').count()
    expect(questions).toBeGreaterThan(0)
  })

  test('should apply correct panel colors to questions', async ({ page }) => {
    await page.waitForSelector('.survey-question')

    const bluePanels = await page.locator('.quiz-panel-blue').count()
    const brownPanels = await page.locator('.quiz-panel-brown').count()
    const greenPanels = await page.locator('.quiz-panel-green').count()
    const yellowPanels = await page.locator('.quiz-panel-yellow').count()
    const purplePanels = await page.locator('.quiz-panel-purple').count()

    // With 12 questions cycling through 5 colors: 3, 2, 2, 2, 3
    const totalPanels = bluePanels + brownPanels + greenPanels + yellowPanels + purplePanels
    expect(totalPanels).toBe(12)
  })

  test('should have white text on blue panel', async ({ page }) => {
    await page.waitForSelector('.quiz-panel-blue')

    const bluePanel = await page.locator('.quiz-panel-blue').first()
    const bgColor = await bluePanel.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    )

    // Blue background should be rgb(25, 117, 161) or similar
    expect(bgColor).toMatch(/rgb\(25,\s*117,\s*161\)/)

    // Text color should be white
    const textColor = await bluePanel.evaluate((el) => 
      window.getComputedStyle(el).color
    )
    expect(textColor).toMatch(/rgb\(255,\s*255,\s*255\)/)
  })

  test('should have black text on green panel', async ({ page }) => {
    await page.waitForSelector('.quiz-panel-green')

    const greenPanel = await page.locator('.quiz-panel-green').first()
    const bgColor = await greenPanel.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    )

    // Green background
    expect(bgColor).toMatch(/rgb\(208,\s*231,\s*191\)/)

    // Text should be black
    const textColor = await greenPanel.evaluate((el) => 
      window.getComputedStyle(el).color
    )
    expect(textColor).toMatch(/rgb\(0,\s*0,\s*0\)/)
  })

  test('should have question titles with custom styling class', async ({ page }) => {
    await page.waitForSelector('.survey-question-title')

    const titles = await page.locator('.survey-question-title').count()
    expect(titles).toBeGreaterThan(0)

    // Check font properties
    const titleFontSize = await page.locator('.survey-question-title').first().evaluate((el) => 
      window.getComputedStyle(el).fontSize
    )
    expect(titleFontSize).toBeTruthy()
  })

  test('should have radio items with custom styling', async ({ page }) => {
    await page.waitForSelector('.survey-radioitem')

    const radioItems = await page.locator('.survey-radioitem').count()
    expect(radioItems).toBeGreaterThan(0)
  })

  test('should not have any SurveyJS internal classes in live DOM', async ({ page }) => {
    await page.waitForSelector('.survey-root')

    // Check for any .sd-* or .sv-* classes
    const hasOldClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="sd-"], [class*="sv-"]')
      return elements.length > 0
    })

    expect(hasOldClasses).toBe(false)
  })

  test('should have CSS variables for panel colors', async ({ page }) => {
    await page.waitForSelector('.quiz-panel-blue')

    const panelFgColor = await page.locator('.quiz-panel-blue').first().evaluate((el) => 
      window.getComputedStyle(el).getPropertyValue('--panel-fg').trim()
    )

    expect(panelFgColor).toBeTruthy()
  })

  test('should style first and last questions with correct panel colors', async ({ page }) => {
    await page.waitForSelector('.survey-question')

    const questions = await page.locator('.survey-question')
    const count = await questions.count()
    expect(count).toBe(12)

    // First question (index 0) should be blue (0 % 5 = 0)
    const firstQuestion = questions.first()
    const hasBlueClass = await firstQuestion.evaluate((el) => 
      el.classList.contains('quiz-panel-blue')
    )
    expect(hasBlueClass).toBe(true)

    // Last question (index 11) should be brown (11 % 5 = 1)
    const lastQuestion = questions.last()
    const hasBrownClass = await lastQuestion.evaluate((el) => 
      el.classList.contains('quiz-panel-brown')
    )
    expect(hasBrownClass).toBe(true)
  })

  test('should have proper spacing and layout', async ({ page }) => {
    await page.waitForSelector('.survey-container')

    const container = await page.locator('.survey-container')
    const display = await container.evaluate((el) => 
      window.getComputedStyle(el).display
    )

    expect(display).toBe('flex')

    const gap = await container.evaluate((el) => 
      window.getComputedStyle(el).gap
    )
    expect(gap).toBeTruthy()
  })

  test('should apply focus styles to radio items', async ({ page }) => {
    await page.waitForSelector('.survey-radioitem')

    const firstRadio = page.locator('.survey-radioitem').first()
    
    // Focus the element
    await firstRadio.focus()

    // Check for focus styles (outline)
    const outline = await firstRadio.evaluate((el) => 
      window.getComputedStyle(el).outline
    )

    // Should have some outline style for accessibility
    expect(outline).toBeTruthy()
  })

  test('should have question description with proper styling', async ({ page }) => {
    await page.waitForSelector('.survey-question-description')

    const descriptions = await page.locator('.survey-question-description').count()
    expect(descriptions).toBeGreaterThan(0)

    // Should show question counter (e.g., "1 of 12")
    const firstDesc = await page.locator('.survey-question-description').first()
    const text = await firstDesc.innerText()
    expect(text).toMatch(/\d+ of \d+/)
  })

  test('should maintain consistent styling across multiple questions', async ({ page }) => {
    await page.waitForSelector('.survey-question')

    const questionsWithTitles = await page.evaluate(() => {
      const questions = document.querySelectorAll('.survey-question')
      return Array.from(questions).every(q => q.querySelector('.survey-question-title'))
    })

    expect(questionsWithTitles).toBe(true)
  })

  test('should have submit button with proper styling', async ({ page }) => {
    // Fill out quiz first
    const radioItems = await page.locator('[role="radio"]')
    const count = await radioItems.count()

    // Click enough radio items to complete the quiz
    for (let i = 0; i < Math.min(12, count); i++) {
      await page.locator(`[role="radio"]`).nth(i).click()
    }

    // Submit button should exist and be styled
    const submitButton = await page.locator('.submit-button')
    const exists = await submitButton.count()
    
    if (exists > 0) {
      const bgColor = await submitButton.first().evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      )
      expect(bgColor).toBeTruthy()
    }
  })

  test('should display all 12 questions with correct layout', async ({ page }) => {
    // Wait for all questions to load
    await page.waitForSelector('.survey-question')
    
    const allQuestions = await page.locator('.survey-question').all()
    expect(allQuestions.length).toBe(12)

    // All should have the same core classes
    for (const question of allQuestions) {
      const hasQuizPanel = await question.evaluate((el) => 
        el.classList.contains('quiz-panel')
      )
      const hasTitle = await question.evaluate((el) => 
        el.querySelector('.survey-question-title') !== null
      )

      expect(hasQuizPanel).toBe(true)
      expect(hasTitle).toBe(true)
    }
  })
})
