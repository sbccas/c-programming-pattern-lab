# C Programming Pattern Lab — Project Progress

> Status file for future work sessions (Claude Code, ChatGPT, or a person).
> Read this first, then `README.md` and `C_Programming_Pattern_Lab_PRD.md`.

**Last updated:** 2026-10-28 · **Status:** ✅ Version 1 + "Pyramids & diamonds" live in production · **Latest commit on `main`:** `b8d9b65`

**At a glance:** 12 patterns in 4 levels · 254 automated tests · 17 site pages · mobile-first (320px → 4K) · no login, no backend

| | |
|---|---|
| **Live app** | https://c-programming-pattern-lab.vercel.app/ |
| **Repository** | https://github.com/sbccas/c-programming-pattern-lab (public, branch `main`) |
| **Local folder** | `D:\Future Projects\c-programming-pattern-lab` |
| **Hosting** | Vercel, auto-deploys every push to `main`; other branches get preview URLs |
| **Specification** | [`C_Programming_Pattern_Lab_PRD.md`](../C_Programming_Pattern_Lab_PRD.md) |
| **Creator** | Hitesh Patel, Assistant Professor & Coordinator, BSc Data Science · Hi-Tech AI Solutions & Services |

---

## 1. Milestones

| Date | Milestone | Commit |
|---|---|---|
| 2026-10-28 | PRD read. Project scaffolded with React + TypeScript + Vite + Tailwind | — |
| 2026-10-28 | Deterministic simulator engine and 7 verified patterns, with engine tests | — |
| 2026-10-28 | Full UI: home, library, lesson + simulator, practice, about. Prediction mode and quizzes | — |
| 2026-10-28 | Node upgraded to v24 LTS; all dependencies moved to the latest versions | — |
| 2026-10-28 | Futuristic "space lab" redesign, mobile-first layout, creator branding and `/creator` page | — |
| 2026-10-28 | Creator photo (animated GIF), designation, college and email added | — |
| 2026-10-28 | **First push to GitHub (sbccas)** | `47f2995` |
| 2026-10-28 | **Deployed on Vercel** and smoke-tested live | `47f2995` |
| 2026-10-28 | Social share previews (WhatsApp etc.), app icons and manifest, SEO, README screenshots | `adcb9a7` |
| 2026-10-28 | Progress notes (this file) and image source files | `59c6f6d` |
| 2026-10-28 | **Pyramids & diamonds**: 5 new patterns; engine supports two inner loops, sequential outer loops, arithmetic limits, comments | `0457d42` |
| 2026-10-28 | Progress notes record the pyramids commit; deployed and verified live | `b8d9b65` |

The user decided against a QR code; the link is shared directly.

### Where we left off (handoff)

- Everything above is committed, pushed and **live**. There are no open bugs and no uncommitted work.
- The user has been reviewing the app locally and then asking for commit + push. **Always ask before pushing.**
- Suggested next tasks, none started:
  1. Refresh the README screenshots so they show a pyramid or diamond lesson (§ 9).
  2. Optionally add the live URL to the GitHub repository's "About → Website" field. The user does this on GitHub.
  3. Add more patterns from § 10. Hollow shapes first need `if-else` support in the engine.

---

## 2. What is built

**Pages (routes)**

| Route | Contents |
|---|---|
| `/` | Home page: hero, a live terminal replaying real engine steps, highlights, how it works, featured patterns (Star Triangle, Pyramid of Stars, Diamond), creator spotlight |
| `/patterns` | Pattern library with category filters (Basic repetition, Increasing, Decreasing, Pyramids & diamonds), difficulty filters (Beginner, Easy, Moderate, Challenging) and a "completed" badge |
| `/patterns/:id` | Lesson: objectives, expected output, explanations, settings, simulator, quiz, previous/next navigation. Supports `?rows=` and similar settings in the URL |
| `/practice` | Every quiz question, filterable by question type, with local progress tracking and reset |
| `/creator` | Faculty profile: photo, designation, colleges, focus areas, the idea behind the lab, Hi-Tech AI Solutions |
| `/about` | Supported C subset, the step policy, limitations, privacy, accessibility |
| `*` | Friendly "Page not found" page |

