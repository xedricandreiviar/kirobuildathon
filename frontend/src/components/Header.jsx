import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-surface w-full top-0 sticky border-b border-outline-variant z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center justify-between px-[--spacing-margin-mobile] h-14 w-full max-w-screen-xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          <span className="text-[20px] leading-[28px] font-semibold text-primary tracking-tight">Ready Ka Ba?</span>
        </Link>
      </div>
    </header>
  )
}
