# Alexandria VR

A cozy, walkable 3D library you can enter on desktop or in a VR headset (WebXR). Walk to the bookcase, touch a shelf, see its covers float out in front of you, touch a cover, and read. Built with Three.js r128 and GSAP; no build step is needed to run it.

## Goals

**Goal:** a first-time viewer, with no coaching, walks to a bookcase, touches a shelf, sees covers fan out into a floating display, touches one, and reads, in **under 60 seconds**, on desktop and on Quest 2.

**Current scope:** one cozy room, one interaction flow, 12 Project Gutenberg books with real covers, VR teleport.
**Out of scope (iteration 3):** Calibre export, 300+ books, multiple bookcases, search, full-length reading, multiple rooms or moods.

The full iteration 2 spec is in [docs/iteration-2-spec.md](docs/iteration-2-spec.md).

## Run it locally

The page is a single `index.html`. It loads Three.js and GSAP from CDNs, so it needs an internet connection.

**Serve it over HTTP.** The covers are loaded as WebGL textures from `covers/`, which browsers generally block or fail to resolve when the page is opened straight from disk (`file://`). In that case the generated fallback covers appear instead. All testing of the real covers was done over HTTP.

```bash
# Option A: any static server
python3 -m http.server 8000
# then open http://localhost:8000
```

```bash
# Option B: the project's Vite setup
npm install
npm run dev
# then open http://localhost:3000
```

`npm install` previously failed with a peer-dependency conflict (`esbuild ^0.25` vs Vite 8). The pin is now `^0.28.0`. With that change, install, the dev server, `npx tsc --noEmit` and the unit tests all worked in a clean copy of the repo.

Unit tests (data and pagination logic only, not the 3D scene):

```bash
npx tsx --test src/library/reader-logic.test.ts
```

## Controls

| | Desktop | VR (Quest) |
|---|---|---|
| Move | Orbit Cam (drag to orbit), or FPS Walk with WASD | Push a thumbstick forward to aim, release to teleport |
| Touch a shelf | Click it: its books float into an arc in front of you | Trigger |
| Open a book | Click a floating cover | Trigger on a cover |
| Put books back | Click the shelf again, or empty space | Same |

## Project layout

```
index.html              the whole app (scene, room, interaction, reader, VR)
covers/<gutenbergId>.jpg  local cover art (gutenberg.org sends no CORS headers)
images/                 style reference photos (not used in the scene)
docs/                   iteration specs
src/library/            typed, unit-tested book data + pagination logic (mirror of
                        the data in index.html; index.html does not import it)
```

## Iteration 2: requirement status

| Req | What | Status |
|---|---|---|
| R1 | One interaction: touch shelf, books float into an arc, touch cover to read | Done, verified on desktop |
| R2 | Real covers with generated fallback | Done, 12 of 12 verified over HTTP |
| R3 | Cozy room | Done, verified on desktop. World Labs Marble backdrop (stretch) not attempted |
| R4 | Remove atmosphere presets | Done |
| R5 | Fix plaques | Superseded: the shelf labels were removed entirely (they did not match the books on each shelf) |
| R6 | VR teleport | Built, logic tested on desktop with a simulated controller. **Not tested on a headset** |
| R7 | Housekeeping | Done (this commit) |

## Acceptance tests (run 2026-11-10)

| # | Test | Result |
|---|---|---|
| 1 | 360° from spawn never shows a black void | **Pass.** 36 views (12 headings × 3 pitches): at most 0.9% near-black pixels in any view |
| 2 | Plaque labels fully readable | **No longer applies.** Labels removed after iteration 2 (see below) |
| 3 | At least 10 of 12 image covers | **Pass.** 12 of 12 |
| 4 | Shelf, then cover, then open in two actions | **Pass.** Two real clicks opened a book; no extra buttons |
| 5 | Teleport to each bookcase and open a book in a Quest browser | **Not run.** Needs a headset |
| 6 | Cold-start stranger completes the flow in under 60 s | **Not run.** Needs a person |
| 7 | 72 fps on Quest 2 (OVR Metrics) | **Not run.** Needs a headset. Desktop frame: 123 draw calls, 5 lights, 1 shadow-casting light |

## Iteration log

### Iteration 1: rated 1.5 / 5

Root causes found in review: redundant shelf controls, atmosphere presets that only changed light and fog colors, clipped plaque labels, text-only covers, mostly black space (no background, no front wall, near-black ceiling), and no way to move in VR.

### Iteration 2 (2026-11-10): make the room real, simplify the interaction

Built in the spec's order, one commit per step: plaques and presets, interaction, covers, room, VR teleport, housekeeping.

**What was cut, and why**

