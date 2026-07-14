# Wedding Invitation Website

A single-page vertical-scroll wedding invitation. Plain HTML + CSS + vanilla JS, bundled with
[Vite](https://vitejs.dev/). The output is a fully static site hosted on GitHub Pages.

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

## Deploying to GitHub Pages

The site auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`): every push to
`main` runs `npm run build` and publishes `dist/` to GitHub Pages. One-time setup:

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main` — the workflow builds and deploys automatically. The Actions tab shows
   progress; the live URL appears in **Settings → Pages**.

Vite's `base` is left at the default `/` (see `vite.config.js`), which is correct when the
site is served from the domain root — both the `*.github.io` project URL *with a custom
domain* and the custom domain itself serve at root. (If you ever host under a subpath like
`username.github.io/repo/` **without** a custom domain, uncomment `base: '/repo/'`.)

### Custom domain

Currently **www.sima-zhenya-wedding.ru**.

1. `public/CNAME` holds the domain (one line). Vite copies it into `dist/`, so the custom
   domain survives every deploy. Its value **must exactly match** the domain in
   Settings → Pages; change both together if the domain ever changes.
2. **Settings → Pages → Custom domain:** enter the same domain, save.
3. **DNS at the registrar** — so GitHub can issue a valid TLS cert for *both* forms:
   - apex `sima-zhenya-wedding.ru` → four A records:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
   - `www` → CNAME to `eumbr.github.io`.
   - Make sure no CAA record blocks Let's Encrypt.
4. **Enable "Enforce HTTPS"** in Settings → Pages. If the checkbox is greyed out, the
   Let's Encrypt certificate is still being issued (up to ~24 h after DNS is correct) —
   wait, then tick it.

**Certificate warning from an antivirus?** Antiviruses that scan HTTPS (e.g. Kaspersky)
re-sign every site with their own root CA and can be cautious about a brand-new domain.
Click the warning and check the certificate issuer: if it says the antivirus's name, it's
client-side interception, not a site problem — it usually clears once the domain settles and
"Enforce HTTPS" is on. There is nothing to fix in the site's code for this.

## Pre-launch checklist

- [ ] Replace the organizer contact link in `index.html` (search for
  `TODO: replace placeholder organizer contact link`).
- [ ] Delete the test rows from the Google Form responses (rows named
  «тест сайта — эту строку можно удалить»).
  Note: `scripts/test-rsvp.mjs` submits one such real test row per run.

## Windows caveats

- Use a regular terminal (PowerShell or cmd) — no WSL needed; everything here is
  cross-platform.
- If `npm install` complains about `sharp`, make sure you're on Node 20+ (`node -v`).
  `sharp` is only needed for the image script, never during the Cloudflare build.
