/**
 * Analyze archetype fixture for ties in similarity rankings.
 * Identifies edge cases where multiple archetypes have equal similarity scores.
 * 
 * Usage: node scripts/analyze-archetype-ties.js
 */

import { archetypeData } from '../src/data/archetypeData.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load fixture
const fixturePath = path.join(__dirname, '..', 'src', 'test', 'fixtures', 'archetypeAnswerPaths.json')
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

// Cosine similarity function
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

// Analyze ties
let totalCombinations = 0
let tieCases = {
  primaryTie2Way: [],
  primaryTie3Plus: [],
  secondaryTie2Way: [],
  otherTies: []
}

const dimKeys = fixture.dimKeys
const archetypeNames = Object.keys(archetypeData)

// Iterate through all combinations
for (const archetypeName of archetypeNames) {
  const combinations = fixture.combinations[archetypeName]
  
  for (const combo of combinations) {
    const [s, a, c, e, im] = combo
    const dims = {
      [dimKeys[0]]: s,
      [dimKeys[1]]: a,
      [dimKeys[2]]: c,
      [dimKeys[3]]: e,
      [dimKeys[4]]: im
    }

    // Calculate similarities to all archetypes
    const similarities = archetypeNames.map(name => ({
      name,
      similarity: cosineSimilarity(dims, archetypeData[name].dimensions)
    }))

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity)

    totalCombinations++

    // Check for ties: group by similarity value
    const byScore = {}
    similarities.forEach(({ name, similarity }) => {
      const key = similarity.toFixed(6) // Round to 6 decimals to catch floating point ties
      if (!byScore[key]) byScore[key] = []
      byScore[key].push(name)
    })

    const sortedScores = Object.keys(byScore).sort((a, b) => parseFloat(b) - parseFloat(a))
    const primaryGroup = byScore[sortedScores[0]]
    const secondaryGroup = sortedScores[1] ? byScore[sortedScores[1]] : []

    // Flag problematic cases
    if (primaryGroup.length >= 3) {
      tieCases.primaryTie3Plus.push({
        dims: combo,
        archetypes: primaryGroup,
        similarity: parseFloat(sortedScores[0])
      })
    } else if (primaryGroup.length === 2) {
      tieCases.primaryTie2Way.push({
        dims: combo,
        archetypes: primaryGroup,
        similarity: parseFloat(sortedScores[0])
      })
    }

    if (secondaryGroup && secondaryGroup.length >= 2) {
      tieCases.secondaryTie2Way.push({
        dims: combo,
        archetypes: secondaryGroup,
        similarity: parseFloat(sortedScores[1])
      })
    }
  }
}

// Report findings
console.log(`\n📊 ARCHETYPE TIE ANALYSIS`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`Total combinations analyzed: ${totalCombinations}`)
console.log(`\n⚠️  TIE CASES FOUND:`)
console.log(`   3+ way tie for PRIMARY:     ${tieCases.primaryTie3Plus.length} cases`)
console.log(`   2-way tie for PRIMARY:      ${tieCases.primaryTie2Way.length} cases`)
console.log(`   2+ way tie for SECONDARY:   ${tieCases.secondaryTie2Way.length} cases`)

console.log(`\n🔴 CRITICAL (needs fixing):`)
if (tieCases.primaryTie3Plus.length > 0) {
  console.log(`   ❌ ${tieCases.primaryTie3Plus.length} 3+ way ties for PRIMARY`)
  console.log(`      Sample: dims=${tieCases.primaryTie3Plus[0].dims.join(',')} archetypes=${tieCases.primaryTie3Plus[0].archetypes.join(', ')}`)
}
if (tieCases.secondaryTie2Way.length > 0) {
  console.log(`   ❌ ${tieCases.secondaryTie2Way.length} 2+ way ties for SECONDARY`)
  console.log(`      Sample: dims=${tieCases.secondaryTie2Way[0].dims.join(',')} archetypes=${tieCases.secondaryTie2Way[0].archetypes.join(', ')}`)
}

console.log(`\n🟡 ACCEPTABLE (can pick one as primary, one as secondary):`)
if (tieCases.primaryTie2Way.length > 0) {
  console.log(`   ⚠️  ${tieCases.primaryTie2Way.length} 2-way ties for PRIMARY`)
  console.log(`      These can be resolved: pick one as primary, one as secondary`)
} else {
  console.log(`   ✅ No 2-way ties for PRIMARY`)
}

console.log(`\n📈 OVERALL ASSESSMENT:`)
const isCritical = tieCases.primaryTie3Plus.length > 0 || tieCases.secondaryTie2Way.length > 0
if (isCritical) {
  console.log(`   ❌ ISSUES FOUND: Scoring logic may need adjustment`)
} else {
  console.log(`   ✅ HEALTHY: All ties are acceptable (2-way primary at most)`)
}

console.log(``)
