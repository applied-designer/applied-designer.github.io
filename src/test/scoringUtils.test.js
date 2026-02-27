import { describe, it, expect } from 'vitest'
import { calculateScores } from '../data/scoringUtils'
import { quizQuestions } from '../data/quizData'
import { 
  ORCHESTRATOR, CONNECTOR, MULTIDISCIPLINARY, EXPERIMENTALIST, EDUCATOR, 
  RESEARCHER, DIRECTOR, getAnswerForArchetype 
} from './utils/archetypeTestUtils'

describe('Scoring Utils', () => {
  describe('calculateScores', () => {
    it('should calculate scores correctly for complete responses', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', ORCHESTRATOR) },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', CONNECTOR) },
        { questionId: 'Q3', answer: getAnswerForArchetype('Q3', MULTIDISCIPLINARY) },
        { questionId: 'Q4', answer: getAnswerForArchetype('Q4', ORCHESTRATOR) },
        { questionId: 'Q5', answer: getAnswerForArchetype('Q5', EXPERIMENTALIST) },
        { questionId: 'Q6', answer: getAnswerForArchetype('Q6', MULTIDISCIPLINARY) },
        { questionId: 'Q7', answer: getAnswerForArchetype('Q7', EDUCATOR) },
        { questionId: 'Q8', answer: getAnswerForArchetype('Q8', ORCHESTRATOR) },
        { questionId: 'Q9', answer: getAnswerForArchetype('Q9', ORCHESTRATOR) },
        { questionId: 'Q10', answer: getAnswerForArchetype('Q10', RESEARCHER) },
        { questionId: 'Q11', answer: getAnswerForArchetype('Q11', RESEARCHER) },
        { questionId: 'Q12', answer: getAnswerForArchetype('Q12', ORCHESTRATOR) }
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe(ORCHESTRATOR)
      expect(result.primary.score).toBe(5)
      expect(result.secondary.archetype).toBe(RESEARCHER)
      expect(result.secondary.score).toBe(2)
      expect(result.tieBreakMethod).toBe('dominant-dimension-rank')
      expect(result.dimensionScores.length).toBe(5)
    })

    it('should handle empty responses', () => {
      const result = calculateScores([])
      
      expect(result.primary.score).toBe(0)
      expect(result.primary.archetype).toBe(ORCHESTRATOR)
      expect(result.secondary.archetype).toBe(RESEARCHER)
      expect(result.secondary).toBeTruthy()
    })

    it('should handle tie-breaking by dominant dimensions', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', ORCHESTRATOR) },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', DIRECTOR) }
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.score).toBe(1)
      expect(result.secondary.score).toBe(1)
      expect(result.primary.archetype).toBe(DIRECTOR)
      expect(result.secondary.archetype).toBe(ORCHESTRATOR)
    })

    it('should handle partial responses', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', ORCHESTRATOR) },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', CONNECTOR) }
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe(CONNECTOR)
      expect(result.primary.score).toBe(1)
      expect(result.secondary.archetype).toBe(ORCHESTRATOR)
      expect(result.secondary.score).toBe(1)
    })

    it('should return all scores sorted correctly', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', ORCHESTRATOR) },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', CONNECTOR) }
      ]
      
      const result = calculateScores(responses)
      
      const sortedScores = result.allScores
      const highestScore = sortedScores[0][1]
      const secondHighestScore = sortedScores[1][1]
      
      expect(highestScore).toBeGreaterThanOrEqual(secondHighestScore)
      expect(result.primary.archetype).toBe(CONNECTOR)
      expect(result.secondary.archetype).toBe(ORCHESTRATOR)
      
      // Verify all scores are descending or equal
      for (let i = 1; i < sortedScores.length - 1; i++) {
        expect(sortedScores[i][1]).toBeGreaterThanOrEqual(sortedScores[i + 1][1])
      }
    })

    it('should handle invalid question answers gracefully', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Invalid answer that does not exist' },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', CONNECTOR) }
      ]
      
      // Should not crash and should still calculate valid answers
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe(CONNECTOR)
      expect(result.primary.score).toBe(1)
    })

    it('should handle duplicate questions in responses', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', 'The Orchestrator') },
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', 'The Researcher') },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', 'The Connector') }
      ]
      
      const result = calculateScores(responses)
      
      // Last answer for duplicate question should win
      expect(result.allScores.find(([archetype]) => archetype === ORCHESTRATOR)[1]).toBe(0)
      expect(result.allScores.find(([archetype]) => archetype === RESEARCHER)[1]).toBe(1)
      expect(result.allScores.find(([archetype]) => archetype === CONNECTOR)[1]).toBe(1)
    })

    it('should always return distinct primary and secondary archetypes', () => {
      const responses = [
        { questionId: 'Q1', answer: getAnswerForArchetype('Q1', ORCHESTRATOR) },
        { questionId: 'Q2', answer: getAnswerForArchetype('Q2', CONNECTOR) },
        { questionId: 'Q3', answer: getAnswerForArchetype('Q3', MULTIDISCIPLINARY) },
        { questionId: 'Q4', answer: getAnswerForArchetype('Q4', ORCHESTRATOR) }
      ]

      const result = calculateScores(responses)

      expect(result.primary.archetype).toBeTruthy()
      expect(result.secondary.archetype).toBeTruthy()
      expect(result.primary.archetype).not.toBe(result.secondary.archetype)
    })
  })
})