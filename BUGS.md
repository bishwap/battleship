# Battleship — Bugs Found and Fixed

This document lists every bug, error, or unexpected behavior found during the build, test, and play-through of the Battleship game, plus the reason it happened and how it was fixed.

## 1. Tailwind CSS `init` command failed

**What happened:** `npx tailwindcss init -p` returned an error.  
**Why:** The project had `tailwindcss` v4 installed, but `init` is a Tailwind v3 CLI command. Tailwind v4 uses a completely different configuration system (`@tailwindcss/vite`) and does not have an `init` command.  
**Fix:** Uninstalled `tailwindcss` v4 and installed `tailwindcss@3`, then ran `npx tailwindcss init -p`. This created the `tailwind.config.js` and `postcss.config.js` files expected by the Vite + PostCSS build.

## 2. Production build could not find `dist` assets at the public link

**What happened:** Earlier the Vercel link showed a blank page.  
**Why:** Vercel CLI was not installed on the machine and the project was never configured or deployed through Vercel. The link that was tried was either a failed deployment or a default placeholder.  
**Fix:** Switched hosting to GitHub Pages. Set `base: '/battleship/'` in `vite.config.ts` so all asset paths are relative to the repo name, and added a GitHub Actions workflow to build `dist/` and deploy to the `gh-pages` branch.

## 3. AI stopped firing after a hit

**What happened:** After the AI made a hit, it would not take its next shot.  
**Why:** `useGame` had `useEffect([game.turn, game.gameOver])` controlling the AI timer. When the AI hit, `turn` stayed `'ai'` and `gameOver` stayed `false`, so the dependency array did not change and the effect did not re-run. The AI only fired again when `turn` changed from `'player'` to `'ai'`.  
**Fix:** Added `game.aiMemory` to the effect dependency array. The AI memory object changes after every AI shot, so the effect re-runs, letting the AI keep firing consecutive hits.

## 4. `vite.config.ts` type error on `test` property

**What happened:** `tsc` reported `test` does not exist in `UserConfigExport`.  
**Why:** Vite's own `defineConfig` does not include Vitest-specific properties in its type definition.  
**Fix:** Changed the import from `vite` to `vitest/config`. The Vitest config re-exports Vite's `defineConfig` with the `test` block typed correctly.

## 5. `gameLogic` test for sinking a ship failed

**What happened:** `reports a sunk ship and marks all its cells` expected `'sunk'` but got `'hit'`.  
**Why:** `fireAt` returns a brand-new `Board` object and does not mutate the original. The test fired the first shot but ignored the returned board, then fired the second shot on the original board, which still had `hits: 0`.  
**Fix:** Updated the test to chain the returned board: `const { board } = fireAt(board, x, y)`.

## 6. Unused imports and dead code

**What happened:** Several TypeScript warnings appeared for unused imports/variables (`CellState`, `ShipType`, `prioritizedQueue`, `aiLoseMessage`, `playerLoseMessage`, `Position`).  
**Why:** They were imported during early planning but never used, or a helper function was written and then abandoned.  
**Fix:** Removed the unused imports and the unused `prioritizedQueue` helper from `ai.ts`.

## 7. UI looked too small and lacked ship/water pixel art

**What happened:** The original board, chat avatars, and fleet sprites were small and used plain colored blocks.  
**Why:** The first pass focused on logic. The visual layer was mostly basic Tailwind utilities.  
**Fix:**
- Increased `Board` minimum/maximum widths, padding, and cell gap.
- Replaced plain ship squares with a `ShipSegment` SVG component that draws a pixel ship segment.
- Added a `PixelWater` background pattern to empty ocean cells.
- Made `CommanderAvatar` 16x16 pixel art with hat, epaulettes, and medals, and bumped chat avatar size to 64px.
- Added `ShipSegment` to the fleet `ShipSprite` so the fleet panel also shows pixel ships.

## 8. Chat and hit windows did not react to events

**What happened:** The chat was static and the hit board did not provide feedback.  
**Why:** No animation state was wired to game events.  
**Fix:**
- Added a `shakeSide` field to `GameState`. `playerFire` sets `'ai'` when the enemy is hit, `aiFire` sets `'player'` when the player is hit.
- `App.tsx` applies the `animate-shake` class to the board wrapper when the corresponding side is hit.
- `CommanderChat` watches the last message: if it contains `!`, it applies `animate-shake` to the chat panel.

## 9. AI name was generic

**What happened:** The user asked to rename the AI.  
**Why:** The placeholder name was `Admiral Byte`.  
**Fix:** Changed `AI_COMMANDER` to `Admiral Intelligence (AI)` in `src/lib/constants.ts` and updated all status/chat strings that use it.
