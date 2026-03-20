import { archetypeData } from './archetypeData';

/**
 * quizUtils.js
 * Shared quiz encoding/decoding/versioning utilities for results permalinks
 * Version: v1
 *
 * - Centralizes dimension/archetype logic
 * - Provides robust, versioned encoding/decoding for permalinks
 * - Handles scoring and archetype matching via cosine similarity
 * - Used by both quiz and results pages
 */

// Canonical dimension keys derived from archetypeData
// Strategy, Adaptability, Collaboration, Experimentation, Impact
const ARCHETYPES = Object.keys(archetypeData);
export const DIM_KEYS = ARCHETYPES.length > 0 ? Object.keys(archetypeData[ARCHETYPES[0]].dimensions) : [];

/**
 * Build the raw (non-base64) dims string for analytics.
 * Format: v1:strategy:5,adaptability:3,...
 * @param {Object} dims - { strategy: number, ... }
 * @returns {string} raw encoded string (e.g. "v1:strategy:5,...")
 */
export function encodeDimsV1(dims) {
    return 'v1:' + DIM_KEYS.map(k => `${k}:${dims[k] ?? 0}`).join(',');
}

/**
 * Decode a base64-encoded dimension string (with version prefix)
 * @param {string} b64 - base64 string from URL
 * @returns {Object|null} dims object or null if invalid
 */
export function decodeDims(b64) {
    let result = null;

    try {
        const decoded = atob(b64);
        const version = decoded.match(/v(\d):/);

        switch (parseInt(version?.[1], 10)) {
            case 1: {
                const raw = decoded.slice(3);
                const dims = Object.fromEntries(
                    raw.split(',').map(pair => {
                        const [k, v] = pair.split(':');
                        return [k, parseFloat(v)];
                    })
                );
                if (DIM_KEYS.every(k => typeof dims[k] === 'number' && !isNaN(dims[k]))) {
                    result = dims;
                }
                break;
            }
            default:
                break;
        }
    } catch {
        // noop
    }
    
    return result;
}

/**
 * Get dimension array in canonical order for charting, etc.
 * @param {Object} dims - { system, people, ... }
 * @returns {number[]} array in DIM_KEYS order
 */
export function dimsToArray(dims) {
    return DIM_KEYS.map(k => dims[k]);
}

/**
 * Compute cosine similarity between two vectors (dimension score objects).
 * Higher similarity = better match.
 * @param {Object} userDims - { strategy: num, ... }
 * @param {Object} archetypeDims - { strategy: num, ... }
 * @returns {number} cosine similarity (0 to 1)
 */
function cosineSimilarity(userDims, archetypeDims) {
    const keys = Object.keys(userDims);
    let dotProduct = 0;
    let userMagnitude = 0;
    let archetypeMagnitude = 0;

    keys.forEach(k => {
        const u = userDims[k] || 0;
        const a = archetypeDims[k] || 0;
        dotProduct += u * a;
        userMagnitude += u * u;
        archetypeMagnitude += a * a;
    });

    userMagnitude = Math.sqrt(userMagnitude);
    archetypeMagnitude = Math.sqrt(archetypeMagnitude);

    if (userMagnitude === 0 || archetypeMagnitude === 0) return 0;
    return dotProduct / (userMagnitude * archetypeMagnitude);
}

/**
 * Get primary/secondary archetypes based on closest similarity to user's dimension scores.
 * Uses cosine similarity to match user profile to archetype profiles.
 * @param {Object} userDims - { strategy: num, adaptability: num, ... }
 * @returns {{primary: string, secondary: string}} archetype names
 */
export function getClosestArchetypes(userDims) {
    const similarities = ARCHETYPES.map(archetypeName => ({
        name: archetypeName,
        similarity: cosineSimilarity(userDims, archetypeData[archetypeName].dimensions)
    }));

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    return {
        primary: similarities[0]?.name || null,
        secondary: similarities[1]?.name || null
    };
}
