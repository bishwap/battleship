# BattleShipz

A public, browser-playable Battleship game against an AI opponent. Built with React 19, TypeScript, Vite, Tailwind CSS, and Vitest.

## Play the game

- Live site: https://bishwap.github.io/battleship/
- GitHub repo: https://github.com/bishwap/battleship

## How to play

- Place your fleet by dragging ships from the Ship Dock onto your board, clicking cells to place the selected ship, or tapping **Randomize Fleet**.
- Click the enemy board to fire.
- Red = hit, blue/white = miss, dark red = sunk.
- Keyboard users can move around the enemy board with the arrow keys and press **Enter** or **Space** to fire.
- Sink all five enemy ships before Admiral Intelligence (AI) sinks yours.

## Features

- AI with random, hunt, and target firing strategies.
- Drag-and-drop or tap-to-place ship placement.
- Pixel-art ships and animated water, hit, and sink effects.
- Commander chat with pixel avatars and shake effects on hits/exclamations.
- Sound and haptic feedback (toggleable in Settings).
- Keyboard and screen-reader friendly.
- Progressive Web App: installable from the browser with an offline fallback page.
- Responsive layout for desktop and mobile, including safe-area support for notched devices.

## Raga Studio (music app)

The same site also ships **Raga Studio**, a browser-based Indian music composer for people with no musical training. Switch between BattleShipz and Raga Studio with the tabs at the top of the page (or open `#raga` / `#battleship`).

All sound is synthesized client-side with the Web Audio API — no backend, no samples, no extra dependencies.

### How to use it

1. Pick a **Raga** (Bilawal, Yaman, Bhairav, Kafi, Bhupali, Khamaj). The rows for notes that belong to the raga turn blue; the raga's *vadi* (most important note) is marked.
2. Choose **Sa (tonic pitch)** — the base note everything else is tuned from — and a **Taal** (Teentaal 16, Keherwa 8, Dadra 6, Rupak 7).
3. Click grid cells to place notes. Rows are the sargam (Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa'), columns are beats. `✕` marks the *sam*, the first beat of each cycle. Click a note name to hear it on its own.
4. Press **Play**. The currently playing beat is highlighted, a tanpura-style drone hums Sa and Pa underneath, and a synthesized tabla keeps the taal.
5. Adjust **Tempo** (40–200 BPM) and the number of **Beats** (4–32) while playing.
6. **Save** stores your composition in `localStorage`; **Load** restores it, **Reset** starts fresh.

### Where the code lives

- `src/lib/ragas.ts` — sargam swaras, just-intonation ratios, raga and tonic definitions.
- `src/lib/audio/` — `synth.ts` (plucked note), `drone.ts` (tanpura), `tabla.ts` (taals + percussion), `scheduler.ts` (look-ahead step clock), `context.ts` (shared `AudioContext`).
- `src/lib/sequencer.ts` — pure composition state (toggle, resize, prune to raga, serialize).
- `src/contexts/RagaStudioProvider.tsx` + `src/hooks/useRagaStudio.ts` — composition/playback state.
- `src/components/RagaStudio.tsx`, `SequencerGrid.tsx`, `StudioControls.tsx` — UI.
- `src/tests/ragas.test.ts`, `src/tests/sequencer.test.ts` — Vitest coverage for the pure logic.

## Development

```bash
npm install
npm run dev        # http://localhost:5173/battleship/
npm run test -- --run
npm run lint
npm run build
```

## PWA assets

The `public/` folder contains:

- `manifest.json` — PWA manifest with icons, screenshots, and shortcuts.
- `icon-192.png` / `icon-512.png` — standard launcher icons.
- `maskable-icon-192.png` / `maskable-icon-512.png` — Android adaptive/maskable icons.
- `apple-touch-icon.png` — iOS home-screen icon.
- `sw.js` — service worker that precaches the app shell and serves an offline fallback.

## Bugs and fixes

See [DEBUGGING.md](./DEBUGGING.md) for the full list of bugs found and fixed during development.

## License

MIT
