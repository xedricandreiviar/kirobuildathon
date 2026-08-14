import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { IntakeFormPage } from "./pages/IntakeFormPage";
import ResultPage from "./pages/ResultPage";
import CardPage from "./pages/CardPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="bg-[#f7f9fb] w-full top-0 sticky border-b border-[#c6c6cd] z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center justify-between px-4 h-14 w-full max-w-screen-xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b6171e]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            <span className="text-[20px] leading-[28px] font-semibold text-[#000000] tracking-tight">Ready Ka Ba?</span>
          </a>
        </div>
      </header>
      {children}
      {/* Footer */}
      <footer className="bg-[#f7f9fb] w-full py-8 mt-auto border-t border-[#c6c6cd]">
        <div className="flex flex-col items-center gap-1 px-4 text-center max-w-screen-xl mx-auto">
          <span className="text-[14px] leading-[20px] font-semibold text-[#b6171e] mb-2">Ready Ka Ba?</span>
          <div className="flex gap-4 mb-2">
            <a className="text-[12px] leading-[16px] font-medium text-[#45464d] hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="text-[12px] leading-[16px] font-medium text-[#45464d] hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
          </div>
          <p className="text-[12px] leading-[16px] font-medium text-[#45464d] opacity-80">© 2024 Ready Ka Ba?</p>
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
