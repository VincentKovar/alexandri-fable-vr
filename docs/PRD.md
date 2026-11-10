# Alexandria VR: Product Requirements Document

**Status:** Draft v1  |  **Date:** 2026-11-10  |  **Owner:** Vincent
**Basis:** the iteration 1 and 2 prototype (see [README](../README.md) and [iteration 2 spec](iteration-2-spec.md)) and two intended future uses.

---

## 1. Summary

Alexandria VR is a web-based 3D library you can walk into, on a desktop browser or in a VR headset (WebXR). You approach a bookcase, touch a shelf, see its covers float out in front of you, touch one, and read.

The prototype proves that interaction with 12 public-domain books in one cozy room. This PRD describes how to grow it into a reusable product with **one core and two applications**:

| | Application A: Personal library | Application B: Branded storefront |
|---|---|---|
| Who | People with an eBook collection (the "Calibre" user) | Writers and small publishers who sell books, magazines and audio on their own site |
| What they do | Browse their own collection spatially and read in the web or VR | Offer visitors a branded virtual shop: browse, sample, buy |
| Content | The user's own DRM-free files | The seller's catalog, with samples and a link to purchase |
| Core need | Import a real library; reading that is comfortable at length | Brand control; a path from browsing to checkout; works on a normal website |

Both share the same room, shelf interaction, reader and data model. The product risk is building two products. The mitigation is a strict order: shared core first (Phases 1 to 4), then the two applications (Phases 5 to 7), and a decision point in between (section 9).

## 2. Problem and opportunity

- **Digital collections are flat.** Calibre and similar tools present books as lists and grids. They are efficient but have no sense of place, and browsing is a chore rather than a pleasure.
- **Online bookshops for independent writers are generic.** A writer's site usually has a product grid and a checkout. Nothing about it feels like their world.
- **WebXR makes a shared approach possible.** The same experience can run in a headset and on a plain laptop with no install, which neither a native app nor a typical storefront template offers.

## 3. Users and use cases

**Reader-collector (Application A).** Has hundreds to thousands of eBooks, mostly in Calibre. Wants to see the collection as a room of shelves, find a book, and read it. Cares about: importing without re-tagging, privacy (their files stay theirs), comfortable reading.

**Author-seller (Application B).** Sells novels, a magazine and audio on a personal site. Wants a storefront that reflects their brand, lets visitors sample content and reach checkout. Cares about: brand control, not needing a developer, sales actually happening, and visitors on phones and laptops who will never put on a headset.

**Visitor / buyer (Application B).** Arrives from a link. Must understand what to do in seconds, without instructions.

**Core scenario (both):** *First-time viewer, with no coaching, walks to a bookcase, touches a shelf, sees covers fan out, touches one, and reads, in under 60 seconds.* This is the standing success test for every phase.

## 4. Where we are today (prototype status)

Built and verified on desktop:

- One closed cozy room (fireplace, lit window, rug, armchair, lamp) and one three-shelf bookcase.
- One interaction: touch a shelf, its books fan into a floating arc about 1 m away, touch a cover to open, touch the shelf or empty space to put them back.
- 12 books with real covers (stored locally; a generated cover is the fallback).
- A page-turning reader showing about 250 to 350 words per page, from the real opening of each book (7 to 12 pages per book).
- Desktop movement (orbit camera, FPS walk with WASD and bookcase collision). VR teleport is built and logic-tested with a simulated controller.

Not yet true:

- **Nothing is tested on a headset.** Quest 2 frame rate, teleport and legibility of text are unknown.
- **No cold-start user test** has been run.
- **Content is hard-coded** in `index.html`. There is no way to add a book without editing code.
- **Excerpts only.** No book can be read in full, and there is no bookmark or "resume".
- **12 books, one bookcase.** There is no search, no grouping, no second bookcase or room.
- **One 2,000-line file, a three.js release from 2021 (r128)**, and an unused AI Studio scaffold in `package.json`.
- Shelf labels were removed because they did not match the books. Shelf grouping needs real metadata.

