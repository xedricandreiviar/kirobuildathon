# Implementation Plan: QR Card Display

## Overview

Implement two React pages for the "Ready Ka Ba?" emergency info card app: a Result Page (`/result/:id`) that displays a QR code, styled card preview, download-as-image, and copy-link actions; and a Public Card View (`/card/:id`) that renders emergency info in a mobile-optimized, zero-friction layout for first responders.

## Tasks

- [x] 1. Set up shared utilities and data layer
  - [x] 1.1 Create the apiClient utility module
    - Create `src/utils/apiClient.ts` with `Card` and `EmergencyContact` interfaces
    - Implement `fetchCard(id)` function with 10-second AbortController timeout
    - Implement `CardNotFoundError` and `CardFetchError` custom error classes
    - Handle missing/empty ID validation before making the API call
    - Use `VITE_API_URL` environment variable with `http://localhost:3001` default
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4_

  - [x] 1.2 Create the QR code generator utility
    - Create `src/utils/qrGenerator.ts`
    - Implement `generateQRDataURL(url)` using `qrcode` package's `toDataURL` method
    - Configure with 400px width (2x display), margin 2, error correction level M
    - _Requirements: 2.1, 2.2_

  - [x] 1.3 Create the image export utility
    - Create `src/utils/imageExport.ts`
    - Implement `exportCardAsImage(element, cardId)` using `html-to-image` `toPng`
    - Configure with `pixelRatio: 2` for high-resolution export
    - Trigger browser download with filename `ready-ka-ba-card-{id}.png`
    - _Requirements: 4.2, 4.4, 4.5_

  - [x] 1.4 Create the clipboard utility
    - Create `src/utils/clipboardUtil.ts`
    - Implement `copyToClipboard(text)` with feature detection for `navigator.clipboard.writeText`
    - Return boolean indicating success/failure
    - _Requirements: 5.2, 5.4_

- [x] 2. Implement the Result Page
  - [x] 2.1 Create the ResultPage component with data fetching
    - Create `src/pages/ResultPage.tsx`
    - Read `id` from `useParams`, validate it is non-empty
    - Call `fetchCard(id)` on mount with proper state management (loading, error, card)
    - Display loading spinner while fetching
    - Display "card not found" for missing ID or 404 errors
    - Display generic error message for network/server errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Create the QRCodeDisplay sub-component
    - Create `src/components/QRCodeDisplay.tsx`
    - Generate QR data URL on card load using `generateQRDataURL`
    - Render QR as `<img>` at minimum 200x200px, centered in page content
    - Add descriptive alt text: "QR code linking to your emergency card"
    - On QR generation failure, show error message and display Public_Card_URL as selectable text
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.3 Create the CardPreview sub-component
    - Create `src/components/CardPreview.tsx`
    - Accept `card` prop and `ref` for DOM targeting by image export
    - Style with fixed width (350-450px), white background, rounded corners, border
    - Display fields top-to-bottom: full name, blood type, allergies, conditions, medications, emergency contacts, notes
    - Style blood type and allergies with red/amber accent, font 1.25x base size
    - Omit sections entirely if the corresponding field is empty (empty string or empty array)
    - Ensure 4.5:1 minimum contrast ratio for all text
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.4 Implement the Download button functionality
    - Add "Download as image" button to ResultPage
    - On click, disable button and call `exportCardAsImage` targeting the CardPreview DOM element
    - On success, re-enable button
    - On failure, re-enable button and show brief error message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 2.5 Implement the Copy Link button functionality
    - Add "Copy link" button to ResultPage
    - On click, call `copyToClipboard` with the Public_Card_URL (`{origin}/card/{id}`)
    - On success, show "Copied!" feedback for 3 seconds, then reset to original state
    - On failure, display the Public_Card_URL as selectable text for manual copy
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.6 Write property test for QR code URL correctness
    - **Property 1: QR code encodes the correct public card URL**
    - Use `fast-check` to generate random card IDs and origins
    - Verify the QR data URL decodes to exactly `{origin}/card/{id}`
    - Minimum 100 iterations
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 2.7 Write property test for card preview field rendering
    - **Property 2: Card preview renders exactly the non-empty fields**
    - Use `fast-check` to generate Card objects with various empty/non-empty field combinations
    - Render CardPreview and verify DOM contains sections only for non-empty fields
    - Verify no section rendered for empty strings or empty arrays
    - Minimum 100 iterations
    - **Validates: Requirements 3.1, 3.4**

  - [ ]* 2.8 Write property test for download filename format
    - **Property 3: Download filename matches the expected format**
    - Use `fast-check` to generate random non-empty ID strings
    - Verify filename equals `ready-ka-ba-card-{id}.png`
    - Minimum 100 iterations
    - **Validates: Requirements 4.4**

