import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { encodeDimsV1, getClosestArchetypes, DIM_KEYS } from '../data/quizUtils'
import { calculateScores } from '../data/scoringUtils'
import { quizQuestions } from '../data/quizData'
import { getAnswerForArchetype, ORCHESTRATOR, DISRUPTOR } from './utils/archetypeTestUtils'
import ResultsPage from '../pages/Results'
import QuizPage from '../pages/Quiz'

const createResponsesForArchetype = (archetype) => {
    return quizQuestions.map(q => ({
        questionId: q.id,
        answer: getAnswerForArchetype(q.id, archetype)
    }))
}

const getExpectedDimsForArchetype = (archetype) => {
    const responses = createResponsesForArchetype(archetype)
    const scores = calculateScores(responses)
    const dims = Object.fromEntries(
        (scores.dimensionScores || []).map(([k, v]) => [k, v])
    )
    DIM_KEYS.forEach(k => { if (!(k in dims)) dims[k] = 0 })
    return dims
}

describe('Quiz to Results Flow', () => {
    describe('Orchestrator archetype flow', () => {
        it('Orchestrator answers produce valid dimension scores', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            expect(dims.strategy).toBeGreaterThan(0)
            expect(dims.adaptability).toBeGreaterThan(0)
            expect(dims.collaboration).toBeGreaterThan(0)
            expect(dims.experimentation).toBeGreaterThan(0)
            expect(dims.impact).toBeGreaterThan(0)
        })

        it('Orchestrator dimensions encode to v1 format', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const b64 = encodeDimsV1(dims)
            const decoded = atob(b64)
            
            expect(decoded.startsWith('v1:')).toBe(true)
            expect(decoded).toContain('strategy:')
            expect(decoded).toContain('adaptability:')
            expect(decoded).toContain('collaboration:')
            expect(decoded).toContain('experimentation:')
            expect(decoded).toContain('impact:')
        })
    })

    describe('Disruptor archetype flow', () => {
        it('Disruptor answers produce valid dimension scores', () => {
            const dims = getExpectedDimsForArchetype(DISRUPTOR)
            expect(dims.strategy).toBeGreaterThan(0)
            expect(dims.adaptability).toBeGreaterThan(0)
            expect(dims.collaboration).toBeGreaterThan(0)
            expect(dims.experimentation).toBeGreaterThan(0)
            expect(dims.impact).toBeGreaterThan(0)
        })

        it('Disruptor dimensions encode to v1 format', () => {
            const dims = getExpectedDimsForArchetype(DISRUPTOR)
            const b64 = encodeDimsV1(dims)
            const decoded = atob(b64)
            
            expect(decoded.startsWith('v1:')).toBe(true)
            expect(decoded).toContain('strategy:')
            expect(decoded).toContain('adaptability:')
            expect(decoded).toContain('collaboration:')
            expect(decoded).toContain('experimentation:')
            expect(decoded).toContain('impact:')
        })
    })

    describe('Full quiz flow with results page', () => {
        it('renders results page with encoded Orchestrator dims', async () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsB64 = encodeDimsV1(dims)

            render(
                <MemoryRouter initialEntries={[`/results?dims=${dimsB64}`]}>
                    <Routes>
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                const resultsContainer = document.querySelector('.results-container')
                expect(resultsContainer).toBeTruthy()
            }, { timeout: 3000 })

            await waitFor(() => {
                expect(screen.getByText('Your Results')).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('renders results page with encoded Disruptor dims', async () => {
            const dims = getExpectedDimsForArchetype(DISRUPTOR)
            const dimsB64 = encodeDimsV1(dims)

            render(
                <MemoryRouter initialEntries={[`/results?dims=${dimsB64}`]}>
                    <Routes>
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                const resultsContainer = document.querySelector('.results-container')
                expect(resultsContainer).toBeTruthy()
            }, { timeout: 3000 })

            await waitFor(() => {
                expect(screen.getByText('Your Results')).toBeTruthy()
            }, { timeout: 3000 })
        })

        it('results page displays archetype results heading', async () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsB64 = encodeDimsV1(dims)

            render(
                <MemoryRouter initialEntries={[`/results?dims=${dimsB64}`]}>
                    <Routes>
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                expect(screen.getByText('You are the...')).toBeTruthy()
            }, { timeout: 3000 })
        })
    })

    describe('Partial quiz completion', () => {
        it('submit button is disabled when no questions are answered', async () => {
            render(
                <MemoryRouter initialEntries={['/quiz']}>
                    <Routes>
                        <Route path="/quiz" element={<QuizPage />} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                const submitButton = document.querySelector('.submit-button')
                expect(submitButton).toBeTruthy()
            }, { timeout: 3000 })

            await waitFor(() => {
                const submitButton = document.querySelector('.submit-button')
                expect(submitButton.classList.contains('disabled')).toBe(true)
            }, { timeout: 3000 })
        })

        it('calculates partial dimension scores', () => {
            const partialResponses = createResponsesForArchetype(ORCHESTRATOR).slice(0, 6)
            const scores = calculateScores(partialResponses)
            
            expect(scores.primary.score).toBeLessThan(12)
            expect(scores.primary.archetype).toBeTruthy()
        })

        it('no questions answered returns zero scores', () => {
            const scores = calculateScores([])
            expect(scores.primary.score).toBe(0)
        })

        it('partial responses still produce valid dimension totals', () => {
            const partialResponses = createResponsesForArchetype(ORCHESTRATOR).slice(0, 6)
            const scores = calculateScores(partialResponses)
            
            scores.dimensionScores.forEach(([key, value]) => {
                expect(value).toBeGreaterThan(0)
                expect(value).toBeLessThanOrEqual(30)
            })
        })
    })
})
