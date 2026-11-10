# Alexandria VR: Iteration 2 Spec

**Status:** Draft for Claude Code  |  **Date:** 2026-11-10  |  **Owner:** Vincent
**Theme:** Make the room real, simplify the interaction.

*(Original spec, kept verbatim. See the README for what was built and the iteration log.)*

## 1. Why this iteration

Iteration 1 was rated 1.5 out of 5. Root causes, traced to the code in `index.html`:

| Problem | Cause |
|---|---|
| Shelf control feels unnecessary | Clicking a book already activates its shelf and then opens the book. The dock adds three more shelf buttons. The "fan" is a 0.38 m slide, not a floating display. |
| Atmosphere does nothing | Presets change only light colors and fog color. Room, wallpaper and props never change. Fog density 0.03 to 0.04 gives roughly 4 to 6 percent haze at 6 m. |
| Plaque labels clipped | Plaque canvas is 256 px wide with fixed 20 px text. "II. GOTHIC & SPECULATIVE" overflows. |
| Covers are text only | `generateBookCover` draws text on a canvas. `coverUrl` values in `src/library/reader-logic.ts` are never loaded. |
| Mostly black space | No `scene.background`, no front wall, near-black ceiling, one 4.2 m bookcase in an 11 m room. |
| Cannot walk in VR (found in review) | WASD only works on desktop. No teleport or thumbstick code exists for a headset. |

## 2. Goal and success measure

A first-time viewer, with no coaching, walks to a bookcase, touches a shelf, sees covers fan out into a floating display, touches one, and reads, in **under 60 seconds**, on desktop and on Quest 2.

## 3. Scope

**In scope:** one cozy room, one interaction flow, real covers, VR teleport, plaque fix.
**Out of scope (iteration 3):** Calibre export, 300+ books, multiple bookcases, search, full-length reading, multiple rooms or moods.

## 4. Requirements

**R1. One interaction.**
- Remove the dock shelf buttons and the `data-tier` handlers.
- Touching a shelf section moves its books into a floating arc about 1 m in front of the viewer, covers facing the viewer, each large enough to read the title.
- Touching a cover opens the reader. Touching the shelf again, or empty space, returns the books.
- A book click must no longer trigger a separate shelf activation.
- Code to change: `activateShelfTier`, `selectAndOpenBook`, `onPointerClick`, `handleXRTriggerSelect`.

**R2. Real covers.**
- Load each book's `coverUrl` (Project Gutenberg cover image) as the front-cover texture.
- Fall back to the generated cover when the image is missing or fails to load.
- Risk: gutenberg.org may block cross-origin texture loading. If it does, download the covers into `/covers/` in the repo and reference them locally.

**R3. A real cozy room.**
- Set `scene.background` and add a front wall so no direction shows empty black.
- Lower the ceiling toward 3 to 3.5 m. Lighten wall and ceiling colors.
- Add warm cozy elements: rug, fireplace with flickering light, lit window, reading lamp, armchair.
- Reference images are in `/images/`. Style reference only, unless the photo is the owner's own. Optional stretch: a World Labs Marble backdrop (500K splats) beyond the shelves.

**R4. Remove atmosphere presets.**
- Delete the four presets and the Atmosphere dock row. One finished room replaces them.

**R5. Fix plaques.**
- Measure the text with `measureText` and shrink the font, or widen the canvas, so the longest label fits with margin.

**R6. VR locomotion.**
- Add controller teleport (arc plus landing marker) or thumbstick smooth movement with a comfort vignette. Teleport is preferred.
- Desktop keeps Orbit and WASD.

**R7. Housekeeping.**
- Delete the unused React scaffold (`src/App.tsx`, `src/main.tsx`, `index.css`) or document why it stays.
- Add a README with goals, this spec, and an iteration log (what was cut and why).
- Remove `.aistudio/` screenshots from the repo.

## 5. Acceptance tests

1. From the spawn point, turning 360 degrees never shows an empty black void.
2. All plaque labels are fully readable.
3. At least 10 of 12 books show an image cover.
4. Shelf touch then cover touch then open takes two actions, with no extra buttons.
5. In a Quest browser, the user can teleport to each bookcase and open a book.
6. A cold-start stranger completes the flow in under 60 seconds (watch one person, no hints).
7. Frame rate holds at 72 fps on Quest 2, measured with OVR Metrics.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Gutenberg cover CORS blocks | Save covers locally |
| Quest 2 frame rate with the new room | Keep lights few, limit shadow-casting lights to one, test early |
| Two reference images are empty files | Re-upload `NY-rose-readingroom.png` and `chabon-sample-image.jpeg` |
| Blank first load seen in `r1-desktop.png` | Check the CDN scripts load on a clean browser profile |

## 7. Suggested build order for Claude Code

1. R5 and R4 (small, quick wins), commit.
2. R1 (interaction), commit.
3. R2 (covers), commit.
4. R3 (room), commit after a Quest 2 frame-rate check.
5. R6 (VR teleport), test on headset.
6. R7 (housekeeping and README), then run the acceptance tests.

Commit after each step so any change can be rolled back.