**Simulator**
- Synchronised panels: code highlight, variables, step explanation, output, and dry-run trace.
  - Variables show "not set yet" before initialisation.
  - Pyramids and the diamond show `i`, `j` and `k` side by side, each with a role label (outer loop · rows, spaces loop, stars loop).
- When a limit is arithmetic, the explanation works it out first, e.g. `Check j <= 4 - i (here 4 - i = 1): 1 <= 1 is true…`.
- "Symbols printed" counts only visible symbols, never spaces.
- Comment lines in the code, such as the diamond's `// upper half`, are shown dimmed and never count as steps.
- Controls: Next, Previous, Auto Run, Pause, Reset, End, four speeds and a progress bar. The ← and → keys also step.
- On phones the dry-run trace becomes a stacked list.
- Prediction mode asks students to guess the next real event before it runs.

**Patterns (12)**, by id and teaching order:

| Level · category | Patterns |
|---|---|
| 1 · Basic repetition | `rectangle` (rows, columns) · `square` (size) · `repeated-row-number` |
| 2 · Increasing patterns | `star-triangle` · `number-triangle` |
| 3 · Decreasing patterns | `inverted-triangle` · `inverted-number-triangle` |
| 4 · Pyramids & diamonds | `star-pyramid` · `number-pyramid` · `odd-star-pyramid` (`k <= 2 * i - 1`) · `inverted-pyramid` · `diamond` (two outer loops; `rows` = upper-half height, total 2 × rows − 1 rows) |

Limits are 1–10, or 1–9 for the number patterns and the diamond. There are **40 quiz questions**: 36 across the lessons (2–4 each) and 4 general nested-loop questions. All of them appear in `/practice`, and 20 of the answers are re-checked against the simulator by the tests.

**Design:**
- A dark "space lab" theme: glass panels, neon cyan, violet and pink, and an animated grid-and-glow background.
- Animation respects `prefers-reduced-motion`.
- Fonts are bundled from `@fontsource-variable` (Inter, Space Grotesk, JetBrains Mono), so no font CDN is needed.
- Code ligatures are switched off so `<=` never renders as ≤.

**Responsive:**
- Mobile-first from 320px phones up to 2560px+ displays; the root font size scales up at 1536, 1920 and 2560px.
- Custom breakpoints: `xs` = 360px, `3xl` = 1920px.
- Verified with no horizontal overflow on all 17 pages at 320, 375, 768, 1440 and 2560px, including 10-row pyramids and a 9-row diamond.

**Sharing and SEO:**
- Open Graph and Twitter tags in `index.html`.
- `public/og-image.jpg`: 1200×630, about 90 KB.
- Icons and `site.webmanifest`, so students can "Add to Home screen".
- JSON-LD structured data, `robots.txt` and `sitemap.xml`.

---

## 3. Architecture (key idea)

```
Pattern definition (structured program, src/patterns/*.ts)
   → validateParams → renderSource (exact C code shown) + buildTimeline (typed events)
   → buildStates (one immutable snapshot per step) → useSimulation(position) → every panel
```

- **No C parsing and no `eval`.** The same structured program is used both to render the code and to run it, so they cannot disagree.
- **Step policy:** step 0 means "declared, not initialised". After that, each step is one event: `INIT_VARIABLE`, `CONDITION_CHECK`, `OUTPUT`, `NEWLINE`, `INCREMENT`, `DECREMENT` or `PROGRAM_END`. A `CONDITION_CHECK` with result `false` is the moment a loop exits; there is no separate "leave loop" event.
- **Previous Step** selects an earlier snapshot. **Auto Run** dispatches the same "advance one event" action on a timer, and the timer is cleaned up on pause, reset, step, settings change and unmount.
- **Safety:** parameters are validated and capped at 10, and the engine stops at 5,000 events.
- **Program shapes supported:**
  - an outer loop with one or two inner loops (pyramids: spaces loop `j`, then symbols loop `k`);
  - several outer loops in sequence (diamond);
  - `// comments`;
  - arithmetic limits (`+ - *`); constant parts are shown as their value, so `rows - 1` → `3`.

  Loops carry a `label` (spaces, stars, upper half…) that is used in explanations and in the dry-run trace.
- **Explanation cards:** `explain()` returns cards that point at a `loopId` or `partId`. `src/patterns/cardCode.ts` copies the code from the rendered program.

