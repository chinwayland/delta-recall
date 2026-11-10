# Migrating DELTA Recall

The complete latest account-synced application is in `synced-app/`. `SOURCE_VERSION.json` records its upstream source commit. No live progress data or credentials are included.

## Move to another ChatGPT account

1. While the current account is still accessible, obtain a private backup of its latest cloud progress. The synced app currently has an import action but no Export account progress button. Add that action or download an authenticated `GET /api/progress` snapshot before moving. The original GitHub Pages app's export contains only that browser's local progress.
2. Copy `synced-app/` into a new project directory and open it under the destination ChatGPT account, which must have Sites access.
3. In the new copy, remove the old `project_id` from `.openai/hosting.json` before asking Sites to register a new Site. Preserve the database binding:

   ```json
   {
     "d1": "DB",
     "r2": null
   }
   ```

   The old project ID identifies the existing workspace's Site. It is not a secret, but reusing it is not an account transfer. Let Sites create and persist a fresh project ID.
4. Ask Sites to install, build and publish this existing Vinext project privately with ChatGPT sign-in and D1. Preserve the existing D1 schema and migrations. Do not copy the old deployment's credentials or local runtime state.
5. Sign into the new app using the destination account. Under References & privacy, choose Import existing progress and select the private progress backup. The importer accepts a plain state, the original export envelope, or an authenticated API snapshot containing `state`.
6. Test ratings, review dates, the current card and typed draft across two devices. Confirm Saved to account before switching. Keep the original app accessible until the replacement is verified, then update bookmarks and any links to it.

Creating a new Site does not automatically copy the old Site's database. Sign-in identities differ between Sites/accounts; import associates the saved progress with the newly signed-in user. This guide describes redeployment and data migration, not a guaranteed ownership-transfer feature.

## Move to an independent hosting provider

The app uses a Cloudflare-compatible Worker, a D1/SQLite database and a small authenticated progress API. It does not call an AI model to serve the flashcards.

- Replace the ChatGPT-specific identity helpers in `app/chatgpt-auth.ts` and the sign-in/sign-out links with an independently managed authentication system.
- Continue verifying identity server-side for every read and write. Never trust a client-supplied account ID to select the database owner.
- Configure a new database and apply the schema migrations. Preserve account scoping, revision checks, same-origin write protection and private/no-store responses.
- Import the private progress snapshot into the new account, test the app across devices, and retain a private backup before retiring the old deployment.

Cloudflare Workers plus D1 is close to the current runtime. Other providers may need adjustments to the Worker and database integration.

## Developer checks

Run from `synced-app/` with Node.js 22.13 or newer:

```sh
npm ci
npm test
npm run build
```

The portable development server supports localhost-only mock ChatGPT sign-in; production authentication is provided by the hosting platform. Apply local D1 migrations using the generated Wrangler configuration and the same `.wrangler/state` persistence path before testing server saves. Local test records are separate from production.

Never commit progress backups, `.env` files, private keys, source-repository credentials, `.wrangler/`, or browser recovery state.
