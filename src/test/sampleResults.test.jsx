import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import SampleResultsPage from '../pages/SampleResults';

const LocationDisplay = ({ onLocation }) => {
    const location = useLocation();
    if (onLocation) onLocation(location);
    return null;
};

describe('SampleResultsPage', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <SampleResultsPage />
            </MemoryRouter>
        );
    });

    it('navigates to results page with sample dims', async () => {
        let capturedLocation = null;
        
        render(
            <MemoryRouter initialEntries={['/sample-results']}>
                <Routes>
                    <Route path="/sample-results" element={<SampleResultsPage />} />
                    <Route path="/results" element={<LocationDisplay onLocation={(loc) => { capturedLocation = loc; }} />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(capturedLocation).not.toBeNull();
            expect(capturedLocation.pathname).toBe('/results');
            expect(capturedLocation.search).toContain('dims=');
        }, { timeout: 3000 });
    });
});
