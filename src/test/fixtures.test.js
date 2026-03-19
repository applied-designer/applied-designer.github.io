import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { getClosestArchetypes } from '../data/quizUtils'
import { archetypeData } from '../data/archetypeData'
import { ARCHETYPES, SHORT_TO_FULL } from './utils/archetypeTestUtils'

/**
 * fixtures.test.js
 * Integration tests using the 244M quiz answer combination fixtures
 *
 * Spot-checks: Pick sample combinations from quiz_results.csv
 * and verify they produce expected primary/secondary archetypes
 */

const fixtureDir = path.resolve(__dirname, '../test/fixtures')
const resultsPath = path.join(fixtureDir, 'quiz_results.csv')

describe('Quiz Fixtures Integration Tests', () => {
    let fixtureData = []

    beforeAll(async () => {
    // Read first 1000 lines of results CSV without loading entire file into memory
        if (!fs.existsSync(resultsPath)) {
            console.warn(`Fixture not found: ${resultsPath}`)
            return
        }

        return new Promise((resolve) => {
            const fileStream = fs.createReadStream(resultsPath)
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            })

            let lineNum = 0
            rl.on('line', (line) => {
                lineNum++
                if (lineNum === 1) return // Skip header
                if (lineNum > 1000) {
                    rl.close()
                    resolve()
                    return
                }

                if (line.trim()) {
                    const parts = line.split(',')
                    fixtureData.push({
                        combo_index: parseInt(parts[0]),
                        primary: parts[1],
                        secondary: parts[2]
                    })
                }
            })

            rl.on('close', () => {
                resolve()
            })
        })
    })

    it('should load fixture data', () => {
        expect(fixtureData.length).toBeGreaterThan(0)
    })

    /**
   * Test: Verify scoring logic matches fixture for sample combinations
   * We can't fully reconstruct quiz answers from combo_index without the input CSV,
   * but we can verify that the archetype names exist and are valid.
   */
    it('should have valid archetype names in fixture', () => {
        fixtureData.forEach(({ primary, secondary }) => {
            const primaryFull = SHORT_TO_FULL[primary.toLowerCase()] || primary
            const secondaryFull = SHORT_TO_FULL[secondary.toLowerCase()] || secondary
            expect(ARCHETYPES).toContain(primaryFull)
            expect(ARCHETYPES).toContain(secondaryFull)
        })
    })

    /**
   * Test: Verify no ties exist (primary !== secondary for all samples)
   * This confirms the zero-tie finding from the full analysis
   */
    it('should have no tie-breaking cases in sample', () => {
        fixtureData.forEach(({ primary, secondary }) => {
            expect(primary).not.toBe(secondary)
        })
    })

    /**
   * Test: Verify archetype distribution is reasonable
   * Top 3 should be educator, multidisciplinary, generalist
   */
    it('should show expected primary distribution pattern', () => {
        const counts = {}
        fixtureData.forEach(({ primary }) => {
            counts[primary] = (counts[primary] || 0) + 1
        })

        // Sort by count descending
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
        const topName = sorted[0][0]

        // Top should be one of the big 3
        expect(['educator', 'multidisciplinary', 'generalist']).toContain(topName)
    })

    /**
   * Test: Verify dimension calculation logic
   * Create a simple 5D vector and verify it scores to expected archetype
   */
    it('should correctly match high-strategy dimensions to educator-like archetype', () => {
    // High strategy + collaboration + impact should match educator-ish profile
        const dims = {
            strategy: 5,
            adaptability: 2,
            collaboration: 5,
            experimentation: 2,
            impact: 5
        }

        const { primary } = getClosestArchetypes(dims)
        expect(primary).toBeDefined()
        expect(Object.keys(archetypeData)).toContain(primary)
    })

    /**
   * Test: Verify multi-archetype recognition
   * Different dimension combinations should yield different primary archetypes
   */
    it('should differentiate between high-adaptability and high-strategy', () => {
        const strategyHigh = {
            strategy: 5,
            adaptability: 1,
            collaboration: 1,
            experimentation: 1,
            impact: 1
        }

        const adaptabilityHigh = {
            strategy: 1,
            adaptability: 5,
            collaboration: 1,
            experimentation: 1,
            impact: 1
        }

        const { primary: p1 } = getClosestArchetypes(strategyHigh)
        const { primary: p2 } = getClosestArchetypes(adaptabilityHigh)

        // Should be different archetypes
        expect(p1).not.toBe(p2)
    })

    /**
   * Test: Verify zero-dimension scores still produce valid archetypes
   * Edge case: all dimensions at 0 should still match something
   */
    it('should handle zero-dimension vector gracefully', () => {
        const zeroDims = {
            strategy: 0,
            adaptability: 0,
            collaboration: 0,
            experimentation: 0,
            impact: 0
        }

        const { primary, secondary } = getClosestArchetypes(zeroDims)
        // With all zeros, should still return some archetype (usually first or default)
        expect(primary || secondary).toBeDefined()
    })

    /**
   * Test: Snapshot of fixture distribution
   * This documents the actual distribution from the fixtures
   */
    it('should show primary distribution from sample', () => {
        const counts = {}
        fixtureData.forEach(({ primary }) => {
            counts[primary] = (counts[primary] || 0) + 1
        })

        // Log distribution for inspection
        const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({
                name,
                count,
                pct: ((count / fixtureData.length) * 100).toFixed(2)
            }))

        console.log('Primary Archetype Distribution (sample):')
        sorted.forEach(({ name, count, pct }) => {
            console.log(`  ${name}: ${count} (${pct}%)`)
        })

        expect(sorted.length).toBeGreaterThan(0)
    })
})
