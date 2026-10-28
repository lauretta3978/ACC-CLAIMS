# ClaimGenius - Intelligent Expense Claim Automation
## Product Specification & Architecture Guide

---

## 1. Critical Bug Fix & API Configuration
To resolve the `404 Not Found` error caused by deprecated model endpoints, all backend service integrations and API calls must be updated to use the current model version:
* **Deprecated Model:** `models/gemini-2.5-flash`
* **Updated Model:** `models/gemini-3.8-flash`

Ensure environment variables and configuration files point strictly to `models/gemini-3.8-flash` for all receipt OCR extraction and parsing tasks.

---

## 2. Minimalist & Cinematic UI/UX Guidelines
The interface must be stripped of all visual clutter, prioritizing whitespace, legibility, and high-end aesthetics.
* **Color Palette:** Pure white background (`#FFFFFF`), subtle slate/charcoal text (`#1E293B`), and refined accent highlights (deep charcoal or muted metallic gold/silver for a cinematic feel).
* **Layout:** Centered, breathing layouts with generous padding. No congested dashboards or overlapping widgets.
* **Scroll Animations:** Smooth, fade-in and slide-up scroll animations (using CSS transitions / Intersection Observer) as the user navigates down the page.

---

## 3. Core Features (The 3-Step Workflow)
The application is streamlined into three primary actions:
1. **Upload Receipts:** A clean drag-and-drop zone or file picker supporting consolidated PDFs and image formats (PNG, JPG, WebP).
2. **Download Excel File:** Instant generation and one-click download of the segregated claim statement matching standard corporate claim forms.
3. **Discrepancies Report:** A clear, uncluttered view highlighting unmatched amounts, tax mismatches, or policy exceptions.

---

## 4. Authentication & User Management
The system supports dual role-based access control (User and Admin) with clean, distraction-free authentication screens.

### A. User Capabilities
* **Sign Up:** Simple registration form (Name, Email, Password).
* **Sign In:** Secure login portal with persistent session token.
* **Password Reset:** Self-service reset via email verification link.

### B. Admin Capabilities
* **User Management Dashboard:** Clean tabular view of active users.
* **Add User:** Ability to register new staff members and assign roles.
* **Delete User:** Remove unauthorized or inactive accounts.
* **Reset Password:** Ability to manually trigger or set a password reset for any user.

---

## 5. Technical Implementation Checklist
* [ ] Update API client instantiation to `gemini-3.8-flash`.
* [ ] Implement JWT or session-based authentication routes (`/login`, `/signup`, `/reset-password`).
* [ ] Build Admin CRUD interface for user management.
* [ ] Design minimalist dashboard with white background and scroll-triggered fade animations.
* [ ] Wire up receipt parser output to Excel exporter and Discrepancy report generator.