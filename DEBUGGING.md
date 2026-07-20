# BattleShipz Debugging Report

This document records the bugs, errors, and unexpected behaviors found and fixed during the development of BattleShipz. Each entry follows the pattern: **Symptom**, **Discovered by**, **Root cause**, **Fix**, and **File changed**.

## 1. Tailwind CSS `init` command failed

**Symptom:** `npx tailwindcss init -p` returned an error and would not generate the expected `tailwind.config.js` and `postcss.config.js` files.

**Discovered by:** Autonomous development setup

**Root cause:** The project had `tailwindcss` v4 installed, but `init` is a Tailwind v3 CLI command. Tailwind v4 uses a different configuration system (`@tailwindcss/vite`) and does not provide `init`.

**Fix:** Uninstalled `tailwindcss` v4, installed `tailwindcss@3`, and ran `npx tailwindcss init -p` to create the configuration files expected by Vite + PostCSS.

**File changed:** `package.json`, `tailwind.config.js`, `postcss.config.js`

## 2. Production build assets were not found at the public link

**Symptom:** The public preview link showed a blank page instead of the built game.

**Discovered by:** Autonomous deployment verification

**Root cause:** Vercel CLI was not installed or configured, and the tried link was a failed/default placeholder. The project needed a reliable static-hosting setup with the correct base path.

**Fix:** Switched hosting to GitHub Pages, set `base: '/battleship/'` in `vite.config.ts`, and added a GitHub Actions workflow to build `dist/` and deploy to the `gh-pages` branch.

**File changed:** `vite.config.ts`, `.github/workflows/deploy.yml`

## 3. AI stopped firing after a hit

**Symptom:** After the AI scored a hit, it did not take its next shot; it only fired again when the turn switched back from the player.

**Discovered by:** Autonomous integration testing

**Root cause:** The `useEffect` that triggers the AI timer had dependencies `[game.turn, game.gameOver]`. After an AI hit, `turn` stayed `'ai'` and `gameOver` stayed `false`, so the effect did not re-run.

**Fix:** Added `game.aiMemory` to the effect dependency array. `aiMemory` changes after every AI shot, so the effect re-runs and lets the AI keep firing consecutive hits.

**File changed:** `src/hooks/useGame.ts`

## 4. `vite.config.ts` type error on the `test` block

**Symptom:** `tsc` reported that `test` does not exist in `UserConfigExport`.

**Discovered by:** Autonomous type check (npm run build)

**Root cause:** Vite's own `defineConfig` does not include Vitest-specific properties in its type definition.

**Fix:** Changed the import from `vite` to `vitest/config`, which re-exports Vite's `defineConfig` with the `test` block typed correctly.

**File changed:** `vite.config.ts`

## 5. `gameLogic` test for sinking a ship failed

**Symptom:** The test "reports a sunk ship and marks all its cells" expected `'sunk'` but got `'hit'`.

**Discovered by:** Autonomous test run (npm run test)

**Root cause:** `fireAt` returns a brand-new `Board` object and does not mutate the original. The test fired the first shot but ignored the returned board, then fired the second shot on the original board that still had `hits: 0`.

**Fix:** Updated the test to chain the returned board: `const { board } = fireAt(board, x, y)`.

**File changed:** `src/tests/gameLogic.test.ts`

## 6. Unused imports and dead code caused lint warnings

**Symptom:** TypeScript/Oxlint warnings appeared for unused imports/variables and for an abandoned helper function.

**Discovered by:** Autonomous lint run (npm run lint)

**Root cause:** Several identifiers were imported during early planning but never used, and `prioritizedQueue` was written and then abandoned.

**Fix:** Removed unused imports (`CellState`, `ShipType`, `aiLoseMessage`, `playerLoseMessage`, etc.) and deleted the unused `prioritizedQueue` helper.

**File changed:** `src/hooks/useGame.ts`, `src/lib/ai.ts`, and other affected files

## 7. Board and fleet looked too small and used plain colored blocks

**Symptom:** The board, chat avatars, and fleet sprites were small and lacked a themed, readable appearance.

**Discovered by:** Autonomous visual review

**Root cause:** The first implementation focused on logic and used basic Tailwind utilities without pixel-art assets.

**Fix:**
- Increased `Board` minimum/maximum widths, padding, and cell gap.
- Replaced plain ship squares with a `Ship` SVG component that draws pixel-art ship segments.
- Added a `PixelWater` background pattern and animated wave effect to empty ocean cells.
- Made `CommanderAvatar` 16×16 pixel art with hat, epaulettes, and medals, and increased the chat avatar size to 64 px.
- Added `Ship` sprites to the fleet `ShipSprite` so the fleet panel also shows pixel ships.

