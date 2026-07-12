# Wedding Invitation Website

## Project context

A single-page vertical-scroll wedding invitation website. The design is finalized and provided
as reference screenshots. The design is deliberately unconventional: text is intentionally NOT
aligned to a grid, elements sit at irregular positions. This is the intended style — reproduce
the references as precisely as possible. Do not "fix", normalize, or center things that look
off-grid in the reference. Pixel-faithfulness to the references is the top priority.

The project owner is a developer from a different IT field with limited web experience.
Explain key decisions briefly and in plain language.

## Materials

```
materials/
├── references/       # Design reference screenshots. THE SOURCE OF TRUTH for layout.
│                     # opening_slide.png — splash screen
│                     # slide1.png ... slide8.png — main page sections, in order
│                     # heart.png — reference for the interactive connect-the-dots heart
├── files/
│   ├── slide1/       # image assets for section 1
│   ├── slide2/       # ...
│   └── ...
├── fonts/            # Helvetica CY — the single font used everywhere
├── audio/            # track.mp3 — background music
└── content.md        # ALL site copy, colors, Yandex Maps iframe, Google Form IDs
```

Always take copy from `content.md`. Never invent text. If copy for a section is missing, ask.

**Asset usage is not mandatory.** The owner exported many assets, including trivial ones
(black/orange circles, square backing shapes behind photos). If a plain CSS shape is simpler
and visually identical, use CSS instead of an image file. Use image assets for photos and
anything with real detail.

**Photos are provided in two variants.** Where relevant, each photo exists as a plain export
and as a pre-rounded one with a `_rounded` suffix (e.g. `couple_image1.png` and
`couple_image1_rounded.png`). The rounded ones have a 7px corner radius baked in (from Figma).

**Prefer the plain (non-`_rounded`) version and apply `border-radius: 7px` in CSS.** It keeps
the assets compressible (no alpha channel required, so WebP/JPEG compress much better) and
keeps the radius adjustable. Fall back to the `_rounded` file only if a CSS radius genuinely
can't reproduce the design in some specific spot. Never do both — that would double-round.

## Design tokens

```
--beige:  #F1E5CF
--orange: #F55B29
--black:  #000000
--muted:  #C7BEAD   /* unchecked radio button in the RSVP form */
```

Font: **Helvetica CY** (in `materials/fonts/`). Load it via `@font-face`, use it everywhere.
Include a sensible fallback stack.

## Tech stack

- Plain HTML + CSS + vanilla JS. No React/Vue, no heavy libraries.
- Vite (vanilla template) as dev server and bundler.
- Output is a fully static site (`dist/`). Hosting: Cloudflare Pages.
- Dev machine is Windows 10, hosting is Linux. **Priority is a great site, not cross-platform
  purity.** Prefer cross-platform tooling where it's free, but if something works better on a
  Linux-oriented setup, take it. The build MUST work on the hosting provider's Linux CI.

## Page structure

### Splash screen (`opening_slide.png`)
Styled as an mp3 player / audio file. Copy: "нажмите на mp3, чтобы открыть приглашение",
file label "2026_свадьба симы и жени.mp3". On tap/click anywhere:
- start background music,
- smoothly transition into the main page.

### Main page — a single continuous vertical scroll (sections 1–8)

**Important:** these are called "slides" only for convenience. It is ONE long scrolling page,
not a slideshow. There is no snap-scrolling and no fixed viewport height per section.

- **Sections 1–6 do not overlap.** Each reference screenshot shows exactly the content that
  fits one phone screen. `slide1.png` ends exactly where `slide2.png` begins. Do not invent
  any content, spacing, or transitions between them.
- **`slide7.png` and `slide8.png` DO overlap.** Section 7 (the RSVP form) is taller than one
  phone screen, so its reference is a longer screenshot. `slide8.png` re-captures the bottom
  of section 7 in order to show the transition into section 8. Do not duplicate that
  overlapping content — it is the same content shown twice.

Section contents (details in `content.md`):
1. Title screen — "все начинается с точки", names, date.
2. Table of contents — anchor links to sections 3–7.
3. Timeline ("тайминг").
4. Location — Yandex Maps embed + "открыть карту" button.
5. Details ("детали торжества") — gifts, flowers, contacts.
6. Dress code.
7. **Guest brief / RSVP form.**
8. Closing — "с любовью, Сима и Женя!" + the interactive heart + countdown timer.

