# Stadium Copilot

GenAI assistant for **PromptWars — Challenge 4: Smart Stadiums & Tournament Operations**.

Helps fans, volunteers, and organizers with navigation, crowd guidance, accessibility, and multilingual support during FIFA World Cup 2026 matches.

## Features → Problem Statement Alignment
- **Navigation & crowd management** — Live Gate Board with simulated per-gate crowd levels + AI recommendation for the least busy gate.
- **Multilingual assistance** — 9 languages, AI always replies in the selected one regardless of question language.
- **Accessibility** — one-click Accessibility Mode: larger text, plain-language answers, numbered steps, text-to-speech read-aloud.
- **Operational intelligence / real-time decision support** — Volunteer Console turns a quick incident note into a structured dispatch (priority, location, summary, action).

## Stack
Plain HTML/CSS/JS frontend (no build step) + one Vercel serverless function (`/api/chat`) that calls the Anthropic API. The API key lives only on the server — never shipped to the browser.

## Run locally
```bash
npm install -g vercel
vercel dev
```
Add your key first (see below).

## Deploy (get your "Deployed Link")
1. Push this folder to a **public GitHub repo**.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. In Project Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy. Vercel gives you a live URL like `https://your-project.vercel.app` — that's your **Deployed Link**.

## Tests
```bash
npm test
```
Runs 12 unit tests (Node's built-in test runner) covering input validation and prompt construction — no API key needed to run them.

## Security notes
- API key is server-side only (`process.env.ANTHROPIC_API_KEY`), never exposed to the client.
- All inputs validated server-side (message length, allowed mode/language enums).
- Output escaped before insertion into the DOM (`escapeHTML`) to prevent XSS.

## Project structure
```
index.html        Frontend markup
styles.css         Styles (dark stadium/scoreboard theme, WCAG-conscious contrast)
app.js             Frontend logic (chat, gate board, accessibility toggle)
api/chat.js        Serverless function — the only place calling the Anthropic API
lib/logic.js       Pure validation + prompt-building functions (unit tested)
tests/logic.test.js Unit tests
```

## Submission checklist
- [ ] GitHub repo link (public, <10MB)
- [ ] Deployed link (from Vercel)
- [ ] LinkedIn post about your build
