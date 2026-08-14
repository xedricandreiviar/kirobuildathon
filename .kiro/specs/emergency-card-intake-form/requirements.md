# Requirements Document

## Introduction

This document specifies the requirements for the emergency card intake form — the primary data entry interface of the "Ready Ka Ba?" app. The form allows users to input their emergency medical information (blood type, allergies, conditions, medications, emergency contacts) and submit it to the backend API. Upon successful submission, the user is redirected to a result page where they receive a QR code linking to a live public emergency card.

This feature is developed as a React (Vite) application within a `/frontend` folder and serves as the home page at route "/". It is built by Person 2 in a 4-person parallel development team and must conform to a shared data model contract.

## Glossary

- **Intake_Form**: The React single-page form component rendered at route "/" that collects emergency medical information from the user
- **Tag_Input**: A text input field where users type a value and press Enter to add it as a removable chip/tag to a list
- **Emergency_Contact**: An object containing name (string), relationship (string), and phone (string) representing a person to contact in an emergency
- **Card_Payload**: The JSON object sent to the API containing fullName, bloodType, allergies, conditions, medications, emergencyContacts, and notes — excluding id and timestamps
- **API_Client**: The module responsible for sending HTTP requests to the backend API at the configured base URL
- **Validation_Engine**: The client-side logic that checks form inputs against required field rules before allowing submission
- **Blood_Type_Selector**: A dropdown input offering the values A+, A-, B+, B-, AB+, AB-, O+, O-, and Unknown

## Requirements

### Requirement 1: Form Field Collection

**User Story:** As a user, I want to fill out a single form with all my emergency medical information, so that I can generate a complete emergency info card in one step.

#### Acceptance Criteria

1. THE Intake_Form SHALL render a text input field labeled "Full Name" that accepts a string value mapped to the fullName field, with a maximum length of 100 characters
2. THE Intake_Form SHALL render a Blood_Type_Selector dropdown containing the options: A+, A-, B+, B-, AB+, AB-, O+, O-, and Unknown, with no option pre-selected by default
3. THE Intake_Form SHALL render a Tag_Input for allergies that allows the user to type a value and press Enter to add it as a removable chip, with each chip value limited to 50 characters and a maximum of 20 chips
4. THE Intake_Form SHALL render a Tag_Input for conditions that allows the user to type a value and press Enter to add it as a removable chip, with each chip value limited to 50 characters and a maximum of 20 chips
5. THE Intake_Form SHALL render a Tag_Input for medications that allows the user to type a value and press Enter to add it as a removable chip, with each chip value limited to 50 characters and a maximum of 20 chips
6. IF the user presses Enter on a Tag_Input while the text field is empty or contains only whitespace, THEN THE Intake_Form SHALL not add a chip
7. THE Intake_Form SHALL render at least one Emergency_Contact group containing a name text input (maximum 100 characters), a relationship text input (maximum 50 characters), and a phone text input (maximum 20 characters)
8. THE Intake_Form SHALL render an "Add another contact" button that adds an additional Emergency_Contact group up to a maximum of 3
9. WHEN the user has 3 Emergency_Contact groups displayed, THE Intake_Form SHALL hide or disable the "Add another contact" button
10. THE Intake_Form SHALL render an optional free-text textarea field labeled "Notes" mapped to the notes field, with a maximum length of 500 characters
11. THE Intake_Form SHALL allow removal of individual chips from the allergies, conditions, and medications Tag_Input fields by activating a remove control on the chip
12. WHEN the user removes a chip from a Tag_Input field and no chips remain, THE Intake_Form SHALL display the empty Tag_Input text field ready to accept new input

### Requirement 2: Client-Side Validation

**User Story:** As a user, I want to see clear error messages when I miss required fields, so that I can correct my input before submission.

#### Acceptance Criteria

1. WHEN the user attempts to submit the Intake_Form with an empty or whitespace-only fullName field, THE Validation_Engine SHALL display an inline error message directly below the Full Name input stating "Full name is required"
2. WHEN the user attempts to submit the Intake_Form without selecting a blood type (no option chosen in the dropdown), THE Validation_Engine SHALL display an inline error message directly below the Blood_Type_Selector stating "Blood type is required"
3. WHEN the user attempts to submit the Intake_Form without at least one Emergency_Contact containing both a non-empty name and a non-empty phone number, THE Validation_Engine SHALL display an inline error message adjacent to the emergency contacts section stating "At least one contact with name and phone is required"
4. WHEN validation errors exist, THE Validation_Engine SHALL prevent the form submission from proceeding and SHALL NOT send any request to the API
5. WHEN the user corrects a previously invalid field by entering a valid value, THE Validation_Engine SHALL remove the corresponding inline error message without requiring a new submission attempt

### Requirement 3: Form Submission to API

**User Story:** As a user, I want my emergency info to be saved securely through the API, so that my card data persists and can be accessed later.

#### Acceptance Criteria

1. WHEN the user submits a valid Intake_Form, THE API_Client SHALL send a POST request to the URL constructed from the VITE_API_URL environment variable concatenated with "/api/cards"
2. IF the VITE_API_URL environment variable is not defined or is an empty string, THEN THE API_Client SHALL use "http://localhost:3001" as the base URL
3. THE API_Client SHALL construct the Card_Payload with fields fullName, bloodType, allergies, conditions, medications, emergencyContacts, and notes — excluding id, createdAt, and updatedAt
4. THE API_Client SHALL send the Card_Payload as a JSON request body with Content-Type header set to "application/json"
5. THE API_Client SHALL never contain a hardcoded API base URL in the source code

