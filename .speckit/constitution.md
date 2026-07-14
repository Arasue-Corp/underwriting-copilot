# Project Constitution: Underwriting Co-Pilot

## 1. Core Principles
- **Accuracy First:** As a tool for underwriting, precision and correctness of data processing are paramount.
- **Security & Privacy:** Ensure all PII (Personally Identifiable Information) and financial data are handled securely, following compliance standards (e.g., SOC2, GDPR, HIPAA if applicable).
- **Transparency:** The AI's decisions, suggestions, and risk assessments must be explainable to the end user (the underwriter).

## 2. Code Quality & Standards
- **Readability over Cleverness:** Code should be easily understandable by any engineer onboarding to the project.
- **Type Safety:** Use strict typing (e.g., TypeScript, Python Type Hints) across the stack to prevent runtime errors.
- **Modularity:** Separate business logic from UI components and API layers.
- **Linting & Formatting:** Enforce consistent style using automated tools (e.g., Prettier, ESLint, Ruff) in CI/CD.

## 3. Testing Strategy
- **Unit Testing:** All core underwriting logic and calculations must have 100% test coverage.
- **Integration Testing:** Critical user flows (e.g., document ingestion, risk analysis) must be covered by integration tests.
- **Security Audits:** Regular automated security scanning for dependencies and code vulnerabilities.

## 4. User Experience (UX)
- **Responsive & Accessible:** The UI must be accessible (WCAG compliant) and responsive across desktop and tablet devices used by underwriters.
- **Fast Feedback Loops:** Any AI operations that take time should provide clear progress indicators to the user.
- **Error Handling:** Graceful degradation and clear, actionable error messages for the user.

## 5. Performance
- **Fast Load Times:** Optimize for Largest Contentful Paint (LCP) and smooth interactions (INP).
- **Efficient Data Handling:** Pagination and lazy loading for large datasets (e.g., policy histories, claims data).

---
*Note: This is a living document. As the project evolves, this constitution should be updated to reflect new learnings and requirements.*
