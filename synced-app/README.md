# DELTA Recall with account sync

The original 60-card study app, with ChatGPT sign-in and private server-saved review records and sessions.

## Behaviour

- Ratings, scheduling, current card, reveal state and typed draft sync to the signed-in account.
- The browser saves an account-specific recovery copy until the server acknowledges a write.
- A revision check prevents a stale tab from silently overwriting another device. Users choose which session to resume; newer card records from both sides are merged.
- Resets carry a reset timestamp so an older device or import cannot restore pre-reset reviews.
- Checklist ticks are temporary self-checks and are not recorded.
- Import the JSON export from the original GitHub Pages app on each device. Repeated imports are idempotent. Existing cloud sessions take precedence; the first import can restore an unfinished legacy session.

## Implementation

Sites supplies ChatGPT identity. Each API operation uses the server-injected account ID; client-selected account IDs cannot select a record. Writes require a matching Origin, the expected account and the current revision. Responses are private and uncached.

D1 stores one progress snapshot and revision per account in `recall_progress`. Drizzle migrations live in `drizzle/`. The Sites publishing workflow applies hosted migrations. Preview data is separate and is not packaged.

## Local development

Use the Sites plugin workflow to install and launch the app. Portable development supports a localhost-only mock ChatGPT sign-in; it is not included in production. Apply local migrations following the starter tooling instructions before testing progress saves.

`npm test` checks validation, import merging, idempotence and stale reset protection. `npm run build` produces the Worker and client assets. Publishing uses the Sites source helper and the project ID in `.openai/hosting.json`.