### Requirement 4: Post-Submission Navigation

**User Story:** As a user, I want to be taken to my result page after saving my card, so that I can view my QR code and card preview immediately.

#### Acceptance Criteria

1. WHEN the API responds with an HTTP 2xx status and a response body containing a non-empty id field, THE Intake_Form SHALL navigate the user to the route "/result/{id}" within 1 second of receiving the response, where {id} is the id value from the API response
2. WHEN navigation to "/result/{id}" occurs, THE Intake_Form SHALL use client-side routing provided by React Router without triggering a full page reload
3. IF the API responds with an HTTP 2xx status but the response body does not contain a valid non-empty id field, THEN THE Intake_Form SHALL display an error message indicating that card creation succeeded but navigation failed, and SHALL remain on the form page with the user's entered data preserved

### Requirement 5: Loading State Feedback

**User Story:** As a user, I want visual feedback while my form is being submitted, so that I know the system is processing my request and I do not accidentally submit twice.

#### Acceptance Criteria

1. WHILE the API_Client is awaiting a response from the POST request, THE Intake_Form SHALL disable the submit button
2. WHILE the API_Client is awaiting a response from the POST request, THE Intake_Form SHALL display a loading indicator within or immediately adjacent to the submit button
3. WHILE the API_Client is awaiting a response from the POST request, THE Intake_Form SHALL prevent additional form submissions
4. WHEN the API_Client receives a successful response from the POST request, THE Intake_Form SHALL remove the loading indicator and re-enable the submit button within 1 second of receiving the response
5. IF the API_Client receives an error response or no response is received within 30 seconds, THEN THE Intake_Form SHALL remove the loading indicator, re-enable the submit button, and display an error message indicating that the submission failed

### Requirement 6: Error State Handling

**User Story:** As a user, I want to see a clear error message when something goes wrong with submission, so that I know my data was not saved and I can try again.

#### Acceptance Criteria

1. IF the API_Client receives a non-success HTTP response (status code 400 or above) from the POST request, THEN THE Intake_Form SHALL display an inline error message above the submit button indicating the submission failed
2. IF the API_Client does not receive a response within 10 seconds of the POST request, THEN THE Intake_Form SHALL display an inline error message indicating the server is unreachable
3. IF a network error occurs and no response is received from the POST request, THEN THE Intake_Form SHALL display an inline error message indicating the server is unreachable
4. IF an error occurs during submission, THEN THE Intake_Form SHALL hide the loading spinner, re-enable the submit button, and allow the user to retry submission
5. IF an error occurs during submission, THEN THE Intake_Form SHALL preserve all user-entered data in the form fields including tag-style inputs (allergies, conditions, medications) and emergency contact entries
6. WHILE an error message is displayed, IF the user initiates a new submission, THEN THE Intake_Form SHALL dismiss the previous error message before showing the loading state

### Requirement 7: Responsive and Accessible Design

**User Story:** As a user filling out this form on my phone, I want the layout to be clean, readable, and easy to tap, so that I can complete it without frustration on a small screen.

#### Acceptance Criteria

1. THE Intake_Form SHALL render all form fields, labels, and buttons fully visible within the viewport width on screens from 320px to 1440px wide without requiring horizontal scrolling or content overflow
2. THE Intake_Form SHALL use a minimum spacing of 16px between form sections and display a visible text label of at least 14px font size positioned directly above or beside every input field
3. THE Intake_Form SHALL use a muted color palette with no animated elements, no background patterns, and a maximum of two accent colors to maintain a subdued visual tone
4. THE Intake_Form SHALL ensure all interactive elements (buttons, inputs, chips) have a minimum tap target size of 44x44 CSS pixels on viewports 768px wide or narrower
5. THE Intake_Form SHALL associate each input field with a corresponding label element using the htmlFor attribute for screen reader accessibility
6. THE Intake_Form SHALL ensure all text and interactive elements meet WCAG 2.1 Level AA color contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text and UI components)
7. THE Intake_Form SHALL use a minimum font size of 16px for all input fields on mobile viewports (768px wide or narrower) to prevent automatic zoom on focus in mobile browsers

### Requirement 8: Data Model Conformance

**User Story:** As a team member, I want the form output to strictly match the shared data model, so that the backend and other frontend components work seamlessly with the submitted data.

#### Acceptance Criteria

1. THE Card_Payload SHALL structure the allergies field as an array of strings, represented as an empty array [] when the user provides no entries
2. THE Card_Payload SHALL structure the conditions field as an array of strings, represented as an empty array [] when the user provides no entries
3. THE Card_Payload SHALL structure the medications field as an array of strings, represented as an empty array [] when the user provides no entries
4. THE Card_Payload SHALL structure the emergencyContacts field as an array of 1 to 3 objects, each containing exactly three properties: name (string), relationship (string), and phone (string)
5. THE Card_Payload SHALL include the fullName field as a non-empty string
6. THE Card_Payload SHALL include the bloodType field as a string matching one of the following values: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
7. THE Card_Payload SHALL include the notes field as a string (empty string if not provided by the user)
8. THE Card_Payload SHALL use exact camelCase field names matching the shared data model (fullName, bloodType, allergies, conditions, medications, emergencyContacts, notes) and SHALL NOT include server-generated fields (id, createdAt, updatedAt)
