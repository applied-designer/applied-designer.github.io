import { encodeDimsV1, decodeDims, dimsToArray, getClosestArchetypes, DIM_KEYS } from '../data/quizUtils';
import { archetypeData } from '../data/archetypeData';
import archetypeFixture from './fixtures/archetypeAnswerPaths.json' with { type: 'json' };

describe('quizUtils encoding/decoding', () => {
    // Correct dimension keys for the quiz (strategy, adaptability, collaboration, experimentation, impact)
    const dims = { strategy: 5, adaptability: 3, collaboration: 4, experimentation: 2, impact: 3 };

    it('encodes and decodes dims with version', () => {
        const raw = encodeDimsV1(dims);
        const b64 = btoa(raw);
        const decoded = decodeDims(b64);
        expect(decoded).toEqual(dims);
    });

    it('dimsToArray returns correct order matching DIM_KEYS', () => {
        const arr = dimsToArray(dims);
        expect(arr).toEqual(DIM_KEYS.map(k => dims[k]));
    });

    it('getClosestArchetypes finds The Orchestrator (high strategy)', () => {
        const userDims = { strategy: 5, adaptability: 1, collaboration: 1, experimentation: 1, impact: 1 };
        const { primary } = getClosestArchetypes(userDims);
        expect(primary).toBe('The Orchestrator');
    });

    it('getClosestArchetypes returns two distinct archetypes', () => {
        const userDims = { strategy: 4, adaptability: 3, collaboration: 4, experimentation: 2, impact: 5 };
        const { primary, secondary } = getClosestArchetypes(userDims);
        expect(primary).not.toBeNull();
        expect(secondary).not.toBeNull();
        expect(primary).not.toBe(secondary);
    });

    it('decodeDims returns null for invalid base64', () => {
        expect(decodeDims('notbase64')).toBeNull();
    });

    it('decodeDims returns null for missing dimension keys', () => {
        const bad = btoa('v1:strategy:1,adaptability:1');
        expect(decodeDims(bad)).toBeNull();
    });

    it('all 12 archetypes are reachable as primary results', () => {
        const archetypeNames = Object.keys(archetypeData);
        expect(archetypeNames).toHaveLength(12);

        // For each archetype, use its own dimension profile as input
        // It should return at minimum as primary or secondary
        const reachable = new Set();
        archetypeNames.forEach(archetypeName => {
            const archetypeProfile = archetypeData[archetypeName].dimensions;
            const { primary } = getClosestArchetypes(archetypeProfile);
      
            // Using an archetype's own profile should return it as primary
            expect(primary).toBe(archetypeName);
            reachable.add(primary);
        });

        // Verify all 12 are in the reachable set
        expect(reachable.size).toBe(12);
        archetypeNames.forEach(name => {
            expect(reachable).toContain(name);
        });
    });

    describe('comprehensive fixture-based tests', () => {
        it('fixture contains all 12 archetypes', () => {
            const archetypeNames = Object.keys(archetypeData);
            expect(Object.keys(archetypeFixture.combinations)).toEqual(expect.arrayContaining(archetypeNames));
        });

        it('fixture covers 7776 total combinations (6^5)', () => {
            expect(archetypeFixture.stats.totalCombinations).toBe(7776);
        });

        it('each combination in fixture resolves to correct primary archetype', () => {
            // Sample test: verify a few known combinations from the fixture
            const sampleSize = 100;
            const archetypes = Object.keys(archetypeFixture.combinations);
            let tested = 0;

            for (const archetypeName of archetypes.slice(0, 5)) {
                const combinations = archetypeFixture.combinations[archetypeName];
                // Test first few combinations for this archetype
                for (let i = 0; i < Math.min(20, combinations.length); i++) {
                    const [s, a, c, e, im] = combinations[i];
                    const dims = {
                        [archetypeFixture.dimKeys[0]]: s,
                        [archetypeFixture.dimKeys[1]]: a,
                        [archetypeFixture.dimKeys[2]]: c,
                        [archetypeFixture.dimKeys[3]]: e,
                        [archetypeFixture.dimKeys[4]]: im
                    };
                    const { primary } = getClosestArchetypes(dims);
                    expect(primary).toBe(archetypeName);
                    tested++;
                    if (tested >= sampleSize) break;
                }
                if (tested >= sampleSize) break;
            }

            expect(tested).toBe(sampleSize);
        });

        it('distribution of 12 archetypes across 7776 combinations is reasonable', () => {
            const distribution = archetypeFixture.stats.archetypeDistribution;
            const archetypeNames = Object.keys(archetypeData);

            // All 12 archetypes should be present in distribution
            archetypeNames.forEach(name => {
                expect(distribution[name]).toBeGreaterThan(0);
            });

            // Total should be 7776
            const total = Object.values(distribution).reduce((a, b) => a + b, 0);
            expect(total).toBe(7776);

            // Each should be at least ~1% (77+ combinations)
            // Some variation is OK due to dimensional geometry
            archetypeNames.forEach(name => {
                expect(distribution[name]).toBeGreaterThanOrEqual(75);
            });
        });
    });
});
