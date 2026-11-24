# Gematria

A mobile-first Hebrew letter calculator for GitHub Pages. Type a phrase or use the built-in Hebrew keyboard. All five totals update as you type. Select a method to see its per-letter values and word subtotals. The app starts with שלום (“peace”).

| Method | Calculation |
| --- | --- |
| Mispar Hechrachi | Standard Hebrew values from 1 to 400. Finals retain their regular values. |
| Mispar Gadol | Standard values with ך, ם, ן, ף, ץ worth 500, 600, 700, 800, 900. |
| Mispar Katan | Drop the zeros in each letter’s standard value and add the results. |
| Mispar Siduri | Alphabet positions from 1 to 22. Finals retain their regular positions. |
| Atbash | Exchange each letter with its counterpart in the reversed alphabet and sum the transformed word’s standard values. |

The calculation ignores Hebrew pointing, cantillation, punctuation and digits. Spaces and maqaf separate words for subtotals. Latin letters have their own A–Z ordinal total. Same-value matches use standard values computed from a built-in list of 285 Hebrew words and phrases.

Recent history stays on the device under `gematria-history` and can be cleared from **History**. The interface follows the system color scheme. Copy a result or add the app to the iPhone Home Screen. After the first successful online load and service worker installation, the calculator and word list work offline.

## Run locally

From the repository root, run `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000/`. GitHub Pages can serve the same files directly from the root of `main`. Bump the cache version in `sw.js` when updating shell assets.

## Tests

- `node --test` runs the dependency-free calculation and lexicon tests.
- `node tests/e2e.mjs` serves the app under a local `/gematria/` path, opens a fresh headless Chromium context at 393 × 852, and checks visible values, keyboard input, history, matches, responsive widths and an offline reload. It writes light and dark iPhone screenshots and a desktop screenshot to `docs/screens/`.

The browser check uses Playwright at `~/dev/build-kids-apps/node_modules/playwright` and the macOS ARM64 Chromium headless shell at `~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`. It requires permission to bind a loopback port and launch that shell.
