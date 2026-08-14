interface BloodTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}

export function BloodTypeSelector({ value, onChange, options, error }: BloodTypeSelectorProps) {
  return (
    <div>
      <label className="block text-label-md text-primary mb-2">Blood Type</label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Blood Type">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              className="peer sr-only"
              name="bloodType"
              type="radio"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              aria-invalid={!!error}
            />
            <div className="px-4 py-2 border border-outline-variant rounded-full text-center text-label-md text-on-surface-variant peer-checked:bg-secondary peer-checked:text-on-secondary peer-checked:border-secondary hover:bg-surface-container-low transition-colors">
              {option}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p id="blood-type-error" className="text-error text-label-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