**File changed:** `src/components/Board.tsx`, `src/components/Cell.tsx`, `src/components/Ship.tsx`, `src/components/CommanderAvatar.tsx`, `src/index.css`

## 8. Chat and hit windows did not react to game events

**Symptom:** The chat log was static and the board did not provide visual feedback when a ship was hit.

**Discovered by:** Autonomous UX review

**Root cause:** No animation state was wired to game events.

**Fix:**
- Added `shakeSide` to `GameState`. `playerFire` sets it to `'ai'` when the enemy is hit; `aiFire` sets it to `'player'` when the player is hit.
- `App.tsx` applies `animate-shake` to the board wrapper when the corresponding side is hit.
- `CommanderChat` watches the last message and applies `animate-shake` when it contains an exclamation.

**File changed:** `src/hooks/useGame.ts`, `src/App.tsx`, `src/components/CommanderChat.tsx`, `src/components/Board.tsx`

## 9. AI commander had a generic placeholder name

**Symptom:** The AI was displayed as `Admiral Byte`, which felt placeholder-ish.

**Discovered by:** User report

**Root cause:** `AI_COMMANDER` in constants used a temporary name and not all status/chat strings were centralized.

**Fix:** Changed `AI_COMMANDER` to `Admiral Intelligence (AI)` in `src/lib/constants.ts` and updated all status and chat strings that use it.

**File changed:** `src/lib/constants.ts`

## 10. Firing at an already-hit cell consumed the player's turn

**Symptom:** Clicking an enemy cell that was already `hit`, `miss`, or `sunk` passed the turn to the AI.

**Discovered by:** Autonomous smoke test

**Root cause:** `playerFire` did not guard against firing on non-empty cells before calling `fireAt`.

**Fix:** Added an early return using `isValidTarget(prev.enemyBoard, x, y)` so only `empty` enemy cells end the turn.

**File changed:** `src/hooks/useGame.ts`

## 11. Enemy ship positions leaked to screen readers

**Symptom:** The enemy board's `aria-label` revealed hidden ship cells as `"A1 ship"` before they were hit.

**Discovered by:** Autonomous accessibility review

**Root cause:** `Board.tsx` rendered the raw `cell.state` string in the `aria-label` for both player and enemy boards.

**Fix:** Masked hidden enemy ship cells by using `isPlayerBoard || cell.state !== 'ship' ? cell.state : 'empty'` when building the label.

**File changed:** `src/components/Board.tsx`

## 12. Board grid did not fit the viewport on mobile, desktop, or Safari

**Symptom:** The 10×10 board could be cut off horizontally or vertically on mobile and did not render as a square grid in Safari.

**Discovered by:** User report (Safari desktop sizing issue)

**Root cause:** The grid used per-cell `aspect-ratio`, a fixed `44px` minimum cell size, and `min-w-max` wrappers that forced overflow in narrow viewports. Safari handles `aspect-ratio` inside grid rows inconsistently.

**Fix:**
- Replaced per-cell `aspect-ratio` with a padding-bottom square wrapper around the grid.
- Switched the grid to equal `1fr` rows and columns.
- Removed the `44px` cell minimums and `min-w-max` wrappers so the board scales with the available space.

**File changed:** `src/components/Board.tsx`, `src/index.css`

## 13. Service worker served stale GitHub Pages builds

**Symptom:** Returning visitors saw an old version of the game after a new release was deployed.

**Discovered by:** Autonomous deployment verification

**Root cause:** The original service worker was cache-first for the app shell and did not update precached `index.html` when a new build was deployed.

**Fix:**
- Bumped `CACHE_NAME` to `battleshipz-v3` and added cache cleanup in `activate`.
- Switched navigation requests to network-first, falling back to the cached shell/offline page.
- Registered the service worker with a cache-busting query string so updates are picked up.

**File changed:** `public/sw.js`, `src/main.tsx`

## 14. Placement preview was inaccurate when moving a selected ship

**Symptom:** When dragging or re-placing a ship that was already on the board, the preview could show the placement as invalid because it treated the ship's current cells as occupied.

**Discovered by:** Autonomous code review

**Root cause:** `canPlaceShip` had no way to ignore the ship being moved, so it checked the board cells before the old position was removed.

