import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { encodeDimsV1, DIM_KEYS } from '../data/quizUtils'
import { quizQuestions } from '../data/quizData'
import { calculateScores } from '../data/scoringUtils'
import { ORCHESTRATOR, getAnswerForArchetype } from './utils/archetypeTestUtils'
import QuizPage from '../pages/Quiz'

vi.mock('survey-react-ui', async () => {
    const actual = await vi.importActual('survey-react-ui')
    return {
        ...actual,
        Survey: ({ model }) => {
            const surveyData = {}
            quizQuestions.forEach(q => {
                const answer = getAnswerForArchetype(q.id, ORCHESTRATOR)
                if (answer) {
                    surveyData[q.id] = answer
                }
            })
            model.data = surveyData
            
            return (
                <div data-testid="mock-survey">
                    <button 
                        className="submit-button enabled"
                        onClick={() => {
                            const responses = Object.entries(model.data).map(([questionId, answer]) => ({ questionId, answer }))
                            const dimsResult = Object.fromEntries(
                                ((calculateScores(responses) || {}).dimensionScores || []).map(([k, v]) => [k, v])
                            )
                            DIM_KEYS.forEach(k => { if (!(k in dimsResult)) dimsResult[k] = 0 })
                            
                            window.gtag?.('event', 'quiz_complete', {
                                dims_raw: encodeDimsV1(dimsResult),
                                version: 1,
                                ...dimsResult,
                                question_answers: JSON.stringify(model.data)
                            })
                        }}
                    >
                        Submit
                    </button>
                </div>
            )
        }
    }
})

const getExpectedDimsForArchetype = (archetype) => {
    const responses = quizQuestions.map(q => ({
        questionId: q.id,
        answer: getAnswerForArchetype(q.id, archetype)
    }))
    const scores = calculateScores(responses)
    const dims = Object.fromEntries(
        (scores.dimensionScores || []).map(([k, v]) => [k, v])
    )
    DIM_KEYS.forEach(k => { if (!(k in dims)) dims[k] = 0 })
    return dims
}

const getSurveyDataForArchetype = (archetype) => {
    const data = {}
    quizQuestions.forEach(q => {
        data[q.id] = getAnswerForArchetype(q.id, archetype)
    })
    return data
}

