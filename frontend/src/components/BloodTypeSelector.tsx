interface BloodTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}

export function BloodTypeSelector({ value, onChange, options, error }: BloodTypeSelectorProps) {
  return (
    <div className="blood-type-selector">
      <label htmlFor="blood-type">Blood Type</label>
      <select
        id="blood-type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "blood-type-error" : undefined}
      >
        <option value="" disabled>
          Select blood type
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <span id="blood-type-error" className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
