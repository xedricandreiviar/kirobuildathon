# Implementation Plan: Emergency Card Intake Form

## Overview

This plan implements the emergency card intake form for the "Ready Ka Ba?" app — a React (Vite + TypeScript) SPA that collects emergency medical info and submits it to a backend API. The implementation follows a bottom-up approach: constants/types first, then utility modules (validation, API client, payload builder), then reusable UI components, then the page composition, and finally integration wiring with React Router.

## Tasks

- [x] 1. Set up project structure, constants, and type definitions
  - [x] 1.1 Initialize Vite + React + TypeScript project and install dependencies
    - Create `/frontend` directory with Vite React-TS template
    - Install dependencies: `react-router-dom`, `fast-check` (dev), `@testing-library/react` (dev), `@testing-library/jest-dom` (dev), `jsdom` (dev)
    - Configure Vitest in `vite.config.ts` with jsdom environment
    - Create directory structure: `src/components/`, `src/hooks/`, `src/lib/`, `src/pages/`, `src/utils/`
    - _Requirements: 3.1, 3.2_

  - [x] 1.2 Define shared types, interfaces, and constants
    - Create `src/types.ts` with `FormState`, `EmergencyContact`, `CardPayload`, `CardResponse`, and `ValidationErrors` interfaces
    - Create `src/constants.ts` with `BLOOD_TYPE_OPTIONS`, `MAX_CHIPS`, `MAX_CHIP_LENGTH`, `MAX_CONTACTS`, `MAX_FULL_NAME_LENGTH`, `MAX_CONTACT_NAME_LENGTH`, `MAX_RELATIONSHIP_LENGTH`, `MAX_PHONE_LENGTH`, `MAX_NOTES_LENGTH`, `API_TIMEOUT_MS`, `DEFAULT_API_URL`
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.10, 8.1–8.8_

- [x] 2. Implement validation engine and payload builder
  - [x] 2.1 Implement the validation engine
    - Create `src/lib/validation.ts` with `validate(formState: FormState): ValidationErrors` and `hasErrors(errors: ValidationErrors): boolean`
    - Validate: fullName non-empty/non-whitespace, bloodType selected, at least one emergency contact with non-empty name and phone
    - Return specific error messages matching requirement 2.1–2.3
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x]* 2.2 Write property tests for validation engine
    - **Property 4: Validation rejects all invalid form states**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Use fast-check to generate invalid form states (empty fullName, no bloodType, no valid contact) and verify validation returns errors

  - [x] 2.3 Implement the payload builder utility
    - Create `src/utils/buildPayload.ts` that converts `FormState` to `CardPayload`
    - Ensure only the 7 allowed fields are included (no id, createdAt, updatedAt)
    - Ensure empty arrays for allergies/conditions/medications when user provides none
    - Ensure notes defaults to empty string if not provided
    - _Requirements: 3.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [x]* 2.4 Write property tests for payload builder
    - **Property 6: Payload data model conformance**
    - **Validates: Requirements 3.3, 8.1–8.8**
    - Use fast-check to generate valid form states and verify payload structure, field names, types, and absence of server fields

- [x] 3. Implement the API client module
  - [x] 3.1 Create the API client with environment variable support
    - Create `src/lib/api-client.ts` with `createCard(payload: CardPayload): Promise<CardResponse>`
    - Read base URL from `import.meta.env.VITE_API_URL`, fall back to `http://localhost:3001`
    - Send POST to `{baseUrl}/api/cards` with `Content-Type: application/json`
    - Implement 10-second timeout using AbortController
    - Handle network errors, timeout, and non-2xx responses with distinct error types
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 6.1, 6.2, 6.3_

  - [x]* 3.2 Write unit tests for API client
    - Mock `fetch` to test: successful response, 4xx/5xx errors, network failure, timeout
    - Verify Content-Type header, URL construction, timeout behavior
    - _Requirements: 3.1, 3.2, 3.4, 6.1, 6.2, 6.3_

