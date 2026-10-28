# Fotia

Website for Fotia, premium indoor cannabis flower. *Fire of the Gods.*

Angular 19 (standalone components, SSR + prerendering, SCSS). The site has three jobs: explore strains, find Fotia at a retailer, and find the right certificate of analysis (COA) for a batch.

## Commands

```bash
npm start                      # dev server at http://localhost:4200
npm run build                  # production build + prerender
npm run serve:ssr:fotia        # serve the SSR build at http://localhost:4000
npx ng test --watch=false      # unit tests (Karma, Chrome)
npm run deploy:ghpages         # build for GitHub Pages and publish to the gh-pages branch
```

Use Node 20 or 22 LTS in production. The build warns on odd-numbered versions such as 23.

## Routes

| Route | Page |
| --- | --- |
| `/` | Hero, featured strains, Find Fotia and lab-results entry points, story preview |
| `/strains` | Strain directory. `?q=` name search, `?type=` filter (shown only when the data has more than one type) |
| `/strains/:slug` | Strain detail. `?batch=BATCH_ID` selects a batch, for packaging QR codes; add `#coa` to land on the lab section |
| `/find-fotia` | Retailer finder. `?location=` and `?strain=` |
| `/lab-results` | COA search. `?q=` strain or batch number, `?strain=` filter |
| `/our-story` | Brand identity page |
| `**` | Not found (returns a real 404 from the SSR server) |

`/`, `/strains`, `/find-fotia`, `/lab-results` and `/our-story` are prerendered. Strain detail pages are rendered by the Node server. If you deploy static-only, add the strain slugs to a prerender routes file.

## Project layout

```
src/styles/                 design tokens, base, type, layout, buttons, forms, utilities
src/app/core/
  assets.ts                 every image path (single source)
  site.config.ts            nav, contact, social, legal, map provider: empty values are omitted from the UI
  data/demo-fixtures.ts     clearly labeled placeholder strains (replace)
  models/                   Strain, Batch, CoaDocument, Retailer, InventoryState …
  catalog/                  CatalogSource (data provider), StrainService, search helpers
  inventory/                InventoryProvider abstraction + classifyInventory rules
  retailers/                RetailerDirectory abstraction
  browser/                  COA viewer, document download, geolocation (all SSR-safe)
src/app/shared/             header, footer, strain card/photo, batch selector, inventory status,
                            COA actions, download button, COA viewer dialog, retailer card
src/app/pages/              home, strains, strain-detail, find-fotia, lab-results, our-story, not-found
scripts/optimize-images.mjs regenerates web images from the originals
```

## Assets

Originals supplied by Fotia stay untouched in `public/assets/`:

| File | Used for |
| --- | --- |
| `FOTIA-bg.png` | Combined hero (background, platform and pouch in one image). The only hero artwork; nothing is overlaid on it. |
| `full-logo.png` | Gold logo (transparent). Trimmed for the header, mobile menu and footer. |
| `icon-logo.png` | Flame mark: photo placeholders, footer rule, story section, favicons |

Web derivatives live in `public/assets/web/`: hero in AVIF, WebP and JPEG at 640–1672px (72 KB AVIF at full width, from a 2 MB PNG), trimmed logo, flame and favicons. Regenerate them after replacing an original:

```bash
npm i --no-save sharp@0.33.5 && node scripts/optimize-images.mjs
```

If dimensions change, update `src/app/core/assets.ts`.

**Still needed from Fotia**

- Flower photography for each strain: natural color, 4:5 portrait or 1:1. Until then, cards show a "Photo coming soon" placeholder.
- COA PDFs per batch (see below).
- Approved strain names, types, genetics, aroma/flavor copy and batch IDs.
- Retailer data and an inventory source.
- Contact details, social profiles and legal copy (age requirement, license numbers, required warnings, policy links), entered in `site.config.ts`.
- Approved company story (history, cultivation, licensing). `/our-story` currently contains only brand identity copy.

## Replacing demo data

Everything in `demo-fixtures.ts` is flagged `demo: true`. The UI labels it "Demo" and shows demo notices. The fixtures contain no genetics, potency, test dates, labs or PDFs, so every batch shows "COA not yet available".

To use real data, either edit the fixtures (and drop `demo`), or provide another `CatalogSource` in `app.config.ts` that loads from a CMS, JSON file or API. The UI does not change.

