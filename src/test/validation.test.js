import { describe, it, expect } from 'vitest'
import { getClosestArchetypes, DIM_KEYS } from '../data/quizUtils'
import { archetypeData } from '../data/archetypeData'

/**
 * validation.test.js
 * Validation tests to ensure quiz scoring logic is correct
 *
 * Tests:
 * - Verify sample quiz responses produce expected archetypes
 * - Validate cosine similarity matching works correctly
 * - Ensure primary/secondary results are deterministic
 */

describe('Quiz Scoring Validation', () => {
    /**
   * Test: Exact archetype profiles should match themselves
   * When user dimensions exactly match an archetype profile,
   * that archetype should be primary
   */
    it('should match exact archetype profiles correctly', () => {
        const archetypes = Object.entries(archetypeData)

        // Test each archetype profile
        archetypes.forEach(([name, data]) => {
            const { primary } = getClosestArchetypes(data.dimensions)
            expect(primary).toBe(name)
        })
    })

    /**
   * Test: Mirrored dimension scores should differ
   * High-adaptability vs high-strategy should produce different primaries
   */
    it('should differentiate opposite dimension profiles', () => {
        const highly_adaptive = {
            strategy: 1,
            adaptability: 5,
            collaboration: 1,
            experimentation: 5,
            impact: 1
        }

        const highly_strategic = {
            strategy: 5,
            adaptability: 1,
            collaboration: 5,
            experimentation: 1,
            impact: 5
        }

        const { primary: p1 } = getClosestArchetypes(highly_adaptive)
        const { primary: p2 } = getClosestArchetypes(highly_strategic)

        expect(p1).not.toBe(p2)
    })

    /**
   * Test: Balanced dimensions should match middle-ground archetype
   * All equal dimensions should pick a balanced archetype
   */
    it('should handle balanced dimension vectors', () => {
        const balanced = {
            strategy: 3,
            adaptability: 3,
            collaboration: 3,
            experimentation: 3,
            impact: 3
        }

        const { primary, secondary } = getClosestArchetypes(balanced)

        expect(primary).toBeDefined()
        expect(secondary).toBeDefined()
        expect(primary).not.toBe(secondary)
    })

    /**
   * Test: Deterministic matching
   * Same dimension input should always produce same archetype
   */
    it('should be deterministic (same input = same output)', () => {
        const dims = {
            strategy: 4,
            adaptability: 3,
            collaboration: 5,
            experimentation: 2,
            impact: 4
        }

        const result1 = getClosestArchetypes(dims)
        const result2 = getClosestArchetypes(dims)
        const result3 = getClosestArchetypes(dims)

        expect(result1.primary).toBe(result2.primary)
        expect(result2.primary).toBe(result3.primary)
        expect(result1.secondary).toBe(result2.secondary)
    })

    /**
   * Test: Secondary is never same as primary
   * With non-zero dimensions, primary and secondary should differ
   */
    it('should always have different primary and secondary (non-zero dims)', () => {
        const testCases = [
            { strategy: 5, adaptability: 1, collaboration: 1, experimentation: 1, impact: 1 },
            { strategy: 1, adaptability: 5, collaboration: 1, experimentation: 1, impact: 1 },
            { strategy: 2, adaptability: 3, collaboration: 4, experimentation: 5, impact: 1 },
            { strategy: 3, adaptability: 3, collaboration: 3, experimentation: 3, impact: 3 },
            { strategy: 5, adaptability: 5, collaboration: 5, experimentation: 5, impact: 5 }
        ]

        testCases.forEach((dims) => {
            const { primary, secondary } = getClosestArchetypes(dims)
            expect(primary).not.toBe(secondary)
        })
    })

    /**
   * Test: No primary should be null/undefined
   * For any valid dimension input, always get a valid primary
   */
    it('should always produce a valid primary archetype', () => {
        const validArchetypes = Object.keys(archetypeData)

        const testDims = [
            { strategy: 0, adaptability: 0, collaboration: 0, experimentation: 0, impact: 0 },
            { strategy: 1, adaptability: 1, collaboration: 1, experimentation: 1, impact: 1 },
            { strategy: 5, adaptability: 5, collaboration: 5, experimentation: 5, impact: 5 },
            { strategy: 2.5, adaptability: 3.1, collaboration: 4.7, experimentation: 1.2, impact: 3.8 }
        ]

        testDims.forEach((dims) => {
            const { primary } = getClosestArchetypes(dims)
            expect(validArchetypes).toContain(primary)
        })
    })

    /**
   * Test: Marginal changes in dimensions should stay consistent
   * Small tweaks to dimensions shouldn't cause wild primary changes
   */
    it('should be stable for similar dimension profiles', () => {
        const base = {
            strategy: 4.0,
            adaptability: 3.0,
            collaboration: 4.0,
            experimentation: 2.0,
            impact: 3.0
        }

        const { primary: primaryBase } = getClosestArchetypes(base)

        // Small perturbations
        const perturbed = {
            strategy: 4.1,
            adaptability: 3.0,
            collaboration: 4.0,
            experimentation: 2.0,
            impact: 2.95
        }

        const { primary: primaryPerturbed } = getClosestArchetypes(perturbed)

        // Should stay same (or very close) for small changes
        expect(primaryBase).toBe(primaryPerturbed)
    })

    /**
   * Test: All archetypes should be reachable
   * At least one combination should produce each archetype as primary
   */
    it('should be able to reach all archetypes as primary', () => {
        const validArchetypes = Object.keys(archetypeData)

        // Each archetype's profile should match itself as primary
        validArchetypes.forEach((archetypeName) => {
            const profile = archetypeData[archetypeName].dimensions
            const { primary } = getClosestArchetypes(profile)
            expect(primary).toBe(archetypeName)
        })
    })

    /**
   * Test: Verify dimension key consistency
   * Ensure all dimension keys are properly defined and used
   */
    it('should have consistent dimension keys', () => {
        expect(DIM_KEYS.length).toBe(5)
        expect(DIM_KEYS).toContain('strategy')
        expect(DIM_KEYS).toContain('adaptability')
        expect(DIM_KEYS).toContain('collaboration')
        expect(DIM_KEYS).toContain('experimentation')
        expect(DIM_KEYS).toContain('impact')
    })

    /**
   * Test: Archetype profiles are in valid range
   * All dimension values should be positive and reasonable
   */
    it('should have valid archetype dimension profiles', () => {
        Object.entries(archetypeData).forEach(([_name, data]) => {
            expect(data.dimensions).toBeDefined()

            DIM_KEYS.forEach((key) => {
                const val = data.dimensions[key]
                expect(typeof val).toBe('number')
                expect(val).toBeGreaterThanOrEqual(0)
                expect(val).toBeLessThanOrEqual(10) // Reasonable upper bound
            })
        })
    })
})
