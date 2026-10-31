# C Programming Pattern Lab — Project Progress

> Status file for future work sessions (Claude Code, ChatGPT, or a person).
> Read this first, then `README.md` and `C_Programming_Pattern_Lab_PRD.md`.

**Last updated:** 2026-10-31 · **Status:** ✅ Live in production: Version 1, "Pyramids & diamonds" and the visitor counter · **Latest feature commit:** `b5b4b6a`

**At a glance:** 12 patterns in 4 levels · 270 automated tests · 17 site pages · mobile-first (320px → 4K) · no login · live visitor counter + Vercel Web Analytics

| | |
|---|---|
| **Live app** | https://c-programming-pattern-lab.vercel.app/ |
| **Repository** | https://github.com/sbccas/c-programming-pattern-lab (public, branch `main`) |
| **Local folder** | `D:\Future Projects\c-programming-pattern-lab` |
| **Hosting** | Vercel (team `sbccasamroli-3241s-projects`, Hobby plan), auto-deploys every push to `main`; other branches get preview URLs |
| **Counter API** | https://c-programming-pattern-lab.vercel.app/api/counter (read-only `GET` returns `{configured, visits, devices}`) |
| **Owner dashboards** | Vercel → project → **Analytics** (visitors, pages, devices, countries) · **Storage** (Upstash Redis database) |
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
| 2026-10-28 | README screenshots show pyramids and the diamond; home highlight text fixed | `1fbc6f0` |
| 2026-10-28 | Progress notes updated (pyramids release, handoff, verification) | `d51fb3f` |
| 2026-10-29 | **Visitor counter**: public "students · visits" counter (`api/counter.ts` + Upstash Redis, read-only token for reads) and Vercel Web Analytics; privacy text updated | `b5b4b6a` |
| 2026-10-29 | User enabled Web Analytics and connected Upstash for Redis (free); counter verified live with `configured: true`, starting at 0 / 0 | — |
| 2026-10-31 | Tailwind scans only `src/` (`@import 'tailwindcss' source('..')`). Before, it also scanned README, `docs/` and the PRD, so docs edits changed the CSS. The 2 rules dropped (`flex-shrink`, `transform`) came only from the share-card HTML; 270 tests pass. The same fix was made in C Programming Array Lab | this commit |

The user decided against a QR code; the link is shared directly.

### Where we left off (handoff)

- Everything above is committed, pushed and **live**. There are no open bugs and no uncommitted work (apart from this notes update, if it has not been pushed yet).
- The user has been reviewing the app locally and then asking for commit + push. **Always ask before pushing.**
- ~~Open action for the user: enable Web Analytics and connect Upstash for Redis~~ ✅ done on 2026-10-29.
  - The database was created through Vercel → Storage → **Create Database** → Upstash for Redis (free plan).
  - The "Connect Database" panel only lists *existing* databases.
  - It added `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL` and `REDIS_URL`. Only the first three are used.
- **When checking the live site, do not inflate the counter:**
  - use `curl …/api/counter` (`GET` only reads); or
  - in a scripted browser, set `localStorage['c-pattern-lab:device-counted']='1'` and `sessionStorage['c-pattern-lab:visit-counted']='1'` before the app runs (CDP `Page.addScriptToEvaluateOnNewDocument`).

  Automated browsers (`navigator.webdriver`) never count anyway.
- **Never ask for or paste the Redis token values**; ask only for variable names.
- Suggested next tasks:
  1. ~~Refresh the README screenshots to show a pyramid or diamond~~ ✅ done: the diamond, the solid pyramid on a phone, and the library filtered to pyramids.
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

**Visitor counting** (added 2026-10-29):

| Part | Details |
|---|---|
| Public counter | "812 students · 3,940 visits", shown as a pill in the home hero and as a line in the footer. `src/components/VisitorCounter.tsx` and `src/utils/visitorStats.ts` |
| Server | `api/counter.ts`, a Vercel Function. `GET` reads, `POST {newDevice}` counts. It stores only `cpl:visits` and `cpl:devices` in Upstash Redis through the REST pipeline |
| Counting rules | A device once ever (`localStorage`), a visit once per session (`sessionStorage`). Only on `PRODUCTION_HOST` and never in automated browsers, so previews, localhost and screenshot scripts don't inflate it |
| Failure behaviour | Hidden when the database is not connected (`configured: false`) or a request fails |
| Private dashboard | Vercel Web Analytics |
| Privacy text | Updated on Home, the footer and About ("Visitor counting") |

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
| Visitor counter | `api/counter.ts` (Vercel Function, Upstash REST) · `src/utils/visitorStats.ts` (counting rules, `PRODUCTION_HOST`) · `src/components/VisitorCounter.tsx` (pill + footer line) · tests in `tests/counter-api.test.ts` and `src/__tests__/visitorCounter.test.tsx` |
| Analytics | `<Analytics />` from `@vercel/analytics/react` in `src/app/App.tsx` |
| Styles | `src/styles/index.css` (Tailwind v4 `@theme` tokens, `@utility` classes such as `glass`, `btn-primary`, `neon-text`) |