- [x] 3. Checkpoint - Verify Result Page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the Public Card View
  - [x] 4.1 Create the PublicCardView component with data fetching and retry
    - Create `src/pages/PublicCardView.tsx`
    - Read `id` from `useParams`, validate it is non-empty
    - Call `fetchCard(id)` on mount with proper state management
    - Display loading spinner while fetching
    - Display "Emergency card not found" for missing ID or 404 errors (no retry)
    - Display error message with "Try Again" button for network/server errors
    - On retry click, reset to loading state and re-fetch
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Implement the emergency-optimized card layout
    - Display full name in header area at top of page
    - Display blood type as largest text (minimum 48px), red/amber accent, first visible element without scrolling on 320px viewport
    - Display allergies as second largest text (minimum 24px), red/amber accent, immediately below blood type
    - Display "Not specified" if blood type is empty, "None reported" if allergies is empty
    - Display conditions and medications below critical section, minimum 16px, with category labels
    - Display notes section below conditions/medications if non-empty
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 4.3 Implement the EmergencyContactsList with tap-to-call
    - Create `src/components/EmergencyContactsList.tsx`
    - Render each contact with name, relationship, and phone grouped together
    - Render phone numbers as `tel:` hyperlinks with minimum 44x44px tap targets
    - If a contact has empty/missing phone, render name and relationship as plain text (no link)
    - If zero emergency contacts, hide the entire section
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.4 Implement mobile-responsive styling and accessibility
    - Ensure responsive layout from 320px to 1024px without horizontal scrolling
    - Use minimum 16px body text for mobile legibility
    - Ensure no authentication, login prompts, or installation gates
    - Ensure no interstitial modals or overlays that block content
    - Ensure page works without cookies, session tokens, or prior navigation
    - Render with standard HTML/CSS compatible with recent Chrome, Safari, Firefox, Samsung Internet
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 4.5 Write property test for emergency contact rendering
    - **Property 4: Emergency contact rendering respects phone presence**
    - Use `fast-check` to generate EmergencyContact objects with/without phone values
    - Render EmergencyContactsList and verify `tel:` links appear only when phone is non-empty
    - Verify name and relationship always displayed regardless of phone presence
    - Minimum 100 iterations
    - **Validates: Requirements 8.1, 8.3, 8.5**

  - [ ]* 4.6 Write unit tests for Public Card View
    - Test loading state renders spinner
    - Test 404 response renders not-found message without retry button
    - Test network error renders error message with retry button
    - Test retry button re-triggers fetch
    - Test blood type "Not specified" fallback when empty
    - Test allergies "None reported" fallback when empty
    - Test no horizontal overflow at 320px viewport width
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.6, 7.7, 9.1_

- [x] 5. Checkpoint - Verify Public Card View
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wire routing and integration
  - [x] 6.1 Register routes in React Router
    - Add `/result/:id` route pointing to ResultPage component
    - Add `/card/:id` route pointing to PublicCardView component
    - Ensure both routes are accessible without authentication
    - _Requirements: 1.1, 6.1, 10.1_

  - [x] 6.2 Install required npm dependencies
    - Install `qrcode` and `@types/qrcode` packages
    - Install `html-to-image` package
    - Verify packages are added to `package.json`
    - _Requirements: 2.2, 4.2_

  - [ ]* 6.3 Write integration tests for full page flows
    - Test ResultPage: mount → fetch mock → QR visible → download triggers → copy works
    - Test PublicCardView: mount → fetch mock → all sections visible → phone links clickable
    - Test PublicCardView retry: error state → click retry → success render
    - _Requirements: 1.1, 2.1, 4.2, 5.2, 6.1, 6.4, 6.5_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript with React, `qrcode` for QR generation, `html-to-image` for PNG export, and `fast-check` for property-based testing
- Both pages share the `apiClient` utility for data fetching with consistent error handling
- CSS Modules or scoped CSS should be used to prevent style leakage between pages

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "6.2"] },
    { "id": 1, "tasks": ["2.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "4.2", "4.3", "4.4"] },
    { "id": 3, "tasks": ["2.6", "2.7", "2.8", "4.5", "4.6"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.3"] }
  ]
}
```
