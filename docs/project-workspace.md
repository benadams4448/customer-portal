# Client project workspace

The first implementation lives at `/projects`, linked from the existing sidebar. Run `yarn dev:workspace` and open `http://127.0.0.1:3000/projects` to preview it without credentials or environment configuration. Stop any other server on port 3000 first. This development-only mode binds to localhost, skips provider/email setup and serves only the sample workspace plus Next.js assets. Backend API routes are unavailable. In the normal connected portal, sign in through the starter's existing authentication first. The project workspace uses a separate App Router layout group so it does not inherit the cloud-subscription navigation. It still inherits the existing root providers and provider branding; production authentication remains required.

This is an interactive product preview, not a production project-management backend. Its sample organization, directory, projects, and messages are fictional. Project edits live in component state and reset on refresh. Organization profile edits reset when leaving that view. No personal information is written to browser storage. No emails are sent and no files are uploaded. Document sample cards open service homepages, not real documents.

## Available now

- Dark responsive workspace using the provider's primary accent (purple by default).
- Project selection and project creation from three milestone templates.
- Manual progress and target-delivery editing, milestone completion, issue and unread-discussion counts.
- Labeled, searchable threads with replies, unread state, and resolution.
- Searchable document-link cards, folder filtering, moving links between folders, and document comments.
- Shared organization contact, address, notes, and invoice-status preview.
- Project directory and six role previews; restricted controls stay visible with an explanatory tooltip.

The role switch is a UI demonstration. It does not grant real permissions or isolate organizations. Keep the workspace in a preview environment until the backend below exists. Invitation and upload controls deliberately explain their missing integration.

## Production model

Use one identity per person, with separate organization and project memberships. A person can belong to several organizations without maintaining several passwords. Avoid a single global `role` column.

| Role | Scope | Capabilities |
| --- | --- | --- |
| Read only | Assigned organization/projects | View authorized projects and documents |
| Organization admin | Customer organization | Manage profile, invitations, members and projects |
| Project admin | Explicit projects | Manage project settings, milestones, project membership and content |
| Customer success manager | All organizations | Internal administration; audited and protected with MFA |
| Assigned organization manager | Assigned organizations | Internal administration only for assigned organizations |
| Project collaborator | Explicit projects across organizations | Participate in shared project threads/documents without wider organization access |

Decide whether read-only members can comment before connecting the backend; this preview treats them as fully read-only. Organization profile editing is reserved for organization administrators and internal organization managers in the preview.

Suggested tables: `organizations`, `profiles`, `organization_memberships`, `internal_organization_assignments`, `projects`, `project_memberships`, `project_templates`, `milestones`, `folders`, `documents`, `document_comments`, `threads`, `thread_labels`, `thread_replies`, `thread_reads`, `invitations`, `invoice_records`, `audit_events`, and `notification_outbox`.

Every project-owned record needs an organization ID plus a project ID. Use composite foreign keys to prevent references across organizations. Document comments refer to a document ID, not an external URL. Folder moves must validate destination ownership and reject cycles. Index membership lookup columns, `(organization_id, project_id)`, and thread timestamps. Paginate threads, replies and documents. Store per-user read positions, rather than a shared unread flag.

Invitation flow: an authorized organization admin submits names/emails and scopes; the server stores a pending invitation, sends a single-use expiring activation link, verifies email ownership at acceptance, and creates memberships transactionally. Send activation links, never shared passwords. Project admins may invite only within their project scope; they cannot grant organization or internal privileges. Record membership changes and revocations in the audit log.

Authorize every request against verified identity and current memberships. Enforce both organization and project scope on reads, writes, search, file downloads, notification delivery and background jobs. Global internal access must be explicit, never inferred from a company email domain. Add cross-organization negative tests before enabling real accounts. Invitations, notes, addresses and directory details must never enter logs or URL parameters.

Files belong in private object storage with short-lived authorized download links. Use signed uploads, file-size/type limits, quarantine, malware scanning and a cleanup job for abandoned uploads. Store only metadata and storage keys in Postgres. External document permissions remain with Google Drive or the document host; adding a link does not grant access to the underlying document.

## Recommended hosting

