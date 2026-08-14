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
  it("every input, select, and textarea with an id has an associated label with matching htmlFor", () => {
    const { container } = render(
      <MemoryRouter>
        <IntakeFormPage />
      </MemoryRouter>
    );

    // Query all form control elements (input, select, textarea)
    const formControls = container.querySelectorAll(
      "input, select, textarea"
    );

    // Ensure we actually found form controls to test
    expect(formControls.length).toBeGreaterThan(0);

    // Track elements with ids for reporting
    const elementsWithIds: Array<{ tag: string; id: string }> = [];

    for (const element of formControls) {
      const id = element.getAttribute("id");

      // Only check elements that have an id attribute
      if (!id) continue;

      elementsWithIds.push({
        tag: element.tagName.toLowerCase(),
        id,
      });

      // Find a label whose htmlFor (rendered as "for" in DOM) matches this element's id
      const associatedLabel = container.querySelector(
        `label[for="${id}"]`
      );

      expect(
        associatedLabel,
        `Expected a <label for="${id}"> to exist for <${element.tagName.toLowerCase()} id="${id}">`
      ).toBeTruthy();
    }

    // Verify we checked a meaningful number of labeled elements
    // Initial form state: full-name (input), blood-type (select),
    // allergies/conditions/medications (3 tag inputs),
    // contact-1-name, contact-1-relationship, contact-1-phone (3 contact inputs),
    // notes (textarea) = at least 9 elements with ids
    expect(elementsWithIds.length).toBeGreaterThanOrEqual(9);
  });

  it("all labels with htmlFor reference existing form controls", () => {
    const { container } = render(
      <MemoryRouter>
        <IntakeFormPage />
      </MemoryRouter>
    );

    // Verify every label with a for attribute points to an existing element
    const labels = container.querySelectorAll("label[for]");

    expect(labels.length).toBeGreaterThan(0);

    for (const label of labels) {
      const forAttr = label.getAttribute("for");
      const referencedElement = container.querySelector(`#${CSS.escape(forAttr!)}`);

      expect(
        referencedElement,
        `Label with for="${forAttr}" (text: "${label.textContent}") does not reference an existing element`
      ).toBeTruthy();
    }
  });
});
