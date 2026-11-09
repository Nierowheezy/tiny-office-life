import React, { useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Compass,
  Move,
} from 'lucide-react';
import { CameraState, OfficeScene } from '../game/OfficeScene';

interface CameraControlsProps {
  sceneRef: React.RefObject<OfficeScene | null>;
}

export const CameraControls: React.FC<CameraControlsProps> = ({ sceneRef }) => {
  const [camState, setCamState] = useState<CameraState>({
    zoom: 1.0,
    rotation: 0,
    rotationDegrees: 0,
    isPanning: false,
  });

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const unsubscribe = scene.subscribeCamera(setCamState);

    // Keyboard shortcuts for power users:
    // + / -: Zoom
    // Q / E: Rotate 90°
    // R: Reset view
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        scene.zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        scene.zoomOut();
      } else if (e.key.toLowerCase() === 'q') {
        scene.rotateLeft();
      } else if (e.key.toLowerCase() === 'e') {
        scene.rotateRight();
      } else if (e.key.toLowerCase() === 'r') {
        scene.resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sceneRef]);

  const zoomPercent = Math.round(camState.zoom * 100);

  return (
    <div className="absolute top-18 left-3 z-30 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/80 pointer-events-auto">
      {/* Zoom In */}
      <button
        onClick={() => sceneRef.current?.zoomIn()}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
        title="Zoom In (+ or Scroll Up)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Percent readout */}
      <div className="text-[10px] font-bold text-center text-slate-500 font-mono select-none px-1">
        {zoomPercent}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={() => sceneRef.current?.zoomOut()}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
        title="Zoom Out (- or Scroll Down)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200/80 my-0.5" />

      {/* Rotate CCW */}
      <button
        onClick={() => sceneRef.current?.rotateLeft()}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
        title="Rotate 90° CCW (Q key)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Rotation Degree readout */}
      <div
        className="text-[10px] font-bold text-center text-indigo-600 font-mono select-none flex items-center justify-center"
        title="Current Camera Angle"
      >
        {camState.rotationDegrees}°
      </div>

      {/* Rotate CW */}
      <button
        onClick={() => sceneRef.current?.rotateRight()}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
        title="Rotate 90° CW (E key)"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200/80 my-0.5" />

      {/* Reset View */}
      <button
        onClick={() => sceneRef.current?.resetView()}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-95"
        title="Reset Camera (Center, 100%, 0° - R key)"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
