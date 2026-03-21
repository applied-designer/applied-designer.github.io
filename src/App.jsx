import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { getRoutes } from './routes';
import MainApp from './components/MainApp';
import QuizPage from './pages/Quiz';
import ResultsPage from './pages/Results';

const SampleResultsPage = import.meta.env.DEV
    ? lazy(() => import('./pages/SampleResults'))
    : null;

const routeComponents = {
    home: MainApp,
    quiz: QuizPage,
    results: ResultsPage,
    ...(SampleResultsPage ? { 'sample-results': SampleResultsPage } : {}),
};

function App() {
    const routes = getRoutes(import.meta.env.DEV);
    validateRoutes(routes);
    
    return (
        <HashRouter>
            <Suspense fallback={null}>
                <Routes>
                    {routes.map(route => {
                        const Component = routeComponents[route.name];
                        if (!Component) return null;
                        return <Route key={route.path} path={route.path} element={<Component />} />;
                    })}
                    <Route path="*" element={<MainApp />} />
                </Routes>
            </Suspense>
        </HashRouter>
    );
}

export default App;

function validateRoutes(routes) {
    if (!import.meta.env.DEV) return;
    
    const routeNames = new Set(routes.map(r => r.name));
    
    for (const name of Object.keys(routeComponents)) {
        if (!routeNames.has(name)) {
            throw new Error(
                `routeComponents has "${name}" but no matching route in routes.js`
            );
        }
    }
    
    for (const route of routes) {
        if (route.name && !routeComponents[route.name]) {
            throw new Error(
                `Route "${route.name}" has no matching component in routeComponents`
            );
        }
    }
}
