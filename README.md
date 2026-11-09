# DELTA Recall

A focused, responsive flashcard app for DELTA Module One practice. The 60 original cards target language analysis, learning principles, connected speech, terminology, test evaluation and answer development.

## Practice

Start with a ten-card focus mix, or select a topic. Try an answer, reveal the model, check the key points and rate your recall. Ratings are self-assessments, not automated exam scores.

- **Again:** revisit later in the current session; due in ten minutes if the session is left.
- **Hard:** review tomorrow.
- **Got it:** review in 1, 3, 7, 14, then 30 days after successive due recalls. Early extra practice does not advance an established interval.

The last rating can be undone. Progress and the current session are saved locally in the browser. No accounts, analytics, remote answer submission or cross-device synchronization.

## Run locally

Serve `dist/` with any static HTTP server. For example:

```sh
python3 -m http.server 8765 --directory dist
```

Then open `http://localhost:8765`. No build or dependency installation is required.

## Test

With a recent Node.js installation:

```sh
npm test
```

## Hosting

The `gh-pages` branch contains the contents of `dist/`. GitHub Pages serves that branch from its root. All asset paths are relative so the app works beneath a repository path.

## Content

Prompts and examples are original practice material. They are not a reproduction of a candidate script or official past paper. References appear in the app. It is independent study material, not endorsed by Cambridge. Pronunciation examples describe possible realizations and note accent conditions where relevant.

## Account sync

Use the signed-in version at https://delta-recall-sync.wintec-at-ji-0331.chatgpt.site to resume across devices with the same ChatGPT account.

To bring existing browser progress across, choose **Export progress** in this original app. In the signed-in app, choose **References & privacy → Import existing progress** and select the JSON file. Repeat on each previously used device. Import keeps the newer review record for each card without adding duplicate reviews. The original app remains local-only.
