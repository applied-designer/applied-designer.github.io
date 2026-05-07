import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { archetypeData } from '../data/archetypeData';
import { decodeDims, dimsToArray, getClosestArchetypes, DIM_KEYS } from '../data/quizUtils';
import { exportToPNG } from '../utils/pngExport';
import { DIM_COLORS, DIM_LABELS } from '../data/colors';

// Source - https://stackoverflow.com/a/5650012
// Posted by Alnitak, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-16, License - CC BY-SA 3.0

const _mapRange = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

function ResultsChart({values}) {
    return(
        <div className="results-chart">
            {/*TODO: some unique keys error here*/}
            {DIM_KEYS.map((k, v) => (
                <div style={{"display": "flex", "textAlign": "left", "alignItems": "center"}}>
                    <label htmlFor={`${k}_bar`} style={{"textTransform": "capitalize", "minWidth": "30%", "fontSize": "1.2rem", "marginRight": "2rem"}}>{DIM_LABELS[v]}</label>
                    <div className="progress-bar">
                        <div className="progress-value" style={{"backgroundColor": DIM_COLORS[v], "width": `${values[v]/.6}%` }}>
                        </div>
                    </div>
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
    const location = useLocation();
    const navigate = useNavigate();
    const [copyText, setCopyText] = useState("Copy Link");

    // Parse v1/v2: ?v=<version>&dims=<base64>&p=<primary>&s=<secondary>
    const params = new URLSearchParams(location.search);
    const version = params.get('v');
    const dimsB64 = params.get('dims');
    const dims = dimsB64 ? decodeDims(dimsB64) : null;

    // Invalid/missing dims → quiz
    if (!dims) {
        navigate('/quiz', { replace: true });
        return null;
    }

    // Only v2 supported. Missing v = v1 mode.
    if (version !== null && version !== '2') {
        navigate('/quiz', { replace: true });
        return null;
    }

    // v2 with vote-based archetypes
    let primary, secondary;
    if (version === '2') {
        const votePrimary = params.get('p');
        const voteSecondary = params.get('s');
        if (votePrimary && archetypeData[votePrimary]) {
            primary = votePrimary;
            secondary = voteSecondary && archetypeData[voteSecondary] ? voteSecondary : null;
        } else {
            // Fallback: cosine similarity
            ({ primary, secondary } = getClosestArchetypes(dims));
        }
    } else {
        // v1: cosine similarity
        ({ primary, secondary } = getClosestArchetypes(dims));
    }
    const primaryData = archetypeData[primary] || {};
    const secondaryData = archetypeData[secondary] || {};
    const radarValues = dimsToArray(dims);

    // Share/Export handlers
    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopyText("Link Copied!");
            setTimeout(() => setCopyText("Copy Link"), 2000);
        });
    };

    const _handleDownloadPNG = async () => {
        await exportToPNG(radarValues, primaryData);
    };
  
    return (
        <div className="results-container">
            <div className="results-overview">
                <h1>Your Results</h1>
                <br />
                <br />
            
                <p className="results-caption">
                    You are the...
                </p>
                <h1 className="results-title">
                    {primaryData.emoji} {primary}
                </h1>
                <p className="results-caption">
                    Your mantra could be... 
                </p>
                <h2 className="results-subtitle results-mantra">
                    {primaryData.mantra}
                </h2>
                <h2 className="results-subtitle">
                    You are most alive when <span style={{textTransform: "lowercase"}}>{primaryData.mostAliveWhen}</span>
                </h2>
                <ResultsChart values={radarValues} />
                {/* TODO: implement Radar chart in v2 */}
                {/*<div style={{ maxWidth: 400, margin: '0 auto 2.5rem' }}>
                    <RadarChart values={radarValues} />
                </div>*/}
            </div>
            <div className="results-breakdown">
                <h2>Dimension breakdown</h2>
                <div className="results-note" style={{font: "var(--font-sans)"}}>
                    {DIM_KEYS.map(k => (
                        <p style={{fontSize: "1.25rem", "textAlign": "left", "justifyContent": "space-between", "display": "flex"}}>
                            <span style={{textTransform: "capitalize", display: "inline", marginRight: "2rem"}}>
                                {k}
                            </span>
                            <span style={{display: "inline"}}>
                                <span style={{fontWeight: "bold"}}>{dims[k]}</span>
                                &nbsp;/&nbsp;60
                            </span>
                        </p>
                    ))}
                </div>
                {/*TODO: float 2 cols desktop -> 1 col mobile */}
                <div>
                    <div>
                        <h2 className="results-subtitle">{primary} (Primary Archetype)</h2>
                        <p className="results-note center">
                            {primaryData.description}
                        </p>
                    </div>
                    <br />
                    {secondaryData && (
                        <div>
                            <h2 className="results-subtitle">{secondary} (Secondary Archetype)</h2>
                            <p className="results-note center">
                                {secondaryData.description}
                            </p>
                        </div>

                    )}
                </div>
                {/* TODO: build out info pages for each archetype */}
                {/*<p className="results-note">
                    <button 
                        className="results-button"
                        onClick={() => navigate(`/archetype/${primary.toLowerCase().replace(/\s+/g, '-')}`)}
                        style={{ marginTop: '1.5rem' }}
                    >
                        Learn More About {primary}
                    </button>
                </p>*/}
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
                    {/*Copy Link*/}
                    {copyText}
                </button>
                {/*<button 
                    className="results-button"
                    onClick={handleDownloadPNG}
                >
                    Download PNG
                </button>*/}
            </div>
        </div>
    );
}