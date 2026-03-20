import { HashRouter, Routes, Route } from 'react-router-dom';
import MainApp from './components/MainApp';
import QuizPage from './pages/Quiz';
import ResultsPage from './pages/Results';
import SampleResultsPage from './pages/SampleResults';

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/results" element={<ResultsPage />} />
                {import.meta.env.DEV && (
                    <Route path="/sample-results" element={<SampleResultsPage />} />
                )}
                {/*TODO: not implemented yet*/}
                {/* <Route path="/archetype/:name" element={<ArchetypeDetail />} /> */}
                
                {/* 404 fallback to the homepage */}
                <Route path="*" element={<MainApp />} />
            </Routes>
        </HashRouter>
    );
}

export default App;