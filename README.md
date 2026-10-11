# Nanolite Global

A static, responsive rebuild of the original Nanolite Global site. The published Global header is preserved. The Group footer layout is adapted to Global branding, navigation and office information. No 3D journey, video, animated scene or rendering dependency is included in deployment.

## Content

33 pages include the home page, product directory, 13 detailed material/plant pages, manufacturing/franchise information, About, Contact, Careers, Investors, technical enquiries, order requests and PDF resources. Original extensionless route names and existing product query links continue to work.

Reference material: nanoliteglobal.com; user-supplied Home (1) through Home (11) PDFs; the owned Nanolite Group release for company content, office information and 12 career profiles. Source snapshots are in tools/original-content.json and tools/group-content.json and are excluded from deployment. tools/rebuild_static.py regenerates pages using those snapshots and checked-in assets.

ReadyMix uses the user-confirmed specification: 40 kg bags at PKR 600 per bag in Pakistan. Source packaging imagery is illustrative and may show other pack sizes. Shipping, taxes and availability require commercial confirmation. Historical investor profile statements are labelled; there is no simulated stock-price feed.

## Build and validation

Node 22 or newer: npm run build. No package installation is needed for production builds. The build generates dist and includes only referenced assets and application files.

npm test requires Playwright and Chrome. It checks every page at desktop, tablet and two mobile widths, local links and anchors, the unchanged header, footer offices, career filtering, mobile navigation, product redirects, ReadyMix calculations and safe email-draft reviews. Screenshots go into ignored test-artifacts.

Content remains readable without JavaScript. Enquiry/order forms prepare a reviewed email draft; they do not transmit data, take payment or create backend orders. Careers links register interest by email and do not confirm open vacancies. The app page retains platform availability information.

## Publication

Cloudflare Workers Builds connects nanoliteus-dotcom/Nanolite-Global-Website, branch main, with build command npm run build, deploy command npx wrangler deploy and assets directory dist from wrangler.toml.

Preview: https://nanolite-global-website.nanoliteus.workers.dev

This repository does not modify the Nanolite Group website or change DNS for nanoliteglobal.com.

Manrope font: Google Fonts, SIL Open Font License. Product imagery comes from the supplied reference PDFs. The transparent opening logo was previously generated from the user's Nanolite logo reference with the subtitle removed.
