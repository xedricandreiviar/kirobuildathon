import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmergencyContactGroup } from "./EmergencyContactGroup";

const defaultContact = { name: "", relationship: "", phone: "" };

function setup(overrides = {}) {
  const props = {
    contacts: [{ ...defaultContact }],
    onUpdateContact: vi.fn(),
    onAddContact: vi.fn(),
    onRemoveContact: vi.fn(),
    maxContacts: 3,
    ...overrides,
  };
  const result = render(<EmergencyContactGroup {...props} />);
  return { ...result, props };
}

describe("EmergencyContactGroup", () => {
  it("renders name, relationship, and phone inputs for each contact", () => {
    setup({
      contacts: [
        { name: "Alice", relationship: "Mother", phone: "123" },
        { name: "Bob", relationship: "Father", phone: "456" },
      ],
    });

    expect(screen.getByLabelText("Contact 1 Name")).toHaveValue("Alice");
    expect(screen.getByLabelText("Contact 1 Relationship")).toHaveValue("Mother");
    expect(screen.getByLabelText("Contact 1 Phone")).toHaveValue("123");
    expect(screen.getByLabelText("Contact 2 Name")).toHaveValue("Bob");
    expect(screen.getByLabelText("Contact 2 Relationship")).toHaveValue("Father");
    expect(screen.getByLabelText("Contact 2 Phone")).toHaveValue("456");
  });

  it("associates labels with inputs via htmlFor/id", () => {
    setup();

    const nameInput = screen.getByLabelText("Contact 1 Name");
    expect(nameInput).toHaveAttribute("id", "contact-1-name");

    const relInput = screen.getByLabelText("Contact 1 Relationship");
    expect(relInput).toHaveAttribute("id", "contact-1-relationship");

    const phoneInput = screen.getByLabelText("Contact 1 Phone");
    expect(phoneInput).toHaveAttribute("id", "contact-1-phone");
  });

  it("enforces maxLength on inputs", () => {
    setup();

    expect(screen.getByLabelText("Contact 1 Name")).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText("Contact 1 Relationship")).toHaveAttribute("maxLength", "50");
    expect(screen.getByLabelText("Contact 1 Phone")).toHaveAttribute("maxLength", "20");
  });

  it("calls onUpdateContact when an input value changes", () => {
    const { props } = setup();

    fireEvent.change(screen.getByLabelText("Contact 1 Name"), {
      target: { value: "John" },
    });

    expect(props.onUpdateContact).toHaveBeenCalledWith(0, "name", "John");
  });

  it("shows 'Add another contact' button when contacts < maxContacts", () => {
    setup({ contacts: [defaultContact] });
    expect(screen.getByText("Add another contact")).toBeInTheDocument();
  });

  it("hides 'Add another contact' button when contacts === maxContacts", () => {
    setup({
      contacts: [defaultContact, defaultContact, defaultContact],
      maxContacts: 3,
    });
    expect(screen.queryByText("Add another contact")).not.toBeInTheDocument();
  });

  it("calls onAddContact when 'Add another contact' is clicked", () => {
    const { props } = setup();
    fireEvent.click(screen.getByText("Add another contact"));
    expect(props.onAddContact).toHaveBeenCalledTimes(1);
  });

  it("does not show remove button for the first contact", () => {
    setup({ contacts: [defaultContact] });
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("shows remove button for contacts beyond the first", () => {
    setup({ contacts: [defaultContact, defaultContact] });
    expect(screen.getByRole("button", { name: /remove contact 2/i })).toBeInTheDocument();
  });

  it("calls onRemoveContact with correct index when remove is clicked", () => {
    const { props } = setup({ contacts: [defaultContact, defaultContact] });
    fireEvent.click(screen.getByRole("button", { name: /remove contact 2/i }));
    expect(props.onRemoveContact).toHaveBeenCalledWith(1);
  });

  it("displays error message when error prop is provided", () => {
    setup({ error: "At least one contact with name and phone is required" });
    expect(
      screen.getByText("At least one contact with name and phone is required")
    ).toBeInTheDocument();
  });

  it("does not display error message when error prop is not provided", () => {
    setup();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
