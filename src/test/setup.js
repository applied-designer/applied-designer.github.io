// Mock p5.js
vi.mock('p5', () => {
    return {
        default: class MockP5 {
            constructor() {}
            setup() {}
            draw() {}
            createCanvas() { return { drawingContext: {} }; }
            background() {}
            fill() {}
            noFill() {}
            stroke() {}
            noStroke() {}
            strokeWeight() {}
            text() {}
            textSize() {}
            textStyle() {}
            textAlign() {}
            textFont() {}
            beginShape() {}
            endShape() {}
            vertex() {}
            circle() {}
            triangle() {}
            saveCanvas() {}
            remove() {}
            color() { return {}; }
            get COLOR() { return { CENTER: 'center' }; }
            get TOP() { return 'top'; }
            get BOTTOM() { return 'bottom'; }
            get BOLD() { return 'bold'; }
            get NORMAL() { return 'normal'; }
            get CLOSE() { return 'close'; }
        }
    };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

// Mock clipboard API
const clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
};
Object.defineProperty(navigator, 'clipboard', {
    value: clipboard,
    writable: true
});

// Mock WebGL context for Three.js
global.HTMLCanvasElement.prototype.getContext = vi.fn();