# Nanolite Global Website

New, separate website for nanoliteglobal.com. It does not replace the Nanolite Group project.

## Build

Node.js 22 or newer. No package installation is required.

`npm run build` creates `dist` with the ten pages, application files and 32 optimized reference assets. Source documentation and repository metadata are excluded.

## Cloudflare Workers automatic deployments

The connected dashboard project uses Workers Builds. The repository supplies an assets-only Workers configuration that serves the generated `dist` folder. No Worker script is needed.

- Repository: `nanoliteus-dotcom/Nanolite-Global-Website`
- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Node version: 22 (also supplied in `.node-version`)
- Worker name: `nanolite-global-website`; this must match the dashboard Worker name.

Pushes to the production branch start builds and deployments automatically. A browser refresh displays a completed deployment; it does not initiate one. Review preview deployments before production changes.

The prior failure occurred after a successful website build: Workers deployment could not read the Pages-only `pages_build_output_dir` setting. The configuration now uses `[assets] directory = "./dist"` instead.

Leave the existing `nanolite-group` Pages project unchanged. After reviewing the new preview, configure the new domain through the Workers project's Settings > Domains & Routes. Current domain registration, DNS control and existing website routes must be inspected before switching production traffic. Do not reuse another domain's assigned nameservers.

## Continuous 3D preview

The homepage uses a continuous Three.js camera journey through one world. Scrolling forwards and backwards moves the camera, construction, extracted wall block, roof tile and delivery truck. Installed plant scenes include a half-orbit. The earlier still-film preview is retained in source history but excluded from deployment.

Photographic concrete, grass and soil materials, optimized CC0 tree geometry, a detailed CC0 truck and reference-based generated packaging artwork replace the earlier flat geometry. The distant landscape is a generated panorama; the building and machinery remain reconstructed geometry. This browser preview is not an offline photoreal render and does not reproduce every supplied machine exactly.

A minimal black loading screen prevents a gallery flash. The shared header provides product, company, resource, expert, contact and app destinations. Eleven restrained product cards arrive after the camera settles. The opening caption sits at the lower left; no people, scene-reference, skip-to-products, plant-inspection or return controls remain.

Reduced motion, asset failures and JavaScript-disabled visits retain an accessible still-image story. The header and catalogue are shared across all ten pages. Requests prepare reviewed email drafts, with no payment, stock reservation or submission backend. ReadyMix is 40 kg / PKR 600 per bag before freight and tax; agent sales quantity is confirmed with the team.

## Validation

`npm test` runs `tests/journey.cjs` using Playwright and installed Chrome. The build remains dependency-free; Playwright is needed only for browser checks. Screenshots are written to ignored `test-artifacts/`.

Checks cover reload, continuous forward/reverse camera travel, all 30 scenes, 11 compact cards, copy line breaks, ten responsive pages, mobile canvas/menu, pricing, safe request review, reduced motion, no-JavaScript and asset-failure fallbacks, block/tile extraction and crane clearance. Physical mobile GPU performance is not verified.

`HANDOFF.md` retains the reference production brief. The primary Nanolite Group domain remains unchanged.

## October refinement

The nighttime journey has longer camera holds, progressive clipped construction, a permanent crane and suspended panel, denser optimized trees, continuous terrain, marked wet roads, reflectors, rain streaks and a round lit drainage tunnel. The hybrid wall detour was removed from the journey; its catalogue entry remains available. Equipment has explicit T-series labels and separate foreground bays. Camera framing and card arrival share the same eased progress.

The shared header now links Products, About us, Resources (corporate profile, product catalogue, ASTM case studies), Ask our experts, Contact us and the Nanolite app page. The owner-supplied corporate profile and product catalogue PDFs are served unmodified. The app page shows iOS and Android availability; store buttons remain disabled until actual store links are supplied. Expert inquiries prepare a reviewed email draft using the existing email pattern; there is no delivery backend.

The ASTM feature changes hourly among concrete-related chapters of the official 125th Anniversary Case Study Compilation. Links go to the original publisher PDF with page anchors; the site does not republish standards or imply that these are Nanolite product reports. An open page refreshes its feature at most 30 seconds after the hour changes. External PDF availability and individual PDF viewers' page-anchor support remain outside this site.
