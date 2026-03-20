import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResultsPage from '../pages/Results';

const validDims = 'djE6c3RyYXRlZ3k6NDUsYWRhcHRhYmlsaXR5OjM1LGNvbGxhYm9yYXRpb246NTAsZXhwZXJpbWVudGF0aW9uOjI1LGltcGFjdDo0MA';

const renderResultsWithDims = (dims = validDims) => {
    return render(
        <MemoryRouter initialEntries={[`/results?dims=${dims}`]}>
            <Routes>
                <Route path="/results" element={<ResultsPage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Copy Link Behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'location', {
            value: {
                href: `http://localhost:3000/#/results?dims=${validDims}`
            },
            writable: true
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: { href: 'http://localhost:3000/' },
            writable: true
        });
    });

    it('shows "Copy Link" text on initial render', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const copyButton = screen.getByText('Copy Link');
            expect(copyButton).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('has Copy Link button with results-button class', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const copyButton = screen.getByText('Copy Link');
            expect(copyButton.classList.contains('results-button')).toBe(true);
        }, { timeout: 3000 });
    });

    it('clicking button calls navigator.clipboard.writeText', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const copyButton = screen.getByText('Copy Link');
            expect(copyButton).toBeTruthy();
        }, { timeout: 3000 });

        const copyButton = screen.getByText('Copy Link');
        
        await act(async () => {
            copyButton.click();
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('clicking button changes text to "Link Copied!"', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const copyButton = screen.getByText('Copy Link');
            expect(copyButton).toBeTruthy();
        }, { timeout: 3000 });

        const copyButton = screen.getByText('Copy Link');
        
        await act(async () => {
            copyButton.click();
        });

        await waitFor(() => {
            const copiedButton = screen.getByText('Link Copied!');
            expect(copiedButton).toBeTruthy();
        }, { timeout: 1000 });
    });

    it('button is a clickable button element', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const buttons = document.querySelectorAll('button');
            const copyButton = Array.from(buttons).find(b => b.textContent === 'Copy Link');
            expect(copyButton).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('copies a URL containing dims parameter', async () => {
        renderResultsWithDims();
        
        await waitFor(() => {
            const copyButton = screen.getByText('Copy Link');
            expect(copyButton).toBeTruthy();
        }, { timeout: 3000 });

        const copyButton = screen.getByText('Copy Link');
        
        await act(async () => {
            copyButton.click();
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            expect.stringContaining('dims=')
        );
    });
});
