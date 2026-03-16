import { useLocation, useNavigate } from 'react-router-dom'
import { archetypeData } from '../data/archetypeData'
import RadarChart from '../components/RadarChart'
import { decodeDims, dimsToArray, getClosestArchetypes, DIM_KEYS } from '../data/quizUtils'
import { exportToPNG } from '../utils/pngExport'
import { DIM_COLORS, DIM_LABELS } from '../data/colors'

// Source - https://stackoverflow.com/a/5650012
// Posted by Alnitak, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-16, License - CC BY-SA 3.0

function mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function ResultsChart({values}) {
    function cleanValue(val) {
        return mapRange(val, 0, 60, 12, 60);
    }

    return(
        <div>
            {DIM_KEYS.map((k, v) => (
                <div style={{"display": "flex", "textAlign": "left"}}>
                    <label for={`${k}_bar`} style={{"textTransform": "capitalize", "minWidth": "30%"}}>{DIM_LABELS[v]}</label>
                    <progress id={`${k}_bar`} max={cleanValue(60)} value={cleanValue(values[v])} style={{height: "2rem"}}>cleanValue(values[v])</progress>
                    {/*<span>{cleanValue(values[v]) + " / " + cleanValue(60) }</span>*/}
                </div>
            ))}
        </div>
    );
}

/**
 * ResultsPage: Decodes dimension scores from base64 query param, computes archetypes, and renders chart/results.
 * Redirects to /quiz if query param is missing or invalid.
 */
export default function ResultsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    // Expect ?dims=base64string
    const params = new URLSearchParams(location.search)
    const dimsB64 = params.get('dims')
    const dims = dimsB64 ? decodeDims(dimsB64) : null

    // Redirect to quiz if missing/invalid
    if (!dims) {
        navigate('/quiz', { replace: true })
        return null
    }

    // Match user dimensions to closest archetypes using cosine similarity
    const { primary, secondary } = getClosestArchetypes(dims)
    const primaryData = archetypeData[primary] || {}
    const secondaryData = archetypeData[secondary] || {}
    const radarValues = dimsToArray(dims)

    // Share/Export handlers
    const handleCopyLink = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!')
        })
    }

    const handleDownloadPNG = async () => {
        await exportToPNG(radarValues, primaryData)
    }
  
    return (
        <div className="results-container">
            <div className="results-content">
                <h1 className="results-title">
                    {primaryData.emoji} {primary}
                </h1>
                <h2 className="results-subtitle">
                    You are most alive when {primaryData.mostAliveWhen}
                </h2>
                <h2 className="results-subtitle">
                    Your mantra could be “{primaryData.mantra}”
                </h2>
                <div>
                    <ResultsChart values={radarValues} />
                </div>
                {/* TODO: implement Radar chart in v2 */}
                {/*<div style={{ maxWidth: 400, margin: '0 auto 2.5rem' }}>
                    <RadarChart values={radarValues} />
                </div>*/}
                <div className="results-notes">
                    <div className="results-note">
                        <strong>Dimension breakdown:</strong>
                        {DIM_KEYS.map(k => (
                        // `${k} (${dims[k]}/60)`).join(', ')
                            <p>
                                <span style={{textTransform: "capitalize", display: "inline"}}>{k}: </span>
                                <span style={{display: "inline"}}>{dims[k]}/60</span>
                            </p>
                        ))}
                    </div>
                    <p className="results-note">
                        <strong>{primary}:</strong> {primaryData.description}
                    </p>
                    {secondaryData && (
                        <p className="results-note">
                            <strong>{secondary}:</strong> {secondaryData.description}
                        </p>
                    )}
                    <p className="results-note">
                        <button 
                            className="results-button"
                            onClick={() => navigate(`/archetype/${primary.toLowerCase().replace(/\s+/g, '-')}`)}
                            style={{ marginTop: '1.5rem' }}
                        >
                            Learn More About {primary}
                        </button>
                    </p>
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
                        onClick={handleCopyLink}
                    >
                        Copy Link
                    </button>
                    {/*<button 
                        className="results-button"
                        onClick={handleDownloadPNG}
                    >
                        Download PNG
                    </button>*/}
                </div>
            </div>
        </div>
    )
}