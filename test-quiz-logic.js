const { calculateScores } = require('./src/data/scoringUtils.js')

// Test with real quiz data from CSV sample
const sampleResponses = [
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

console.log('Testing quiz scoring with sample responses...')
console.log('Responses:', sampleResponses)

const result = calculateScores(sampleResponses)
console.log('\n=== Results ===')
console.log('Primary:', result.primary.archetype, '-', result.primary.score, 'points')
console.log('Secondary:', result.secondary?.archetype, '-', result.secondary?.score, 'points')

console.log('\n=== Full Score Breakdown ===')
result.allScores.forEach(([archetype, score]) => {
  if (score > 0) {
    console.log(`${archetype}: ${score}`)
  }
})