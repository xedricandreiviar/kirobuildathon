import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BloodTypeSelector } from "./BloodTypeSelector";
import { BLOOD_TYPE_OPTIONS } from "../constants";

const defaultOptions = [...BLOOD_TYPE_OPTIONS];

describe("BloodTypeSelector", () => {
  it("renders a label associated with the select via htmlFor/id", () => {
    render(
      <BloodTypeSelector value="" onChange={() => {}} options={defaultOptions} />
    );
    const label = screen.getByText("Blood Type");
    expect(label).toHaveAttribute("for", "blood-type");
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "blood-type");
  });

  it("renders all 9 blood type options plus the placeholder", () => {
    render(
      <BloodTypeSelector value="" onChange={() => {}} options={defaultOptions} />
    );
    // 9 blood type options + 1 disabled placeholder = 10 total
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(10);
  });

  it("renders a disabled placeholder option with text 'Select blood type'", () => {
    render(
      <BloodTypeSelector value="" onChange={() => {}} options={defaultOptions} />
    );
    const placeholder = screen.getByText("Select blood type");
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("value", "");
  });

  it("has no pre-selected value by default when value is empty string", () => {
    render(
      <BloodTypeSelector value="" onChange={() => {}} options={defaultOptions} />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("calls onChange with the selected value when user picks an option", async () => {
    const handleChange = vi.fn();
    render(
      <BloodTypeSelector
        value=""
        onChange={handleChange}
        options={defaultOptions}
      />
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "O+");
    expect(handleChange).toHaveBeenCalledWith("O+");
  });

  it("displays the currently selected value", () => {
    render(
      <BloodTypeSelector
        value="AB-"
        onChange={() => {}}
        options={defaultOptions}
      />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("AB-");
  });

  it("shows an error message when the error prop is provided", () => {
    render(
      <BloodTypeSelector
        value=""
        onChange={() => {}}
        options={defaultOptions}
        error="Blood type is required"
      />
    );
    expect(screen.getByText("Blood type is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show an error message when the error prop is not provided", () => {
    render(
      <BloodTypeSelector value="" onChange={() => {}} options={defaultOptions} />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sets aria-invalid when error is provided", () => {
    render(
      <BloodTypeSelector
        value=""
        onChange={() => {}}
        options={defaultOptions}
        error="Blood type is required"
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });
});
