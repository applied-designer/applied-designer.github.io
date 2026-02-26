// Simple test of quiz scoring logic without module system issues

// Define sample quiz data directly
const quizQuestions = [
  {
    id: 'Q1',
    text: 'What excites you most when starting a new project?',
    choices: [
      { text: 'Finding patterns and designing a system', archetype: 'The Orchestrator' },
      { text: 'Researching the context', archetype: 'The Researcher' },
      { text: 'Trying a lot of different ideas', archetype: 'The Experimentalist' },
      { text: 'Getting the team to work toward the same vision', archetype: 'The Director' },
      { text: 'Discovery along the way', archetype: 'The Generalist' }
    ]
  }
]

// Define scoring function inline
function calculateScores(responses) {
  const scores = {}
  
  // Initialize all archetypes to 0
  const archetypes = [
    'The Orchestrator', 'The Researcher', 'The Multidisciplinary', 'The Generalist',
    'The Director', 'The Advocate', 'The Experimentalist', 'The Disruptor',
    'The Connector', 'The Idealist', 'The Improviser', 'The Educator'
  ]
  
  archetypes.forEach(arch => {
    scores[arch] = 0
  })
  
  // Add 1 point for each selected archetype
  responses.forEach(response => {
    const question = quizQuestions.find(q => q.id === response.questionId)
    if (question) {
      const choice = question.choices.find(c => c.text === response.answer)
      if (choice && choice.archetype) {
        scores[choice.archetype] = (scores[choice.archetype] || 0) + 1
      }
    }
  })
  
  // Sort by score (highest first), then alphabetically for ties
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  
  return {
    primary: { archetype: sorted[0][0], score: sorted[0][1] },
    secondary: sorted[1] ? { archetype: sorted[1][0], score: sorted[1][1] } : null,
    allScores: sorted
  }
}

// Test with sample responses
const sampleResponses = [
  { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
  { questionId: 'Q1', answer: 'Researching the context' }, // The Researcher
  { questionId: 'Q1', answer: 'Trying a lot of different ideas' }, // The Experimentalist
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

// Test tie-breaking
const tieResponses = [
  { questionId: 'Q1', answer: 'Finding patterns and designing a system' }, // The Orchestrator
  { questionId: 'Q1', answer: 'Researching the context' }, // The Researcher
]

console.log('\n=== Testing Tie-Breaking ===')
const tieResult = calculateScores(tieResponses)
console.log('Primary (tie):', tieResult.primary.archetype, '-', tieResult.primary.score, 'points')
console.log('Secondary (tie):', tieResult.secondary?.archetype, '-', tieResult.secondary?.score, 'points')
console.log('Should be alphabetical: Orchestrator before Researcher =', tieResult.primary.archetype < tieResult.secondary?.archetype)