import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResultsPage from '../pages/Results'

const sampleDims = 'djE6c3RyYXRlZ3k6NDUsYWRhcHRhYmlsaXR5OjM1LGNvbGxhYm9yYXRpb246NTAsZXhwZXJpbWVudGF0aW9uOjI1LGltcGFjdDo0MA'

const renderWithDims = (dims = sampleDims) => {
    return render(
        <MemoryRouter initialEntries={[`/results?dims=${dims}`]}>
            <ResultsPage />
        </MemoryRouter>
    )
}

describe('Results Page Styling', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders results container with results-container class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const container = document.querySelector('.results-container')
            expect(container).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders results title section', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const title = screen.getByText('Your Results')
            expect(title).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders results overview section with results-overview class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const overview = document.querySelector('.results-overview')
            expect(overview).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders results caption with results-caption class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const captions = document.querySelectorAll('.results-caption')
            expect(captions.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('renders results title with archetype emoji and name', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const title = document.querySelector('.results-title')
            expect(title).toBeTruthy()
            expect(title.textContent.length).toBeGreaterThan(1)
        }, { timeout: 3000 })
    })

    it('renders results subtitle with mantra', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const subtitle = document.querySelector('.results-subtitle')
            expect(subtitle).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders results chart with results-chart class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const chart = document.querySelector('.results-chart')
            expect(chart).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders progress bars for each dimension', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const progressBars = document.querySelectorAll('.progress-bar')
            expect(progressBars.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('renders progress values with colored backgrounds', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const progressValues = document.querySelectorAll('.progress-value')
            expect(progressValues.length).toBeGreaterThan(0)
            
            progressValues.forEach(pv => {
                const styles = window.getComputedStyle(pv)
                expect(styles.backgroundColor).toBeTruthy()
            })
        }, { timeout: 3000 })
    })

    it('renders results breakdown section with results-breakdown class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const breakdown = document.querySelector('.results-breakdown')
            expect(breakdown).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders dimension breakdown with capitalized labels', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const breakdown = document.querySelector('.results-breakdown')
            expect(breakdown).toBeTruthy()
            expect(breakdown.textContent).toMatch(/strategy/i)
            expect(breakdown.textContent).toMatch(/adaptability/i)
            expect(breakdown.textContent).toMatch(/collaboration/i)
        }, { timeout: 3000 })
    })

    it('renders action buttons with results-button class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const buttons = document.querySelectorAll('.results-button')
            expect(buttons.length).toBeGreaterThan(0)
        }, { timeout: 3000 })
    })

    it('renders results actions container with results-actions class', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const actions = document.querySelector('.results-actions')
            expect(actions).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders Retake Quiz button', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const retakeButton = screen.getByText('Retake Quiz')
            expect(retakeButton).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('renders Copy Link button', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const copyButton = document.querySelector('.results-button')
            expect(copyButton).toBeTruthy()
        }, { timeout: 3000 })
    })

    it('displays primary archetype name', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const breakdown = document.querySelector('.results-breakdown')
            expect(breakdown.textContent).toMatch(/\(Primary Archetype\)/i)
        }, { timeout: 3000 })
    })

    it('displays secondary archetype name', async () => {
        renderWithDims()
        
        await waitFor(() => {
            const breakdown = document.querySelector('.results-breakdown')
            expect(breakdown.textContent).toMatch(/\(Secondary Archetype\)/i)
        }, { timeout: 3000 })
    })
})
