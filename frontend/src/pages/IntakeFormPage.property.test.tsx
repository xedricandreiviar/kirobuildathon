import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as fc from "fast-check";
import { IntakeFormPage } from "./IntakeFormPage";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API client
vi.mock("../lib/api-client", () => ({
  createCard: vi.fn(),
}));

import { createCard } from "../lib/api-client";
const mockedCreateCard = vi.mocked(createCard);

/**
 * Helper to fill the form with valid data so submission passes validation.
 */
function fillValidForm(
  overrides: {
    fullName?: string;
    bloodType?: string;
    contactName?: string;
    contactPhone?: string;
  } = {}
) {
  const fullName = overrides.fullName ?? "John Doe";
  const bloodType = overrides.bloodType ?? "A+";
  const contactName = overrides.contactName ?? "Jane Doe";
  const contactPhone = overrides.contactPhone ?? "1234567890";

  // Fill full name
  const fullNameInput = screen.getByLabelText("Full Name");
  fireEvent.change(fullNameInput, { target: { value: fullName } });

  // Select blood type
  const bloodTypeSelect = screen.getByLabelText("Blood Type");
  fireEvent.change(bloodTypeSelect, { target: { value: bloodType } });

  // Fill contact name and phone
  const contactNameInput = screen.getByLabelText("Contact 1 Name");
  fireEvent.change(contactNameInput, { target: { value: contactName } });

  const contactPhoneInput = screen.getByLabelText("Contact 1 Phone");
  fireEvent.change(contactPhoneInput, { target: { value: contactPhone } });
}

/**
 * Helper to submit the form
 */
function submitForm() {
  const submitButton = screen.getByRole("button", { name: /submit/i });
  fireEvent.click(submitButton);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <IntakeFormPage />
    </MemoryRouter>
  );
}

describe("IntakeFormPage Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 7: Successful response navigates to correct route
   * Validates: Requirements 4.1, 4.2
   *
   * For any API response with HTTP 2xx status containing a non-empty id string,
   * the application SHALL navigate to the route "/result/{id}" where {id} matches
   * the id value from the response.
   */
  describe("Property 7: Successful response navigates to correct route", () => {
    it("should navigate to /result/{id} for any non-empty id string", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.stringMatching(/^[a-zA-Z0-9-]{1,36}$/),
          async (id) => {
            vi.clearAllMocks();
            cleanup();

            mockedCreateCard.mockResolvedValue({
              id,
              fullName: "John Doe",
              bloodType: "A+",
              allergies: [],
              conditions: [],
              medications: [],
              emergencyContacts: [
                {
                  name: "Jane Doe",
                  relationship: "Spouse",
                  phone: "1234567890",
                },
              ],
              notes: "",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
            });

            renderPage();
            fillValidForm();
            submitForm();

            await waitFor(() => {
              expect(mockNavigate).toHaveBeenCalledWith(`/result/${id}`);
            });

            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 8: Error preserves all form data
   * Validates: Requirements 6.5
   *
   * For any form state containing user-entered data and any API error,
   * after the error occurs all form fields SHALL retain their pre-submission values.
   */
  describe("Property 8: Error preserves all form data", () => {
    it("should preserve all form field values after API error", async () => {
      const formDataArb = fc.record({
        fullName: fc
          .stringMatching(/^[A-Za-z ]{1,20}$/)
          .filter((s) => s.trim().length > 0),
        bloodType: fc.constantFrom(
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
          "Unknown"
        ),
        contactName: fc
          .stringMatching(/^[A-Za-z ]{1,20}$/)
          .filter((s) => s.trim().length > 0),
        contactPhone: fc.stringMatching(/^[0-9]{1,15}$/),
      });

      await fc.assert(
        fc.asyncProperty(formDataArb, async (data) => {
          vi.clearAllMocks();
          cleanup();

          mockedCreateCard.mockRejectedValue(
            new Error(
              "Something went wrong on our end. Please try again."
            )
          );

          renderPage();

          // Fill form with generated data
          const fullNameInput = screen.getByLabelText(
            "Full Name"
          ) as HTMLInputElement;
          fireEvent.change(fullNameInput, {
            target: { value: data.fullName },
          });

          const bloodTypeSelect = screen.getByLabelText(
            "Blood Type"
          ) as HTMLSelectElement;
          fireEvent.change(bloodTypeSelect, {
            target: { value: data.bloodType },
          });

          const contactNameInput = screen.getByLabelText(
            "Contact 1 Name"
          ) as HTMLInputElement;
          fireEvent.change(contactNameInput, {
            target: { value: data.contactName },
          });

          const contactPhoneInput = screen.getByLabelText(
            "Contact 1 Phone"
          ) as HTMLInputElement;
          fireEvent.change(contactPhoneInput, {
            target: { value: data.contactPhone },
          });

          // Submit and wait for error
          submitForm();

          await waitFor(() => {
            expect(screen.getByRole("alert")).toBeInTheDocument();
          });

          // Verify all form fields retain their values
          expect(fullNameInput.value).toBe(data.fullName);
          expect(bloodTypeSelect.value).toBe(data.bloodType);
          expect(contactNameInput.value).toBe(data.contactName);
          expect(contactPhoneInput.value).toBe(data.contactPhone);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 9: Non-success HTTP status displays error
   * Validates: Requirements 6.1, 6.4
   *
   * For any HTTP response with status code 400 or above, the form SHALL display
   * an inline error message and SHALL re-enable the submit button for retry.
   */
  describe("Property 9: Non-success HTTP status displays error", () => {
    it("should display error and re-enable submit button for any HTTP error status", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          async (statusCode) => {
            vi.clearAllMocks();
            cleanup();

            // Simulate the error message the API client would throw for this status
            const errorMessage =
              statusCode >= 500
                ? "Something went wrong on our end. Please try again."
                : "Submission failed. Please check your data and try again.";

            mockedCreateCard.mockRejectedValue(new Error(errorMessage));

            renderPage();
            fillValidForm();
            submitForm();

            // Wait for error to appear
            await waitFor(() => {
              expect(screen.getByRole("alert")).toBeInTheDocument();
            });

            // Verify error message is displayed
            const alert = screen.getByRole("alert");
            expect(alert.textContent).toBeTruthy();

            // Verify submit button is re-enabled
            const submitButton = screen.getByRole("button", {
              name: /submit/i,
            });
            expect(submitButton).not.toBeDisabled();

            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
