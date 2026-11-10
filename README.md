# DELTA Recall

The latest account-synced app source is in **[synced-app/](synced-app/)**. This version saves ratings, review dates, the current card and typed drafts to a signed-in account. It includes the complete application, the 60-card deck, dependency lockfile, server routes, database schema and migrations, build tooling and tests.

## Versions

| Version | Source | Published app |
| --- | --- | --- |
| Latest — account sync | [synced-app/](synced-app/) | [Open signed-in app](https://delta-recall-sync.wintec-at-ji-0331.chatgpt.site) |
| Original — local progress | [dist/](dist/) and the root package/test files | [Open original app](https://chinwayland.github.io/delta-recall/) |

GitHub Pages continues to serve the `gh-pages` branch. Adding the synced source here does not change that deployment. The signed-in app is hosted separately through ChatGPT Sites.

## Run or migrate the latest version

Start with [MIGRATION.md](MIGRATION.md), then read the [synced app README](synced-app/README.md). With Node.js 22.13 or newer, run these commands from `synced-app/`:

```sh
npm ci
npm test
```

The app also needs a D1 database and authentication. Follow the migration guide before publishing under another ChatGPT account or hosting provider.

[SOURCE_VERSION.json](synced-app/SOURCE_VERSION.json) identifies the exact Sites source commit copied into this repository. The synced source files are a snapshot of the deployed version.

## What is not backed up here

This repository contains code and schema, not live progress records, local databases, browser state, credentials or installed dependencies. Keep progress backups private. Moving the source alone does not transfer a ChatGPT account or its saved data.

## Original local app

The root `package.json` and `tests/` belong to the original local app. Serve `dist/` with a static HTTP server to run it, or use the GitHub Pages link above. Its Export progress button downloads a browser-local JSON backup that the synced app can import.
