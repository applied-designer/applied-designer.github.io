import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { encodeDimsV1, DIM_KEYS } from '../data/quizUtils'
import { quizQuestions } from '../data/quizData'
import { calculateScores } from '../data/scoringUtils'
import { ORCHESTRATOR, getAnswerForArchetype } from './utils/archetypeTestUtils'

const buildDimsRaw = (dims) => {
    return 'v1:' + DIM_KEYS.map(k => `${k}:${dims[k] ?? 0}`).join(',')
}

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
            const dimsRaw = buildDimsRaw(dims)

            expect(dimsRaw).toMatch(/^v1:/)
            expect(dimsRaw).toContain('strategy:')
            expect(dimsRaw).toContain('adaptability:')
            expect(dimsRaw).toContain('collaboration:')
            expect(dimsRaw).toContain('experimentation:')
            expect(dimsRaw).toContain('impact:')
        })

        it('dims_raw matches encodeDimsV1 output (minus base64)', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = buildDimsRaw(dims)
            const b64 = encodeDimsV1(dims)
            const decoded = atob(b64)

            expect(decoded).toBe(dimsRaw)
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
            const dimsRaw = buildDimsRaw(dims)

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
            const dimsRaw = buildDimsRaw(dims)

            DIM_KEYS.forEach(key => {
                const regex = new RegExp(`${key}:(\\d+)`)
                const match = dimsRaw.match(regex)
                expect(match).not.toBeNull()
                expect(parseInt(match[1], 10)).toBe(dims[key])
            })
        })

        it('dims_raw format is valid for manual decoding', () => {
            const dims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const dimsRaw = buildDimsRaw(dims)

            const parts = dimsRaw.split(':')
            expect(parts[0]).toBe('v1')

            const pairs = parts.slice(1).join(':').split(',')
            expect(pairs.length).toBe(5)

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
            const dimsRaw = buildDimsRaw(dims)

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

    describe('different archetypes produce different analytics', () => {
        it('different archetypes produce different dims_raw values', () => {
            const orchestratorDims = getExpectedDimsForArchetype(ORCHESTRATOR)
            const orchestratorDimsRaw = buildDimsRaw(orchestratorDims)

            const researcherDims = getExpectedDimsForArchetype('The Researcher')
            const researcherDimsRaw = buildDimsRaw(researcherDims)

            expect(orchestratorDimsRaw).not.toBe(researcherDimsRaw)
        })

        it('all archetypes produce valid analytics params for their answered questions', () => {
            const archetypes = ['The Orchestrator', 'The Researcher', 'The Disruptor', 'The Educator']

            archetypes.forEach(archetype => {
                const dims = getExpectedDimsForArchetype(archetype)
                const surveyData = getSurveyDataForArchetype(archetype)
                const dimsRaw = buildDimsRaw(dims)

                expect(dimsRaw).toMatch(/^v1:strategy:\d+,adaptability:\d+,collaboration:\d+,experimentation:\d+,impact:\d+$/)

                const answeredQuestions = Object.keys(surveyData).filter(k => surveyData[k] !== undefined)
                expect(answeredQuestions.length).toBeGreaterThan(0)
            })
        })
    })
})
