import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ResultPage from './pages/ResultPage';
import PublicCardView from './pages/PublicCardView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/card/:id" element={<PublicCardView />} />
      </Routes>
    </BrowserRouter>
  );
}
