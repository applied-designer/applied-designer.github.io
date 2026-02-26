import { archetypeData } from './archetypeData'
import { quizQuestions } from './quizData'

export function calculateScores(responses) {
  const scores = {}
  
  // Initialize all archetypes to 0
  Object.keys(archetypeData).forEach(arch => {
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