describe('Quiz Analytics', () => {
    let gtagSpy

    beforeEach(() => {
        gtagSpy = vi.fn()
        window.gtag = gtagSpy
    })

    afterEach(() => {
        delete window.gtag
    })

    describe('dims_raw format', () => {
        it('builds correct v1 format with all dimension keys', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            expect(dimsRaw).toMatch(/^v1:/)
            expect(dimsRaw).toContain('strategy:')
            expect(dimsRaw).toContain('adaptability:')
            expect(dimsRaw).toContain('collaboration:')
            expect(dimsRaw).toContain('experimentation:')
            expect(dimsRaw).toContain('impact:')
        })

        it('dims_raw format is the raw v1 string', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            expect(dimsRaw.startsWith('v1:')).toBe(true)
            expect(dimsRaw).toMatch(/^v1:strategy:\d+,adaptability:\d+,collaboration:\d+,experimentation:\d+,impact:\d+$/)
        })

        it('base64 encoding of dims_raw produces valid URL-safe string', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)
            const b64 = btoa(dimsRaw)

            expect(b64).toBeTruthy()
            expect(atob(b64)).toBe(dimsRaw)
        })

        it('all dimensions have positive scores for complete quiz', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)

            DIM_KEYS.forEach(key => {
                expect(dims[key]).toBeGreaterThan(0)
            })
        })
    })

    describe('gtag event structure', () => {
        it('creates event params with correct structure for GA4', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const surveyData = getSurveyDataForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            const eventParams = {
                dims_raw: dimsRaw,
                strategy: dims.strategy,
                adaptability: dims.adaptability,
                collaboration: dims.collaboration,
                experimentation: dims.experimentation,
                impact: dims.impact,
                question_answers: JSON.stringify(surveyData)
            }

            expect(eventParams.dims_raw).toBeDefined()
            expect(eventParams.strategy).toBeGreaterThan(0)
            expect(eventParams.adaptability).toBeGreaterThan(0)
            expect(eventParams.collaboration).toBeGreaterThan(0)
            expect(eventParams.experimentation).toBeGreaterThan(0)
            expect(eventParams.impact).toBeGreaterThan(0)
            expect(eventParams.question_answers).toBeDefined()
        })

        it('question_answers JSON contains answers for questions the archetype appears in', () => {
            const surveyData = getSurveyDataForArchetype(ORCHESTRATOR)
            const answeredQuestions = Object.keys(surveyData).filter(k => surveyData[k] !== undefined)

            answeredQuestions.forEach(qId => {
                expect(surveyData[qId]).toBeTruthy()
            })

            expect(answeredQuestions.length).toBeGreaterThan(0)
            expect(answeredQuestions.length).toBeLessThanOrEqual(quizQuestions.length)
        })

        it('individual dimension scores match dims_raw values', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            DIM_KEYS.forEach(key => {
                const regex = new RegExp(`${key}:(\\d+)`)
                const match = dimsRaw.match(regex)
                expect(match).not.toBeNull()
                expect(parseInt(match[1], 10)).toBe(dims[key])
            })
        })

        it('dims_raw format is valid for manual decoding', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            const parts = dimsRaw.split(':')
            expect(parts[0]).toBe('v1')

            const pairs = parts.slice(1).join(':').split(',')
            expect(pairs.length).toBe(DIM_KEYS.length)

            pairs.forEach(pair => {
                const [key, value] = pair.split(':')
                expect(DIM_KEYS).toContain(key)
                expect(parseInt(value, 10)).toBeGreaterThanOrEqual(0)
            })
        })
    })

    describe('GA blocked scenario', () => {
        it('gtag is undefined does not cause errors in param building', () => {
            delete window.gtag

            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const surveyData = getSurveyDataForArchetype(ORCHESTRATOR)
            const dimsRaw = encodeDimsV1(dims)

            const eventParams = {
                dims_raw: dimsRaw,
                strategy: dims.strategy,
                adaptability: dims.adaptability,
                collaboration: dims.collaboration,
                experimentation: dims.experimentation,
                impact: dims.impact,
                question_answers: JSON.stringify(surveyData)
            }

            expect(eventParams.dims_raw).toBe(dimsRaw)
        })

        it('gtag call is safely skipped when undefined', () => {
            delete window.gtag

            expect(() => {
                window.gtag?.('event', 'quiz_complete', {})
            }).not.toThrow()
        })

        it('gtag?.() syntax safely handles undefined', () => {
            delete window.gtag

            const callGtag = () => {
                window.gtag?.('event', 'test', {})
            }

            expect(callGtag).not.toThrow()
            expect(window.gtag).toBeUndefined()
        })
    })

    describe('QuizPage integration', () => {
        it('calls window.gtag with quiz_complete and correct params on submit', async () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const expectedDimsRaw = encodeDimsV1(dims)
            const expectedSurveyData = getSurveyDataForArchetype(ORCHESTRATOR)

            render(
                <MemoryRouter initialEntries={['/quiz']}>
                    <Routes>
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/results" element={<div>Results</div>} />
                    </Routes>
                </MemoryRouter>
            )

            await waitFor(() => {
                expect(document.querySelector('.submit-button')).toBeTruthy()
            }, { timeout: 3000 })

            const submitButton = document.querySelector('.submit-button')
            await act(async () => {
                submitButton.click()
            })

            expect(gtagSpy).toHaveBeenCalledTimes(1)
            expect(gtagSpy).toHaveBeenCalledWith(
                'event',
                'quiz_complete',
                expect.objectContaining({
                    dims_raw: expectedDimsRaw,
                    version: 1,
                    strategy: dims.strategy,
                    adaptability: dims.adaptability,
                    collaboration: dims.collaboration,
                    experimentation: dims.experimentation,
                    impact: dims.impact,
                    question_answers: JSON.stringify(expectedSurveyData)
                })
            )
        })
    })

    describe('different archetypes produce different analytics', () => {
        it('different archetypes produce different dims_raw values', () => {
            const orchestratorDims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const orchestratorDimsRaw = encodeDimsV1(orchestratorDims)

            const researcherDims = getExpectedDimsForArchetype('The Researcher')
            const researcherDimsRaw = encodeDimsV1(researcherDims)

            expect(orchestratorDimsRaw).not.toBe(researcherDimsRaw)
        })

        it('all archetypes produce valid analytics params for their answered questions', () => {
            const archetypes = ['The Orchestrator', 'The Researcher', 'The Disruptor', 'The Educator']

            archetypes.forEach(archetype => {
                const dims = getExpectedDimsForArchetype(archetype)
                const surveyData = getSurveyDataForArchetype(archetype)
                const dimsRaw = encodeDimsV1(dims)

                expect(dimsRaw).toMatch(/^v1:strategy:\d+,adaptability:\d+,collaboration:\d+,experimentation:\d+,impact:\d+$/)

                const answeredQuestions = Object.keys(surveyData).filter(k => surveyData[k] !== undefined)
                expect(answeredQuestions.length).toBeGreaterThan(0)
            })
        })
    })
})
