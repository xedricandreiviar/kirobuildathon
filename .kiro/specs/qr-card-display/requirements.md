# Requirements Document

## Introduction

This feature covers two frontend pages for the "Ready Ka Ba?" emergency info card app: a **Result page** (shown after card creation) that displays a QR code and card preview with download/copy actions, and a **Public card view** (accessible by scanning the QR) that renders emergency info in a fast, read-only, mobile-optimized layout. Together these pages close the loop between filling in emergency data and making it accessible to first responders via a scannable QR code.

## Glossary

- **Result_Page**: The React page rendered at route `/result/:id`, shown immediately after a user creates their emergency card. Displays a QR code and a styled card preview.
- **Public_Card_View**: The React page rendered at route `/card/:id`, optimized for emergency reading after someone scans a QR code.
- **Card**: The emergency info data object containing personal medical information, emergency contacts, and metadata (id, timestamps).
- **QR_Code**: A machine-readable two-dimensional barcode generated from the public card URL, rendered as an image on the Result_Page.
- **API**: The backend Express server accessed via `VITE_API_URL` environment variable (default `http://localhost:3001`), exposing `GET /api/cards/:id`.
- **Public_Card_URL**: The URL `{current site origin}/card/{id}` encoded into the QR code, linking directly to the Public_Card_View for a specific Card.
- **Card_Element**: The DOM element containing the styled ID card preview on the Result_Page, targeted for image export.
- **Download_Button**: A UI control on the Result_Page that exports the Card_Element as a PNG image file.
- **Copy_Link_Button**: A UI control on the Result_Page that copies the Public_Card_URL to the user's clipboard.

## Requirements

### Requirement 1: Fetch Card Data on Result Page

**User Story:** As a user who just created my emergency card, I want the Result page to load my card data, so that I can see and share my emergency info immediately.

#### Acceptance Criteria

1. WHEN the Result_Page mounts with an `id` route parameter, THE Result_Page SHALL fetch the Card from `GET /api/cards/:id` using the base URL from the `VITE_API_URL` environment variable (defaulting to `http://localhost:3001`).
2. WHILE the Card data is loading, THE Result_Page SHALL display a loading indicator, and IF the API response is not received within 10 seconds, THEN THE Result_Page SHALL treat the request as failed and display the error state.
3. IF the API returns a 404 status for the given id, THEN THE Result_Page SHALL display a "card not found" message indicating the card does not exist or may have been removed.
4. IF the API request fails due to a network error or non-404 server error, THEN THE Result_Page SHALL display an error message indicating the data could not be loaded.
5. IF the `id` route parameter is missing or empty, THEN THE Result_Page SHALL display a "card not found" message without making an API request.

### Requirement 2: Generate and Display QR Code

**User Story:** As a user, I want to see a QR code that links to my public card page, so that I can share my emergency info by printing or saving the QR.

#### Acceptance Criteria

1. WHEN the Card data is successfully fetched, THE Result_Page SHALL generate a QR code encoding the Public_Card_URL (`{window.location.origin}/card/{id}`).
2. THE Result_Page SHALL generate the QR code using the `qrcode` npm package.
3. WHEN the QR code is generated, THE Result_Page SHALL display it as an image element rendered at a minimum size of 200x200 pixels, centered or placed in the upper portion of the page content area.
4. THE QR_Code SHALL encode a URL that, when scanned, navigates to the Public_Card_View for the corresponding Card.
5. IF QR code generation fails, THEN THE Result_Page SHALL display an error message indicating the QR code could not be generated, and SHALL display the Public_Card_URL as selectable text so the user can still share the link.
6. THE Result_Page SHALL render the QR code image with descriptive alternative text that identifies it as a QR code linking to the user's emergency card.

### Requirement 3: Display Styled Card Preview

**User Story:** As a user, I want to see a visual preview of my emergency ID card, so that I can verify my info looks correct before sharing.

