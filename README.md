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

## Find words by number

Open **Find words**, or type digits in the calculator and tap **Find words = N**. Choose Standard, Gadol, Katan, Ordinal, or Atbash. Curated entries appear first. Within each group, more frequent spellings appear first. Tap a spelling to load it into the calculator, or **Show more** for the next 24 matches. A lookup can be shared with a fragment such as `#find=26` or `#find=936&m=gadol`.

The index covers 305,507 written word occurrences in 39 books, with 39,615 distinct written forms. Combining these with 8,674 Strong’s entries and 285 curated entries gives **41,781 distinct spellings**, including multi-word headwords and phrases. All five lookup methods use the calculator’s own `calculate()`.

Frequency counts use the exact unpointed spelling, with attached prefixes and suffixes. Counts include the written ketiv and exclude alternate qere readings in notes. Maqaf separates words. Phrase counts require consecutive whole words within one verse. A zero means the exact spelling or phrase has no occurrences under these rules. An English gloss gives one reading of the spelling. Written forms use their most frequent numbered lemma, with the lower Strong’s number breaking ties. Curated glosses take precedence.

### Index size and loading

The 150 JSON files in `data/words/` total **2,060,124 bytes raw** and **731,907 bytes gzipped** (sum of files compressed individually with Node’s default gzip settings). The calculator and the empty lookup fetch no index data. The first numeric lookup fetches the manifest, the selected method’s value shard, and the dictionary pages needed for the first 24 rows. Standard values are grouped together on disk. **Show more** reuses loaded files and requests any additional pages it needs. Service worker v5 caches successful shard requests on use, so previously fetched pages can be reopened offline.

To regenerate the static files, run `node tools/build-index.mjs` with `xsltproc` on the path and the source checkouts under `~/dev/gematria-data/morphhb` and `~/dev/gematria-data/HebrewLexicon`. The build reads the local XML and prints the counts and byte totals. Publish the generated files alongside the app. GitHub Pages needs no build command or backend.

## Data & licenses

The Westminster Leningrad Codex (WLC) Hebrew text is public domain. The lemma and morphology data are © Open Scriptures Hebrew Bible Project and licensed under CC BY 4.0. This index removes pointing and cantillation, joins morphological segments, and counts written forms. [Open Scriptures Hebrew Bible source](https://github.com/openscriptures/morphhb) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

Strong’s Hebrew dictionary text is public domain. The HebrewLexicon XML is © Open Scriptures Hebrew Bible Project and licensed under CC BY 4.0. The index uses unpointed headwords and shortened English definitions or usage glosses. [HebrewLexicon source](https://github.com/openscriptures/HebrewLexicon) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Random facts

Press **Random** for one of 28 fact cards. Each card shows the Hebrew, the equation, the letter values, and the story behind the observation. **Next** deals every card once before reshuffling, including across dialog visits in the same page session. **Load into calculator** puts the card’s main word or verse in the input. Close the card with its close button or Escape.

The address bar links to the current card. Open [Pi in Genesis](https://zev330-lab.github.io/gematria/#fact=genesis-pi) for the featured comparison. Expand the letter-by-letter proof to inspect all seven words. The other featured card, [Pi's digits and the first verse](https://zev330-lab.github.io/gematria/#fact=genesis-pi-digits), lets you inspect both splits of the first 628 decimals of pi. All arithmetic runs locally. Source links open in a new tab only when selected.

`facts.mjs` contains the claims, shuffle bag, and verse calculations. Hebrew values come from the same `calculate()` function as the calculator. Verse products and division use BigInt. The service worker includes the deck and card UI for offline use.

## Run locally

From the repository root, run `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000/`. GitHub Pages can serve the same files directly from the root of `main`. Bump the cache version in `sw.js` when updating shell assets.

## Tests

- `node --test` runs the dependency-free calculation, lexicon, fact-claim, BigInt ratio, pi digit-window, and shuffle tests. It also loads every index shard, verifies ranking and completeness, and recomputes every indexed value across all five methods.
- `node tests/e2e.mjs` serves the app under a local `/gematria/` path, opens a fresh headless Chromium context at 393 × 852, and checks visible values, keyboard input, history, matches, responsive widths, the Random and Next buttons, fact deep links, reverse lookup, the numeric chip, pagination, calculator loading, and offline lookup after reload. It writes light and dark iPhone screenshots and a desktop screenshot, plus `find-26.png`, `find-376.png`, `fact-pi.png`, `fact-pi-digits.png`, and `fact-other.png`, to `docs/screens/`.

The browser check uses Playwright at `~/dev/build-kids-apps/node_modules/playwright` and the macOS ARM64 Chromium headless shell at `~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`. It requires permission to bind a loopback port and launch that shell.
