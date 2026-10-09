# Nanolite Global Website

New, separate website for nanoliteglobal.com. It does not replace the Nanolite Group project.

## Build

Node.js 22 or newer. No package installation is required.

`npm run build` creates `dist` with the five pages, application files and 32 optimized reference assets. Source documentation and repository metadata are excluded.

## Cloudflare Pages automatic deployments

Create a new **Pages** project through **Workers & Pages > Create application > Pages > Connect to Git**. Authorize GitHub access only to `nanoliteus-dotcom/Nanolite-Global-Website`.

- Production branch: `main`
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank
- Node version: 22 (also supplied in `.node-version`)

Repository pushes start deployments automatically. A browser refresh displays a completed deployment; it does not initiate one. If preview branches are enabled, review work there before merging to main.

The existing `nanolite-group` project is a Direct Upload project. Leave it unchanged. Cloudflare does not convert an existing Direct Upload Pages project into a Git integration project.

After reviewing the new preview, add nanoliteglobal.com and www.nanoliteglobal.com under the new project's Custom domains. Current domain registration, DNS control and existing website routes must be inspected before switching production traffic. Do not reuse another domain's assigned nameservers.

## Current review boundary

- Five working pages: homepage, product directory, product detail, request review and contact.
- 32 image references are mapped in `scene-manifest.json`.
- Scroll drives a coherent procedural 3D study, rather than morphing unrelated pictures. This is a spatial prototype, not final photoreal production artwork. The original scene references remain available in static mode.
- Ordinary scrolling, no wheel interception. Reduced motion and unavailable WebGL use a static reference journey.
- The 3D model consistently uses eight floors. It is an illustrative design choice pending approval.
- Prices are supplied Pakistan material prices only. Freight and tax remain pending. ReadyMix is 40 kg / PKR 600 per bag. Agent sales units remain unconfirmed.
- Request forms prepare a reviewed email draft. No commerce backend, payment, stock reservation, uploaded files or server-side order/status system is implemented. No fake submission confirmations.
- The 3D ReadyMix label says 40 kg. The supplied reference image still depicts older artwork and must be replaced before production publication. Original source PNGs are not altered.
- Plant models and road cutaway are conceptual, not engineering drawings. Final models, exact camera paths, physical water, installation behavior and specifications require further production work.
- Existing site routes, legal documents and PDFs have not been audited because the public domain could not be retrieved during this session. No production redirect or domain switch has been made.

## Validation

Browser checks cover all 32 scene stops, one shared world, wall-component selection, desktop/tablet/mobile widths down to 320px, five pages, price computation, safe request review, agent/plant form behavior, mobile navigation and reduced motion. Physical mobile hardware, server submission and live Cloudflare deployment are not verified.

Read `HANDOFF.md` for the original scene and camera brief. All claims and final artwork require owner approval before the production domain changes.
