import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { IntakeFormPage } from "./pages/IntakeFormPage";
import ResultPage from "./pages/ResultPage";
import CardPage from "./pages/CardPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface w-full top-0 sticky border-b border-outline-variant z-40 transition-colors duration-200">
        <div className="flex items-center justify-between px-[16px] h-14 w-full max-w-screen-xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="text-headline-sm font-bold text-primary">Ready Ka Ba?</span>
          </a>
        </div>
      </header>
      {children}
      {/* Footer */}
      <footer className="bg-surface-bright w-full py-8 mt-auto border-t border-outline-variant">
        <div className="flex flex-col items-center gap-[4px] px-[16px] text-center max-w-screen-xl mx-auto">
          <span className="text-label-md font-semibold text-secondary mb-2">Ready Ka Ba?</span>
          <div className="flex gap-4 mb-2">
            <a className="text-label-sm text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="text-label-sm text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
          </div>
          <p className="text-label-sm text-on-surface-variant opacity-80">© 2024 Ready Ka Ba?</p>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><IntakeFormPage /></Layout>} />
        <Route path="/result/:id" element={<Layout><ResultPage /></Layout>} />
        <Route path="/card/:id" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