## 5. Goals and non-goals

**Goals**

1. A beginner can browse and read with no instructions, on desktop and Quest 2.
2. The room is driven by data (a catalog file), not by code.
3. A real Calibre library of 300+ items can be imported and browsed at a steady frame rate.
4. Reading a full-length book is comfortable, including in VR.
5. A seller can brand the room and connect items to a purchase flow, and embed it on their own site.

**Non-goals (for now)**

- Multi-user or social presence, voice chat, user accounts across sites.
- Hosting or DRM-protecting paid content. Paid items link out to the seller's own checkout.
- Our own payment processing. No card details are ever entered in the 3D scene.
- Native apps. Web and WebXR only.
- AI features (recommendations, summaries). Possible later; out of scope here.
- Marble or Gaussian-splat backdrops (the optional iteration 2 stretch). Revisit under theming.

## 6. Product principles

1. **One interaction.** Touch a shelf, touch a cover. No extra control panels for core flows.
2. **Content is data.** The room, shelves and reader contain no book-specific code.
3. **A plain-web alternative always exists.** Every item is also reachable as ordinary HTML (accessibility, SEO for storefronts, headset-less visitors, phones).
4. **Performance is a feature.** Quest 2 budget: 72 fps, about 5 lights, one shadow caster. Every phase must stay inside it.
5. **Seller and reader data stays with its owner.** Personal libraries are processed in the browser unless the user chooses otherwise. Analytics, if any, are privacy-light and disclosed.
6. **Leave work in a shippable state.** Each phase ends with something that works, so the project can stop at any phase boundary.

## 7. Requirements by capability

Priority: **P0** = required for the phase that introduces it, **P1** = should have, **P2** = later.

### 7.1 Catalog and data model (core)