**Fix:** Added an optional `ignoreShipId` parameter to `canPlaceShip` and passed the selected ship ID from `Board.tsx` preview logic.

**File changed:** `src/lib/gameLogic.ts`, `src/components/Board.tsx`

## 15. Start Battle could be clicked before the fleet was complete

**Symptom:** The **Start Battle** button was active even when fewer than five ships were placed.

**Discovered by:** Autonomous code review

**Root cause:** `SetupControls` did not disable the button based on the number of placed ships.

**Fix:** Added a `canStartBattle` prop controlled by `game.playerBoard.ships.length === game.shipSet.length` and disabled the button when false.

**File changed:** `src/components/SetupControls.tsx`, `src/App.tsx`

## 16. Global keyboard shortcuts leaked through modal overlays

**Symptom:** Pressing `r`, `n`, `u`, or `m` while the difficulty selector, tutorial, "Ready for battle?" overlay, or zoomed fleet view was open still acted on the game behind the modal.

**Discovered by:** Autonomous debugging pass

**Root cause:** `App.tsx` registered a single `window` `keydown` listener but only guarded against input/textarea targets, not open overlays.

**Fix:** Added an early return in the `keydown` handler when any modal or game-over state is active, leaving in-game shortcuts active only during normal setup/play.

**File changed:** `src/App.tsx`

## 17. Hint banner stayed visible after the player scored a hit

**Symptom:** After three consecutive misses, the strategic hint banner appeared correctly but did not disappear once the player finally hit a ship.

**Discovered by:** Autonomous debugging pass

**Root cause:** The `useEffect` controlling `showHint` only set it to `true` when `consecutiveMisses >= 3` and never set it back to `false`.

**Fix:** Derived `showHint` directly from `consecutiveMisses`:

```ts
useEffect(() => {
  setShowHint(game.consecutiveMisses >= 3);
}, [game.consecutiveMisses]);
```

**File changed:** `src/App.tsx`

## 18. Crash when switching to a larger board size

**Symptom:** Selecting `Hard` (12×12) from the default `Medium` (10×10) could crash the game.

**Discovered by:** Autonomous Devin Review / manual test

**Root cause:** In `Board.tsx`, the `cellRefs` array was initialized to the size of the first render. When the board size increased, the ref callback tried to assign `cellRefs.current[y][x] = el` before the new row array existed.

**Fix:** Made the ref callback defensive by creating the row array before assignment and clamping/resetting `activeCell` whenever the board size changes.

**File changed:** `src/components/Board.tsx`

## 19. Sound did not play for the second consecutive game

**Symptom:** Audio worked on the first playthrough but was silent on subsequent games.

**Discovered by:** User report

**Root cause:** The `AudioContext` was created once but could enter a `suspended` state after the first use, and later sound calls did not resume it.

**Fix:** Updated `ensureAudioContext` to call `audioCtx.resume()` before scheduling any sound, and to handle autoplay restrictions gracefully.

**File changed:** `src/lib/feedback.ts`

## 20. Tutorial onboarding had usability and layout issues

**Symptom:** The tutorial did not welcome the player by name, used hard-to-read copy, had inconsistent step heights, blocked vertical scrolling on mobile, and the fleet dock was below the fold on small screens.

**Discovered by:** User report

**Root cause:** The tutorial overlay used a rigid `min-h-[420px]` card with all text in a static layout, and the setup screen did not prioritize the ship dock on mobile.

**Fix:**
- Rewrote tutorial copy to be shorter and friendlier, and parameterized the title with the player's name.
- Made the tutorial card scrollable with `max-h-[85dvh]`, a fixed footer for Next/Skip buttons, and a stable body height.
- Moved the ship dock above the board on mobile and auto-selected the first unplaced ship.
- Added health bars and renamed "Salvoes" to "Shots Fired".

**File changed:** `src/components/TutorialOverlay.tsx`, `src/App.tsx`, `src/index.css`

## 21. Ships could be placed touching each other

**Symptom:** The in-game hint tells players "ships can't touch," yet the placement logic allowed ships to be placed adjacent or diagonally.

**Discovered by:** Autonomous debugging pass

**Root cause:** `canPlaceShip` only checked that the ship's own cells were empty (or belonged to the ship being moved). It did not inspect surrounding cells.

**Fix:** After verifying the ship path, `canPlaceShip` now scans all eight neighboring cells for every cell in the path and rejects the placement if any neighbor contains another ship.

**File changed:** `src/lib/gameLogic.ts`

