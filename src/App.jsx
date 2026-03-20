import { HashRouter, Routes, Route } from 'react-router-dom';
import { getRoutes } from './routes';
import MainApp from './components/MainApp';
import QuizPage from './pages/Quiz';
import ResultsPage from './pages/Results';
import SampleResultsPage from './pages/SampleResults';

const routeComponents = {
    home: MainApp,
    quiz: QuizPage,
    results: ResultsPage,
    'sample-results': SampleResultsPage,
};

function App() {
    const routes = getRoutes();
    
    return (
        <HashRouter>
            <Routes>
                {routes.map(route => {
                    const Component = routeComponents[route.name];
                    if (!Component) return null;
                    return <Route key={route.path} path={route.path} element={<Component />} />;
                })}
                <Route path="*" element={<MainApp />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
