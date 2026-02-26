import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Model, Survey } from 'survey-react-ui'
import { quizQuestions } from '../data/quizData'
import { calculateScores } from '../data/scoringUtils'
import 'survey-core/survey-core.css'

export default function QuizPage() {
  const [survey, setSurvey] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const navigate = useNavigate()
  
  const checkCompletion = (surveyData) => {
    const answeredCount = Object.keys(surveyData || {}).filter(key => 
      surveyData[key] !== undefined && surveyData[key] !== null
    ).length
    const allAnswered = answeredCount === quizQuestions.length
    console.log('Completion check:', answeredCount, 'of', quizQuestions.length, '=>', allAnswered)
    return allAnswered
  }
  
  useEffect(() => {
    const surveyModel = new Model({
      questions: quizQuestions.map(q => ({
        type: 'radiogroup',
        name: q.id,
        title: q.text,
        choices: q.choices.map(c => c.text),
        isRequired: true,
        showNoneItem: false
      })),
      showNavigationButtons: false,
      showProgressBar: false,
      completedHtml: '<div></div>'
    })
    
    surveyModel.onValueChanged.add((sender, options) => {
      const allAnswered = checkCompletion(sender.data)
      setIsComplete(allAnswered)
    })
    
    surveyModel.onCurrentPageChanged.add((sender, options) => {
      const allAnswered = checkCompletion(sender.data)
      setIsComplete(allAnswered)
    })
    
    // Set initial state
    const initiallyComplete = checkCompletion(surveyModel.data)
    setIsComplete(initiallyComplete)
    
    setSurvey(surveyModel)
  }, [])
  
  const handleSubmit = () => {
    if (!survey || !isComplete) return
    
    const responses = Object.entries(survey.data).map(([questionId, answer]) => ({
      questionId,
      answer
    }))
    
    const scores = calculateScores(responses)
    navigate('/results', { state: { scores } })
  }
  
  if (!survey) {
    return <div className="quiz-container">Loading...</div>
  }
  
  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Applied Designer Quiz</h1>
      
      <div className="survey-wrapper">
        <Survey model={survey} />
      </div>
      
      <button 
        className={`submit-button ${isComplete ? 'enabled' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={!isComplete}
      >
        Submit
      </button>
    </div>
  )
}