#### Acceptance Criteria

1. WHEN the Card data is successfully fetched, THE Result_Page SHALL render a styled Card_Element displaying the following fields in order from top to bottom: full name, blood type, allergies, conditions, medications, emergency contacts (name, relationship, phone), and notes.
2. THE Card_Element SHALL be styled with a fixed width between 350px and 450px, a bordered container with rounded corners, a white or light background, and a minimum contrast ratio of 4.5:1 for all text against its background.
3. THE Card_Element SHALL display blood type and allergies in a visually distinct section at the top of the medical information area, using a red or amber background or text color accent and a font size at least 1.25 times the base body font size.
4. IF any optional field (allergies, conditions, medications, emergency contacts, or notes) has no data, THEN THE Card_Element SHALL omit that field's section entirely rather than displaying an empty or placeholder label.

### Requirement 4: Download Card as Image

**User Story:** As a user, I want to download my emergency card as a PNG image, so that I can print it or save it to my phone's photo gallery.

#### Acceptance Criteria

1. THE Result_Page SHALL display a Download_Button labeled "Download as image".
2. WHEN the user activates the Download_Button, THE Result_Page SHALL export the Card_Element as a PNG file using the `html-to-image` or `html2canvas` library.
3. WHILE the export is in progress, THE Result_Page SHALL disable the Download_Button to prevent duplicate export requests.
4. WHEN the export completes successfully, THE Result_Page SHALL trigger a browser download of the generated PNG file with the filename format `ready-ka-ba-card-{id}.png`, where `{id}` is the Card's unique identifier.
5. THE exported PNG SHALL visually match the on-screen Card_Element rendering (including styling, text, and layout) at a minimum resolution of 2x the Card_Element's displayed pixel dimensions.
6. IF the PNG export fails, THEN THE Result_Page SHALL re-enable the Download_Button and display a brief error message indicating the image could not be generated.

### Requirement 5: Copy Public Link to Clipboard

**User Story:** As a user, I want to copy the public link to my card, so that I can share it via messaging apps or email.

#### Acceptance Criteria

1. THE Result_Page SHALL display a Copy_Link_Button labeled "Copy link".
2. WHEN the user activates the Copy_Link_Button, THE Result_Page SHALL copy the Public_Card_URL to the system clipboard.
3. WHEN the copy operation succeeds, THE Result_Page SHALL display a visual confirmation (e.g., tooltip or button text change indicating "Copied!") that automatically dismisses after 3 seconds and restores the Copy_Link_Button to its original state.
4. IF the clipboard API is unavailable or the copy operation fails, THEN THE Result_Page SHALL display the Public_Card_URL as selectable text so the user can manually copy it.

### Requirement 6: Fetch Card Data on Public Card View

**User Story:** As a first responder scanning the QR code, I want the public card page to load the person's emergency info, so that I can quickly access critical medical data.

#### Acceptance Criteria

1. WHEN the Public_Card_View mounts with an `id` route parameter, THE Public_Card_View SHALL fetch the Card from `GET /api/cards/:id` using the base URL from the `VITE_API_URL` environment variable (defaulting to `http://localhost:3001`).
2. WHILE the Card data is loading, THE Public_Card_View SHALL display a loading indicator, and IF the API response is not received within 10 seconds, THEN THE Public_Card_View SHALL treat the request as failed and display the error state.
3. IF the API returns a 404 status for the given id, THEN THE Public_Card_View SHALL display a not-found message indicating that the emergency card was not found or may have been removed.
4. IF the API request fails due to a network error or non-404 server error, THEN THE Public_Card_View SHALL display an error message indicating that the card could not be loaded, and SHALL provide a visible retry control that allows the user to re-attempt the fetch without reloading the page.
5. WHEN the user activates the retry control after a failed fetch, THE Public_Card_View SHALL re-attempt the `GET /api/cards/:id` request and return to the loading state.

