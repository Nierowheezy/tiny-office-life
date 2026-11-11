<div align="center">
  <h1>🏢 Tiny Office Life</h1>
  <p><strong>An interactive miniature isometric pixel-art virtual office with autonomous characters, daily routines, coffee breaks, and charming interactions.</strong></p>

  <p>
    <a href="https://tiny-office-life.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-tiny--office--life.vercel.app-00b4d8?style=for-the-badge&logo=vercel" alt="Live Demo"></a>
    <img src="https://img.shields.io/badge/version-1.0.0-6366f1?style=for-the-badge" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React 19">
    <img src="https://img.shields.io/badge/PixiJS-8-ff6b6b?style=for-the-badge" alt="PixiJS 8">
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript">
  </p>
</div>

---

## 🎮 Live Demo

**[Play Tiny Office Life →](https://tiny-office-life.vercel.app)**

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Morning Office View</strong></td>
      <td align="center"><strong>Character Details Panel</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/600x400/2563eb/ffffff?text=Isometric+Office+View" alt="Office View" width="500"></td>
      <td><img src="https://via.placeholder.com/600x400/f43f5e/ffffff?text=Character+Panel" alt="Character Panel" width="500"></td>
    </tr>
    <tr>
      <td align="center"><strong>Evening Lighting</strong></td>
      <td align="center"><strong>Activity Feed & Roster</strong></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/600x400/f97316/ffffff?text=Golden+Hour+Lighting" alt="Evening Lighting" width="500"></td>
      <td><img src="https://via.placeholder.com/600x400/10b981/ffffff?text=Activity+Feed" alt="Activity Feed" width="500"></td>
    </tr>
  </table>
</div>

> 📝 **Note**: Replace placeholder images above with actual screenshots from the running app.

---

## ✨ Features

### 🤖 Autonomous Character Simulation
- **5 unique personalities** with distinct behaviors, roles, and dialogue
- **Dynamic needs system**: Energy, coffee cravings, social interaction, rest
- **Autonomous decision-making**: Characters choose actions based on personality and state
- **Real-time simulation**: 1 real second = 1 simulated minute (adjustable 1x/2x/4x)

### 🎨 Procedural Pixel Art (Zero Assets)
- **100% code-generated graphics** — no external image files
- **5 characters × 6 actions × 4 facings** = 120 character sprites
- **14 furniture types** with state variations (brewing coffee, screen blink, etc.)
- **Dynamic floor tiles** (wood planks, carpet) with isometric depth sorting
- **Animated wall clock** with real-time minute hand

### 🎮 Interactive Controls
- **Drag to pan** / **Scroll to zoom** (0.6x – 2.5x)
- **Q/E or toolbar** to rotate camera 90°
- **Click characters/furniture** to inspect details
- **Click floor** to spawn ripple effect
- **Quick actions**: Send to coffee, cheer up, send to desk

### 🔊 Procedural Audio (Web Audio API)
- Mechanical keyboard clacks while working
- Coffee machine bubbling sounds
- Water cooler bloops
- Chime notifications
- Sleepy Zzz tones

### 🌅 Dynamic Atmosphere
- **Time-of-day lighting**: Warm morning → neutral midday → golden evening
- **Live wall clock** synchronized with simulation time
- **Ambient particles**: Steam from coffee, Zzz bubbles from sleeping
- **Day cycle**: 8:00 AM – 6:00 PM with automatic end-of-day sequence

---

## 👥 Meet the Team

| Character | Role | Personality | Special Behaviors |
|-----------|------|-------------|-------------------|
| **Alex** | Senior Full-Stack Dev | High energy, clean code advocate | Refactors rendering pipelines, TypeScript enthusiast |
| **Sarah** | Lead UI/UX Designer | Detail-oriented, plant parent | Waters monstera, reviews color palettes, collabs with Alex |
| **Mike** | Office Manager | Supportive, organized | 1-on-1 check-ins, manages coffee supply, plans team events |
| **Toby** | Engineering Intern | Eager, coffee-obsessed | Frequent coffee breaks, learning PixiJS, StackOverflow browser |
| **Kevin** | Backend Architect | Brilliant, nap-prone | Power naps on sofa, dreams of distributed systems, low energy |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript 5, Vite 8 |
| **Rendering** | PixiJS 8 (WebGL/WebGPU) |
| **Styling** | Tailwind CSS 4, CSS Variables |
| **Animation** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Build/Deploy** | Vercel (zero-config) |
| **Package Manager** | Bun / npm |

---

## 🏗 Architecture

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Root component, UI composition
├── index.css                # Global styles, Tailwind imports
├── types/index.ts           # TypeScript interfaces & types
├── components/              # React UI components
│   ├── TopBar.tsx           # Time, speed, pause, day controls
│   ├── CharacterPanel.tsx   # Character detail modal
│   ├── FurniturePanel.tsx   # Furniture detail modal
│   ├── ActivityFeed.tsx     # Live event log
│   ├── QuickRoster.tsx      # Character avatar bar
│   └── CameraControls.tsx   # Zoom/rotate/reset toolbar
├── simulation/              # Game logic (runs independent of render)
│   ├── OfficeSimulation.ts  # Main loop, character AI, state mgmt
│   └── CharacterState.ts    # Initial character definitions
├── game/                    # PixiJS rendering engine
│   ├── OfficeScene.ts       # Scene graph, camera, effects, tick
│   ├── Isometric.ts         # 2:1 iso projection math + rotation
│   ├── Pathfinding.ts       # A* on 13×13 grid
│   ├── SpriteFactory.ts     # 1000+ lines procedural pixel art
│   └── Furniture.ts         # Furniture layout & metadata
└── audio/
    └── SoundEffects.ts      # Web Audio API synth (no audio files)
```

### Key Design Decisions

- **Simulation ↔ Render separation**: `OfficeSimulation` runs pure logic; `OfficeScene` subscribes and renders
- **Observer pattern**: UI components subscribe to simulation state changes
- **Procedural everything**: Sprites, sounds, textures generated at runtime → tiny bundle, no asset pipeline
- **Isometric depth sorting**: `calculateDepth()` with rotation awareness for correct z-ordering

---

## 🎮 Controls

| Action | Key / Interaction |
|--------|-------------------|
| Pan camera | Drag (mouse/touch) |
| Zoom | Scroll wheel / pinch |
| Rotate 90° CW | `E` or toolbar |
| Rotate 90° CCW | `Q` or toolbar |
| Reset view | `R` or toolbar |
| Inspect character | Click character |
| Inspect furniture | Click furniture |
| Deselect | Click empty floor |
| Trigger coffee break | TopBar button / furniture click |
| Cheer up character | Character panel button |
| Send to desk | Character panel button |
| Pause/Resume | TopBar button |
| Speed (1x/2x/4x) | TopBar buttons |
| End day / Restart | TopBar buttons |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or Bun 1.0+)

### Installation

```bash
# Clone the repo
git clone https://github.com/Nierowheezy/tiny-office-life.git
cd tiny-office-life

# Install dependencies
npm install        # or: bun install

# Start dev server
npm run dev        # or: bun run dev
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build      # Outputs to ./dist
npm run preview    # Preview production build locally
```

---

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nierowheezy/tiny-office-life)

1. Push to GitHub
2. Import project in Vercel
3. Zero-config deploy — `vercel.json` handles build settings

### Manual Deploy

```bash
npm run build
# Deploy ./dist to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc.)
```

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build to `./dist` |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with `tsc --noEmit` |

### Project Structure Notes

- **No external assets**: All graphics/sounds generated in `SpriteFactory.ts` and `SoundEffects.ts`
- **Simulation is deterministic**: Given same seed, same sequence (useful for testing)
- **React + PixiJS integration**: PixiJS canvas mounted in React ref, updated via simulation subscription

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **PixiJS** — blazing fast 2D WebGL renderer
- **Tailwind CSS** — utility-first styling
- **Vercel** — seamless deployment platform
- **Framer Motion** — delightful animations
- **Lucide** — beautiful open-source icons

---

## 📈 Releases

### v1.0.0 (Latest) — 2026-11-11
- Initial release
- 5 autonomous characters with unique personalities
- Full 8AM–6PM day cycle with dynamic lighting
- Procedural pixel art (characters, furniture, floors, walls)
- Procedural audio synthesis
- Interactive isometric camera (pan, zoom, rotate)
- A* pathfinding with dynamic walkability
- Live activity feed and character inspection panels

---

<div align="center">
  <p>Made with ☕ and 💻 by <a href="https://github.com/Nierowheezy">Nierowheezy</a></p>
  <p><a href="https://tiny-office-life.vercel.app">Play Now</a> · <a href="https://github.com/Nierowheezy/tiny-office-life/issues">Report Bug</a> · <a href="https://github.com/Nierowheezy/tiny-office-life/issues">Request Feature</a></p>
</div>