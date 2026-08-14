import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagInput } from "./TagInput";

describe("TagInput", () => {
  const defaultProps = {
    label: "Allergies",
    chips: [],
    onAddChip: vi.fn(),
    onRemoveChip: vi.fn(),
    maxChips: 20,
    maxChipLength: 50,
  };

  it("renders label associated with input via htmlFor/id", () => {
    render(<TagInput {...defaultProps} />);
    const input = screen.getByLabelText("Allergies");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("adds chip on Enter key press with trimmed value", () => {
    const onAddChip = vi.fn();
    render(<TagInput {...defaultProps} onAddChip={onAddChip} />);
    const input = screen.getByLabelText("Allergies");
    fireEvent.change(input, { target: { value: "  Peanuts  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddChip).toHaveBeenCalledWith("Peanuts");
  });

  it("clears input after adding chip", () => {
    render(<TagInput {...defaultProps} />);
    const input = screen.getByLabelText("Allergies") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Peanuts" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("rejects empty input on Enter", () => {
    const onAddChip = vi.fn();
    render(<TagInput {...defaultProps} onAddChip={onAddChip} />);
    const input = screen.getByLabelText("Allergies");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddChip).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only input on Enter", () => {
    const onAddChip = vi.fn();
    render(<TagInput {...defaultProps} onAddChip={onAddChip} />);
    const input = screen.getByLabelText("Allergies");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddChip).not.toHaveBeenCalled();
  });

  it("truncates chip value to maxChipLength", () => {
    const onAddChip = vi.fn();
    const longValue = "a".repeat(60);
    render(<TagInput {...defaultProps} onAddChip={onAddChip} maxChipLength={50} />);
    const input = screen.getByLabelText("Allergies");
    fireEvent.change(input, { target: { value: longValue } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddChip).toHaveBeenCalledWith("a".repeat(50));
  });

  it("prevents adding beyond maxChips limit", () => {
    const onAddChip = vi.fn();
    const chips = Array.from({ length: 20 }, (_, i) => `chip-${i}`);
    render(<TagInput {...defaultProps} chips={chips} onAddChip={onAddChip} />);
    const input = screen.getByLabelText("Allergies");
    expect(input).toBeDisabled();
  });

  it("renders existing chips with remove buttons", () => {
    render(<TagInput {...defaultProps} chips={["Peanuts", "Shellfish"]} />);
    expect(screen.getByText("Peanuts")).toBeInTheDocument();
    expect(screen.getByText("Shellfish")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Peanuts")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Shellfish")).toBeInTheDocument();
  });

  it("calls onRemoveChip with correct index when remove button clicked", () => {
    const onRemoveChip = vi.fn();
    render(
      <TagInput
        {...defaultProps}
        chips={["Peanuts", "Shellfish"]}
        onRemoveChip={onRemoveChip}
      />
    );
    fireEvent.click(screen.getByLabelText("Remove Shellfish"));
    expect(onRemoveChip).toHaveBeenCalledWith(1);
  });

  it("shows error message when error prop is provided", () => {
    render(<TagInput {...defaultProps} error="This field has an error" />);
    expect(screen.getByText("This field has an error")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show error message when error prop is not provided", () => {
    render(<TagInput {...defaultProps} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("generates kebab-case id from label", () => {
    render(<TagInput {...defaultProps} label="Medical Conditions" />);
    const input = screen.getByLabelText("Medical Conditions");
    expect(input.id).toBe("medical-conditions");
  });

  it("does not add chip on non-Enter key press", () => {
    const onAddChip = vi.fn();
    render(<TagInput {...defaultProps} onAddChip={onAddChip} />);
    const input = screen.getByLabelText("Allergies");
    fireEvent.change(input, { target: { value: "Peanuts" } });
    fireEvent.keyDown(input, { key: "Tab" });
    expect(onAddChip).not.toHaveBeenCalled();
  });
});
