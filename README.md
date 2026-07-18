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

## Development

```bash
npm install
npm run dev
npm run test -- --run
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