---

## 4. Tech stack (as of 2026-10-28)

| Tool | Version | Note |
|---|---|---|
| Node.js | **24.22.1 LTS** (npm 11.19) | `package.json` engines: `>=22.12` |
| React | 19.3 | |
| React Router | 7.18 | `BrowserRouter`; `vercel.json` rewrites every path except `/api/…` to `index.html` |
| @vercel/analytics | 2.0 | `<Analytics />` in `src/app/App.tsx` |
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
- **Vercel settings:** framework Vite, build `npm run build`, output `dist`, Node 24.x.
  - The only environment variables are the Upstash Redis ones (`KV_REST_API_URL`, `KV_REST_API_TOKEN`), added by the Marketplace integration.
  - **Web Analytics** must be enabled in the Analytics tab.
  - Setup steps are in README → "Visitor counter & analytics".

---

## 7. Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 270 tests
npm run lint
npm run build      # → dist/
npm run preview    # serve dist on http://localhost:4173
```

**Windows gotchas:**
- A dev server started from a script can leave the Vite process running after the shell stops. If so, find the `node.exe` whose command line contains this project's path and end it. Other `node.exe` processes, such as the Google Stitch `mcp-remote` connector, are unrelated; leave them alone.
- If a script edits the same file twice within a few milliseconds, the Vite dev server can miss the second edit and keep serving an old copy. The page then breaks in the browser while tests and the build pass. Fix it by touching the file (or restarting `npm run dev`). This never affects production.
- Python scripts that write files on Windows produce CRLF line endings. `.gitattributes` turns them back into LF on commit, so this is harmless.
- Tailwind v4 scans every project file for class names unless `source()` limits it. Keep `source('..')` on the import in `src/styles/index.css`, so README and docs edits never change the site's CSS.

---

## 8. Verification status

- **Tests:** 270 passing across 8 files.
  - Visitor counter: the API against a fake Redis (exact commands, the "not configured" fallback, both variable-name styles, the read-only token used for reads, error handling) and the client counting rules (production only, no automated browsers, once per device and once per session, one request per page load, hidden on failure).
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
- **Live checks (2026-10-29, after `b5b4b6a`):**
  - The live bundle matched the local build.
  - `GET /api/counter` returns `200 {"configured":true,"visits":0,"devices":0}` with `Cache-Control: no-store`.
  - SPA routes still return 200 (the rewrite skips `/api/`).
  - `/_vercel/insights/script.js` returns 200, so Analytics is enabled.
  - A scripted read-only browser check showed "0 students · 0 visits" in the home pill and the footer, on desktop and phone. It made only two `GET` requests, and the totals stayed 0 / 0.

---

## 9. Regenerating images (if the title, designation or photo changes)

The sources are in `docs/assets-src/`:

| File | Produces | How |
|---|---|---|
| `og-card.html` | `public/og-image.jpg` | Render at 1200×630 with headless Chrome (example below), then save as JPEG, quality about 86, **under 300 KB** |
| `icon.html` | `public/icon-512.png` | Render at 512×512, then downscale with Pillow to `icon-192.png` and `apple-touch-icon.png` (180). Headless Chrome has a minimum window width, so small direct renders come out cropped |
| `shoot-screenshots.mjs` | `docs/screenshots/*.png` | `node docs/assets-src/shoot-screenshots.mjs <outDir> https://c-programming-pattern-lab.vercel.app` drives headless Chrome over the DevTools protocol. It steps a lesson until a given explanation appears (for example `Start lower half loop`). It captures home, diamond (desktop), solid pyramid (phone), the library filtered to pyramids, and creator. Convert the results to WebP (quality about 86) into `docs/screenshots/` |

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

**Visitor counter limits:**
- The public number is an approximation. A student using a phone and a laptop counts twice, clearing browser data counts again, and a determined person could inflate it.
- Use the Vercel Analytics dashboard for reliable statistics.
- The numbers refresh on each page load, not live on an open page.
- The counter only counts on `PRODUCTION_HOST` (`src/utils/visitorStats.ts`). **Update it if a custom domain is added.**
- Upstash free plan: if the limits are ever exceeded the requests fail, and the site just hides the counter.

**Possible next steps (PRD "later versions" and expansion candidates):**
- More patterns: alphabet triangle (`%c`), hollow square or hollow pyramid (needs `if-else` in the engine), Floyd's triangle, Pascal's triangle.
- Pyramids, the inverted pyramid, the number pyramid and the diamond were added on 2026-10-28.
- Each new pattern must pass the generic engine tests before it is published.
- Other C topics: `while`, `do-while`, `if-else`, arrays, functions.
- Gujarati language support.
- Exportable lesson sheets.
- A teacher dashboard and accounts (these need a privacy review first).
- Optional: a custom domain on Vercel (then update `PRODUCTION_HOST`), and the live URL in the GitHub repo's "About → Website" field.
- Optional counter ideas: show "visits today", or count per-lesson opens (more Redis keys; no personal data).
