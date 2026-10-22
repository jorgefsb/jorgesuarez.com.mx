# Cursor líquido integration

This page mounts the published **Papacito Juice profile 1.0.1**, with **core Juice 1.2.0**, mandatory Moki 1.2.0 and Cursor líquido 1.0.1. `js/cursor-conductor.js` calls `PapacitoJuice.mount({ page: 'home' })`; the profile validates the menu, Hardcore, Moki and all twelve artwork files before Game Feel 1.0.1 mounts the cursor. `window.papacitoReady` exposes completion or failure. Neither adapter writes the level, sound preference, Moki progress or unlock state.

The versioned profile and Game Feel adapter are byte-identical to published commits `f05e03427235cd7d5ba52dd3b2af05abb06a2f4b` and `443d51b5e2dbfe083770e030d77d82b372ffd664`. Their manifests pin every copied file, including licenses and the profile's Moki/brand notices. Profile CSS loads before the existing brandkit; the brandkit remains authoritative. No vendor core, shader, artwork or layout is rewritten.

| Juega | Cursor |
| --- | --- |
| Nada (`off`) | Disabled |
| Poquito (`subtle`) | Orange dots, no WebGL |
| Mucho (`full`) | Approved fluid renderer, 10 CSS px |
| Hardcore (`hard`) | Approved fluid renderer, 18 CSS px |

The frozen renderer SHA256 is `3d478cc836969c216812c7e479724e0e204bbb76a26df24c2414568883021230`. Local vendor filenames map to the public source paths in `vfx/cursor-liquido/1.0.1/manifest.json`. The MIT license and Pavel Dobryakov attribution travel with the vendor. Moki artwork is not licensed by the cursor's MIT license.

## Page configuration

The 1.0.1 load order is approved renderer, approved engine adapter, external
quality-input guard, then the LiquidCursor wrapper. The guard preserves only
real queued input through adaptive quality reduction; actual viewport resize,
scroll cancellation and the sustained-budget GPU shutdown remain intact.
Sources are pinned to public release commit `6035bbd24c06b23be353d9af68bd67d33b22f34e`.
The 1.0.0 vendor directory remains byte-identical as a historical rollback input.

- `data-jz-shake=".jzh-layer"` sends Hardcore shake to its decorative particles, not the full-height document. Rotating a long `main` around its center had displaced and cropped the hero at a 320px viewport. The vendor and renderer are unchanged.
- `data-liquid-obstacle` marks the HUD, quest rail, light sections and video frames as fluid boundaries.
- The page loads only one cursor controller. The previous `fluid-v2.js` and its canvas are no longer loaded, but the historical file remains in Git for rollback.
- While the new cursor owns pointer feedback, CSS hides only Juice's bounded `.jzh-t` trail nodes. Other Hardcore particles remain active.
- `max-width: none` on the fluid canvas overrides the global media constraint so its CSS bounds match the renderer's input coordinates, including classic scrollbars.
- Touch drawing stays off by default. Native scrolling and controls keep their events. Reduced motion disables the cursor; unsupported WebGL or a slow-frame budget must not break the page.

## Verification

```sh
npm test
PLAYWRIGHT_MODULE=/path/to/existing/node_modules/playwright \
CURSOR_TEST_OUTPUT=/path/outside/the/site/evidence npm run test:cursor
```

The suite checks vendor checksums, the negative checksum guard, ES/EN content against production baseline `673794ffec82acde800df43ed31b5ded3cb0e592`, all four levels, one owner, visible colour, obstacles, native controls, Moki, sound preferences, profile lifecycle, reduced motion and rollback-query behaviour. It includes touch emulation at 375px, a trusted CDP scroll gesture, no-WebGL fallback, a 320/390/1440px ES/EN matrix and lock-text contrast on light/dark sections. Injected dates 2026-10-22 and 2026-10-23 exercise five real pointer clicks, unique poses, artwork aspect ratios, hit testing and actual Hardcore unlock at 320/390/1280px, without calling `Moki.poke` or overriding the lock. Use the existing cached Playwright installation; no project dependencies are needed. `CURSOR_TEST_OUTPUT` redirects screenshots, videos and JSON outside the site; the default remains ignored `qa/cursor-liquido/`.

Software-rendered Chromium and emulated touch do not certify Safari, physical phones, GPU frame rates or battery use.

## Disable and rollback

`?cursor=off` skips the new cursor controller for that visit and leaves Juice's native Hardcore trail available. It does not re-enable the old fluid renderer.

Revert the cursor integration commit to restore the PR #16 state, including the old cursor. For a complete return to the production baseline, use the preserved remote branch `backup/pre-cursor-liquido-20261021` at `673794ffec82acde800df43ed31b5ded3cb0e592`. Prepare any restoration as a reviewed commit; never force-push the main branch.

The change is prepared on top of PR #16 (`ad9e778ecfd3ccba81496a19dd4dda73611f8e65`). Coordinate those changes before merging to `main`, because GitHub Pages publishes that branch. Preparing a branch or draft PR does not approve a production deployment.
