# Nanolite Global Website

New, separate website for nanoliteglobal.com. It does not replace the Nanolite Group project.

## Build

Node.js 22 or newer. No package installation is required.

`npm run build` creates `dist` with the five pages, application files and 32 optimized reference assets. Source documentation and repository metadata are excluded.

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

## Cinematic preview

The homepage is now a scroll-controlled, silent film assembled from the 32 supplied photoreal concept renders. Four 24-second chapters have desktop (1600 x 900) and mobile (960 x 540) encodings. Native scrolling controls paused video seeking in both directions; no wheel interception is used. Film chapter paths and timing are in `film-manifest.json`.

This is an editorial preview with dissolves between still renders. It is not a newly rendered continuous camera flight and does not animate installation physics, a moving truck, falling water or a 180-degree plant orbit. Upgrade the film assets when continuous rendered footage is available; the scroll interface can remain the same.

The original bags, drums and machines carry the product appearance. Visible people and their shadows were removed from construction and factory renders. The lifted CLC shot has an empty origin slot. Only the foreground ReadyMix bag weight artwork was corrected from 50 to the approved 40 kg; source PNGs remain untouched. `cinema-provenance.json` records edited scenes.

A minimal black loading screen prevents a gallery flash. The slim header provides Materials, Manufacturing, Contact and a real 13-page downloadable catalogue. Twelve compact black cards have one blue Learn More link each. Nonproduct captions are centered; no scene-reference, skip-to-products, plant-inspection or return controls remain.

Reduced motion, missing video and JavaScript-disabled visits retain an accessible still-image story. The header and catalogue are shared across all five pages. Requests still prepare reviewed email drafts, with no payment, stock reservation or submission backend. ReadyMix is 40 kg / PKR 600 per bag before freight and tax; agent sales quantity is confirmed with the team.

## Validation

`npm test` runs `tests/cinema.cjs` using Playwright and installed Chrome. The build remains dependency-free; Playwright is needed only for browser checks (the Codex runtime already provides it). Screenshots are written to ignored `test-artifacts/`.

Checks cover loading on reload, decoded forward/reverse chapter seeking, 32 scenes, 12 compact cards, intentional desktop hero line breaks, five pages at desktop/tablet/mobile widths, mobile video selection and menu, reduced motion, no-JavaScript and unavailable-film fallbacks, pricing and safe request review. The catalogue is rendered and inspected across all 13 pages. Physical mobile hardware is not verified.

`HANDOFF.md` retains the original continuous-film production brief. No production domain switch is made by this preview.
