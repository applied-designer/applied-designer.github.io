import { useLocation, useNavigate } from 'react-router-dom'
import { archetypeData } from '../data/archetypeData'

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { scores } = location.state || {}
  
  if (!scores) {
    navigate('/quiz')
    return null
  }
  
  const primary = archetypeData[scores.primary.archetype]
  const secondary = scores.secondary ? archetypeData[scores.secondary.archetype] : null
  
  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">
          You are {primary.emoji} {scores.primary.archetype}
        </h1>
        
        <h2 className="results-subtitle">
          You are most alive when {primary.mostAliveWhen}
        </h2>
        
        <h2 className="results-subtitle">
          Your mantra could be "{primary.mantra}"
        </h2>
        
        <div className="results-notes">
          <p className="results-note">
            <strong>{scores.primary.archetype}:</strong> {primary.description}
          </p>
          
          {secondary && (
            <p className="results-note">
              <strong>{scores.secondary.archetype}:</strong> {secondary.description}
            </p>
          )}
          
          <p className="results-note">
            <strong>Scores:</strong> {scores.primary.archetype} - {scores.primary.score} points
          </p>
          
          {secondary && (
            <p className="results-note">
              {scores.secondary.archetype} - {scores.secondary.score} points
            </p>
          )}
        </div>
        
        <div className="results-actions">
          <button 
            className="results-button"
            onClick={() => navigate('/quiz')}
          >
            Retake Quiz
          </button>
          <button 
            className="results-button"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}