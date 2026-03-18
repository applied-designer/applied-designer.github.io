#!/usr/bin/env node

/**
 * Generate all 5^12 quiz answer combinations (244,140,625 total)
 * 
 * Each combination represents all possible ways to answer the 12-question quiz
 * where each question has 5 answer choices (0-4).
 * 
 * Output: CSV with columns a1,a2,...,a12
 * File: src/test/fixtures/quiz_answer_combinations.csv
 */

const fs = require('fs')
const path = require('path')

const QUESTIONS = 12
const CHOICES_PER_QUESTION = 5
const TOTAL_COMBINATIONS = Math.pow(CHOICES_PER_QUESTION, QUESTIONS) // 244,140,625

const fixturesDir = path.join(__dirname, '..', 'src', 'test', 'fixtures')
const outputFile = path.join(fixturesDir, 'quiz_answer_combinations.csv')

// Ensure fixtures directory exists
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true })
}

console.log(`🎯 Generating ${TOTAL_COMBINATIONS.toLocaleString()} quiz answer combinations...`)
console.log(`ℹ️  5^12 combinations, each representing a unique way to answer 12 questions`)
console.log(`📁 Output: ${outputFile}`)
console.log()

const startTime = Date.now()
let written = 0
let lastLogTime = startTime

const writeStream = fs.createWriteStream(outputFile)

// Write header
writeStream.write('a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12\n')

// Generate combinations using a counter approach
// index represents the combination number (0 to 5^12-1)
// We convert each index to base-5 representation to get the answers for each question
for (let index = 0; index < TOTAL_COMBINATIONS; index++) {
  let remaining = index
  let row = ''

  // Convert index to base-5 representation and build CSV row directly
  for (let q = 0; q < QUESTIONS; q++) {
    if (q > 0) row += ','
    row += remaining % CHOICES_PER_QUESTION
    remaining = Math.floor(remaining / CHOICES_PER_QUESTION)
  }

  // Write as CSV row
  writeStream.write(row + '\n')

  // Progress logging every 5 million combinations
  if ((index + 1) % 5000000 === 0) {
    const elapsed = Date.now() - startTime
    const rate = (index + 1) / (elapsed / 1000)
    const remaining_total = TOTAL_COMBINATIONS - (index + 1)
    const eta_seconds = remaining_total / rate
    const eta_minutes = (eta_seconds / 60).toFixed(1)

    console.log(
      `✓ Generated ${(index + 1).toLocaleString()} combinations | ` +
      `${rate.toLocaleString('en', { maximumFractionDigits: 0 })} combos/sec | ` +
      `ETA: ${eta_minutes} minutes remaining`
    )
  }
}

writeStream.end()

writeStream.on('finish', () => {
  const elapsed = Date.now() - startTime
  const elapsedSeconds = (elapsed / 1000).toFixed(1)
  const fileSizeBytes = fs.statSync(outputFile).size
  const fileSizeMB = (fileSizeBytes / 1024 / 1024).toFixed(1)

  console.log()
  console.log(`✅ Done! Generated ${TOTAL_COMBINATIONS.toLocaleString()} combinations in ${elapsedSeconds}s`)
  console.log(`📊 File size: ${fileSizeMB} MB`)
  console.log()
  console.log(`Next step: Score all combinations using calculateScores()`)
})

writeStream.on('error', (err) => {
  console.error('❌ Error writing file:', err)
  process.exit(1)
})
