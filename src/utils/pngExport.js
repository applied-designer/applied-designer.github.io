/**
 * pngExport.js
 * Utilities for exporting results as PNG for social sharing (1080x1920 IG story format)
 */

import p5 from 'p5';
import {DIM_COLORS_HEX} from '../data/colors';

/**
 * Create p5.js sketch for 1080x1920 PNG export
 * @param {number[]} values - Dimension scores (0-5 range)
 * @param {Object} archetypeData - { emoji, name, mantra, description }
 * @returns {Object} p5 sketch function
 */
export function createExportSketch(values, archetypeData) {
    // TODO: lots of hard-coded stuff here that doesn't have to be
    const DIM_COLORS = DIM_COLORS_HEX; // ['#1975A1', '#7B392A', '#D0E7BF', '#FAA41A', '#893A69']
    const DIM_LABELS = ['Strategy', 'Adaptability', 'Collaboration', 'Experimentation', 'Impact'];

    const getPentagonPoints = (centerX, centerY, radius) => {
        const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5);
        return Array.from({ length: 5 }, (_, i) => ({
            x: centerX + radius * Math.cos(angle(i)),
            y: centerY + radius * Math.sin(angle(i))
        }));
    };

    const getValuePoints = (centerX, centerY, radius, normalVals) => {
        const angle = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / 5);
        return normalVals.map((v, i) => ({
            x: centerX + radius * v * Math.cos(angle(i)),
            y: centerY + radius * v * Math.sin(angle(i))
        }));
    };

    // Normalize values to 0-1 range
    const normalizedValues = values.map(v => {
        const max = Math.max(...values);
        return max > 0 ? v / max : 0;
    });

    return (p) => {
        const CANVAS_W = 1080;
        const CANVAS_H = 1920;
        const MARGIN = 80;
        const HEADER_H = 300;

        p.setup = function () {
            p.createCanvas(CANVAS_W, CANVAS_H);
            p.background('#f5f5f5');

            // Header with archetype info
            p.fill(0);
            p.textAlign(p.CENTER, p.TOP);
            p.textFont('urw-din, sans-serif');
            p.textSize(56);
            p.textStyle(p.BOLD);
            p.text(
                `${archetypeData.emoji || '🎨'} ${archetypeData.name || 'Archetype'}`,
                CANVAS_W / 2,
                MARGIN
            );

            // Mantra subheader
            p.fill(100);
            p.textSize(24);
            p.textStyle(p.NORMAL);
            p.text(archetypeData.mantra || '', CANVAS_W / 2, MARGIN + 70);

            // Draw pentagon on lower half
            const cx = CANVAS_W / 2;
            const cy = HEADER_H + (CANVAS_H - HEADER_H) / 2 - 100;
            const r = 250;

            const pentPoints = getPentagonPoints(cx, cy, r);
            const valPoints = getValuePoints(cx, cy, r, normalizedValues);

            // Colored sectors with opacity
            for (let i = 0; i < 5; i++) {
                const pt = pentPoints[i];
                const next = pentPoints[(i + 1) % 5];
                p.fill(p.color(DIM_COLORS[i]));
                p.stroke('none');
                p.triangle(cx, cy, pt.x, pt.y, next.x, next.y);
            }

            // Reset fill for drawing next elements
            p.noFill();

            // Outer pentagon
            p.stroke(51);
            p.strokeWeight(3);
            p.beginShape();
            pentPoints.forEach((pt) => p.vertex(pt.x, pt.y));
            p.endShape(p.CLOSE);

            // Value polygon
            p.stroke(p.color('#1975A1'));
            p.strokeWeight(3);
            p.fill(p.color('#1975A1'));
            p.beginShape();
            valPoints.forEach((pt) => p.vertex(pt.x, pt.y));
            p.endShape(p.CLOSE);

            // Dots at value points
            for (let i = 0; i < 5; i++) {
                const pt = valPoints[i];
                p.fill(p.color(DIM_COLORS[i]));
                p.stroke(51);
                p.strokeWeight(2);
                p.circle(pt.x, pt.y, 16);
            }

            // Labels
            p.fill(51);
            p.noStroke();
            p.textSize(20);
            p.textAlign(p.CENTER, p.CENTER);
            pentPoints.forEach((pt, i) => {
                const offset = 60;
                const dx = pt.x - cx;
                const dy = pt.y - cy;
                const len = Math.sqrt(dx * dx + dy * dy);
                const labelX = cx + (dx / len) * (len + offset);
                const labelY = cy + (dy / len) * (len + offset);
                p.text(DIM_LABELS[i], labelX, labelY);
            });

            // Footer with dimension values and description
            p.fill(100);
            p.textSize(16);
            p.textAlign(p.CENTER, p.BOTTOM);
            const footerY = CANVAS_H - 120;
            const dims = DIM_LABELS.map((label, i) => `${label}: ${values[i]}`).join(' · ');
            p.text(dims, CANVAS_W / 2, footerY);

            // Description text
            if (archetypeData.description) {
                p.textSize(14);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text(archetypeData.description, CANVAS_W / 2 - 40, CANVAS_H - 40, 80);
            }
        };

        p.draw = function () {
            // Static render
        };
    };
}

/**
 * Download canvas as PNG
 * @param {p5.Renderer} canvas - p5 canvas object
 * @param {string} filename - Filename for download (without extension)
 */
export function downloadCanvasAsPNG(canvas, filename = 'result') {
    canvas.saveCanvas(filename, 'png');
}

/**
 * Trigger PNG export: create temporary sketch, render, download, then clean up
 * @param {number[]} values - Dimension scores
 * @param {Object} archetypeData - { emoji, name, mantra, description }
 * @param {string} filename - Download filename (without extension)
 */
export async function exportToPNG(values, archetypeData, filename = 'applied-designer-result') {
    return new Promise((resolve) => {
        let instance = null;

        // Use DOM to create temporary container
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        // Create sketch
        const sketch = createExportSketch(values, archetypeData);

        // Create p5 instance (hidden)
        instance = new p5(sketch, tempDiv);

        // Wait one frame for rendering, then download
        setTimeout(() => {
            instance.saveCanvas(filename, 'png');

            // Cleanup
            setTimeout(() => {
                instance.remove();
                document.body.removeChild(tempDiv);
                resolve();
            }, 100);
        }, 500);
    });
}
