import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  chips: string[];
  onAddChip: (value: string) => void;
  onRemoveChip: (index: number) => void;
  maxChips: number;
  maxChipLength: number;
  error?: string;
  variant?: "danger" | "default";
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
  variant = "default",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputId = toKebabCase(label);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    }
  }

  function addChip() {
    const trimmed = inputValue.trim();
    if (trimmed === "") return;
    if (chips.length >= maxChips) return;
    const truncated = trimmed.slice(0, maxChipLength);
    onAddChip(truncated);
    setInputValue("");
  }

  const isDanger = variant === "danger";
  const inputContainerClasses = isDanger
    ? "flex items-center bg-surface-bright border border-outline-variant border-l-4 border-l-secondary rounded focus-within:border-primary focus-within:ring-1 focus-within:ring-primary p-2"
    : "flex items-center bg-surface-bright border border-outline-variant rounded focus-within:border-primary focus-within:ring-1 focus-within:ring-primary p-2";

  const chipClasses = isDanger
    ? "inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-label-sm"
    : "inline-flex items-center gap-1 px-3 py-1 bg-surface-container-high text-on-surface rounded-full text-label-sm";

  return (
    <div>
      <label className="block text-label-md text-primary mb-2" htmlFor={inputId}>
        {label}
      </label>
      <div className={inputContainerClasses}>
        <input
          id={inputId}
          type="text"
          className="flex-grow h-8 px-2 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md text-primary placeholder:text-outline"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            chips.length >= maxChips
              ? `Maximum ${maxChips} items reached`
              : `Type ${label.toLowerCase().replace(/s$/, '')} and press Enter...`
          }
          disabled={chips.length >= maxChips}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
        />
        <button
          type="button"
          className="material-symbols-outlined text-on-surface-variant hover:text-primary p-1"
          onClick={addChip}
          aria-label={`Add ${label.toLowerCase().replace(/s$/, '')}`}
        >
          add_circle
        </button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {chips.map((chip, index) => (
            <span key={`${chip}-${index}`} className={chipClasses}>
              {chip}
              <button
                type="button"
                className="material-symbols-outlined text-[16px] leading-none hover:text-secondary focus:outline-none"
                onClick={() => onRemoveChip(index)}
                aria-label={`Remove ${chip}`}
              >
                close
              </button>
            </span>
          ))}
        </div>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-error text-label-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
