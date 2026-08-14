import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import IntakeForm from './pages/IntakeForm'
import ResultPage from './pages/ResultPage'
import CardPage from './pages/CardPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />} path="/">
          <Route index element={<IntakeForm />} />
          <Route path="result/:id" element={<ResultPage />} />
        </Route>
        <Route path="card/:id" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
