# Cursor líquido integration

This page uses Cursor líquido 1.0.1 with Juice 1.2.0. The cursor follows the existing Juega selector through `js/cursor-conductor.js`; it never writes the level, sound preference, Moki progress or unlock state.

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
npm install --no-save --package-lock=false playwright@1.64.1
npx playwright install chromium
npm run test:cursor
```

The suite checks vendor checksums, the negative checksum guard, ES/EN content against production baseline `673794ffec82acde800df43ed31b5ded3cb0e592`, all four levels, one owner, visible colour, obstacles, native controls, Moki, sound preferences, lifecycle, reduced motion and rollback-query behaviour. It includes touch emulation at 375px and a 320/390/1440px ES/EN matrix. Browser evidence goes into ignored `qa/cursor-liquido/`.

Software-rendered Chromium and emulated touch do not certify Safari, physical phones, GPU frame rates or battery use.

## Disable and rollback

`?cursor=off` skips the new cursor controller for that visit and leaves Juice's native Hardcore trail available. It does not re-enable the old fluid renderer.

Revert the cursor integration commit to restore the PR #16 state, including the old cursor. For a complete return to the production baseline, use the preserved remote branch `backup/pre-cursor-liquido-20261021` at `673794ffec82acde800df43ed31b5ded3cb0e592`. Prepare any restoration as a reviewed commit; never force-push the main branch.

The change is prepared on top of PR #16 (`ad9e778ecfd3ccba81496a19dd4dda73611f8e65`). Coordinate those changes before merging to `main`, because GitHub Pages publishes that branch. Preparing a branch or draft PR does not approve a production deployment.
