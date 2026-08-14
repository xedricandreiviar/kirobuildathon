import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { IntakeFormPage } from "./IntakeFormPage";

// Mock the API client to prevent actual network calls
vi.mock("../lib/api-client", () => ({
  createCard: vi.fn(),
}));

/**
 * Property 10: Accessibility label association
 * Validates: Requirements 7.5
 *
 * For any input field rendered in the IntakeForm, there SHALL exist a
 * corresponding label element whose htmlFor attribute matches the input's id attribute.
 *
 * Tag: Feature: emergency-card-intake-form, Property 10: Accessibility label association
 */
describe("Feature: emergency-card-intake-form, Property 10: Accessibility label association", () => {
  it("every input, select, and textarea element has an associated label with matching htmlFor", () => {
    const { container } = render(
      <MemoryRouter>
        <IntakeFormPage />
      </MemoryRouter>
    );

    // Query all form control elements
    const formControls = container.querySelectorAll(
      "input, select, textarea"
    );

    // Ensure we actually found form controls to test
    expect(formControls.length).toBeGreaterThan(0);

    for (const element of formControls) {
      const id = element.getAttribute("id");

      // Every form control must have an id attribute
      expect(
        id,
        `Expected element <${element.tagName.toLowerCase()}> to have an id attribute`
      ).toBeTruthy();

      // Find a label whose htmlFor matches this element's id
      const associatedLabel = container.querySelector(
        `label[for="${id}"]`
      );

      expect(
        associatedLabel,
        `Expected a <label for="${id}"> to exist for <${element.tagName.toLowerCase()} id="${id}">`
      ).toBeTruthy();
    }
  });

  it("all labels reference existing form controls", () => {
    const { container } = render(
      <MemoryRouter>
        <IntakeFormPage />
      </MemoryRouter>
    );

    // Verify that every label with htmlFor points to an existing element
    const labels = container.querySelectorAll("label[for]");

    expect(labels.length).toBeGreaterThan(0);

    for (const label of labels) {
      const forAttr = label.getAttribute("for");
      const referencedElement = container.querySelector(`#${forAttr}`);

      expect(
        referencedElement,
        `Label with for="${forAttr}" does not reference an existing element`
      ).toBeTruthy();
    }
  });
});
