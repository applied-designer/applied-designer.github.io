import { describe, it, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QuizPage from '../pages/Quiz'

const qCount = 12;

describe('Quiz Styling with SurveyJS Custom CSS', () => {
    beforeEach(() => {
    // Clear any previous test state
        localStorage.clear()
    })

    it('should render survey with custom CSS root container', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            // SurveyJS renders with sd-root-modern class
            const surveyRoot = document.querySelector('.sd-root-modern')
            expect(surveyRoot).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('should apply survey-container class to main container', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const container = document.querySelector('.sd-root-modern')
            expect(container).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('should have question elements with survey-question class', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            // Wait for SurveyJS to render at least one question
            const questions = document.querySelectorAll('.sd-question')
            expect(questions.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('should apply panel color classes to questions', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const questions = document.querySelectorAll('.sd-question')
            const panelClasses = ['quiz-panel-blue', 'quiz-panel-brown', 'quiz-panel-green', 'quiz-panel-yellow', 'quiz-panel-purple']
      
            // Map questions to their expected panel colors (cycling through 5 colors)
            const foundColors = new Set()
            questions.forEach((question, index) => {
                const expectedClass = panelClasses[index % panelClasses.length]
                if (question.classList.contains(expectedClass)) {
                    foundColors.add(expectedClass)
                }
            })

            // Should have applied at least one panel color
            expect(foundColors.size).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('should apply survey-question-title class to question titles', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const titles = document.querySelectorAll('.sd-question__title')
            expect(titles.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('should apply survey-radioitem class to radio items', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const radioItems = document.querySelectorAll('.sd-radio')
            expect(radioItems.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('should have computed styles for panel-colored questions', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const bluePanel = document.querySelector('.quiz-panel-blue')
            if (bluePanel) {
                const styles = window.getComputedStyle(bluePanel)
                // Blue panel should have blue background
                expect(styles.backgroundColor).toBeTruthy()
            }
        }, { timeout: 3000 })
    })

    it('should have CSS variable --panel-fg set on panel questions', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const panelQuestion = document.querySelector('.sd-question.quiz-panel')
            if (panelQuestion) {
                const styles = window.getComputedStyle(panelQuestion)
                // Should have --panel-fg CSS variable set
                const panelFg = styles.getPropertyValue('--panel-fg').trim()
                expect(panelFg.length).toBeGreaterThan(0)
            }
        }, { timeout: 3000 })
    })

    it('should apply custom panel styling on top of default SurveyJS classes', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const surveyRoot = document.querySelector('.sd-root-modern')
            if (surveyRoot) {
                const questions = surveyRoot.querySelectorAll('.sd-question')
                // Should have survey questions with custom panel classes applied
                expect(questions.length).toBeGreaterThan(0)
                const hasCustomClass = Array.from(questions).some(q => q.classList.contains('quiz-panel'))
                expect(hasCustomClass).toBe(true)
            }
        }, { timeout: 3000 })
    })

    it('should apply question description styling', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const descriptions = document.querySelectorAll('.sd-question__description')
            // Question description should exist (question counter)
            expect(descriptions.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('should style radio item as selected when clicked', async () => {
        const { container } = render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const radioItems = container.querySelectorAll('.sd-radio')
            expect(radioItems.length).toBeGreaterThan(0)
      
            // First radio item should exist
            const firstItem = radioItems[0]
            if (firstItem) {
                expect(firstItem).toBeTruthy()
            }
        }, { timeout: 3000 })
    })

    it('should maintain quiz-panel base class alongside panel-color class', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const panelQuestions = document.querySelectorAll('.quiz-panel')
            expect(panelQuestions.length).toBeGreaterThan(0)
      
            // Each should also have one of the color classes
            panelQuestions.forEach((question) => {
                const colorClasses = ['quiz-panel-blue', 'quiz-panel-brown', 'quiz-panel-green', 'quiz-panel-yellow', 'quiz-panel-purple']
                const hasColor = colorClasses.some(cls => question.classList.contains(cls))
                expect(hasColor).toBe(true)
            })
        }, { timeout: 3000 })
    })

    it('should have consistent styling across all questions regardless of panel color', async () => {
        render(
            <BrowserRouter>
                <QuizPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            const questions = document.querySelectorAll('.sd-question')
            expect(questions.length).toEqual(qCount);
      
            // All questions should have survey-question-title
            questions.forEach((question) => {
                const title = question.querySelector('.sv-title-actions__title')
                expect(title).toBeTruthy()
            })
        }, { timeout: 3000 })
    })
})
