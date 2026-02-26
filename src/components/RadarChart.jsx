import React from 'react'

// Brand colors for each dimension (order: blue, brown, green, yellow, purple)
const DIM_COLORS = ['#1975A1', '#7B392A', '#D0E7BF', '#FAA41A', '#893A69']
const DIM_LABELS = ['System', 'People', 'Ideas', 'Scale', 'Action']

/**
 * RadarChart for 5 dimensions as a regular pentagon, point up.
 * @param {Object} props
 * @param {number[]} props.values - Array of 5 numbers (0-1, normalized)
 * @param {string[]} [props.labels] - Optional labels for each dimension
 * @param {string[]} [props.colors] - Optional fill colors for each dimension
 * @param {number} [props.size] - Chart size in px
 */
export default function RadarChart({ values, labels = DIM_LABELS, colors = DIM_COLORS, size = 240 }) {
  // Pentagon geometry
  const cx = size / 2, cy = size / 2, r = size * 0.42
  // Angle for each point (pointing up)
  const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5)
  // Outer pentagon points
  const points = Array.from({ length: 5 }, (_, i) => [
    cx + r * Math.cos(angle(i)),
    cy + r * Math.sin(angle(i))
  ])
  // Value polygon points
  const valuePoints = values.map((v, i) => {
    const vr = r * v
    return [cx + vr * Math.cos(angle(i)), cy + vr * Math.sin(angle(i))]
  })
  // SVG path for a polygon
  const path = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Draw colored sectors for each dimension */}
      {points.map((pt, i) => {
        const next = points[(i + 1) % 5]
        return (
          <polygon
            key={i}
            points={`${cx},${cy} ${pt[0]},${pt[1]} ${next[0]},${next[1]}`}
            fill={colors[i]}
            opacity={0.18}
          />
        )
      })}
      {/* Draw outer pentagon */}
      <polygon points={path(points)} fill="none" stroke="#333" strokeWidth={2} />
      {/* Draw value polygon */}
      <polygon points={path(valuePoints)} fill="#1975A1" opacity={0.7} stroke="#1975A1" strokeWidth={2} />
      {/* Draw dots at each value point */}
      {valuePoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={colors[i]} stroke="#333" strokeWidth={1.5} />
      ))}
      {/* Draw labels */}
      {points.map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="urw-din, sans-serif"
          fontSize={size * 0.09}
          fill="#222"
          dy={(() => {
            // Nudge label outward
            const off = 22
            if (y < cy) return -off
            if (y > cy) return off
            return 0
          })()}
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  )
}
