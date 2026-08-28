# Contributing to En Peyar

Thank you for your interest in contributing. En Peyar is an open-source Tamil naming platform. Contributions from Tamil speakers, linguists, developers, and designers are all welcome.

---

## What you can contribute

### Tamil Roots & Words
The heart of En Peyar is its knowledge of Tamil roots. You can expand this by:

- Adding new roots to `static/data/tamil_roots.json` under one of the 20 thematic categories (`creation`, `connection`, `knowledge`, `growth`, `trade`, etc.)
- Adding district-specific naming inspirations to `static/data/districts.json` (`namingInspiration`, `brandMood` fields)
- Suggesting new entries for the `INSPIRE_ROOTS` array in `static/js/main.js`
- Improving existing meanings, pronunciations, or etymologies

**Format for a root in `static/data/tamil_roots.json`:**
```json
{
  "tamil": "படைப்பு",
  "roman": "Padaippu",
  "meaning": "creation / invention",
  "tone": "innovative"
}
```

**Format for an inspire root in `static/js/main.js`:**
```js
{
  word: "தேடல்",          // Tamil script
  roman: "Thedal",        // Romanised transliteration
  meaning: "Search / Quest",
  concept: "A discovery product — search engines, research tools, explorers.",
  names: ["Thedal", "Thedalix", "Thedalo"]
}
```

### Translations
All UI strings live in `static/locales/en.json` and `static/locales/ta.json`.

- Both files must always have 100% identical key structures
- Tamil translations should be written by a native speaker — avoid machine translation
- If you add a new key to `en.json`, add the corresponding key to `ta.json` in the same PR

**To add a translation key:**
```json
// en.json
"section.newKey": "English text here"

// ta.json  
"section.newKey": "தமிழ் உரை இங்கே"
```

### District Data
Each district in `static/data/districts.json` has fields for history, brand mood, naming inspiration, and culture. You can:

- Improve the `history` field with more accurate or richer detail
- Add more entries to `namingInspiration` arrays
- Refine `brandMood` descriptions to be more useful for naming

### Bug Fixes & Code Improvements
- Open an issue first for any non-trivial change
- Modular JavaScript architecture lives in `static/js/`:
  - `events.js`: Central event delegation (CSP compliant `[data-action]` handlers)
  - `generator_api.js`: API fetch client
  - `generator_ui.js`: Brand toolkit modal, preview cards, RDAP domain availability, logo prompt generator
  - `generator.js`: Main generator manager, client-side brand scoring engine, shortlist manager
  - `i18n.js`: Client-side bilingual translation engine
  - `main.js`: App controller, Web Speech TTS, theme manager, context refiner
  - `map.js`: Interactive SVG district map & Thirukkural API integration
- Keep Flask backend changes in `app.py` — ensure AI model failover and JSON schemas remain intact
- Run automated tests before opening a PR: `pytest tests/`

---

## How to run locally

```bash
git clone https://github.com/MKishoreDev/en-peyar
cd en-peyar

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Start the dev server
python app.py
```

Open `http://localhost:5000`.

---

## Pull Request guidelines

- One purpose per PR (translation fix, new roots, bug fix — not all three)
- Write a clear description of what changed and why
- For translation PRs: include the Tamil text and your confidence level (native / fluent / assisted)
- For data PRs: cite a source for historical or linguistic claims

---

## Code of conduct

Be respectful. This project is about Tamil language and culture — treat it accordingly.

Questions? Open an issue or start a discussion on GitHub.
