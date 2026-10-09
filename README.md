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

## Current review boundary

- Five working pages: homepage, product directory, product detail, request review and contact.
- 32 image references are mapped in `scene-manifest.json`.
- Scroll drives a coherent procedural 3D study, rather than morphing unrelated pictures. This is a spatial prototype, not final photoreal production artwork. The original scene references remain available in static mode.
- Ordinary scrolling, no wheel interception. Reduced motion and unavailable WebGL use a static reference journey.
- Portable and installed plants have drag rotation, keyboard-accessible rotation/zoom buttons, reset, and a full-size supplied design-render viewer. The render viewer is a still reference, not a rotatable model.
- The road and 120-metre drainage channel share world coordinates. The underground chapter has three times the usual scroll distance, with a road descent, channel passage, access-shaft ascent and factory reveal. Water uses an animated surface with planar reflections, not a fluid simulation.
- Delivery follows a curved route with truck heading derived from the travel tangent; the tracking camera follows its forward arrival. Portable equipment includes hoses, stabilizers and control cabinets. Installed plants include access platforms, hopper divisions, bracing and ladders; the yard includes pallet straps, perimeter fences and service connections.
- The 3D model consistently uses eight floors. It is an illustrative design choice pending approval.
- Prices are supplied Pakistan material prices only. Freight and tax remain pending. ReadyMix is 40 kg / PKR 600 per bag. Agent sales units remain unconfirmed.
- Request forms prepare a reviewed email draft. No commerce backend, payment, stock reservation, uploaded files or server-side order/status system is implemented. No fake submission confirmations.
- The 3D ReadyMix label says 40 kg. The supplied reference image still depicts older artwork and must be replaced before production publication. Original source PNGs are not altered.
- Plant models and road cutaway are conceptual, not engineering drawings. Final models, exact camera paths, physical water, installation behavior and specifications require further production work.
- Existing site routes, legal documents and PDFs have not been audited because the public domain could not be retrieved during this session. No production redirect or domain switch has been made. Adding these procedural details does not achieve photoreal fidelity to the supplied images; production-grade textured models or a consistent rendered sequence are still required.

## Validation

Browser checks cover 32 scenes, one shared world, underground camera coordinates, truck heading, machine drag/button rotation and reset, reference-dialog loading and Escape dismissal, mobile toolbar separation, wall-component selection, desktop/tablet/mobile widths down to 320px, five pages, price computation, safe request review, agent/plant form behavior, mobile navigation and reduced motion. Physical mobile hardware and server submission are not verified. The Workers deployment pipeline is connected to main and has successfully deployed the preceding version.

Read `HANDOFF.md` for the original scene and camera brief. All claims and final artwork require owner approval before the production domain changes.
