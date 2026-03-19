import { describe, it, expect } from 'vitest'
import { quizQuestions } from '../data/quizData'
import { archetypeData } from '../data/archetypeData'
import { ARCHETYPES } from './utils/archetypeTestUtils'

describe('Data Validation', () => {
    describe('quizQuestions', () => {
        it('should have exactly 12 questions', () => {
            expect(quizQuestions).toHaveLength(12)
        })

        it('should have all required question IDs', () => {
            const questionIds = quizQuestions.map(q => q.id)
            const expectedIds = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12']
      
            expect(questionIds).toEqual(expect.arrayContaining(expectedIds))
            expect(questionIds).toHaveLength(12)
        })

        it('should have exactly 5 choices per question', () => {
            quizQuestions.forEach(question => {
                expect(question.choices).toHaveLength(5)
                expect(question.text).toBeTruthy()
                expect(question.text.length).toBeGreaterThan(0)
            })
        })

        it('should have unique answer texts within each question', () => {
            quizQuestions.forEach(question => {
                const answerTexts = question.choices.map(c => c.text)
                const uniqueTexts = [...new Set(answerTexts)]
        
                expect(uniqueTexts).toHaveLength(5)
                expect(answerTexts).toEqual(uniqueTexts)
            })
        })

        it('should have valid archetype mappings', () => {
            const allArchetypes = Object.keys(archetypeData)
      
            quizQuestions.forEach(question => {
                question.choices.forEach(choice => {
                    expect(choice.archetype).toBeTruthy()
                    expect(allArchetypes).toContain(choice.archetype)
                })
            })
        })

        it('should have consistent question IDs', () => {
            const questionIds = quizQuestions.map(q => q.id)
      
            questionIds.forEach(id => {
                expect(id).toMatch(/^Q\d+$/)
            })
      
            const uniqueIds = [...new Set(questionIds)]
            expect(uniqueIds).toHaveLength(12)
        })
    })

    describe('archetypeData', () => {
        it('should have exactly 12 archetypes', () => {
            expect(Object.keys(archetypeData)).toHaveLength(12)
        })

        it('should have all required fields for each archetype', () => {
            const requiredFields = ['emoji', 'description', 'mostAliveWhen', 'mantra', 'designers', 'dimensions']
      
            Object.entries(archetypeData).forEach(([_name, data]) => {
                requiredFields.forEach(field => {
                    expect(data).toHaveProperty(field)
                    expect(data[field]).toBeTruthy()
                })
            })
        })

        it('should have unique emoji for each archetype', () => {
            const emojis = Object.values(archetypeData).map(a => a.emoji)
            const uniqueEmojis = [...new Set(emojis)]
      
            expect(emojis).toHaveLength(12)
            expect(uniqueEmojis).toHaveLength(12)
        })

        it('should have valid dimension scores for each archetype', () => {
            const dimensionKeys = ['strategy', 'adaptability', 'collaboration', 'experimentation', 'impact']
            const validScores = [1, 2, 3, 4, 5]
      
            Object.values(archetypeData).forEach(archetype => {
                expect(Object.keys(archetype.dimensions)).toEqual(expect.arrayContaining(dimensionKeys))
        
                Object.values(archetype.dimensions).forEach(score => {
                    expect(validScores).toContain(score)
                })
            })
        })

        it('should have all expected archetypes present', () => {
            const actualArchetypes = Object.keys(archetypeData)
            expect(actualArchetypes).toEqual(expect.arrayContaining(ARCHETYPES))
            expect(actualArchetypes).toHaveLength(12)
        })

        it('should have non-empty descriptions and mantras', () => {
            Object.values(archetypeData).forEach(archetype => {
                expect(archetype.description.length).toBeGreaterThan(10)
                expect(archetype.mantra.length).toBeGreaterThan(5)
                expect(archetype.mostAliveWhen.length).toBeGreaterThan(10)
            })
        })
    })
})