## 22. Tally board repeated the percent sign

**Symptom:** The tally board showed `Win %` as the label and `0%` as the value, duplicating the percent symbol.

**Discovered by:** User report

**Root cause:** `TallyBoard.tsx` used the label `Win %` and rendered `{winRate}%`.

**Fix:** Changed the label to `Win Rate` so the value reads correctly as "Win Rate 0%."

**File changed:** `src/components/TallyBoard.tsx`

## 23. Tutorial card overflowed on small screens

**Symptom:** On short/mobile viewports the tutorial card could extend beyond the screen, and its height changed from step to step because the body text was allowed to shrink.

**Discovered by:** User report

**Root cause:** `TutorialOverlay.tsx` set a fixed `min-h-[420px]` without a `max-height`, did not make the content area scrollable, and let the body text collapse to its content size.

**Fix:** Restructured the card so the body area has a stable minimum height, is scrollable, and never exceeds `85dvh`. The step indicators and navigation buttons were moved into a fixed footer so they stay in place while the text scrolls.

**File changed:** `src/components/TutorialOverlay.tsx`

## 24. Opening "How to Play" from an active game reset the setup

**Symptom:** During an active game, opening the tutorial from **Settings → How to Play** restarted the fleet setup or lost the current game state instead of overlaying the instructions.

**Discovered by:** User report

**Root cause:** The tutorial open handler did not distinguish between the first-time onboarding flow and a mid-game help request. Closing or skipping the tutorial could trigger the post-tutorial flow (e.g. showing the difficulty selector) as if the player had just started.

**Fix:** `App.tsx` now sets `tutorialSource='menu'` when opened from the settings panel. `handleTutorialDone` and `handleTutorialSkip` only advance to the difficulty selector when the source is `'onboarding'`; otherwise they simply close the overlay and leave the active game intact.

**File changed:** `src/App.tsx`, `src/components/SettingsPanel.tsx`

## 25. Status text and hint banner shifted the layout on mobile

**Symptom:** The status message at the top of the screen and the strategic hint banner could be long, causing the header and board to move up and down as text wrapped. On mobile this made the board and controls jump around.

**Discovered by:** User report

**Root cause:** Both elements were rendered in the normal document flow above the game boards, so changes in height pushed content below them.

**Fix:** Moved the status bar and hint banner into fixed bottom bars. The main content now has bottom padding equal to the combined bar height, keeping the board stable while the text updates.

**File changed:** `src/App.tsx`, `src/components/StatusBar.tsx`, `src/components/HintBanner.tsx`, `src/index.css`

## 26. Side chat lost the original admiral avatars and animations

**Symptom:** A refactor replaced the side-pane chat with header speech bubbles, which removed the original pixel-art admiral avatars and their idle/talk animations. It also caused the header area to shift as messages changed.

**Discovered by:** User report

**Root cause:** The new speech-bubble implementation rendered the dialogue outside the side pane and did not include the existing `CommanderAvatar` blink/talk animation states or the hit-induced shake.

**Fix:** Restored `CommanderChat` in the side pane with the original admiral avatars, blink/talk animations, and exclamation-triggered shake. Added `animate-shake` to the side-pane "Your Fleet" mini board when the AI hits one of the player's ships. Moved `SettingsPanel` to the bottom of the side pane so fleet status is easier to see.

**File changed:** `src/components/CommanderChat.tsx`, `src/components/Avatar.tsx`, `src/App.tsx`, `src/index.css`

## Verification

- `npm run lint` — passes
- `npm run test -- --run` — 13/13 tests pass
- `npm run build` — passes
- Manual browser checks confirmed:
  - Easy (8×8), Medium (10×10), and Hard (12×12) boards render correctly without cut-off.
  - `r` no longer randomizes the fleet while any overlay is open.
  - The hint banner appears after three misses and disappears on the next hit.
  - No crash when selecting Hard from a default Medium board.
  - Ship placement (manual, rotate, randomize) respects the no-touching rule.
  - The tutorial card fits within mobile viewports and the Next/Skip buttons stay visible.
  - The tally board reads "Win Rate" with the percent next to the number.
  - Already-hit/miss/sunk cells do not pass the turn to the AI.
  - Enemy `aria-label` does not leak hidden ship positions.
  - The AI continues firing after consecutive hits.
  - Opening "How to Play" from an active game does not reset the setup.
  - The status bar and hint banner stay fixed at the bottom and do not shift the boards.
  - The side chat keeps the original admiral avatars, animations, and hit shake.
