import { DIM_COLORS, DIM_LABELS } from '../data/colors';

/**
 * RadarChart for 5 dimensions as a regular pentagon, point up.
 * Draws proportional sector fills based on normalized values (0-5 → 0-1).
 * @param {Object} props
 * @param {number[]} props.values - Array of 5 numbers (0-5 scale, will be normalized internally)
 * @param {string[]} [props.labels] - Optional labels for each dimension
 * @param {string[]} [props.colors] - Optional fill colors for each dimension
 * @param {number} [props.size] - Chart size in px
 */
export default function RadarChart({ values, labels = DIM_LABELS, colors = DIM_COLORS, size = 280 }) {
    // Normalize values from 0-5 to 0-1
    const normalized = values.map(v => Math.min(v / 5, 1));
  
    // Pentagon geometry
    const cx = size / 2, cy = size / 2, r = size * 0.38;
  
    // Angle for each point (pointing up)
    const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5);
  
    // Outer pentagon points
    const points = Array.from({ length: 5 }, (_, i) => [
        cx + r * Math.cos(angle(i)),
        cy + r * Math.sin(angle(i))
    ]);
  
    // Value polygon points (scaled by normalized values)
    const valuePoints = normalized.map((v, i) => {
        const vr = r * v;
        return [cx + vr * Math.cos(angle(i)), cy + vr * Math.sin(angle(i))];
    });
  
    // SVG path for a polygon
    const path = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
            <defs>
                {/* Subtle gradients for visual depth */}
                {colors.map((color, i) => (
                    <linearGradient key={`grad-${i}`} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.7 }} />
                    </linearGradient>
                ))}
            </defs>

            {/* Draw grid reference circles */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
                <circle
                    key={`grid-${i}`}
                    cx={cx}
                    cy={cy}
                    r={r * level}
                    fill="none"
                    stroke="#ddd"
                    strokeWidth={1}
                    strokeDasharray={level === 1 ? '0' : '3,3'}
                    opacity={0.5}
                />
            ))}

            {/* Draw proportional sector fills for each dimension */}
            {valuePoints.map((valuePt, i) => {
                const nextIdx = (i + 1) % 5;
                const nextValuePt = valuePoints[nextIdx];
                const nextOuter = points[nextIdx];
        
                // Sector polygon: center → current value point → next outer point → next value point → center
                const sectorPath = [
                    [cx, cy],
                    valuePt,
                    nextOuter,
                    nextValuePt
                ];
        
                return (
                    <polygon
                        key={`sector-${i}`}
                        points={path(sectorPath)}
                        fill={colors[i]}
                        opacity={0.65}
                        stroke={colors[i]}
                        strokeWidth={0.5}
                    />
                );
            })}

            {/* Draw outer pentagon outline */}
            <polygon points={path(points)} fill="none" stroke="#222" strokeWidth={2.5} />

            {/* Draw value polygon outline for reference */}
            <polygon
                points={path(valuePoints)}
                fill="none"
                stroke="#888"
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.4}
            />

            {/* HIDE dots at each value point */}
            {valuePoints.map(([x, y], i) => (
                <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r={5}
                    fill="white"
                    stroke={colors[i]}
                    strokeWidth={2}
                    opacity={0} 
                />
            ))}

            {/* Draw labels positioned outward */}
            {points.map(([, ], i) => {
                const labelDistance = r * 1.3;
                const labelX = cx + labelDistance * Math.cos(angle(i));
                const labelY = cy + labelDistance * Math.sin(angle(i));
        
                return (
                    <text
                        key={`label-${i}`}
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="urw-din, sans-serif"
                        fontSize={size * 0.05}
                        fontWeight="400"
                        fill="#222"
                    >
                        {labels[i]}
                    </text>
                );
            })}
        </svg>
    );
}
