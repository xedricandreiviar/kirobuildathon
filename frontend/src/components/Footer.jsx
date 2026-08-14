export default function Footer() {
  return (
    <footer className="bg-surface-bright w-full py-8 mt-auto border-t border-outline-variant">
      <div className="flex flex-col items-center gap-[--spacing-unit] px-[--spacing-margin-mobile] text-center max-w-screen-xl mx-auto">
        <span className="text-[14px] leading-[20px] font-semibold text-secondary mb-2">Ready Ka Ba?</span>
        <div className="flex gap-4 mb-2">
          <a className="text-[12px] leading-[16px] font-medium text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
          <a className="text-[12px] leading-[16px] font-medium text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
        </div>
        <p className="text-[12px] leading-[16px] font-medium text-on-surface-variant opacity-80">© 2024 Ready Ka Ba?</p>
      </div>
    </footer>
  )
}
