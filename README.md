# Nanolite Global

A static, responsive rebuild of the original Nanolite Global site. The Global header is redesigned with compact navigation. The Group footer layout is adapted to Global branding, navigation and office information. The opening logo is centered over the supplied water video. The retired 3D journey remains removed. ReadyMix, foaming agent and CLC blocks use their original photographs with a small manual drag tilt. Hybrid wall and roof tiles retain original pictures with hover effects. No full 3D product models or automatic rotations ship.

## Content

38 pages include the home page, product directory, 14 detailed material/plant pages, manufacturing/franchise information, About, Contact, Careers, Investors, technical enquiries, order requests PDF resources, website privacy and the existing draft app privacy, terms and account-deletion notices. Original extensionless route names and existing product query links continue to work.

Reference material: nanoliteglobal.com; user-supplied Home (1) through Home (11) PDFs; the owned Nanolite Group release for company content, office information and 12 career profiles. Source snapshots are in tools/original-content.json and tools/group-content.json and tools/app-notices.json and are excluded from deployment. tools/rebuild_static.py regenerates pages using those snapshots and checked-in assets.

ReadyMix uses the user-confirmed specification: 40 kg bags at PKR 600 per bag in Pakistan. Source packaging imagery is illustrative and may show other pack sizes. Shipping, taxes and availability require commercial confirmation. Historical investor profile statements are labelled; there is no simulated stock-price feed.

## Build and validation

Node 22 or newer: npm run build. No package installation is needed for production builds. The build generates dist and includes only referenced assets and application files.

npm test requires Playwright and Chrome. It checks every page at desktop, tablet and two mobile widths, local links and anchors, the redesigned header, centered logo, both looping videos and mute control, footer offices, career filtering, mobile navigation, product redirects, ReadyMix calculations and safe email-draft reviews. Screenshots go into ignored test-artifacts.

Content remains readable without JavaScript. Inquiry/order forms prepare a reviewed email draft; they do not transmit data, take payment or create backend orders. Careers links register interest by email and do not confirm open vacancies. The app page retains platform availability information.

## Publication

Cloudflare Workers Builds connects nanoliteus-dotcom/Nanolite-Global-Website, branch main, with build command npm run build, deploy command npx wrangler deploy and assets directory dist from wrangler.toml.

Preview: https://nanolite-global-website.nanoliteus.workers.dev

This repository does not modify the Nanolite Group website or change DNS for nanoliteglobal.com.

Manrope font: Google Fonts, SIL Open Font License. Product imagery comes from the supplied reference PDFs. The transparent opening logo was previously generated from the user's Nanolite logo reference with the subtitle removed.

The supplied water background retains 1920 x 1080 at 50 fps. The CLC film retains 1280 x 720 at 55 fps and appears immediately below the ReadyMix bags, full-width at 16:9, looping with only a mute/unmute button. Both files are compressed for hosting and pause off-screen. Company photography comes from the owned Group release. App notices retain their original draft status; the website policy describes the current email-draft forms and hosting.
Latest refinements: black rectangular Application sign-in link, larger header identity, direct Careers/Investors navigation, overlapping CLC blocks, enlarged hybrid wall artwork, tighter ReadyMix-to-film spacing, centered heritage and compact vision/mission sections. Corporate profile uses the complete 20-page document; the full catalog and profile are rendered as normal scrollable page images with original PDF download links. The Group chart is reused with explicit illustrative-data labels; no live quote feed is configured.

Latest update: Explore cue raised 8px; ReadyMix bottom spacing tightened; homepage franchise section and full franchise page rebuilt. The supplied franchise video fills the opening viewport with no page copy over it. Its embedded titles remain part of the original footage. Product photographs support manual drag tilt with keyboard access; there are no automatic spins or pause controls. The header app link is named Nanolite app and remains outside the collapsed navigation. Six T-series configurations use user-supplied nominal daily capacities; T10000 and larger include silos. Old plant pictures are removed pending replacement photographs. Capacities depend on the operating specification; the detailed mixing description follows the owner's brief.
