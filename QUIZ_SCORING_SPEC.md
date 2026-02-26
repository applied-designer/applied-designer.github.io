# Archetype Quiz Scoring Spec

## Scope
This document defines how quiz responses are transformed into a primary and secondary archetype result.

Canonical source is JS data in:
- `src/data/quizData.js`
- `src/data/archetypeData.js`

## Inputs
- 12 required single-choice questions (`Q1` to `Q12`)
- 5 answer choices per question
- Each answer choice maps to exactly one archetype

## Normalization Rules
1. Ignore malformed responses (missing or non-string `questionId` / `answer`).
2. If duplicate responses exist for the same question, last answer wins.
3. If answer text does not match the configured choices for a question, ignore that response.

## Scoring Rules
1. Initialize all 12 archetype scores to `0`.
2. For each valid normalized response, add `+1` to the mapped archetype.
3. Build aggregated dimension totals by adding the selected archetype's dimension profile (`strategy`, `adaptability`, `collaboration`, `experimentation`, `impact`) for each valid answer.

## Ranking and Tie-Breaking
### Primary archetype
1. Rank archetypes by descending archetype score.
2. If tied, apply dominant-dimension tie-break:
   - For each tied archetype, order its own dimensions by that archetype's intrinsic weights (high to low).
   - Compare tied archetypes lexicographically using global aggregated dimension totals in that order.
   - The archetype with the stronger vector ranks higher.
3. If still tied after vector comparison, use deterministic fallback order from `Object.keys(archetypeData)`.

### Secondary archetype
1. Remove selected primary archetype from the pool.
2. Re-rank remaining archetypes with the same ranking/tie-break process.
3. Top remaining archetype is secondary.

## Output Contract
`calculateScores(responses)` returns:
- `primary`: `{ archetype, score, tieBreakVector }`
- `secondary`: `{ archetype, score, tieBreakVector } | null`
- `allScores`: sorted `[archetype, score][]`
- `dimensionScores`: sorted `[dimension, score][]`
- `tieBreakMethod`: `'dominant-dimension-rank'`

## Determinism Guarantees
For identical input responses, output ranking is always identical.

## Validation and Test Strategy
- Structural data tests ensure 12 questions, 5 options each, valid archetype mappings.
- Unit tests cover fixtures, empty/partial/invalid input, duplicates, and tie cases.
- Property-style generated tests assert invariants across thousands of randomized valid response sets.
- E2E tests validate quiz completion, result rendering, and mobile layout behavior.
