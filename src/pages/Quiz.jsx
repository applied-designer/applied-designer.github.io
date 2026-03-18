import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Model, Survey } from 'survey-react-ui'
import { quizQuestions } from '../data/quizData'
import { calculateScores } from '../data/scoringUtils'
import { encodeDimsV1, DIM_KEYS } from '../data/quizUtils'
import { PANEL_COLORS_HEX } from '../data/colors'
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
        const panelClassOrder = [
            'quiz-panel-blue',
            'quiz-panel-brown',
            'quiz-panel-green',
            'quiz-panel-yellow',
            'quiz-panel-purple'
        ]

        const surveyModel = new Model({
            questions: quizQuestions.map((q, index) => ({
                type: 'radiogroup',
                name: q.id,
                title: q.text,
                description: `${index + 1} of ${quizQuestions.length}`,
                choices: q.choices.map(c => c.text),
                isRequired: true,
                showNoneItem: false
            })),
            showNavigationButtons: false,
            showProgressBar: false,
            completedHtml: '<div></div>'
        })

        const applyPanelStyle = (questionName) => {
            const questionIndex = quizQuestions.findIndex(question => question.id === questionName)
            if (questionIndex === -1) return
      
            const panelClass = panelClassOrder[questionIndex % panelClassOrder.length]
            const colors = PANEL_COLORS_HEX[panelClass]
            if (!colors) return
      
            // Find question element - SurveyJS renders to .sd-question elements
            const questionElements = document.querySelectorAll('.sd-question')
            questionElements.forEach(el => {
                const titleEl = el.querySelector('.sd-question__title')
                if (titleEl && titleEl.textContent.includes(quizQuestions[questionIndex].text.substring(0, 20))) {
                    // Apply inline styles to ensure they stick through re-renders
                    el.style.backgroundColor = colors.bg
                    el.style.color = colors.fg
                    el.style.setProperty('--panel-fg', colors.fg)
                    el.classList.add('quiz-panel', panelClass)
                }
            })
        }

        surveyModel.onValueChanged.add((sender, options) => {
            const allAnswered = checkCompletion(sender.data)
            setIsComplete(allAnswered)
            // Reapply styles on value change
            if (options.question) {
                setTimeout(() => applyPanelStyle(options.question.name), 0)
            }
        })
    
        surveyModel.onCurrentPageChanged.add((sender, _options) => {
            const allAnswered = checkCompletion(sender.data)
            setIsComplete(allAnswered)
        })

        surveyModel.onAfterRenderQuestion.add((sender, options) => {
            const questionIndex = quizQuestions.findIndex(question => question.id === options.question.name)
            if (questionIndex === -1) return
      
            const panelClass = panelClassOrder[questionIndex % panelClassOrder.length]
            const colors = PANEL_COLORS_HEX[panelClass]
            if (!colors) return
      
            // Apply inline styles
            options.htmlElement.style.backgroundColor = colors.bg
            options.htmlElement.style.color = colors.fg
            options.htmlElement.style.setProperty('--panel-fg', colors.fg)
            options.htmlElement.classList.add('quiz-panel', panelClass)
        })
    
        // Set initial state
        const initiallyComplete = checkCompletion(surveyModel.data)
        setIsComplete(initiallyComplete)
    
        setSurvey(surveyModel)
    }, [])
  
    const handleSubmit = () => {
        if (!survey || !isComplete) return
        // Calculate dimension scores from responses
        const responses = Object.entries(survey.data).map(([questionId, answer]) => ({ questionId, answer }))
        const scores = calculateScores(responses)
        // Build dims object in canonical order
        const dims = Object.fromEntries(
            (scores.dimensionScores || []).map(([k, v]) => [k, v])
        )
        // Fill missing keys with 0
        DIM_KEYS.forEach(k => { if (!(k in dims)) dims[k] = 0 })

        const dimsRaw = encodeDimsV1(dims)
        const dimsB64 = btoa(dimsRaw)

        // Log analytics
        window.gtag?.('event', 'quiz_complete', {
            dims_raw: dimsRaw,
            version: 1,
            strategy: dims.strategy,
            adaptability: dims.adaptability,
            collaboration: dims.collaboration,
            experimentation: dims.experimentation,
            impact: dims.impact,
            question_answers: JSON.stringify(survey.data)
        })

        navigate(`/results?dims=${encodeURIComponent(dimsB64)}`)
    }
  
    if (!survey) {
        return <div className="quiz-container">Loading...</div>
    }
  
    return (
        <div className="quiz-container">
            <h1 className="quiz-title">Applied Designer Quiz</h1>
            {/* TODO: fix padding properly */}
            <br />
            <br />
            <p className="quiz-intro">
                Take the quiz to find out which archetype of Applied Designer you are!
            </p>
      
            <div className="survey-wrapper">
                <Survey model={survey} />

                <button 
                    className={`submit-button ${isComplete ? 'enabled' : 'disabled'}`}
                    onClick={handleSubmit}
                    disabled={!isComplete}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}
