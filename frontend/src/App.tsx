import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntakeFormPage } from './pages/IntakeFormPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntakeFormPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
