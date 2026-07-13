# Wedding Invitation Website

A single-page vertical-scroll wedding invitation. Plain HTML + CSS + vanilla JS, bundled with
[Vite](https://vitejs.dev/). The output is a fully static site hosted on Cloudflare Pages.

## Prerequisites

- **Node.js 20+** — download the LTS installer from <https://nodejs.org/> (on Windows just run
  the `.msi` and keep the defaults). Verify with `node -v` in a new terminal.

## Development

```bash
npm install        # once, installs dev tools (Vite, sharp)
npm run dev        # starts a local dev server with hot reload
```

Vite prints a local URL (usually `http://localhost:5173`). To open the site on your phone,
run `npm run dev -- --host` and use the "Network" URL it prints (phone must be on the same
Wi-Fi; Windows Defender Firewall may ask to allow Node — accept for private networks).

## Production build

```bash
npm run build      # writes the static site to dist/
npm run preview    # serves dist/ locally to check the real build
```

## Images

Source photos live in `materials/files/` as large PNG exports (not committed to git). They
are converted once into small WebP files in `src/assets/images/` (committed) with:

```bash
npm run optimize-images
```

Re-run it only if a source photo in `materials/` changes.

## Deploying to Cloudflare Pages

1. Push this repository to GitHub (or GitLab).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick
   the repository.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Framework preset: *None* (or *Vite* — same result).
4. Save and deploy. Every push to the main branch redeploys automatically.

### Custom domain

In the Pages project: **Custom domains → Set up a custom domain**, enter the domain and
follow the DNS instructions (if the domain is already on Cloudflare, it's one click; if not,
add the CNAME record it shows at your registrar).

## Pre-launch checklist

- [ ] Replace the organizer contact link in `index.html` (search for
  `TODO: replace placeholder organizer contact link`).
- [ ] After attaching the custom domain, set the absolute `og:image` URL in
  `index.html` (search for `TODO: replace og:image`).
- [ ] Delete the test rows from the Google Form responses (rows named
  «тест сайта — эту строку можно удалить»).
  Note: `scripts/test-rsvp.mjs` submits one such real test row per run.

## Windows caveats

- Use a regular terminal (PowerShell or cmd) — no WSL needed; everything here is
  cross-platform.
- If `npm install` complains about `sharp`, make sure you're on Node 20+ (`node -v`).
  `sharp` is only needed for the image script, never during the Cloudflare build.
