# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-11

### Added
- **Core Simulation**: Autonomous office simulation with 5 unique characters (Alex, Sarah, Mike, Toby, Kevin)
- **Character AI**: Personality-driven decision making, energy management, coffee breaks, social interactions, power naps
- **Day Cycle**: 8:00 AM – 6:00 PM simulation with time-accelerated clock (1 real sec = 1 sim min)
- **Speed Controls**: 1x, 2x, 4x simulation speed with pause/resume
- **End-of-Day Sequence**: Automatic "send everyone home" at 6:00 PM with restart option

### Rendering & Graphics
- **Procedural Pixel Art**: 100% code-generated sprites via `SpriteFactory.ts` (1000+ lines)
  - 5 characters × 6 actions (idle, walk1, walk2, typing, drinking, sleeping) × 4 facings = 120 sprites
  - 14 furniture types with state variations (brewing coffee, screen blink, etc.)
  - Isometric floor tiles (wood planks, carpet) with depth sorting
  - Dynamic wall clock with moving minute hand
- **Isometric Engine**: 2:1 projection with 4-way rotation (0°, 90°, 180°, 270°)
- **Camera System**: Drag-to-pan, scroll/pinch-to-zoom (0.6x–2.5x), keyboard rotation (Q/E)
- **Visual Effects**: Ripple on click, particle systems (coffee steam, Zzz bubbles), ambient lighting transitions
- **Depth Sorting**: Correct z-ordering with rotation awareness

### Audio
- **Procedural Sound Synthesis**: Web Audio API (zero audio assets)
  - Mechanical keyboard clacks during work
  - Coffee machine bubbling
  - Water cooler bloops
  - UI chimes and clicks
  - Sleepy Zzz tones

### UI/UX
- **Top Bar**: Time display, day progress, speed controls, pause, end day/restart
- **Character Panel**: Stats (energy, coffee count, tasks), bio, current thought, quick actions
- **Furniture Panel**: Descriptions, interaction hints
- **Activity Feed**: Live log with categorized events (work, coffee, sleep, chat, break, system)
- **Quick Roster**: Clickable character avatars for instant selection
- **Camera Controls Toolbar**: Visual zoom/rotate/reset buttons
- **Responsive Design**: Works desktop + mobile (touch pan/zoom/pinch)

### Technical
- **Architecture**: Clean separation of simulation (logic) and rendering (PixiJS)
- **State Management**: Observer pattern with subscription-based updates
- **Pathfinding**: A* on 13×13 grid with dynamic walkability
- **TypeScript**: Strict typing throughout with comprehensive type definitions
- **Zero External Assets**: No images, fonts, or audio files — everything generated at runtime
- **Bundle Size**: ~544 KB JS (gzipped ~162 KB)

### Deployment
- **Vercel Configuration**: Zero-config deploy with `vercel.json`
- **GitHub Actions Ready**: CI workflow for type-check and build verification

---

## [Unreleased]

### Planned
- Character customization (names, colors, roles)
- More furniture types (printer, snack bar, meeting table)
- Multiplayer/spectator mode via WebRTC
- Save/load simulation state to localStorage
- Accessibility improvements (screen reader support, reduced motion)
- Performance optimizations (sprite atlasing, frustum culling)