## Feature specs

### Table of contents (section 2)
Each item is an anchor link that smooth-scrolls to its section.

### Yandex Maps (section 4)
`content.md` contains the raw embed copied from Yandex Maps. **It needs fixing:** as-is, it
opens the business info card, which covers the map, and the zoom level is poor.
Rebuild the iframe URL keeping only the coordinates, a point marker, and a suitable zoom —
drop `mode=search`, `oid`, `ol=biz`, and the `sctx` blob, which are what force the info card.
Use the `pt` (point) parameter to place a marker instead. Verify the result renders a clean
map with a visible marker and no overlay card. Make the iframe responsive (full container
width, fixed aspect ratio) — the hardcoded 560×400 will not work on mobile.

Below it, the "открыть карту" button links to the short URL in `content.md` (opens the Yandex
Maps app on mobile).

### RSVP form (section 7)
Custom-built form matching the design. Fields (Google Form entry IDs in `content.md`):
full name (text), attendance (radio), drink preference, hot dish preference (radio).
Field labels and option values are exactly the lowercase strings in `content.md`.

Submit via POST to the Google Form `formResponse` endpoint (`no-cors` fetch or a hidden
iframe target) so the user never leaves the site. Show a thank-you state on success and a
clear error state on failure. Client-side validation before submitting.

Unchecked radio buttons use `--muted` (#C7BEAD); checked ones follow the reference design.

### Interactive heart (reference: `files/heart_game.png`)
- Numbered dots on screen. The user connects them **strictly in order**: 1→2→3→…→N→1,
  closing the loop back to dot 1.
- Tapping the correct next dot draws a line from the previous one. Tapping any other dot does
  nothing. Subtly highlight the next expected dot as a hint.
- When the loop closes: the heart outline completes and a fill animates in (CSS transition),
  plus a small celebratory touch.
- SVG + vanilla JS. **Touch events are mandatory** — this is a mobile-first site.

### Countdown timer (section 8)
Counts down to `2026-08-08T15:00:00+03:00`. The timezone offset must be hardcoded — do NOT
derive the deadline from the visitor's local timezone.

The visual design of the timer is in the reference — follow it exactly (layout, units,
labels, digit styling). Do not invent your own timer UI.

Once the deadline passes, the timer simply displays zeros. Do not swap in a message, do not
hide it, do not count upward.

### Background music (`materials/audio/track.mp3`)
- Do NOT load on page load. Load and start it on the splash-screen click (which also satisfies
  browser autoplay policies).
- Looped playback.
- A mute/unmute button (present in the design) with a clear visual state.
- The source file is ~8.5 MB. Re-encode to ~128 kbps (ffmpeg) targeting 2–3 MB.

### Back-to-top button
Floating button at the bottom of the viewport. Not in the references — design it minimally,
in the site's visual language. Smooth-scrolls to the table of contents (section 2).
Only appears once the user has scrolled past the first screen.

## Animations

- Fade-in (plus a slight upward drift) as elements scroll into view.
  Implement with Intersection Observer + CSS classes. No libraries.
- Each element animates once, on first appearance.
- Respect `prefers-reduced-motion`: skip animations, show content immediately.

## Responsive behavior

- Mobile-first. The design is a phone layout.
- The content column has a fixed max width (matching the reference width) and is centered.
- On wider screens, the margins to the left and right are filled with that section's own
  background color, so no section ever looks cut off.
- Test at 320 / 375 / 768 / 1280 / 1920 px.

## Performance

- Optimize images (WebP with fallback where useful). `loading="lazy"` below the fold.
- Target Lighthouse mobile performance 90+.

## README.md

Maintain a README.md covering: Node.js install, `npm install`, `npm run dev`, `npm run build`,
previewing the build locally, deploying to Cloudflare Pages (connect git repo, build command,
output directory), and attaching a custom domain. Note any Windows-specific caveats.

## Working rules

- Outline a short plan before any substantial change, then write code.
- Small, meaningful commits. Commit messages in English.
- **Stop after each section** so the owner can compare the result against the reference.
- Do not add features that are not in this file without asking first.