| Area | Files |
|---|---|
| Engine | `src/engine/` (`types`, `renderSource`, `buildTimeline`, `replayState`, `executePattern`, `validateParams`) |
| Patterns | `src/patterns/` (one file per pattern; `builders.ts`; `index.ts` sets the order) |
| Quiz | `src/quiz/` (`types`, `questions`, `predictions`) |
| UI | `src/components/`, `src/pages/`, `src/hooks/` (`useSimulation`, `useMediaQuery`), `src/app/` (routes, layout) |
| Branding | **`src/branding.ts`**: creator and organisation details (edit here only) |
| Styles | `src/styles/index.css` (Tailwind v4 `@theme` tokens, `@utility` classes such as `glass`, `btn-primary`, `neon-text`) |

---

## 4. Tech stack (as of 2026-10-28)

| Tool | Version | Note |
|---|---|---|
| Node.js | **24.22.1 LTS** (npm 11.19) | `package.json` engines: `>=22.12` |
| React | 19.3 | |
| React Router | 7.18 | `BrowserRouter`; `vercel.json` rewrites every path to `index.html` |
| Vite | 8.3 | |
| Tailwind CSS | 4.3 | Via `@tailwindcss/vite`. Use `@utility`, not `@layer components`, for anything you want to `@apply` |
| TypeScript | **6.0** (strict) | **Not 7**: typescript-eslint supports TypeScript below 6.1 only |
| Vitest | 5.0 | With jsdom 30 and React Testing Library 16 |
| ESLint | 10 | Includes rules forbidding `eval` and `new Function` |
| lucide-react | 1.63 | **No brand icons.** The GitHub logo is our own `src/components/GithubIcon.tsx` |

---

## 5. Branding and creator details

All in `src/branding.ts`:

| Field | Value |
|---|---|
| Name | Hitesh Patel |
| Designation | Assistant Professor & Coordinator, BSc Data Science |
| Colleges | Prof. V. B. Shah Institute of Management; R. V. Patel College of Commerce (English Medium); V. L. Shah College of Commerce (Gujarati Medium); Sutex College of Computer Applications & Science |
| Location and trust | Amroli, Surat; managed by Jivan Jyot Trust |
| Photo | `public/images/hitesh-patel.gif` (animated, 612×612); `hitesh-patel-still.webp` for reduced motion |
| Contact | Email hitech.nft@gmail.com · GitHub https://github.com/contact2hitech · X @contact2hitesh |
| Organisation | Hi-Tech AI Solutions & Services, https://hi-tech-ai-solutions.github.io/ |

Facts about the creator come from the public GitHub profile and website, plus details the user supplied. **Do not invent new biographical claims.**

---

## 6. Git, GitHub and deployment workflow

- **GitHub account:** `sbccas`.
- **Repo-local identity** (already set in `.git/config`): `sbccas <sbccas.amroli@gmail.com>`. GitHub credits it to sbccas. Do **not** change the global git identity.
- **Remote:** `https://sbccas@github.com/sbccas/c-programming-pattern-lab.git`. Keep the `sbccas@` part so Git Credential Manager uses the saved sbccas login.
- **Commit messages:** **no `Co-Authored-By: Claude` trailer.** The user wants only their own account credited.
- **Line endings:** `.gitattributes` normalises text files to LF.
- **Process for every change:**
  1. Make the change.
  2. `npm run lint && npm test && npm run build` must all pass.
  3. Commit and push.
  4. Vercel deploys in about 20 seconds.
  5. Verify the live site, and report the commit SHA and URL.
- **Vercel settings:** framework Vite, build `npm run build`, output `dist`, no environment variables, Node 24.x.

---