- **Atmosphere presets and dock row (R4).** They changed only colors, so they did not make anything feel different. One finished room replaces them. Also removed from `src/library/reader-logic.ts` and its test.
- **Dock shelf buttons and `data-tier` handlers (R1).** Touching a shelf is now the only way to select it.
- **Auto-fan of the top shelf at startup.** The room now opens with every book at rest.
- **Moonlight directional light and the desk lamp's shadow cube map (R3).** To stay at five lights with one shadow caster for Quest 2. The window is an emissive dusk view instead.
- **The old 11 × 16 m room with a 5.2 m ceiling (R3).** Replaced by an 8 × 7.8 m closed room with a 3.4 m ceiling.
- **React scaffold (R7).** `src/App.tsx`, `src/main.tsx` and `src/index.css` were empty stubs that nothing referenced, so they were deleted.
- **`.aistudio/` screenshots (R7).** Removed, and `.aistudio/` is now in `.gitignore`.
- **Not built:** the World Labs Marble backdrop (optional stretch) and VR snap-turn (you can turn physically).

**Decisions and deviations from the spec**

- **Covers are stored locally (R2).** gutenberg.org sends no `Access-Control-Allow-Origin` header, so its images cannot be used as WebGL textures. This is the spec's fallback. The generated leather cover is still the placeholder and the fallback.
- **Books widened from 0.24 m to 0.28 m.** Gutenberg covers are about 0.65–0.72 wide-to-tall; the old book face (0.57) forced cropping that cut off titles.
- **The fan arc adapts to the screen.** It starts about 1 m from the viewer and backs off up to 1.6 m so all four covers fit within 80% of the horizontal field of view without overlapping.
- **Click versus drag.** A drag that ends in a click no longer counts as a click, so orbiting does not collapse the fan.
- **Brass is not metallic.** With no environment map, metallic materials rendered black, so brass uses low metalness.
- **The camera is clamped inside the room on desktop,** since the room is now smaller. In VR, teleport targets are limited to floor space in front of the bookcase and clear of furniture.
- **Dependency fix.** `esbuild` bumped to `^0.28.0` in `package.json` so `npm install` works.

**Fixes after first hands-on use (2026-11-10)**

- **FPS Walk could get stuck.** The mode switched on before the browser granted mouse lock, and a failed lock left clicks forced to the screen centre (so only the centre shelf and Dracula could be picked). The mode now turns on only after the lock succeeds. Where mouse lock is unavailable (embedded browsers, some iframes) it falls back to drag-to-look with a normal pointer.
- **Walk speed.** Movement was tied to frame rate (about 17 m/s on a fast display). It is now 2.4 m/s at any frame rate.
- **Walking into the bookcase.** The desktop camera can no longer pass through the bookcase.
- **Reader drop cap.** The drop cap no longer overlaps the third line, and a chapter heading is drawn as a heading instead of receiving the drop cap. Pages that open with a date or number (Dracula) get no drop cap.

**Changes after the prototype review (2026-11-10)**

- **Shelf labels removed.** "Victorian Novels", "Gothic & Speculative" and "World Classics" did not describe the books on those shelves, so the plaques are gone. Shelf grouping returns in a later phase, driven by real metadata (see `docs/PRD.md`).
- **Fuller pages.** Each page held about one paragraph (about 60 words). Each book now carries about 2,000 to 3,300 words of its real opening from Project Gutenberg (`books/excerpts.js`), paginated at runtime to fill each page (about 250 to 350 words). If that file is missing the old short pages are used.

**Known issues and open items**

- **Excerpts, not full books.** Each book is an opening excerpt of 7 to 12 pages. Full-length reading is a later phase.

- **Quest 2 is untested:** frame rate, teleport on device (the thumbstick is assumed to be `axes[2]`/`axes[3]`), and how the arc line looks in the headset.
- **Blank first load:** the iteration 1 screenshot `r1-desktop.png` showed an empty canvas. It could not be reproduced in this iteration (every load rendered); the screenshot is gone with `.aistudio/`. Worth checking on a clean browser profile.
- **`images/NY-rose-readingroom.png` is still an empty file** and needs re-uploading. The reference photos are style guidance only and are not used in the scene.
- **`package.json` is still the AI Studio scaffold** (name `react-example`; React, Tailwind, Express and `@google/genai` dependencies). `index.html` uses none of them. `.env.example`, `metadata.json` and `vite.config.ts` also carry AI Studio and Gemini text. Pruning these would be a good small cleanup.
- **`src/library/reader-logic.ts` is not used by `index.html`.** It is a typed copy of the book data, kept because it has unit tests.
- **Cover art:** the covers come from Project Gutenberg's generated cover pages. Check their terms before publishing the project publicly.
