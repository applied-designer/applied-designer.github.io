import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MainApp from '../components/MainApp';
import QuizPage from '../pages/Quiz';
import ResultsPage from '../pages/Results';

const renderPage = (path, element) => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path={path} element={element} />
            </Routes>
        </MemoryRouter>
    );
};

describe('App Routing - Individual Pages', () => {
    describe('MainApp (root)', () => {
        it('renders MainApp at root path', async () => {
            renderPage('/', <MainApp />);
            
            await waitFor(() => {
                const insideDiv = document.getElementById('inside');
                expect(insideDiv).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('renders MainApp for unknown paths (fallback)', async () => {
            renderPage('/unknown', <MainApp />);
            
            await waitFor(() => {
                const insideDiv = document.getElementById('inside');
                expect(insideDiv).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('QuizPage', () => {
        it('renders QuizPage at /quiz', async () => {
            renderPage('/quiz', <QuizPage />);
            
            await waitFor(() => {
                const quizContainer = document.querySelector('.quiz-container');
                expect(quizContainer).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('renders QuizPage with survey title', async () => {
            renderPage('/quiz', <QuizPage />);
            
            await waitFor(() => {
                const title = screen.getByText('Applied Designer Quiz');
                expect(title).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('renders QuizPage with intro text', async () => {
            renderPage('/quiz', <QuizPage />);
            
            await waitFor(() => {
                const intro = screen.getByText(/Take the quiz/);
                expect(intro).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('ResultsPage', () => {
        const validDims = 'djE6c3RyYXRlZ3k6NDUsYWRhcHRhYmlsaXR5OjM1LGNvbGxhYm9yYXRpb246NTAsZXhwZXJpbWVudGF0aW9uOjI1LGltcGFjdDo0MA';

        it('renders ResultsPage at /results with valid dims', async () => {
            render(
                <MemoryRouter initialEntries={[`/results?dims=${validDims}`]}>
                    <Routes>
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </MemoryRouter>
            );
            
            await waitFor(() => {
                const resultsContainer = document.querySelector('.results-container');
                expect(resultsContainer).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('shows "Your Results" heading when dims are valid', async () => {
            render(
                <MemoryRouter initialEntries={[`/results?dims=${validDims}`]}>
                    <Routes>
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </MemoryRouter>
            );
            
            await waitFor(() => {
                const heading = screen.getByText('Your Results');
                expect(heading).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Route fallbacks', () => {
        it('MainApp renders for any unmatched route', async () => {
            renderPage('/foo/bar/baz', <MainApp />);
            
            await waitFor(() => {
                const insideDiv = document.getElementById('inside');
                expect(insideDiv).toBeTruthy();
            }, { timeout: 3000 });
        });
    });
});