## 7. Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 254 tests
npm run lint
npm run build      # → dist/
npm run preview    # serve dist on http://localhost:4173
```

**Windows gotchas:**
- A dev server started from a script can leave the Vite process running after the shell stops. If so, find the `node.exe` whose command line contains this project's path and end it. Other `node.exe` processes, such as the Google Stitch `mcp-remote` connector, are unrelated; leave them alone.
- If a script edits the same file twice within a few milliseconds, the Vite dev server can miss the second edit and keep serving an old copy. The page then breaks in the browser while tests and the build pass. Fix it by touching the file (or restarting `npm run dev`). This never affects production.
- Python scripts that write files on Windows produce CRLF line endings. `.gitattributes` turns them back into LF on commit, so this is harmless.

---

## 8. Verification status

- **Tests:** 254 passing across 6 files.
  - Independent control-flow oracle: for every pattern at every allowed setting, the code part that runs after each step must match the one C would run, worked out from the program structure.
  - Engine: exact PRD first-row sequence, loop order for every pattern at every allowed setting, snapshot replay forwards and backwards.
  - Patterns: PRD C source matched character for character; expected outputs.
  - Quiz: answers recomputed by the engine.
  - UI: all 53 steps forward and back, Auto Run, Pause, Reset, settings, prediction mode, quiz, navigation, mobile menu and tabs, creator page.
  - Metadata: share tags, image under 300 KB, icons, sitemap.
- **Mutation checks** (to prove the tests catch real bugs):
  - Deliberately breaking inner-loop re-initialisation fails 18 tests.
  - Making `-` compute `+` fails 22 tests.
- **Live checks (2026-10-28, after `0457d42`):**
  - All 17 routes and deep links return 200.
  - The live bundle hash matched the local build of the deployed commit.
  - The library shows 12 patterns.
  - Every new lesson runs to its last step with the correct output:

    | Lesson | Steps |
    |---|---|
    | Pyramid of Stars | 79 |
    | Number Pyramid | 79 |
    | Solid Pyramid (Odd Stars) | 97 |
    | Inverted Pyramid | 79 |
    | Diamond (7 rows) | 138 |
  - No console errors and no horizontal overflow.
  - WhatsApp, Facebook and Telegram crawlers receive the Open Graph tags and image.

---

## 9. Regenerating images (if the title, designation or photo changes)

The sources are in `docs/assets-src/`:

| File | Produces | How |
|---|---|---|
| `og-card.html` | `public/og-image.jpg` | Render at 1200×630 with headless Chrome (example below), then save as JPEG, quality about 86, **under 300 KB** |
| `icon.html` | `public/icon-512.png` | Render at 512×512, then downscale with Pillow to `icon-192.png` and `apple-touch-icon.png` (180). Headless Chrome has a minimum window width, so small direct renders come out cropped |
| `shoot-screenshots.mjs` | `docs/screenshots/*.png` | `node docs/assets-src/shoot-screenshots.mjs <outDir> https://c-programming-pattern-lab.vercel.app` drives headless Chrome over the DevTools protocol. Convert the results to WebP for the README. **Note:** the current README screenshots (taken at `adcb9a7`) were made before the pyramids existed. They are still accurate but show only triangle lessons; to include one, add a pyramid or diamond shot to the script |

Example render command (PowerShell, separate profile so the user's Chrome is untouched):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --user-data-dir="$env:TEMP\cpl-profile" `
  --allow-file-access-from-files --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 `
  --virtual-time-budget=3000 --screenshot="$env:TEMP\og-card.png" "file:///D:/Future%20Projects/c-programming-pattern-lab/docs/assets-src/og-card.html"
```

Keep the share card truthful. It shows step 7 (`2 <= 1 → FALSE`, i = 1, j = 2), so the triangle is labelled **"final output"**.

After changing the image, WhatsApp may keep showing the old cached preview. Sharing the link with `?v=N` forces a fresh one.

---

## 10. Known limitations and ideas for later

**Version 1 limits (by design, per the PRD):**
- Only the predefined, verified programs can be simulated; no arbitrary C.
- Settings are capped at 10.
- Progress is stored in `localStorage` only.

**Possible next steps (PRD "later versions" and expansion candidates):**
- More patterns: alphabet triangle (`%c`), hollow square or hollow pyramid (needs `if-else` in the engine), Floyd's triangle, Pascal's triangle.
- Pyramids, the inverted pyramid, the number pyramid and the diamond were added on 2026-10-28.
- Each new pattern must pass the generic engine tests before it is published.
- Other C topics: `while`, `do-while`, `if-else`, arrays, functions.
- Gujarati language support.
- Exportable lesson sheets.
- A teacher dashboard and accounts (these need a privacy review first).
- Optional: a custom domain on Vercel, and the live URL in the GitHub repo's "About → Website" field.
