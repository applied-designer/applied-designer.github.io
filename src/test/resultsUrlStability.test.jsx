import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultsPage from '../pages/Results';

const validDims = 'djE6c3RyYXRlZ3k6NDUsYWRhcHRhYmlsaXR5OjM1LGNvbGxhYm9yYXRpb246NTAsZXhwZXJpbWVudGF0aW9uOjI1LGltcGFjdDo0MA';
const noVersionPrefix = btoa('strategy:45,adaptability:35,collaboration:50,experimentation:25,impact:40');
const v2Prefix = btoa('v2:strategy:45,adaptability:35,collaboration:50,experimentation:25,impact:40');
const missingKeys = btoa('v1:strategy:45');
const nanValues = btoa('v1:strategy:45,adaptability:NaN,collaboration:50,experimentation:25,impact:40');

const renderWithUrl = (url) => {
    return render(
        <MemoryRouter initialEntries={[url]}>
            <ResultsPage />
        </MemoryRouter>
    );
};

describe('Results URL Stability', () => {
    describe('Missing or invalid dims query param', () => {
        it('redirects to quiz when dims query param is completely missing', async () => {
            const { container } = renderWithUrl('/results');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when visiting root results path', async () => {
            const { container } = renderWithUrl('/results');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims is empty string', async () => {
            const { container } = renderWithUrl('/results?dims=');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims key is missing from query', async () => {
            const { container } = renderWithUrl('/results?other=value');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });
    });

    describe('Invalid base64 encoding', () => {
        it('redirects to quiz when dims is not valid base64', async () => {
            const { container } = renderWithUrl('/results?dims=notbase64!!!');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims contains invalid base64 characters', async () => {
            const { container } = renderWithUrl('/results?dims=abc%123');
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });
    });

    describe('Invalid or unsupported version prefix', () => {
        it('redirects to quiz when dims has no version prefix', async () => {
            const { container } = renderWithUrl(`/results?dims=${noVersionPrefix}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims has v2 prefix (unsupported version)', async () => {
            const { container } = renderWithUrl(`/results?dims=${v2Prefix}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims has unknown version prefix', async () => {
            const unknownVersion = btoa('v99:strategy:45,adaptability:35,collaboration:50,experimentation:25,impact:40');
            const { container } = renderWithUrl(`/results?dims=${unknownVersion}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });
    });

    describe('Invalid dimension data', () => {
        it('redirects to quiz when dims has missing dimension keys', async () => {
            const { container } = renderWithUrl(`/results?dims=${missingKeys}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims has NaN values', async () => {
            const { container } = renderWithUrl(`/results?dims=${nanValues}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });

        it('redirects to quiz when dims has non-numeric values', async () => {
            const nonNumeric = btoa('v1:strategy:five,adaptability:3,collaboration:4,experimentation:2,impact:3');
            const { container } = renderWithUrl(`/results?dims=${nonNumeric}`);
            
            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            }, { timeout: 3000 });
        });
    });

    describe('Valid dims', () => {
        it('renders results when dims query param is valid v1 format', async () => {
            const { container } = renderWithUrl(`/results?dims=${validDims}`);
            
            await waitFor(() => {
                const resultsContainer = container.querySelector('.results-container');
                expect(resultsContainer).toBeTruthy();
            }, { timeout: 3000 });
        });
    });
});
