import { describe, it, expect } from 'vitest';
import { calculateScores } from '../data/scoringUtils';
import { quizQuestions } from '../data/quizData_v2';
import { archetypeData } from '../data/archetypeData';

function createSeededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function generateRandomResponses(random) {
    return quizQuestions.map(question => {
        const index = Math.floor(random() * question.choices.length);
        return {
            questionId: question.id,
            answer: question.choices[index].text
        };
    });
}

describe('Scoring Properties', () => {
    it('should satisfy deterministic invariants across generated response sets', () => {
        const random = createSeededRandom(20260226);
        const archetypeNames = Object.keys(archetypeData);

        for (let i = 0; i < 2500; i++) {
            const responses = generateRandomResponses(random);
            const resultA = calculateScores(responses);
            const resultB = calculateScores(responses);

            expect(resultA.primary.archetype).toBe(resultB.primary.archetype);
            expect(resultA.secondary.archetype).toBe(resultB.secondary.archetype);
            expect(resultA.primary.archetype).not.toBe(resultA.secondary.archetype);

            expect(resultA.allScores).toHaveLength(archetypeNames.length);
            expect(resultA.dimensionScores).toHaveLength(5);

            const scoreMap = new Map(resultA.allScores);
            const totalPoints = resultA.allScores.reduce((sum, [, score]) => sum + score, 0);

            expect(totalPoints).toBe(quizQuestions.length);
            expect(resultA.primary.score).toBeGreaterThanOrEqual(resultA.secondary.score);

            archetypeNames.forEach(archetype => {
                const score = scoreMap.get(archetype);
                expect(typeof score).toBe('number');
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(quizQuestions.length);
            });
        }
    });

    it('should ignore malformed response entries safely', () => {
        const validResponse = {
            questionId: quizQuestions[0].id,
            answer: quizQuestions[0].choices[0].text
        };

        const result = calculateScores([
            validResponse,
            null,
            undefined,
            {},
            { questionId: null, answer: 'test' },
            { questionId: quizQuestions[1].id },
            { answer: quizQuestions[1].choices[0].text },
            { questionId: 42, answer: 100 }
        ]);

        expect(result.primary.score).toBe(1);
        expect(result.allScores.reduce((sum, [, score]) => sum + score, 0)).toBe(1);
    });
});
