import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Model, Survey } from 'survey-react-ui';
import { calculateScores } from '../data/scoringUtils';
import { encodeDimsV1, DIM_KEYS } from '../data/quizUtils';
import { PANEL_COLORS_HEX } from '../data/colors';
import 'survey-core/survey-core.css';

export default function QuizPage() {
    const [survey, setSurvey] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkCompletion = (surveyData, questions) => {
            const answeredCount = Object.keys(surveyData || {}).filter(key =>
                surveyData[key] !== undefined && surveyData[key] !== null
            ).length;
            const allAnswered = answeredCount === questions.length;
            console.log('Completion check:', answeredCount, 'of', questions.length, '=>', allAnswered);
            return allAnswered;
        };

        // Load quiz data: default v2, v=1 loads v1 for testing
        const loadQuizData = async () => {
            const params = new URLSearchParams(window.location.search);
            const useV1 = params.get('v') === '1';
            const module = await import(useV1 ? '../data/quizData_v1.js' : '../data/quizData_v2.js');
            return module.quizQuestions;
        };

        loadQuizData().then(questions => {
            setQuizQuestions(questions);

            const panelClassOrder = [
                'quiz-panel-blue',
                'quiz-panel-brown',
                'quiz-panel-green',
                'quiz-panel-yellow',
                'quiz-panel-purple'
            ];

            const surveyModel = new Model({
                questions: questions.map((q, index) => ({
                    type: 'radiogroup',
                    name: q.id,
                    title: q.text,
                    description: `${index + 1} of ${questions.length}`,
                    choices: q.choices.map(c => c.text),
                    isRequired: true,
                    showNoneItem: false
                })),
                showNavigationButtons: false,
                showProgressBar: false,
                completedHtml: '<div></div>'
            });

            const applyPanelStyle = (questionName) => {
                const questionIndex = questions.findIndex(question => question.id === questionName);
                if (questionIndex === -1) return;

                const panelClass = panelClassOrder[questionIndex % panelClassOrder.length];
                const colors = PANEL_COLORS_HEX[panelClass];
                if (!colors) return;

                const questionElements = document.querySelectorAll('.sd-question');
                questionElements.forEach(el => {
                    const titleEl = el.querySelector('.sd-question__title');
                    if (titleEl && titleEl.textContent.includes(questions[questionIndex].text.substring(0, 20))) {
                        el.style.backgroundColor = colors.bg;
                        el.style.color = colors.fg;
                        el.style.setProperty('--panel-fg', colors.fg);
                        el.classList.add('quiz-panel', panelClass);
                    }
                });
            };

            surveyModel.onValueChanged.add((sender, options) => {
                const allAnswered = checkCompletion(sender.data, questions);
                setIsComplete(allAnswered);
                if (options.question) {
                    setTimeout(() => applyPanelStyle(options.question.name), 0);
                }
            });

            surveyModel.onCurrentPageChanged.add((sender, _options) => {
                const allAnswered = checkCompletion(sender.data, questions);
                setIsComplete(allAnswered);
            });

            surveyModel.onAfterRenderQuestion.add((sender, options) => {
                const questionIndex = questions.findIndex(question => question.id === options.question.name);
                if (questionIndex === -1) return;

                const panelClass = panelClassOrder[questionIndex % panelClassOrder.length];
                const colors = PANEL_COLORS_HEX[panelClass];
                if (!colors) return;

                options.htmlElement.style.backgroundColor = colors.bg;
                options.htmlElement.style.color = colors.fg;
                options.htmlElement.style.setProperty('--panel-fg', colors.fg);
                options.htmlElement.classList.add('quiz-panel', panelClass);

                const parentEl = options.htmlElement.closest('.sd-row__question, .sd-question');
                if (parentEl && parentEl !== options.htmlElement) {
                    parentEl.classList.add('quiz-panel', panelClass);
                }
            });

            const initiallyComplete = checkCompletion(surveyModel.data, questions);
            setIsComplete(initiallyComplete);
            setSurvey(surveyModel);

            setTimeout(() => {
                questions.forEach(q => {
                    applyPanelStyle(q.id);
                });
            }, 100);
        });
    }, []);

    const handleSubmit = () => {
        if (!survey || !isComplete) return;
        const responses = Object.entries(survey.data).map(([questionId, answer]) => ({ questionId, answer }));
        const scores = calculateScores(responses);
        const dims = Object.fromEntries(
            (scores.dimensionScores || []).map(([k, v]) => [k, v])
        );
        DIM_KEYS.forEach(k => { if (!(k in dims)) dims[k] = 0; });

        const dimsRaw = encodeDimsV1(dims);
        const dimsB64 = btoa(dimsRaw);

        window.gtag?.('event', 'quiz_complete', {
            dims_raw: dimsRaw,
            version: 2,
            strategy: dims.strategy,
            adaptability: dims.adaptability,
            collaboration: dims.collaboration,
            experimentation: dims.experimentation,
            impact: dims.impact,
            primary: scores.primary.archetype,
            secondary: scores.secondary?.archetype,
            question_answers: JSON.stringify(survey.data)
        });

        const params = new URLSearchParams({ v: '2', dims: dimsB64 });
        if (scores.primary?.archetype) params.set('p', scores.primary.archetype);
        if (scores.secondary?.archetype) params.set('s', scores.secondary.archetype);
        navigate(`/results?${params.toString()}`);
    };

    if (!survey || quizQuestions.length === 0) {
        return <div className="quiz-container">Loading...</div>;
    }

    return (
        <div className="quiz-container">
            <h1 className="quiz-title">Applied Designer Quiz</h1>
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
    );
}
