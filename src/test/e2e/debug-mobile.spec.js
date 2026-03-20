import { test } from 'playwright/test';

test.describe('Debug Mobile SurveyJS', () => {
    test('check mobile quiz page content', async ({ page }) => {
        await page.goto('/#/quiz', { waitUntil: 'networkidle' });
        
        // Wait for survey to render
        await page.waitForTimeout(5000);
        
        // Check for sd-question
        const sdQuestion = await page.locator('.sd-question').count();
        console.log('sd-question count:', sdQuestion);
        
        // Check for any quiz-panel class
        const quizPanel = await page.locator('.quiz-panel').count();
        console.log('quiz-panel count:', quizPanel);
        
        // Check for quiz-panel-blue specifically
        const quizPanelBlue = await page.locator('.quiz-panel-blue').count();
        console.log('quiz-panel-blue count:', quizPanelBlue);
        
        // Get all classes from sd-question elements
        const classes = await page.evaluate(() => {
            const questions = document.querySelectorAll('.sd-question');
            const allClasses = new Set();
            questions.forEach(q => {
                q.classList.forEach(c => allClasses.add(c));
            });
            return Array.from(allClasses);
        });
        console.log('sd-question classes:', classes.slice(0, 30));
    });
});
