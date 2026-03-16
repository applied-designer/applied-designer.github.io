import { useParams, useNavigate } from 'react-router-dom'
import { archetypeData } from '../data/archetypeData'
import RadarChart from '../components/RadarChart'
import { dimsToArray } from '../data/quizUtils'

/**
 * ArchetypeDetail: Display full details for a single archetype
 * Route: /archetype/:name
 *
 * Shows:
 * - Emoji and full name
 * - Description and core philosophy
 * - "Most alive when" moment
 * - Mantra
 * - Example designers
 * - Dimension radar chart
 * - Navigation back to results or home
 */
export default function ArchetypeDetail() {
    const { name } = useParams()
    const navigate = useNavigate()

    // Find archetype by name (case-insensitive)
    const archetypeName = Object.keys(archetypeData).find(
        (key) => key.toLowerCase().replace(/\s+/g, '-') === name?.toLowerCase()
    )

    if (!archetypeName) {
        return (
            <div className="archetype-detail-container">
                <div className="archetype-content">
                    <h1>Archetype not found</h1>
                    <p>The archetype "{name}" does not exist.</p>
                    <div className="archetype-actions">
                        <button onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            </div>
        )
    }

    const data = archetypeData[archetypeName]
    const radarValues = dimsToArray(data.dimensions)

    return (
        <div className="archetype-detail-container">
            <div className="archetype-content">
                {/* Header */}
                <div className="archetype-header">
                    <h1 className="archetype-title">
                        {data.emoji} {archetypeName}
                    </h1>
                    <p className="archetype-mantra">"{data.mantra}"</p>
                </div>

                {/* Main description */}
                <div className="archetype-section">
                    <h2>Who They Are</h2>
                    <p className="archetype-description">{data.description}</p>
                </div>

                {/* Most alive when */}
                <div className="archetype-section">
                    <h2>Most Alive When</h2>
                    <p className="archetype-alive-when">{data.mostAliveWhen}</p>
                </div>

                {/* Dimension visualization */}
                <div className="archetype-section">
                    <h2>Dimension Profile</h2>
                    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
                        <RadarChart values={radarValues} />
                    </div>
                    <div className="archetype-dimensions">
                        <table>
                            <thead>
                                <tr>
                                    <th>Dimension</th>
                                    <th>Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.dimensions).map(([key, value]) => (
                                    <tr key={key}>
                                        <td className="dim-name">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                        <td className="dim-value">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Example designers */}
                {data.designers && data.designers.length > 0 && (
                    <div className="archetype-section">
                        <h2>Example Designers</h2>
                        <ul className="archetype-designers">
                            {data.designers.map((designer) => (
                                <li key={designer}>{designer}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Navigation */}
                <div className="archetype-actions">
                    <button className="archetype-button" onClick={() => navigate(-1)}>
                        Back
                    </button>
                    <button className="archetype-button" onClick={() => navigate('/')}>
                        Home
                    </button>
                    <button className="archetype-button" onClick={() => navigate('/quiz')}>
                        Take Quiz
                    </button>
                </div>
            </div>
        </div>
    )
}
