import { archetypeData } from '../../data/archetypeData';
import { quizQuestions } from '../../data/quizData';

// Export all archetype name constants - single source of truth
export const ARCHETYPES = Object.keys(archetypeData);

// Helper to find archetype by name pattern
const findArchetype = (pattern) => ARCHETYPES.find(a => a.toLowerCase().includes(pattern.toLowerCase()));

// Export individual archetype constants - derived from ARCHETYPES
export const ORCHESTRATOR = findArchetype('orchestrator');
export const RESEARCHER = findArchetype('researcher');
export const MULTIDISCIPLINARY = findArchetype('multidisciplinary');
export const GENERALIST = findArchetype('generalist');
export const DIRECTOR = findArchetype('director');
export const ADVOCATE = findArchetype('advocate');
export const EXPERIMENTALIST = findArchetype('experimentalist');
export const DISRUPTOR = findArchetype('disruptor');
export const CONNECTOR = findArchetype('connector');
export const IDEALIST = findArchetype('idealist');
export const IMPROVISER = findArchetype('improviser');
export const EDUCATOR = findArchetype('educator');

// Build short-to-full mapping dynamically from ARCHETYPES
export const SHORT_TO_FULL = Object.fromEntries(
    ARCHETYPES.map(archetype => [
        archetype.toLowerCase().replace('the ', ''),
        archetype
    ])
);

// Get answer text for a question and archetype
export const getAnswerForArchetype = (questionId, archetypeName) => {
    const question = quizQuestions.find(q => q.id === questionId);
    const choice = question?.choices.find(c => c.archetype === archetypeName);
    return choice?.text;
};

// Get all answers for completing the full quiz (first choice of each question)
export const getFullQuizAnswers = () => {
    return quizQuestions.map(question => question.choices[0].text);
};

// Validate that a string is a valid archetype name
export const isValidArchetype = (name) => {
    return ARCHETYPES.includes(name);
};

// Convert short archetype name to full name
export const shortToFullArchetype = (shortName) => {
    return SHORT_TO_FULL[shortName.toLowerCase()] || shortName;
};