```ts
{ provide: CatalogSource, useClass: HttpCatalogSource }
```

Lab data always belongs to a batch, never to the strain. A batch has `id` (exactly as printed on the package), optional `testDate` (YYYY-MM-DD), `labName`, `cannabinoids` / `terpenes` summaries and `coa`. Batches are listed newest first; the first one is the default selection.

### COA files

`coa.url` can be site-relative (e.g. `/coa/BATCH.pdf` in `public/`) or an absolute https URL.

- **View PDF** opens an in-page viewer where the browser can embed PDFs (desktop), with "Open in new tab" always available. On phones it opens the PDF directly. A missing file shows a visible error.
- **Download PDF** fetches the file and saves it with a clear name (`Fotia-COA-<strain>-<batch>.pdf`). For PDFs on another domain, the host must allow CORS. Otherwise the visitor is offered "Open the PDF in a new tab" instead of a silent failure. The most robust option is a `coa.downloadUrl` that responds with `Content-Disposition: attachment`; when present it is used directly.

## Integrations (retailers, inventory, location, map)

The finder and the availability sections are fully built against two abstractions, both provided in `app.config.ts`:

- `RetailerDirectory`: `search({ location, coords, strainSlug })` returns `not-connected`, `results`, or `error`, plus `capabilities` (`connected`, `locationSearch`, `coordinateSearch`).
- `InventoryProvider`: `strainAvailability(slug)` for the strain page.

Both currently use "not connected" implementations, so the site says plainly that listings aren't live. "Use my location" stays disabled, with an explanation, until `coordinateSearch` is true. The browser never asks for location on page load.

When connecting real data:

- Call **Fotia's own backend**, not dispensary APIs directly. Provider keys and credentials must never be in this frontend.
- Map provider reports through `classifyInventory()` (`core/inventory/inventory-rules.ts`). It keeps unknown as unknown (never zero or sold out), shows unit counts only when verified for that exact product, package size and retailer, shows "low stock" only when `lowStockAtOrBelow` is configured, and marks reports older than `staleAfterMinutes` as stale.
- Show only real stores and provider-supplied timestamps. "Retailers reporting in stock" (a store count) and "units available" (a verified unit count) are separate fields; keep them separate.
- A map is optional. Set `SITE_CONFIG.integrations.mapProvider` and mount it in the `finder__map` slot in `find-fotia.component.html`; the list works without it.

## Age gate (21+)

Every page, deep links included, opens behind a full-screen "Are you 21 or older?" gate (`shared/age-gate`). Until the visitor confirms:

- the rest of the page is `inert`, so keyboard and screen readers can't reach it;
- "No" keeps the gate and explains why.

Confirmation is stored in `localStorage` for 30 days (`core/browser/age-verification.service.ts`). A small inline script in `src/index.html` hides the gate before first paint for returning visitors. Keep its key and class in sync with the service. If a jurisdiction requires date-of-birth entry, extend the gate component; nothing else depends on its UI.

## GitHub Pages

`npm run deploy:ghpages` builds with `--base-href=/fotia/` and copies the client-side shell (`index.csr.html`) to `404.html`. It then publishes `dist/fotia/browser` to the `gh-pages` branch with `angular-cli-ghpages`. In the repo's Settings → Pages, the source must be **Deploy from a branch → gh-pages / (root)**.

Pages is static hosting:

- The five fixed pages are prerendered.
- Strain detail URLs (including QR deep links like `/fotia/strains/<slug>?batch=…`) load through `404.html` and render in the browser. They work for visitors but answer with HTTP 404, which is fine for a preview but not ideal for search engines. Use the Node SSR server for production, or prerender strain routes.
- With a custom domain, change `--base-href` to `/` and add a `CNAME` file.

## SSR notes

- `NG_ALLOWED_HOSTS` must list the production domains (e.g. `fotia.com,www.fotia.com`). Angular refuses to server-render other hosts, which is SSRF protection. `server.ts` defaults to localhost.
- `main.server.ts` passes Angular's `BootstrapContext`, as required by Angular 19.2.16+; the original scaffold couldn't prerender without it.
- Browser-only work (scroll listener, dialogs, downloads, geolocation) runs only in event handlers or after render.
