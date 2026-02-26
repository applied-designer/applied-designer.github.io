import { describe, it, expect } from 'vitest'
import { calculateScores } from '../data/scoringUtils'

describe('Scoring Utils', () => {
  describe('calculateScores', () => {
    it('should calculate scores correctly for complete responses', () => {
      // Test with sample responses that map to known archetypes
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' }, // The Connector
        { questionId: 'Q3', answer: 'Connecting unexpected ideas' }, // The Multidisciplinary
        { questionId: 'Q4', answer: 'Scaling an idea across different contexts' }, // The Orchestrator
        { questionId: 'Q5', answer: 'Jump into making something' }, // The Experimentalist
        { questionId: 'Q6', answer: 'Nonlinear and cross-disciplinary' }, // The Multidisciplinary
        { questionId: 'Q7', answer: 'Teach or inspire someone else' }, // The Educator
        { questionId: 'Q8', answer: 'Structure and cohesion' }, // The Orchestrator
        { questionId: 'Q9', answer: 'Designing a system or workflow' }, // The Orchestrator
        { questionId: 'Q10', answer: 'Extensions of my thinking' }, // The Researcher
        { questionId: 'Q11', answer: 'Open-ended questions' }, // The Researcher
        { questionId: 'Q12', answer: 'Is not just visual — it\'s strategic' } // The Orchestrator
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe('The Orchestrator')
      expect(result.primary.score).toBe(5)
      expect(result.secondary.archetype).toBe('The Researcher')
      expect(result.secondary.score).toBe(2)
      expect(result.tieBreakMethod).toBe('dominant-dimension-rank')
      expect(result.dimensionScores.length).toBe(5)
    })

    it('should handle empty responses', () => {
      const result = calculateScores([])
      
      expect(result.primary.score).toBe(0)
      expect(result.primary.archetype).toBe('The Orchestrator')
      expect(result.secondary.archetype).toBe('The Researcher')
      expect(result.secondary).toBeTruthy()
    })

    it('should handle tie-breaking by dominant dimensions', () => {
      // Create responses that result in a tie
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
        { questionId: 'Q2', answer: 'Taking the lead and shaping the process' } // The Director
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.score).toBe(1)
      expect(result.secondary.score).toBe(1)
      expect(result.primary.archetype).toBe('The Director')
      expect(result.secondary.archetype).toBe('The Orchestrator')
    })

    it('should handle partial responses', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' }, // The Connector
      ]
      
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe('The Connector')
      expect(result.primary.score).toBe(1)
      expect(result.secondary.archetype).toBe('The Orchestrator')
      expect(result.secondary.score).toBe(1)
    })

    it('should return all scores sorted correctly', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' }, // The Connector
      ]
      
      const result = calculateScores(responses)
      
      const sortedScores = result.allScores
      const highestScore = sortedScores[0][1]
      const secondHighestScore = sortedScores[1][1]
      
      expect(highestScore).toBeGreaterThanOrEqual(secondHighestScore)
      expect(result.primary.archetype).toBe('The Connector')
      expect(result.secondary.archetype).toBe('The Orchestrator')
      
      // Verify all scores are descending or equal
      for (let i = 1; i < sortedScores.length - 1; i++) {
        expect(sortedScores[i][1]).toBeGreaterThanOrEqual(sortedScores[i + 1][1])
      }
    })

    it('should handle invalid question answers gracefully', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Invalid answer that does not exist' },
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' }, // The Connector
      ]
      
      // Should not crash and should still calculate valid answers
      const result = calculateScores(responses)
      
      expect(result.primary.archetype).toBe('The Connector')
      expect(result.primary.score).toBe(1)
    })

    it('should handle duplicate questions in responses', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
        { questionId: 'Q1', answer: 'Researching the context' }, // The Researcher (duplicate)
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' }, // The Connector
      ]
      
      const result = calculateScores(responses)
      
      // Last answer for duplicate question should win
      expect(result.allScores.find(([archetype]) => archetype === 'The Orchestrator')[1]).toBe(0)
      expect(result.allScores.find(([archetype]) => archetype === 'The Researcher')[1]).toBe(1)
      expect(result.allScores.find(([archetype]) => archetype === 'The Connector')[1]).toBe(1)
    })

    it('should always return distinct primary and secondary archetypes', () => {
      const responses = [
        { questionId: 'Q1', answer: 'Finding patterns and designing a system' },
        { questionId: 'Q2', answer: 'Bridging gaps between people or roles' },
        { questionId: 'Q3', answer: 'Connecting unexpected ideas' },
        { questionId: 'Q4', answer: 'Scaling an idea across different contexts' }
      ]

      const result = calculateScores(responses)

      expect(result.primary.archetype).toBeTruthy()
      expect(result.secondary.archetype).toBeTruthy()
      expect(result.primary.archetype).not.toBe(result.secondary.archetype)
    })
  })
})