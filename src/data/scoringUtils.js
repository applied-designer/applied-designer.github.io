import { archetypeData } from './archetypeData'
import { quizQuestions } from './quizData'

const ARCHETYPE_ORDER = Object.keys(archetypeData)
const DIMENSION_KEYS = Object.keys(archetypeData[ARCHETYPE_ORDER[0]].dimensions)

function createEmptyScores() {
    return ARCHETYPE_ORDER.reduce((acc, archetype) => {
        acc[archetype] = 0
        return acc
    }, {})
}

function createEmptyDimensionScores() {
    return DIMENSION_KEYS.reduce((acc, dimension) => {
        acc[dimension] = 0
        return acc
    }, {})
}

function normalizeResponses(responses) {
    const latestAnswersByQuestion = new Map()

    responses.forEach(response => {
        if (!response || typeof response.questionId !== 'string' || typeof response.answer !== 'string') {
            return
        }

        latestAnswersByQuestion.set(response.questionId, response.answer)
    })

    return Array.from(latestAnswersByQuestion.entries()).map(([questionId, answer]) => ({
        questionId,
        answer
    }))
}

function getTieBreakVector(archetypeName, dimensionScores) {
    const dimensions = archetypeData[archetypeName]?.dimensions || {}

    const prioritizedDimensions = Object.entries(dimensions)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([dimension]) => dimension)

    return prioritizedDimensions.map(dimension => dimensionScores[dimension] || 0)
}

function compareByTieBreakVector(aArchetype, bArchetype, dimensionScores) {
    const aVector = getTieBreakVector(aArchetype, dimensionScores)
    const bVector = getTieBreakVector(bArchetype, dimensionScores)

    for (let i = 0; i < Math.max(aVector.length, bVector.length); i++) {
        const aValue = aVector[i] ?? 0
        const bValue = bVector[i] ?? 0

        if (aValue !== bValue) {
            return bValue - aValue
        }
    }

    return 0
}

function sortArchetypes(archetypeNames, scores, dimensionScores) {
    return [...archetypeNames].sort((aArchetype, bArchetype) => {
        const scoreDiff = scores[bArchetype] - scores[aArchetype]
        if (scoreDiff !== 0) {
            return scoreDiff
        }

        const tieBreakDiff = compareByTieBreakVector(aArchetype, bArchetype, dimensionScores)
        if (tieBreakDiff !== 0) {
            return tieBreakDiff
        }

        return ARCHETYPE_ORDER.indexOf(aArchetype) - ARCHETYPE_ORDER.indexOf(bArchetype)
    })
}

export function calculateScores(responses) {
    const scores = createEmptyScores()
    const dimensionScores = createEmptyDimensionScores()
    const normalizedResponses = normalizeResponses(responses)

    normalizedResponses.forEach(response => {
        const question = quizQuestions.find(q => q.id === response.questionId)
        if (question) {
            const choice = question.choices.find(c => c.text === response.answer)
            if (choice && choice.archetype) {
                scores[choice.archetype] = (scores[choice.archetype] || 0) + 1

                const archetypeDimensions = archetypeData[choice.archetype]?.dimensions || {}
                Object.entries(archetypeDimensions).forEach(([dimension, value]) => {
                    dimensionScores[dimension] = (dimensionScores[dimension] || 0) + value
                })
            }
        }
    })

    const sortedArchetypes = sortArchetypes(ARCHETYPE_ORDER, scores, dimensionScores)
    const sorted = sortedArchetypes.map(archetype => [archetype, scores[archetype]])

    const primaryArchetype = sortedArchetypes[0]
    const secondaryPool = sortedArchetypes.filter(archetype => archetype !== primaryArchetype)
    const secondaryArchetype = sortArchetypes(secondaryPool, scores, dimensionScores)[0]

    return {
        primary: {
            archetype: primaryArchetype,
            score: scores[primaryArchetype],
            tieBreakVector: getTieBreakVector(primaryArchetype, dimensionScores)
        },
        secondary: secondaryArchetype
            ? {
                archetype: secondaryArchetype,
                score: scores[secondaryArchetype],
                tieBreakVector: getTieBreakVector(secondaryArchetype, dimensionScores)
            }
            : null,
        allScores: sorted,
        dimensionScores: Object.entries(dimensionScores)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
        tieBreakMethod: 'dominant-dimension-rank'
    }
}