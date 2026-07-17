# BattleShipz Debugging Report

This document records bugs discovered during final debugging, their root cause, and the fix applied.

## 1. Global keyboard shortcuts leaked through modal overlays

**Symptom:** While modal overlays such as the difficulty selector, tutorial, "Ready for battle?" confirmation, or zoomed fleet view were open, pressing `r` could randomize the board behind the overlay, `n` could start a new game, or `m` could toggle sound. These actions should be suspended while a modal has focus.

**Root cause:** `App.tsx` registered a single `window` `keydown` listener for shortcuts (`n`, `r`, `u`, `m`). It only guarded against input/textarea targets; it did not check whether any modal overlay was currently open.

**Fix:** Added an early return in the `keydown` handler when any of the following is true:

- `showIntro`
- `showNameEntry`
- `showTutorial`
- `showDifficultySelect`
- `showBattleOverlay`
- `fleetZoomed`
- `game.gameOver`

This keeps the in-game shortcuts active only during normal setup/battleplay and leaves modal-specific keyboard handling to each overlay.

**File changed:** `src/App.tsx`

## 2. Miss-hint banner stayed visible after the player scored a hit

**Symptom:** After three consecutive misses, the strategic hint banner appeared at the bottom as intended, but it did not disappear once the player finally hit a ship. It remained until manually dismissed.

**Root cause:** The `useEffect` in `App.tsx` that controlled `showHint` only set the state to `true` when `consecutiveMisses >= 3`. It never set it back to `false` when `consecutiveMisses` reset to `0` on a hit.

**Fix:** Changed the effect to derive `showHint` directly from `consecutiveMisses`:

```ts
useEffect(() => {
  setShowHint(game.consecutiveMisses >= 3);
}, [game.consecutiveMisses]);
```

Now the banner hides automatically as soon as the player hits or sinks an enemy ship.

**File changed:** `src/App.tsx`

## 3. Crash when switching to a larger board size (Hard 12×12)

**Symptom:** Selecting the `Hard` difficulty (12×12 board) from the default `Medium` (10×10) could crash the game.

**Root cause:** In `Board.tsx`, the `cellRefs` array was initialized once to the size of the first render. When the board size increased, the ref callback tried to assign `cellRefs.current[y][x] = el` before the new row array existed.

**Fix:** Made the ref callback defensive by creating the row array before assignment and clamping/resetting `activeCell` whenever the board size changes.

**File changed:** `src/components/Board.tsx` (already merged via PR #9)

## 4. Ships could be placed touching each other

**Symptom:** The strategic hint tells players "ships can't touch," yet the placement logic allowed ships to be placed adjacent or diagonally. This made the hint misleading and allowed invalid boards during both manual placement and randomization.

**Root cause:** `canPlaceShip` in `src/lib/gameLogic.ts` only checked that the ship's own cells were empty (or belonged to the ship being moved). It did not inspect the surrounding cells.

**Fix:** After verifying the ship path, `canPlaceShip` now scans all eight neighboring cells for every cell in the path and rejects the placement if any neighbor contains a ship that is not the one being placed/rotated.

**File changed:** `src/lib/gameLogic.ts`

## 5. Tally board repeated the percent sign

**Symptom:** The tally board showed `Win %` as a label and `0%` as the value, duplicating the percent symbol.

**Root cause:** `src/components/TallyBoard.tsx` used the label `Win %` and then rendered `{winRate}%` as the value.

**Fix:** Changed the label to `Win Rate` so the value `{winRate}%` reads clearly as "Win Rate 0%."

**File changed:** `src/components/TallyBoard.tsx`

## 6. Tutorial card overflowed on small screens

**Symptom:** On short/mobile viewports the tutorial card could extend beyond the screen, and its height changed from step to step because the body text was allowed to shrink.

**Root cause:** `src/components/TutorialOverlay.tsx` set a fixed `min-h-[420px]` without a `max-height`, did not make the content area scrollable, and let the body text collapse to its content size.

**Fix:** Restructured the card so the body area has a stable minimum height, is scrollable, and never exceeds `85dvh`. The step indicators and navigation buttons were moved into a fixed footer so they stay in place while the text scrolls.

**File changed:** `src/components/TutorialOverlay.tsx`

## Verification

- `npm run lint` – passes
- `npm run test -- --run` – 13/13 tests pass
- `npm run build` – passes
- Manual browser checks confirmed:
  - Easy (8×8), Medium (10×10), and Hard (12×12) boards render correctly.
  - `r` no longer randomizes the fleet while the difficulty selector or battle-ready overlay is open.
  - The hint banner appears after three misses and disappears on the next hit.
  - No crash when selecting Hard from a default Medium board.
  - Ship placement (manual, rotate, randomize) respects the no-touching rule.
  - The tutorial card fits within mobile viewports and the Next/Skip buttons stay visible.
  - The tally board reads "Win Rate" with the percent next to the number.
