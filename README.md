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

Checks cover reload, continuous forward/reverse camera travel, all 32 scenes, 12 compact cards, copy line breaks, ten responsive pages, mobile canvas/menu, pricing, safe request review, reduced motion, no-JavaScript and asset-failure fallbacks, block/tile extraction and crane clearance. Physical mobile GPU performance is not verified.

`HANDOFF.md` retains the reference production brief. The primary Nanolite Group domain remains unchanged.

## October refinement

The nighttime journey has longer camera holds, progressive clipped construction, a permanent crane and suspended panel, denser optimized trees, continuous terrain, marked wet roads, reflectors, rain streaks and a round lit drainage tunnel. The hybrid wall interior and layer cross-section are included in the journey. Equipment has explicit T-series labels and separate foreground bays. Camera framing and card arrival share the same eased progress.

The shared header now links Products, About us, Resources (corporate profile, product catalogue, ASTM case studies), Ask our experts, Contact us and the Nanolite app page. The owner-supplied corporate profile and product catalogue PDFs are served unmodified. The app page shows iOS and Android availability; store buttons remain disabled until actual store links are supplied. Expert inquiries prepare a reviewed email draft using the existing email pattern; there is no delivery backend.

The ASTM feature changes hourly among concrete-related chapters of the official 125th Anniversary Case Study Compilation. Links go to the original publisher PDF with page anchors; the site does not republish standards or imply that these are Nanolite product reports. An open page refreshes its feature at most 30 seconds after the hour changes. External PDF availability and individual PDF viewers' page-anchor support remain outside this site.

## Camera and product inspection refinement

The opening view focuses on the construction site with centered copy and no road in frame. Product panels use translucent right-side glass on desktop and compact lower panels on mobile; the permeable-concrete panel rises from the bottom. Camera projection no longer changes when a panel appears. Block and roof-tile returns finish before the centered pullback, and travel phases suppress captions.

The full roof has 176 tiles; one inspection tile separates its surface, insulation and backing layers. These layer shapes are illustrative, not approved assembly dimensions. Gradual rain, centered road framing and height-based underground fog replace abrupt state changes. Road markings avoid the shaft openings. A newly proportioned flatbed is tracked during delivery.

ReadyMix now has 77 grounded bags on its pallet and the foaming agent has 12 shaped drums. Portable plants share a white-and-blue base design at three scales, with direct logo branding. Installed silos carry vertical Nanolite branding; service platforms connect the stairs and a yard billboard carries the company mark. Materials and models remain browser reconstructions, not manufacturer CAD. The structural caption describes load-dependent optimization without publishing an unsupported 35% savings figure.

## October 11 visual and reference update

Shared navigation, footer, product pages, app availability and forms now use system typography and a restrained common presentation. Product imagery is extracted with its original alpha masks from the owner-supplied Home PDFs and Catalog P, rather than journey screenshots. The full supplied catalogue remains unchanged and is linked on Documents. The owner reconfirmed 40 kg / PKR 600 ReadyMix despite differing sizes in the artwork.

The world now includes 46 surrounding buildings and a street grid, foundation banks, textured iron access covers, continuous side walls under drainage shafts, monotone cubic camera interpolation through the descent and tunnel, sill-anchored fitted windows, hollow glazed crane/truck cabs, truck lights and four cargo stacks. T500 and T1000 have one axle each; T5000 has two. Glass product panels enter and exit to the right independently of camera projection; the road panel retains its requested upward entry.

The requested 35% dead-load reduction is identified as a design target requiring project engineering, not a verified universal saving. Browser geometry, procedural water and reconstructed equipment remain illustrative; this is not an offline film-quality render or manufacturer CAD. Store links and email delivery backend are still pending.


## Camera clearance and compact inspection update

The opening now descends from the sky before construction starts. Inspection cards fit their content, with a compact glass surface and right-side entry/exit; the drainage card keeps its bottom entry. Masonry joints are deeper and narrower units are used, roof tiles have a warmer finish than the cool precast panel, and structural highlights are translucent blue.

Fifty city buildings occupy street parcels, including a western frontage. Factory views remain in the open service corridor; the regression suite samples the complete camera spline against recorded city building envelopes. Architectural glazing uses environment reflections without the transmission render pass. Shaders are prepared before the journey, desktop pixel density is capped at 1.5, shadows update up to 30 Hz during motion and 10 Hz during holds, and the canal reflection uses a 512-pixel target. Section geometry is cached on resize to avoid reading document layout on every frame. These limits reduce rendering work; frame rate still depends on device graphics and is not guaranteed. City and equipment remain procedural reconstructions, not film-quality assets.

## Quiet opening and product focus

The initial camera looks vertically upward; its short caption clears before a slow descent. Oversized foreground towers are moved out of the construction framing, vegetation forms road-side clusters, and tree instances are divided into cullable groups. Concrete uses a finer neutral finish, CLC pore relief is stronger, the precast panel has a dedicated fill light, and the last-floor stair geometry is removed.

Product inspections ease down the environment and general light, with a camera-mounted key preserving the foreground subject. The column/beam highlight combines a translucent blue face with a stronger outline. The shaft ascent shares the ladder centreline and a neutral sky avoids panorama pinching at the zenith. Water reflections update at 20 Hz.

The truck cab is rebuilt with bevelled panels, glazing, a seated driver, and complete wheel assemblies that spin and steer according to the delivery curve. Plant detail includes flanges, fasteners, gauges, canopy seams, plumbing, stair stringers and ladder cages. Aggregate bins use textured beds and loose stones instead of cone piles. These remain browser-built models; manufacturer geometry and physical-device frame-rate validation are not supplied.

## Approved scene copy and intro logo

All 32 scenes use the approved short copy, including the restored hybrid-wall interior and cross-section. Product links, material orders and plant enquiries retain their existing destinations and pricing. Unverified numerical savings are omitted from journey captions.

`assets/nanolite-intro.png` was generated in built-in imagegen edit mode from the supplied logo reference. Prompt: Preserve the overlapping silver concrete diamonds and uppercase NANOLITE lettering; remove the LIGHT WEIGHT CONCRETE subtitle, white background and specks; retain realistic concrete texture and output a clean transparent logo.

The suspended precast panel follows the supplied reference: a wide concrete wall, two open timber-framed window apertures, lifting eyes and four slings. Its inspection camera frames the full width.