- [x] 4. Implement reusable UI components
  - [x] 4.1 Implement the TagInput component
    - Create `src/components/TagInput.tsx` with props: `label`, `chips`, `onAddChip`, `onRemoveChip`, `maxChips`, `maxChipLength`, `error`
    - Add chip on Enter key press; reject empty/whitespace-only input
    - Truncate/limit chip value to `maxChipLength` characters
    - Prevent adding beyond `maxChips` limit
    - Render removable chip elements with accessible remove button (44x44 tap target)
    - Associate label with input via htmlFor/id
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.11, 1.12, 7.4, 7.5_

  - [x]* 4.2 Write property tests for TagInput logic
    - **Property 1: TagInput chip length and count enforcement**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - **Property 2: Whitespace-only input rejection in TagInput**
    - **Validates: Requirements 1.6**
    - **Property 3: Chip removal correctness**
    - **Validates: Requirements 1.11, 1.12**

  - [x] 4.3 Implement the BloodTypeSelector component
    - Create `src/components/BloodTypeSelector.tsx` with props: `value`, `onChange`, `options`, `error`
    - Render a `<select>` with a disabled placeholder option ("Select blood type") and all 9 blood type options
    - No pre-selected value by default
    - Associate label with select via htmlFor/id
    - _Requirements: 1.2, 7.5_

  - [x] 4.4 Implement the EmergencyContactGroup component
    - Create `src/components/EmergencyContactGroup.tsx` with props: `contacts`, `onUpdateContact`, `onAddContact`, `onRemoveContact`, `maxContacts`, `error`
    - Render name (max 100), relationship (max 50), phone (max 20) inputs per contact
    - Show "Add another contact" button when contacts < maxContacts; hide/disable at max
    - Show remove button for contacts beyond the first
    - Associate labels with inputs via htmlFor/id
    - _Requirements: 1.7, 1.8, 1.9, 7.4, 7.5_

  - [x]* 4.5 Write unit tests for BloodTypeSelector and EmergencyContactGroup
    - Test BloodTypeSelector renders all 9 options with no default selection
    - Test EmergencyContactGroup add/remove logic and max contacts enforcement
    - _Requirements: 1.2, 1.7, 1.8, 1.9_

- [x] 5. Checkpoint - Verify components and utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement the useFormState hook
  - [x] 6.1 Create the useFormState custom hook
    - Create `src/hooks/useFormState.ts` returning `formState`, `setField`, `addChip`, `removeChip`, `addContact`, `updateContact`, `removeContact`, `reset`
    - Initialize with default state: empty fullName, empty bloodType, empty arrays, one empty contact, empty notes
    - Enforce chip length/count limits within `addChip`
    - Enforce max contacts within `addContact`
    - _Requirements: 1.1–1.12_

  - [ ]* 6.2 Write property tests for useFormState hook
    - **Property 1: TagInput chip length and count enforcement (hook level)**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - **Property 5: Reactive error clearing on field correction**
    - **Validates: Requirements 2.5**
    - Test addChip enforces limits, removeChip maintains correctness

- [x] 7. Implement the IntakeFormPage
  - [x] 7.1 Compose the IntakeFormPage with all components
    - Create `src/pages/IntakeFormPage.tsx` that renders: FullName input, BloodTypeSelector, TagInput × 3 (allergies, conditions, medications), EmergencyContactGroup, Notes textarea, SubmitButton, ErrorBanner
    - Wire all components to `useFormState` hook
    - Implement form submission: validate → show loading → call API → navigate or show error
    - Implement reactive error clearing: remove field errors when user corrects input
    - Implement loading state: disable button, show spinner during API call
    - Implement error display: show API errors above submit button, preserve form data on error
    - Dismiss previous error on new submission attempt
    - _Requirements: 2.1–2.5, 3.1–3.5, 4.1–4.3, 5.1–5.5, 6.1–6.6_

  - [ ]* 7.2 Write property tests for navigation and error handling
    - **Property 7: Successful response navigates to correct route**
    - **Validates: Requirements 4.1, 4.2**
    - **Property 8: Error preserves all form data**
    - **Validates: Requirements 6.5**
    - **Property 9: Non-success HTTP status displays error**
    - **Validates: Requirements 6.1, 6.4**

  - [ ]* 7.3 Write property test for accessibility label association
    - **Property 10: Accessibility label association**
    - **Validates: Requirements 7.5**
    - Render IntakeFormPage and verify every input has a label with matching htmlFor

- [x] 8. Set up routing and app entry point
  - [x] 8.1 Configure React Router and App component
    - Create `src/App.tsx` with `BrowserRouter` and routes: `/` → IntakeFormPage, `/result/:id` → placeholder ResultPage
    - Create `src/pages/ResultPage.tsx` as a placeholder that reads `:id` from URL params and displays it
    - Update `src/main.tsx` to render `<App />`
    - _Requirements: 4.1, 4.2_

- [x] 9. Implement responsive styling and accessibility
  - [x] 9.1 Apply responsive layout and accessibility styles
    - Add global styles or Tailwind config for: muted color palette, max 2 accent colors, no animations
    - Ensure form renders without horizontal scroll from 320px to 1440px
    - Set minimum 16px spacing between form sections
    - Set labels at minimum 14px font size
    - Set 44x44px minimum tap targets on mobile (≤768px)
    - Set 16px minimum font size for inputs on mobile to prevent auto-zoom
    - Ensure WCAG 2.1 Level AA contrast ratios (4.5:1 normal text, 3:1 UI components)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 10. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout as specified in the design
- fast-check is used for all property-based tests, Vitest as the test runner
- All components use controlled inputs with state managed by `useFormState`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.3", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.4", "3.2", "4.1", "4.3", "4.4"] },
    { "id": 4, "tasks": ["4.2", "4.5", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "9.1"] }
  ]
}
```
