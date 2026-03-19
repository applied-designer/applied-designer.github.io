import { test } from 'playwright/test'

test.describe('Debug SurveyJS', () => {
    test('check page content', async ({ page }) => {
        await page.goto('/#/quiz')
        
        // Wait a bit for JavaScript to execute
        await page.waitForTimeout(3000)
        
        // Log the HTML
        const html = await page.content()
        console.log('Page HTML length:', html.length)
        
        // Check for any elements
        const body = await page.locator('body').innerHTML()
        console.log('Body content:', body.substring(0, 500))
        
        // Check for quiz container
        const quizContainer = await page.locator('.quiz-container').count()
        console.log('quiz-container count:', quizContainer)
        
        // Check for survey wrapper
        const surveyWrapper = await page.locator('.survey-wrapper').count()
        console.log('survey-wrapper count:', surveyWrapper)
        
        // Check for any sd-question
        const sdQuestion = await page.locator('.sd-question').count()
        console.log('sd-question count:', sdQuestion)
        
        // Check for any button
        const buttons = await page.locator('button').count()
        console.log('button count:', buttons)
        
        // Get all classes in the body
        const classes = await page.evaluate(() => {
            const elements = document.body.querySelectorAll('*')
            const classSet = new Set()
            elements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(c => {
                        if (c) classSet.add(c)
                    })
                }
            })
            return Array.from(classSet).slice(0, 20)
        })
        console.log('Classes found:', classes)
    })
})
