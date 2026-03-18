import { useEffect, useRef } from 'react'
import p5 from 'p5'
import { DIM_KEYS } from '../data/quizUtils'

// Brand colors for each dimension (order matches DIM_KEYS)
// strategy: blue, adaptability: brown, collaboration: green, experimentation: yellow, impact: purple
const DIM_LABELS = ['Strategy', 'Adaptability', 'Collaboration', 'Experimentation', 'Impact']

/**
 * Pentagon: 5D dimension visualization as a regular pentagon.
 * Two modes:
 *   - mode='display': Renders responsive SVG for web pages
 *   - mode='export': Returns p5.js sketch for 1080x1920 PNG export
 *
 * @param {Object} props
 * @param {number[]} props.values - Array of 5 numbers (0-1, normalized)
 * @param {string} [props.mode] - 'display' or 'export' (default: 'display')
 * @param {number} [props.size] - Size in px for display mode (default: 280)
 * @param {Object} [props.archetypeData] - { emoji, name, description } for export header
 */
export default function Pentagon({
    values,
    mode = 'display',
    size = 280,
    archetypeData = {}
}) {
    const containerRef = useRef(null)
    const p5InstanceRef = useRef(null)

    // Ensure values is normalized to 0-1 range (if max is 5, divide by 5)
    const normalizedValues = values.map(v => {
        const max = Math.max(...values)
        return max > 0 ? v / max : 0
    })

    // Pentagon geometry helpers
    const getPentagonPoints = (centerX, centerY, radius) => {
        const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5)
        return Array.from({ length: 5 }, (_, i) => ({
            x: centerX + radius * Math.cos(angle(i)),
            y: centerY + radius * Math.sin(angle(i))
        }))
    }

    const getValuePoints = (centerX, centerY, radius, normalVals) => {
        const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5)
        return normalVals.map((v, i) => ({
            x: centerX + radius * v * Math.cos(angle(i)),
            y: centerY + radius * v * Math.sin(angle(i))
        }))
    }

    // SVG Mode (Display)
    if (mode === 'display') {
        const cx = size / 2
        const cy = size / 2
        const r = size * 0.42

        const pentPoints = getPentagonPoints(cx, cy, r)
        const valPoints = getValuePoints(cx, cy, r, normalizedValues)

        const path = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ')

        return (
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
            >
                {/* Colored sectors for each dimension */}
                {pentPoints.map((pt, i) => {
                    const next = pentPoints[(i + 1) % 5]
                    return (
                        <polygon
                            key={`sector-${i}`}
                            points={`${cx},${cy} ${pt.x},${pt.y} ${next.x},${next.y}`}
                            fill={DIM_COLORS_HEX[i]}
                            opacity={0.18}
                        />
                    )
                })}

                {/* Outer pentagon */}
                <polygon points={path(pentPoints)} fill="none" stroke="#333" strokeWidth={2} />

                {/* Value polygon */}
                <polygon
                    points={path(valPoints)}
                    fill="#1975A1"
                    opacity={0.7}
                    stroke="#1975A1"
                    strokeWidth={2}
                />

                {/* Dots at each value point */}
                {valPoints.map(({ x, y }, i) => (
                    <circle
                        key={`dot-${i}`}
                        cx={x}
                        cy={y}
                        r={6}
                        fill={DIM_COLORS_HEX[i]}
                        stroke="#333"
                        strokeWidth={1.5}
                    />
                ))}

                {/* Labels */}
                {pentPoints.map(({ x, y }, i) => (
                    <text
                        key={`label-${i}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="urw-din, sans-serif"
                        fontSize={size * 0.09}
                        fill="#222"
                        dy={
                            y < cy ? -22 : y > cy ? 22 : 0
                        }
                    >
                        {DIM_LABELS[i]}
                    </text>
                ))}
            </svg>
        )
    }

    // P5.js Mode (Export)
    if (mode === 'export') {
        useEffect(() => {
            if (!containerRef.current) return

            const sketch = (p) => {
                const CANVAS_W = 1080
                const CANVAS_H = 1920
                const MARGIN = 80
                const HEADER_H = 300

                p.setup = function () {
                    p.createCanvas(CANVAS_W, CANVAS_H)
                    p.background('#f5f5f5')

                    // Header with archetype info
                    p.fill(0)
                    p.textAlign(p.CENTER, p.TOP)
                    p.textSize(56)
                    p.textFont('urw-din, sans-serif')
                    p.textStyle(p.BOLD)
                    p.text(`${archetypeData.emoji || '🎨'} ${archetypeData.name || 'Archetype'}`, CANVAS_W / 2, MARGIN)

                    // Subheader
                    p.fill(100)
                    p.textSize(24)
                    p.textStyle(p.NORMAL)
                    p.text(archetypeData.mantra || '', CANVAS_W / 2, MARGIN + 60)

                    // Draw pentagon on lower half
                    const cx = CANVAS_W / 2
                    const cy = HEADER_H + (CANVAS_H - HEADER_H) / 2 - 100
                    const r = 250

                    const pentPoints = getPentagonPoints(cx, cy, r)
                    const valPoints = getValuePoints(cx, cy, r, normalizedValues)

                    // Colored sectors
                    for (let i = 0; i < 5; i++) {
                        const pt = pentPoints[i]
                        const next = pentPoints[(i + 1) % 5]
                        p.fill(p.color(DIM_COLORS_HEX[i]))
                        p.stroke('none')
                        p.opacity(0.18)
                        p.triangle(cx, cy, pt.x, pt.y, next.x, next.y)
                    }

                    // Outer pentagon
                    p.stroke(51)
                    p.strokeWeight(3)
                    p.fill(0, 0)
                    p.beginShape()
                    pentPoints.forEach((pt) => p.vertex(pt.x, pt.y))
                    p.endShape(p.CLOSE)

                    // Value polygon
                    p.stroke(p.color('#1975A1'))
                    p.strokeWeight(3)
                    p.fill(p.color('#1975A1'))
                    p.opacity(0.7)
                    p.beginShape()
                    valPoints.forEach((pt) => p.vertex(pt.x, pt.y))
                    p.endShape(p.CLOSE)

                    // Dots at value points
                    for (let i = 0; i < 5; i++) {
                        const pt = valPoints[i]
                        p.fill(p.color(DIM_COLORS_HEX[i]))
                        p.stroke(51)
                        p.strokeWeight(2)
                        p.circle(pt.x, pt.y, 16)
                    }

                    // Labels
                    p.fill(51)
                    p.textSize(20)
                    p.noStroke()
                    pentPoints.forEach((pt, i) => {
                        p.textAlign(p.CENTER, p.CENTER)
                        const offset = 60
                        const dx = pt.x - cx
                        const dy = pt.y - cy
                        const len = Math.sqrt(dx * dx + dy * dy)
                        const labelX = cx + (dx / len) * (len + offset)
                        const labelY = cy + (dy / len) * (len + offset)
                        p.text(DIM_LABELS[i], labelX, labelY)
                    })

                    // Footer with dimension values
                    p.fill(100)
                    p.textSize(16)
                    p.textAlign(p.CENTER, p.BOTTOM)
                    const footerY = CANVAS_H - 60
                    const dims = DIM_KEYS.map((k, i) => `${DIM_LABELS[i]}: ${values[i]}`)
                    p.text(dims.join(' · '), CANVAS_W / 2, footerY)
                }

                p.draw = function () {
                    // Static render, nothing to animate
                }
            }

            // Create sketch instance
            const instance = new p5(sketch, containerRef.current)
            p5InstanceRef.current = instance

            return () => {
                instance.remove()
                p5InstanceRef.current = null
            }
        }, [normalizedValues, archetypeData])

        return <div ref={containerRef} style={{ width: '100%', textAlign: 'center' }} />
    }

    return null
}
