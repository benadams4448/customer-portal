# Live designer demo QC — October 16, 2026

URL inspected: <https://out-chi-azure.vercel.app/>.

Result: the basic designer-review flows passed. This was a smoke and visual review of the public sample demo, not production acceptance testing.

## Checks completed

- Opened the live site in a fresh browser without login or saved cookies.
- Reviewed screenshots of Overview, Discussions, Documents and the mobile layout.
- Checked desktop at 1512 × 1050 and mobile at 390 × 844.
- Verified dashboard request filters and focused thread replies/back navigation.
- Moved a document between folders and posted document feedback.
- Switched to read-only mode and verified that adding a document was disabled.
- Created a project from a template and switched projects using mobile navigation.
- Confirmed no page-level horizontal overflow on mobile.
- Observed no JavaScript exceptions or calls to backend API routes during the browser exercise.

Local screenshots: `test-results/designer-overview.png`, `test-results/designer-discussion.png`, `test-results/designer-documents.png`, and `test-results/designer-mobile.png`. These remain ignored local artifacts, outside the source commit.

## Minor findings for dev

1. A newly created project shows **Not started** in its header while its first incomplete milestone is labeled **In progress**. Align the initial status language before customer use.
2. At 390px, the final project tab is partially clipped in the horizontally scrollable tab bar. The Menu still provides access to every section, but a clearer scroll affordance or revised tab arrangement would improve discoverability.

Neither finding blocked the sample workflows above. Both are suitable for the next UI/UX iteration with the designer.

## Scope and limitations

Data changes reset on reload and are not shared between visitors. Real invitations, secure uploads, durable data, and server-enforced permissions are not implemented in this static demo. File links in the seed data open service homepages. These are documented demo limitations, not verified production features. Automated authenticated HAR coverage remains part of the production-backend work.
