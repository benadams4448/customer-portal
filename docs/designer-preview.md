# Share the workspace with a designer

Live designer demo: <https://out-chi-azure.vercel.app/>. This is an account-owned Vercel production deployment, not an expiring temporary deployment. Its project is `out` in the `benadams4448` scope.

The designer demo is a static export of the actual project workspace. It imports the same UI components and sample data, so changes to the workspace appear in the next demo build. It contains no API routes, authentication bootstrap, mail jobs, production credentials or live client data. It can be hosted on Vercel without a server, database or environment configuration.

## Build and deploy

From the repository root:

```powershell
yarn build:designer
npx vercel@64.5.0 deploy designer-preview/out --project out --scope benadams4448 --prod --yes
```

Use the Vercel account that owns the project. If sign-in is required, run `npx vercel@64.5.0 login`, open its device-authorization link and complete the CLI approval. The explicit project and scope above keep subsequent updates on the existing designer URL, even if rebuilding clears local deployment-link files from the output directory.

Only `designer-preview/out` is uploaded by this command. Do not deploy the repository root as an ordinary Next.js app for this demo: that would deploy the original backend routes and require provider configuration.

For Git-based Vercel deployments, import this repository with its root directory set to the repository root, choose framework preset **Other**, use install command `YARN_ENABLE_SCRIPTS=false yarn install --immutable`, build command `yarn build:designer`, and output directory `designer-preview/out`. Do not add provider or email credentials to this designer project. The existing production portal's build and authentication are separate and unchanged.

The export's Vercel configuration adds a no-index response header, while page metadata also requests no indexing. The demo remains accessible to anyone who can open its deployment link. All edits are temporary browser state and reset on reload; visitors do not share edits. Uploaded files, invitations and external document permissions are outside this demo.

## Designer handoff

Review the Overview, Documents, Discussions, People and Organization views at desktop and mobile widths. Use **Design review tools** at the bottom to switch roles. Test a new project from a template, edit progress, add a document link, move it between folders and post a thread reply. Collect feedback against these flows before connecting the production backend.

This pass removes duplicate desktop navigation, removes overview metrics from the content views, puts discussion replies in a focused detail view, and keeps role-testing controls collapsed. Dashboard request/unread cards open their matching filters. Organization, project and section context remain visible. New projects show **Not started** until progress is updated.

The live URL was verified in a fresh browser without Vercel sign-in. Desktop and mobile checks passed for navigation, request filtering, thread replies, document comments and folder moves, role restrictions, and template-based creation. No JavaScript errors or API requests occurred during that check. The response includes `X-Robots-Tag: noindex, nofollow`.

Configuration changes for review: a separate static Next.js app under `designer-preview/`, the `build:designer` package script, an output-preparation script, and generated-output exclusions in ESLint and TypeScript. No dependency, shared API, CSP, or production authentication changes are required for this deployment.
