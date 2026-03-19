import { test, expect } from 'playwright/test'
import { getFullQuizAnswers } from '../utils/archetypeTestUtils'

const fullQuizAnswers = getFullQuizAnswers()

test.describe('Quiz mobile flow', () => {
    test('applies deterministic panel color sequence with matching text styles', async ({ page }) => {
        await page.goto('/#/quiz')

        const styleSnapshot = await page.evaluate(() => {
            const normalizeColor = (color) => color.replace(/\s+/g, '')
            const questions = Array.from(document.querySelectorAll('.sd-question')).slice(0, 5)

            return questions.map(question => {
                const title = question.querySelector('.sd-title, .sd-question__title')
                const answer = question.querySelector('.sd-item__control-label, .sd-radio__decorator, [role="radio"]')

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
        await page.goto('/#/quiz')

        const submitButton = page.getByRole('button', { name: 'Submit' })
        await expect(submitButton).toBeDisabled()

        for (const answer of fullQuizAnswers) {
            await page.getByText(answer, { exact: true }).click()
        }

        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(page.locator('.results-title')).toContainText('The Orchestrator')
        await expect(page.getByText('Dimension breakdown')).toBeVisible()
    })

    test('does not horizontally overflow on mobile viewport', async ({ page }) => {
        await page.goto('/#/quiz', { waitUntil: 'networkidle' })
        await page.waitForSelector('.sd-question', { timeout: 10000 })
        
        const overflowInfo = await page.evaluate(() => {
            const root = document.documentElement
            return {
                scrollWidth: root.scrollWidth,
                clientWidth: root.clientWidth,
                hasOverflow: root.scrollWidth > root.clientWidth + 50
            }
        })
        
        expect(overflowInfo.hasOverflow).toBe(false)
    })
})

test.describe('Quiz page mobile layout', () => {
    test('quiz container fits within viewport on mobile', async ({ page }) => {
        await page.goto('/#/quiz', { waitUntil: 'networkidle' })
        await page.waitForSelector('.quiz-container', { timeout: 10000 })
        
        const containerInfo = await page.evaluate(() => {
            const container = document.querySelector('.quiz-container')
            const rect = container.getBoundingClientRect()
            
            return {
                width: rect.width,
                left: rect.left,
                right: rect.right,
                viewportWidth: window.innerWidth,
                hasOverflowX: rect.width > window.innerWidth
            }
        })
        
        expect(containerInfo.hasOverflowX).toBe(false)
    })
    
    test('quiz container has no horizontal scroll on mobile', async ({ page }) => {
        await page.goto('/#/quiz', { waitUntil: 'networkidle' })
        await page.waitForSelector('.quiz-container', { timeout: 10000 })
        
        const scrollInfo = await page.evaluate(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                bodyScrollWidth: document.body.scrollWidth,
                bodyClientWidth: document.body.clientWidth
            }
        })
        
        expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.clientWidth + 50)
    })
})

test.describe('Results page mobile layout', () => {
    test('results container fits within viewport on mobile', async ({ page }) => {
        await page.goto('/#/quiz')
        
        for (const answer of fullQuizAnswers) {
            await page.getByText(answer, { exact: true }).click()
        }
        
        await page.getByRole('button', { name: 'Submit' }).click()
        await page.waitForSelector('.results-container', { timeout: 10000 })
        
        const containerInfo = await page.evaluate(() => {
            const container = document.querySelector('.results-container')
            const rect = container.getBoundingClientRect()
            
            return {
                width: rect.width,
                left: rect.left,
                right: rect.right,
                viewportWidth: window.innerWidth,
                hasOverflowX: rect.width > window.innerWidth
            }
        })
        
        expect(containerInfo.hasOverflowX).toBe(false)
    })
    
    test('results page has no horizontal scroll on mobile', async ({ page }) => {
        await page.goto('/#/quiz')
        
        for (const answer of fullQuizAnswers) {
            await page.getByText(answer, { exact: true }).click()
        }
        
        await page.getByRole('button', { name: 'Submit' }).click()
        await page.waitForSelector('.results-container', { timeout: 10000 })
        
        const scrollInfo = await page.evaluate(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth
            }
        })
        
        expect(scrollInfo.scrollWidth).toBeLessThanOrEqual(scrollInfo.clientWidth + 50)
    })
})

test.describe('Dimension score verification', () => {
    test('results page shows dimension scores greater than 1', async ({ page }) => {
        await page.goto('/#/quiz')
        
        for (const answer of fullQuizAnswers) {
            await page.getByText(answer, { exact: true }).click()
        }
        
        await page.getByRole('button', { name: 'Submit' }).click()
        await page.waitForSelector('.results-container', { timeout: 10000 })
        
        // Debug: Get the breakdown section content
        const debugInfo = await page.evaluate(() => {
            const breakdown = document.querySelector('.results-breakdown')
            return {
                hasBreakdown: !!breakdown,
                text: breakdown ? breakdown.textContent.substring(0, 500) : null,
                innerHTML: breakdown ? breakdown.innerHTML.substring(0, 500) : null
            }
        })
        
        console.log('Debug info:', JSON.stringify(debugInfo, null, 2))
        
        // Get dimension values from the results page
        const dimensionValues = await page.evaluate(() => {
            const breakdown = document.querySelector('.results-breakdown')
            if (!breakdown) return null
            
            // Try different selectors to find dimension values
            const spans = breakdown.querySelectorAll('span')
            const values = []
            
            spans.forEach(span => {
                const text = span.textContent.trim()
                const match = text.match(/^(\d+)$/)
                if (match) {
                    values.push(parseInt(match[1], 10))
                }
            })
            
            return values
        })
        
        console.log('Dimension values found:', dimensionValues)
        
        // Verify we found dimension values
        expect(dimensionValues).not.toBeNull()
        expect(dimensionValues.length).toBeGreaterThan(0)
        
        // Verify all dimension scores are greater than 1
        dimensionValues.forEach((value, index) => {
            expect(value).toBeGreaterThan(1, `Dimension ${index + 1} score should be > 1, got ${value}`)
        })
    })
})
