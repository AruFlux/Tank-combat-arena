## Packages
pixi.js | High-performance 2D rendering engine (easier/faster than raw canvas for complex scenes)
framer-motion | For UI animations (menus, HUD transitions)
zustand | State management for game UI overlay (HP, Ammo, Score)
howler | Audio management for sound effects (explosions, shooting)

## Notes
The game logic will be implemented using a custom loop within a React component.
We will use PixiJS for rendering the tanks and projectiles for better performance than raw 2D canvas context.
The game state (HP, Ammo, Enemies Alive) needs to sync from the game loop to the React UI overlay via a Zustand store.