For this repository, start with a paid **Render web service** running its existing Node/Express server, plus **managed Supabase Postgres, Auth, and private Storage**, colocated as closely as the services allow. This is a recommendation for the next backend implementation, not an installed integration. Render supports [Next.js web services](https://render.com/docs/deploy-nextjs-app); Supabase supplies [invitation-based identities](https://supabase.com/docs/guides/auth/users), [Postgres row-level policies](https://supabase.com/docs/guides/database/postgres/row-level-security), and [storage authorization](https://supabase.com/docs/guides/storage/security/access-control).

The existing cloud-provider API is not the desired project backend. Implement a versioned project API contract and regenerate its types in a separate PR before wiring this UI to `$api`. Replacing or separating the starter's provider authentication/bootstrap is a deliberate migration: do not run two unrelated identity systems indefinitely. If the original infrastructure features are not needed, remove them in a separate cleanup phase after the project backend works.

Deploy the current Express entry point as a persistent web service, rather than assuming a serverless deployment can run its embedded mail cron. Before production, make it respect the host's `PORT`, bind on `0.0.0.0`, add a health endpoint, handle graceful shutdown, and move all scheduled mail jobs out of `server.js`. Those hosting changes are not included in the preview. Build with scripts disabled during install (`YARN_ENABLE_SCRIPTS=false yarn install`, then `yarn build`) and start with `NODE_ENV=production node server.js`. Verify the existing Dockerfile and native build dependencies in the host's Linux build environment before launch.

Run email delivery, scanning, and notification fan-out in a separate [background worker](https://render.com/docs/background-workers) consuming a durable queue/outbox. Use a transactional email provider with SPF, DKIM and DMARC on your domain. Never send client invitations with personal mailbox credentials. Keep service/admin keys on the server; Supabase's administrative key bypasses row-level security.

Launch in a staging environment first, using a custom portal domain and dedicated production database. Configure automated backups and recovery testing, connection pooling, rate limits, application error monitoring and audit retention. Start with one app instance and a worker. Scale app replicas when sustained latency and CPU justify it; keep session data, files, jobs and project state outside app memory. Add queue workers independently as document/email work grows. Use database indexes and pagination before adding caches. A future migration to AWS ECS/RDS/S3 is possible if compliance, networking or scale requirements justify the additional operations work.

For usability, send each invite directly to its assigned organization/project, show a clear organization switcher only when needed, remember project navigation without storing sensitive data, and provide a useful empty state for new accounts. Keep external documents as links, show their type and permissions context, and make unread counts specific to each user.

## Remaining delivery work

1. Confirm role semantics and define the project API contract.
2. Implement invitation identity, memberships, audit history, tenant isolation and revocation tests.
3. Connect project/organization persistence and all mutations through the typed API client.
4. Connect private file uploads, quarantine/scanning and download authorization.
5. Add email and notification workers, templates administration and nested directory operations.
6. Record authenticated Playwright HARs, update their submodule pointer and run replay in CI.
7. Verify default and alternate provider branding, mobile layouts, backups and staging recovery before production launch.

## Verification of this preview

The `dev:workspace` startup was also checked in a fresh browser without authentication cookies, environment credentials or a mock backend. It served `/projects` with no API calls or JavaScript errors, bound only to `127.0.0.1`, and blocked the original API and connected portal routes. The production build still redirected an unauthenticated `/projects` request to sign-in even with the preview flag set. Local preview startup touches `server.js`, `proxy.js`, the root layout/providers and a package script; these are intentional development-only integration changes.

Full repository lint completed with zero errors and 73 existing warnings; the new workspace files produced no warnings. Type checking passed. The production build compiled, completed Next.js's TypeScript validation, generated pages and finalized route optimization with `/projects` present. Its browser-compatibility database warnings are inherited from the starter. No dependencies or API contracts changed. The shared theme change only adds four color-token keys; existing keys retain their values.

A local browser check used a local-only mock of the existing provider bootstrap, without production credentials. It exercised read-only controls, progress edits, milestones, thread creation/replies/resolution, rejection of unsafe document URLs, link creation, folder moves, document comments, searching, template-based creation and organization profile edits. Desktop and 390px mobile screenshots were inspected, with no browser JavaScript errors or page-level horizontal overflow. A second provider accent was checked and the original configuration restored.

Local screenshots are in `test-results/projects-overview.png`, `test-results/projects-documents.png`, `test-results/projects-mobile.png` and `test-results/projects-alternate-brand.png`. Attach them to the feature PR; they are ignored local artifacts. There is no before screenshot for this newly introduced route.

The guardrail check passed using a local Windows launcher that resolves the script's `yarn` subprocess to the repository's pinned Yarn file. Playwright discovery currently reports existing specs as undiscovered on this Windows checkout; its path comparison appears to mix separators. That existing tooling issue was left outside this feature. The browser exercise is local verification, not committed HAR coverage. Authenticated HAR recording, replay and a HAR-submodule update remain required before shipping the production backend.