- **P0** A catalog file (JSON) describes every item: id, type (`book`, `magazine`, `audio`), title, creators, cover image, description, tags/collections, language, date, formats, and links (read, sample, buy).
- **P0** The scene is built entirely from the catalog. Hard-coded Gutenberg data moves to a sample catalog.
- **P0** A missing cover falls back to a generated cover (keeps today's behaviour).
- **P1** Collections and tags drive shelf grouping and shelf labels. Labels appear only when derived from real metadata.
- **P1** A schema with validation and clear error messages when an item is malformed.
- **P2** Catalog from a remote source (URL, feed or content server) instead of a static file.

### 7.2 Room, shelves and browsing (core)

- **P0** Keep the one-touch shelf interaction as the default for any number of items.
- **P0** Shelf sections hold a set of items (today four fan out per shelf). Define behaviour when a section holds more than fits in the arc (paging inside the arc, with a clear next/previous affordance).
- **P1** Multiple bookcases and a larger or second room, with an overview of where things are.
- **P1** Search and filter (title, author, tag) that highlights or gathers matching items on a shelf. Needs a non-VR text input plus a VR-friendly alternative (virtual keyboard or voice, to be validated on device).
- **P1** Sort orders (author, title, recent).
- **P2** Rooms or moods as selectable themes (see 7.6).

### 7.3 Reader (core)

- **P0** Real pagination of full-length text that fills each page (today's runtime paginator is the starting point).
- **P0** Resume where you left off and bookmarks, stored locally.
- **P0** Reading comfort: adjustable text size, higher-resolution page text for VR (today's 768 by 1024 canvas at 19 px is likely too soft in a headset and must be tested), chapter navigation.
- **P1** EPUB support for DRM-free files (spine, chapters, basic styling, images). PDF is out of scope initially.
- **P1** Night mode and a distraction-free mode.
- **P2** Highlights and notes.

### 7.4 Navigation and platform (core)

- **P0** Desktop: orbit and FPS walk (done). Pointer-lock failures never leave the app in a stuck state (done).
- **P0** VR: teleport with arc and landing marker (built, untested on device). Verify thumbstick mapping and comfort on Quest 2.
- **P1** Phone and tablet: touch controls, a 3D view that works without WebXR, and the plain-HTML alternative (principle 3).
- **P1** Keyboard-only and screen-reader access through the HTML catalog view.
- **P2** Snap-turn and seated-mode options in VR.

### 7.5 Application A: personal library (Calibre-like)

- **P0** Import path from a Calibre library: a script or page that reads Calibre's `metadata.db` (SQLite) and the per-book folders (covers and files) and produces a catalog plus assets. A one-time export is the first step.
- **P1** In-browser import by dropping a library folder or an OPDS feed, with files kept on the user's device (IndexedDB). Browser support for folder access differs, and Quest browser support must be checked before promising this in VR.
- **P1** Calibre content-server or OPDS connection for live libraries.
- **P1** Series, authors and Calibre tags map to shelves and collections.
- **P2** Reading position sync across devices (needs an account or the user's own storage; decide separately).
- **Constraints:** DRM-protected files are not supported. Files are never uploaded without the user's explicit action.

### 7.6 Application B: branded storefront

- **P0** Item types beyond books: magazines (issue covers, issue lists) and audio (cover plus sample player).
- **P0** Item detail view reached from a cover: description, price, format, "Read a sample", "Listen to a sample", "Buy". Buy opens the seller's hosted checkout (their payment page or product link) in a new tab, or, in VR, shows a QR or link to continue on another device. No payment details are collected in the scene.
- **P0** Sample reading and sample audio, with the seller choosing what is free.
- **P0** Theming without code: logo, brand colours, signage text, wall and floor materials, lighting mood, a few room templates (cozy library, modern gallery, bookshop). Driven by a theme file.
- **P0** Embeddable on a seller's site (script or iframe) with a configurable entry experience and a link back to the seller's pages.
- **P1** The plain-HTML catalog is generated from the same data (shoppers who skip 3D, accessibility, search engines).
- **P1** Simple analytics for the seller (views, opens, sample reads, buy clicks), privacy-light and disclosed.
- **P1** Promotions: "new" or "featured" shelf, a featured item on the table.
- **P2** Bundles, discount codes, pre-order, subscription issues.
- **Constraints:** the product does not host or protect paid files in the first release. Paid content stays on the seller's own system.

### 7.7 Non-functional requirements

- **Performance:** 72 fps on Quest 2 (OVR Metrics), and 60 fps on a mid-range laptop. Scale to 1,000+ items by instancing, virtualising shelves that are out of view and loading cover textures on demand (small, compressed textures, a size cap per cover).
- **Load time:** the room is usable in under 5 seconds on broadband, with covers loading progressively.
- **Compatibility:** current Chrome, Edge, Safari and Firefox for the 3D view; Quest Browser for VR. Where WebXR is missing, the 3D view still works.
- **Accessibility:** readable contrast, text size control, keyboard access, reduced-motion setting, comfortable VR defaults (teleport, vignette-free, no forced rotation).
- **Privacy and security:** no tracking by default; personal libraries stay on device unless the user acts; seller embeds are sandboxed; no third-party scripts beyond pinned, versioned CDN or bundled libraries.
- **Maintainability:** split the single file into modules with a build step; unit tests for catalog parsing, pagination and import; one smoke test that loads the room and opens a book.

## 8. Technical direction

These are recommendations, not decisions, and each is confirmed in the phase that needs it.

- **Structure:** move from one `index.html` to a small TypeScript project built with Vite (the repo already has a Vite config, currently unused). Keep the output a static site that can be hosted anywhere or embedded.
- **three.js version:** upgrade from r128 once, early (Phase 1), with a regression pass on the room, fan interaction and teleport. Newer releases have better WebXR support, texture compression and instancing tooling.
- **Text rendering:** evaluate an SDF text renderer or high-resolution page textures for VR legibility before building full-length reading on the current approach.
- **Catalog format:** one JSON schema shared by the importer, the scene, the HTML alternative and the storefront. A Calibre export is just one producer of this format.
- **Covers and assets:** generate thumbnails at import time (for example 256 px, JPEG or WebP, optionally KTX2) so a 1,000-item library does not load full-size images.
- **Commerce:** hand off to the seller's own checkout (Stripe Payment Links, Shopify, Gumroad, Ko-fi, or their own page). The catalog stores the link per item.
- **Hosting:** Application A can run entirely client-side. Application B is a static bundle plus theme and catalog files; later, an optional hosted service can generate them from a dashboard.

## 9. Phased roadmap

Each phase is independently useful and ends at a **stop point** where the repo works and is committed. Sizes are relative: **S** about one focused session, **M** two to four, **L** five or more.

### Phase 0: Prove the prototype on real hardware (S)

*Why first:* nearly every later decision (text size, scene budget, teleport feel) depends on facts we do not have yet.

- Run the 7 iteration 2 acceptance tests that need a person or headset: Quest teleport to each bookcase and open a book (5), cold-start stranger under 60 seconds (6), 72 fps on Quest 2 (7).
- Check page text legibility in the headset at today's resolution.
- Replace the `package.json` AI Studio scaffold with a minimal, honest one; remove unused config.
- **Exit:** a short test report with measured fps, a legibility verdict, and a list of fixes. **Stop point:** the prototype is a trusted baseline.

### Phase 1: Data-driven room (M)

- Catalog JSON and schema (7.1). The 12 Gutenberg books become the sample catalog.
- Build shelves from the catalog; remove hard-coded book data and the duplicated copy in `src/library`.
- Split into modules with Vite; upgrade three.js with regression checks; add the smoke test.
- Add items to the catalog and see them appear, with no code change.
- **Exit:** adding, removing or reordering a book is a data edit. **Stop point:** a clean foundation; the product still looks the same to a visitor.

### Phase 2: Real reading (M to L)

- Full-length text and chapter navigation; resume and bookmarks; text size control.
- High-resolution or SDF page text, tuned on the headset.
- EPUB import for DRM-free files (can be split into its own chunk if time is short; plain-text books alone already improve the sample a lot).
- **Exit:** a complete public-domain novel can be read start to finish, in VR, comfortably. **Stop point:** the project is a credible reading demo, shareable on its own.

### Phase 3: Calibre import (M)

- Exporter from a Calibre library folder to catalog plus assets (7.5), with thumbnails.
- Map authors, series and tags to collections and shelves; shelf labels return from real metadata.
- Document the workflow for a non-developer.
- **Exit:** a real personal library appears as a room. **Stop point:** Application A has a usable first version.

### Phase 4: Scale and browse (L)

- Multiple shelf sections, bookcases and a second room; paging inside the fan arc.
- Search, filter and sort, with a VR-friendly input method.
- Instancing and virtualisation so 300 then 1,000+ items hold the frame-rate budget; on-demand cover loading.
- The plain-HTML catalog view (principle 3), also needed by Phase 5.
- **Exit:** a 500-item library holds 72 fps on Quest 2 and is searchable. **Stop point:** the shared core is complete.

> **Decision point (after Phase 4):** pick the track to build first. Choose Application A (finish personal-library features: live Calibre connection, sync) or Application B (Phases 5 to 7). They need different effort and different audiences; doing both at once would split attention. This is also the right moment for a few conversations with real writers.

### Phase 5: Storefront foundation (M to L)

- Item types for magazines and audio; item detail view with price and actions (7.6).
- Sample reading and sample audio.
- Buy hand-off to the seller's checkout, including a VR-friendly continuation path (QR or link).
- **Exit:** a sample seller catalog with a book, a magazine and an audio item can be browsed, sampled, and lead to a checkout page. **Stop point:** a demo that can be shown to a prospective seller.

### Phase 6: Branding and embedding (M)

- Theme file (logo, colours, signage, materials, lighting) and 2 to 3 room templates.
- Embed on an external site (script or iframe) and generate the HTML catalog from the same data.
- Seller setup guide: files to edit, how to publish.
- **Exit:** a seller with no developer can brand the room and place it on their site. **Stop point:** a pilot-ready product.

### Phase 7: Pilot and polish (M)

- Pilot with 1 to 3 writers; collect what blocked them.
- Seller analytics (privacy-light), promotions and featured shelf.
- Accessibility pass, onboarding, error states, documentation.
- **Exit:** at least one real seller live, with measured buy-click through. **Stop point:** version 1.0 candidate.

### Later (not scheduled)

Reading sync across devices, highlights and notes, discount codes and bundles, hosted dashboard that generates catalog and theme, a Marble or Gaussian-splat backdrop, multi-user visits.

### Suggested pacing for start-and-stop work

- **Smallest useful commitments:** Phase 0 (a weekend), the first half of Phase 1, and the plain-text part of Phase 2 each stand alone.
- **Bigger milestones that deserve a clear stretch of time:** Phase 4 (scale) and Phase 5 (storefront).
- Within a phase, work in chunks that each end in a commit and leave the app working, as in iteration 2.

## 10. Success metrics

| Area | Metric | Target |
|---|---|---|
| Usability | Cold-start stranger: shelf, cover, reading | Under 60 seconds, no hints |
| Performance | Quest 2 frame rate with a 500-item library | 72 fps sustained |
| Reading | Time reading a full book in VR before discomfort (informal test) | 20+ minutes |
| Import (A) | Calibre library of 500 books imported and browsable | Under 10 minutes, no manual edits |
| Storefront (B) | Seller sets up a branded room from the guide | Under 1 day, no developer |
| Storefront (B) | Visitors who open an item detail go on to the checkout link | Baseline set in the pilot |
| Quality | Smoke test and unit tests pass on every commit | 100% |

## 11. Risks and open questions

| Risk or question | Why it matters | Mitigation or next step |
|---|---|---|
| Text is hard to read in a headset | Reading is the product's point | Test in Phase 0; evaluate SDF or higher-resolution textures before Phase 2 |
| Quest 2 frame rate at 1,000 items | The room is the product | Instancing, virtualised shelves, small textures; measure each phase |
| Quest browser lacks folder access or file APIs | In-browser import may not work in VR | Start with an offline export (Phase 3); verify device support before promising in-browser import |
| Two audiences pull in different directions | Splits effort | Shared core first; explicit decision point after Phase 4 |
| DRM-protected eBooks | Many users' libraries contain them | Explicitly unsupported; say so up front |
| Cover and book rights | Sellers and readers bring their own; sample content comes from Project Gutenberg | Check Gutenberg's terms and cover-art licence before any public launch; sellers are responsible for rights to their own covers and files |
| Checkout inside VR | Typing card details in a headset is poor UX and a trust problem | Hand off to the seller's checkout, never collect payment details in-scene |
| Visitors without headsets are the majority | A VR-only store would lose sales | 3D on the web and the plain-HTML view are first-class |
| Safari and iOS lack WebXR | Some visitors cannot enter VR | 3D desktop and mobile view works without WebXR |
| Seller needs a pricing model for this product | Not decided | Out of scope for this PRD; revisit at the Phase 5 to 6 boundary |
| Who hosts and maintains seller setups | Static bundle vs hosted service | Start with a static bundle and a guide; consider a hosted generator after the pilot |
| Single-file codebase | Slows every phase | Split in Phase 1 |

**Open questions for the owner**

1. After Phase 4, which application first: personal library or storefront?
2. Are there writers you can recruit now for early feedback (especially before Phase 5)?
3. Is the project open source, a product, or both? (Affects the licence, hosting and the Gutenberg and cover-art terms.)
4. Do you have a Quest 3 or Quest 2? (Phase 0 targets Quest 2; a different device changes the budget.)

## 12. Assumptions made in this draft

- The 60-second first-use test and the 72 fps Quest 2 target from the iteration 2 spec remain the standing success criteria.
- "Magazine" means periodical issues with covers and an issue list, not a new reader mode.
- Audio in the storefront means samples and purchase links, not a full audio player or hosting.
- Phase sizes are estimates for a single developer working with Claude Code; they have not been validated.
