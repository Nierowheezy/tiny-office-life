import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OfficeScene } from './game/OfficeScene';
import { officeSim } from './simulation/OfficeSimulation';
import { SimulationState } from './types';
import { TopBar } from './components/TopBar';
import { CharacterPanel } from './components/CharacterPanel';
import { FurniturePanel } from './components/FurniturePanel';
import { ActivityFeed } from './components/ActivityFeed';
import { QuickRoster } from './components/QuickRoster';
import { CameraControls } from './components/CameraControls';
import { AboutPanel } from './components/AboutPanel';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<OfficeScene | null>(null);
  const [simState, setSimState] = useState<SimulationState>(officeSim.getState());
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Subscribe to simulation state
    const unsubscribe = officeSim.subscribe(setSimState);

    // Initialize PixiJS Office Scene
    if (canvasContainerRef.current) {
      const scene = new OfficeScene(canvasContainerRef.current);
      sceneRef.current = scene;
      scene.init().catch(console.error);
    }

    // Custom event handler for opening About panel
    const handleOpenAbout = () => setShowAbout(true);
    window.addEventListener('open-about', handleOpenAbout);

    // Keyboard shortcut: H key for About
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, [contenteditable="true"]')) {
          e.preventDefault();
          setShowAbout(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('open-about', handleOpenAbout);
      window.removeEventListener('keydown', handleKeyDown);
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  const selectedCharacter = simState.selectedCharacterId
    ? simState.characters[simState.selectedCharacterId]
    : null;

  const selectedFurniture = simState.selectedFurnitureId
    ? simState.furniture.find(f => f.id === simState.selectedFurnitureId)
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-['Plus_Jakarta_Sans'] bg-gradient-to-b from-[#fbf8f3] via-[#f4ede4] to-[#e8ded1]">
      {/* Top Bar UI */}
      <TopBar simState={simState} />

      {/* PixiJS Canvas Container */}
      <div
        ref={canvasContainerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Character Details Panel */}
      {selectedCharacter && (
        <CharacterPanel
          character={selectedCharacter}
          onClose={() => officeSim.selectCharacter(null)}
        />
      )}

      {/* Furniture Details Panel */}
      {selectedFurniture && (
        <FurniturePanel
          furniture={selectedFurniture}
          onClose={() => officeSim.selectFurniture(null)}
        />
      )}

      {/* Camera Controls Toolbar (Zoom, Pan, Rotate) */}
      <CameraControls sceneRef={sceneRef} />

      {/* Live Activity Feed */}
      <ActivityFeed />

      {/* Quick Team Roster Navigation Bar */}
      <QuickRoster
        characters={simState.characters}
        selectedId={simState.selectedCharacterId}
      />

      {/* About Panel */}
      {showAbout && (
        <AboutPanel onClose={() => setShowAbout(false)} />
      )}

      {/* Ambient Micro-hint at top center */}
      <div className="hidden lg:flex absolute top-18 left-1/2 -translate-x-1/2 z-10 items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-slate-200/60 text-[11px] font-medium text-slate-500 shadow-2xs pointer-events-none">
        <span>Drag to pan</span>
        <span>•</span>
        <span>Scroll to zoom</span>
        <span>•</span>
        <span>Q/E to rotate 90°</span>
        <span>•</span>
        <span>Click to inspect & ripple</span>
        <span>•</span>
        <span>H for About</span>
      </div>
    </div>
  );
}
