import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainApp from './components/MainApp'
import QuizPage from './pages/Quiz'
import ResultsPage from './pages/Results'
import ArchetypeDetail from './pages/Archetype'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/archetype/:name" element={<ArchetypeDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App