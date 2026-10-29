# Atlas on Nanolite Global

`Atlas/` is a production build of `nanoliteus-dotcom/Nanolite` (formerly Atlas),
branch `website/atlas-public-preview`, source commit `e821101`, mounted at `/Atlas/`.
The existing standalone Atlas deployment is unchanged.

The Global build copies this directory and generates an HTML entry for every
route in `tools/atlas-routes.json`. This works on Pages and Workers without a
site-wide SPA fallback, preserving the Global website's routes.

To refresh the snapshot, check out the desired Atlas release and install its
locked dependencies. Run `python tools/prepare-atlas-subpath.py ABSOLUTE_ATLAS_CHECKOUT`.
The script prints its staging directory. Set `ATLAS_BASE_PATH=/Atlas/`, then run
Atlas's `node_modules/vite/bin/vite.js build STAGING_DIRECTORY --config ATLAS_CHECKOUT/vite.config.js`.
Copy the generated staging `dist` contents into `Atlas/`, removing stale build
files only within that directory. Run `npm run build`, `node tests/atlas.cjs`,
and the existing Global checks before publishing. The browser tests require
Playwright and Chrome.

Atlas updates are published here as reviewed snapshots; the two repositories
do not automatically sync. Existing Atlas authentication and download-service
availability is unchanged by this domain mount.
