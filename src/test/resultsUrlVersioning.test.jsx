import { describe, it, expect } from 'vitest';
import { decodeDims, getClosestArchetypes } from '../data/quizUtils';
import { archetypeData } from '../data/archetypeData';

// Extract URL parsing logic from Results.jsx for unit testing
const parseResultsUrl = (search) => {
    const params = new URLSearchParams(search);
    const version = params.get('v');
    const dimsB64 = params.get('dims');
    const dims = dimsB64 ? decodeDims(dimsB64) : null;

    // Invalid/missing dims → null (redirect)
    if (!dims) return { redirect: true };

    // Invalid version → null (redirect)
    if (version !== null && version !== '2') {
        return { redirect: true };
    }

    // v2 with vote-based archetypes
    if (version === '2') {
        const votePrimary = params.get('p');
        const voteSecondary = params.get('s');
        if (votePrimary && archetypeData[votePrimary]) {
            return { redirect: false, primary: votePrimary, secondary: voteSecondary };
        }
        // Fallback: cosine similarity
        const { primary, secondary } = getClosestArchetypes(dims);
        return { redirect: false, primary, secondary };
    }

    // v1: cosine similarity
    const { primary, secondary } = getClosestArchetypes(dims);
    return { redirect: false, primary, secondary };
};

// Helper: encode dims
const encodeDims = (dims) => {
    const str = Object.entries(dims).map(([k, v]) => `${k}:${v}`).join(',');
    return btoa(`v1:${str}`);
};

const sampleDims = { strategy: 10, adaptability: 10, collaboration: 10, experimentation: 10, impact: 10 };

describe('Results URL Versioning - parse logic', () => {
    describe('v1 (no v param) - cosine similarity fallback', () => {
        it('should accept valid v1 URL', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?dims=${encodeURIComponent(dimsB64)}`);
            expect(result.redirect).toBe(false);
        });

        it('should redirect when v1 URL has invalid dims', () => {
            const result = parseResultsUrl('?dims=invalid');
            expect(result.redirect).toBe(true);
        });

        it('should redirect on empty query string', () => {
            const result = parseResultsUrl('');
            expect(result.redirect).toBe(true);
        });

        it('should redirect on garbage query string', () => {
            const result = parseResultsUrl('?asdfghjkl');
            expect(result.redirect).toBe(true);
        });
    });

    describe('v2 (v=2) - vote-based archetypes', () => {
        it('should accept valid v2 URL with vote-based archetypes', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=2&dims=${encodeURIComponent(dimsB64)}&p=The Orchestrator&s=The Researcher`);
            expect(result.redirect).toBe(false);
            expect(result.primary).toBe('The Orchestrator');
            expect(result.secondary).toBe('The Researcher');
        });

        it('should use vote-based primary if p param valid', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=2&dims=${encodeURIComponent(dimsB64)}&p=The Orchestrator`);
            expect(result.redirect).toBe(false);
            expect(result.primary).toBe('The Orchestrator');
        });

        it('should fallback to cosine if p param invalid in v2', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=2&dims=${encodeURIComponent(dimsB64)}&p=InvalidName`);
            expect(result.redirect).toBe(false);
        });

        it('should redirect when v=2 but dims missing', () => {
            const result = parseResultsUrl('?v=2&p=The Orchestrator');
            expect(result.redirect).toBe(true);
        });
    });

    describe('invalid version handling', () => {
        it('should redirect when v=X (invalid version)', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=99&dims=${encodeURIComponent(dimsB64)}`);
            expect(result.redirect).toBe(true);
        });

        it('should redirect when v=1 (not supported)', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=1&dims=${encodeURIComponent(dimsB64)}`);
            expect(result.redirect).toBe(true);
        });

        it('should redirect when v= (empty)', () => {
            const dimsB64 = encodeDims(sampleDims);
            const result = parseResultsUrl(`?v=&dims=${encodeURIComponent(dimsB64)}`);
            expect(result.redirect).toBe(true);
        });
    });
});