### Requirement 7: Emergency-Optimized Card Layout

**User Story:** As a first responder, I want the most critical medical info (blood type, allergies) to be immediately visible, so that I can act quickly in an emergency.

#### Acceptance Criteria

1. THE Public_Card_View SHALL display the blood type as the largest text element on the page with a minimum font size of 48px, using a red or amber accent color, and positioned as the first data element visible without scrolling on a 320px-wide viewport.
2. THE Public_Card_View SHALL display allergies as the second largest text element with a minimum font size of 24px, using a red or amber accent color, positioned immediately below the blood type and visible without scrolling on a 320px-wide viewport.
3. THE Public_Card_View SHALL display conditions and medications in a section below blood type and allergies, with a minimum font size of 16px and each field labeled with its category name.
4. THE Public_Card_View SHALL display the card holder's full name at the top of the page in a header area above the blood type section.
5. IF the Card contains a non-empty notes field, THEN THE Public_Card_View SHALL display the notes in a section below conditions and medications.
6. IF the Card has no blood type value, THEN THE Public_Card_View SHALL display "Not specified" in the blood type area using the same styling and position.
7. IF the Card has no allergies listed, THEN THE Public_Card_View SHALL display "None reported" in the allergies area using the same styling and position.

### Requirement 8: Tap-to-Call Emergency Contacts

**User Story:** As a first responder on a mobile device, I want to tap a phone number to initiate a call, so that I can reach the patient's emergency contacts without manually dialing.

#### Acceptance Criteria

1. THE Public_Card_View SHALL render each emergency contact's phone number as a `tel:` hyperlink whose `href` attribute contains the phone number value prefixed with `tel:`.
2. THE Public_Card_View SHALL render each emergency contact phone link with a minimum tap target size of 44x44 CSS pixels to ensure usability on mobile devices.
3. THE Public_Card_View SHALL display each emergency contact's name and relationship alongside the phone number, grouped so that each contact's information is visually associated.
4. IF a Card has zero emergency contacts, THEN THE Public_Card_View SHALL hide the emergency contacts section entirely rather than displaying an empty list.
5. IF an emergency contact has an empty or missing phone number, THEN THE Public_Card_View SHALL display that contact's name and relationship as plain text without a `tel:` hyperlink.

### Requirement 9: Mobile-Optimized Public View

**User Story:** As a first responder using a phone, I want the public card page to render correctly on mobile screens, so that I can read the info without pinching or scrolling horizontally.

#### Acceptance Criteria

1. THE Public_Card_View SHALL render responsively on viewport widths from 320px to 1024px without horizontal scrolling.
2. THE Public_Card_View SHALL use legible font sizes (minimum 16px body text) on mobile devices.
3. THE Public_Card_View SHALL load and render without requiring user authentication, account setup, or any interaction beyond navigating to the URL.
4. THE Public_Card_View SHALL not depend on JavaScript frameworks that block initial content paint for more than 2 seconds on a 3G network connection.

### Requirement 10: No-Login Access to Public Card

**User Story:** As anyone scanning the QR code, I want to see the emergency info without being asked to log in or install anything, so that there is zero friction in an emergency.

#### Acceptance Criteria

1. THE Public_Card_View SHALL be accessible without any form of user authentication, login prompt, account creation prompt, or registration gate.
2. THE Public_Card_View SHALL be accessible without installing any application, browser extension, or plugin.
3. THE Public_Card_View SHALL render all Card data directly in the browser using standard HTML and CSS, compatible with the two most recent major versions of Chrome, Safari, Firefox, and Samsung Internet on mobile devices.
4. THE Public_Card_View SHALL display Card data immediately upon page load without presenting any interstitial screen, modal, or dismissible overlay that blocks content visibility.
5. THE Public_Card_View SHALL be fully functional when accessed via the Public_Card_URL alone, without requiring cookies, session tokens, or prior navigation history.
