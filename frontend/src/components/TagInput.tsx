import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  chips: string[];
  onAddChip: (value: string) => void;
  onRemoveChip: (index: number) => void;
  maxChips: number;
  maxChipLength: number;
  error?: string;
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TagInput({
  label,
  chips,
  onAddChip,
  onRemoveChip,
  maxChips,
  maxChipLength,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputId = toKebabCase(label);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed === "") return;
      if (chips.length >= maxChips) return;
      const truncated = trimmed.slice(0, maxChipLength);
      onAddChip(truncated);
      setInputValue("");
    }
  }

  return (
    <div className="tag-input-container">
      <label htmlFor={inputId} className="tag-input-label">
        {label}
      </label>
      <div className="tag-input-chips">
        {chips.map((chip, index) => (
          <span key={`${chip}-${index}`} className="tag-chip">
            <span className="tag-chip-text">{chip}</span>
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => onRemoveChip(index)}
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={inputId}
        type="text"
        className="tag-input-field"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          chips.length >= maxChips
            ? `Maximum ${maxChips} items reached`
            : `Type and press Enter to add`
        }
        disabled={chips.length >= maxChips}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="tag-input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
