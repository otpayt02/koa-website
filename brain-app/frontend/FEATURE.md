# Company Brain local inbox dashboard

## User outcome

Review incoming and processed file lists and trigger the existing local inbox router from a browser.

## Current evidence

- Entry point: `src.jsx`, served by Vite on localhost:3000 through Compose.
- API: `GET /api/inbox/new`, `GET /api/inbox/processed`, `POST /api/inbox/process`, and `POST /api/inbox/mark-processed`.
- Persistence: the backend and router own files under the local repository. The frontend stores no files or credentials.
- Verification: `npm run build`; open the served app and check the API lists, manual routing, empty state, and backend failure state.

## Scope

- The overview, incoming and processed lists, search, file details, refresh, and manual routing are included.
- File content reading, topic index browsing, executive login, collaboration, and external source setup are outside this frontend pass.
- Existing file routing and connector behavior remain owned by the backend and worker.

## Experience flow

1. Open the local dashboard and see counts from the two inbox endpoints.
2. Search or select a file to inspect its name, path, size, and status.
3. Run a full inbox pass or process one waiting file.
4. The dashboard reloads both lists and confirms completion or displays the backend error.

## Safety and cost

The app has no access controls. It remains bound to localhost through Compose and must not hold private executive data. No paid calls or external actions are added. The frontend proxy keeps API calls on the local origin.

## Acceptance

- [x] Frontend builds.
- [x] Missing backend shows an unavailable state with retry.
- [ ] Compose runtime and real routing path checked when Docker Desktop is available.
- [ ] Executive authentication and secure access added before private use.

## Rollback

Revert the frontend commit; the backend API and router retain their previous behavior.
