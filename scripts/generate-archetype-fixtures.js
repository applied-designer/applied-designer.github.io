/**
 * Generate comprehensive archetype reachability fixtures.
 * Tests all 6^5 = 7,776 combinations of dimension scores (0-5 each).
 * Saves the mapping of dimension combinations to primary archetypes.
 * Run once and commit the fixture; do NOT run in tests.
 *
 * Usage: node scripts/generate-archetype-fixtures.js
 */

import { archetypeData } from '../src/data/archetypeData.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Compute cosine similarity
function cosineSimilarity(userDims, archetypeDims) {
  const keys = Object.keys(userDims)
  let dotProduct = 0
  let userMagnitude = 0
  let archetypeMagnitude = 0

  keys.forEach(k => {
    const u = userDims[k] || 0
    const a = archetypeDims[k] || 0
    dotProduct += u * a
    userMagnitude += u * u
    archetypeMagnitude += a * a
  })

  userMagnitude = Math.sqrt(userMagnitude)
  archetypeMagnitude = Math.sqrt(archetypeMagnitude)

  if (userMagnitude === 0 || archetypeMagnitude === 0) return 0
  return dotProduct / (userMagnitude * archetypeMagnitude)
}

// Find closest archetype
function getClosestArchetype(userDims) {
  const archetypeNames = Object.keys(archetypeData)
  const similarities = archetypeNames.map(name => ({
    name,
    similarity: cosineSimilarity(userDims, archetypeData[name].dimensions)
  }))
  similarities.sort((a, b) => b.similarity - a.similarity)
  return similarities[0]?.name || null
}

// Get dimension keys in order
const dimKeys = Object.keys(archetypeData[Object.keys(archetypeData)[0]].dimensions)

// Generate all combinations (0-5 for each dimension)
const combinations = {}
Object.keys(archetypeData).forEach(archetype => {
  combinations[archetype] = []
})

let totalCombinations = 0

// Brute force: iterate all 6^5 = 7,776 combinations
for (let s = 0; s <= 5; s++) {
  for (let a = 0; a <= 5; a++) {
    for (let c = 0; c <= 5; c++) {
      for (let e = 0; e <= 5; e++) {
        for (let i = 0; i <= 5; i++) {
          const dims = {
            [dimKeys[0]]: s,
            [dimKeys[1]]: a,
            [dimKeys[2]]: c,
            [dimKeys[3]]: e,
            [dimKeys[4]]: i
          }
          const primary = getClosestArchetype(dims)
          const dimArray = [s, a, c, e, i]
          combinations[primary].push(dimArray)
          totalCombinations++
        }
      }
    }
  }
}

// Build fixture
const fixture = {
  version: 1,
  description: 'Comprehensive archetype reachability fixture: all 6^5 dimension combinations mapped to primary archetypes',
  dimKeys,
  stats: {
    totalCombinations,
    archetypesReached: Object.keys(archetypeData).length,
    archetypeDistribution: {}
  },
  combinations
}

// Add distribution stats
Object.entries(combinations).forEach(([archetype, combos]) => {
  fixture.stats.archetypeDistribution[archetype] = combos.length
})

// Save fixture
const fixtureDir = path.join(__dirname, '..', 'src', 'test', 'fixtures')
if (!fs.existsSync(fixtureDir)) {
  fs.mkdirSync(fixtureDir, { recursive: true })
}
const fixturePath = path.join(fixtureDir, 'archetypeAnswerPaths.json')
fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2))

console.log(`✅ Generated archetype fixture: ${fixturePath}`)
console.log(`   Total combinations: ${totalCombinations}`)
console.log(`   Archetypes reached: ${fixture.stats.archetypesReached}`)
console.log(`   Distribution:`)
Object.entries(fixture.stats.archetypeDistribution)
  .sort((a, b) => b[1] - a[1])
  .forEach(([archetype, count]) => {
    console.log(`     ${archetype}: ${count} combinations`)
  })
