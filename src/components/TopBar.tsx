import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  LogOut,
  Coffee,
  Volume2,
  VolumeX,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SimulationState } from '../types';
import { officeSim } from '../simulation/OfficeSimulation';
import { sounds } from '../audio/SoundEffects';

interface TopBarProps {
  simState: SimulationState;
}

export const TopBar: React.FC<TopBarProps> = ({ simState }) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Brand & Time */}
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white shadow-sm">
            <Coffee className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
              Tiny Office Life
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                Live
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{simState.timeString}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-sans font-normal text-[11px]">
                {Math.round(simState.dayProgress * 100)}% day
              </span>
            </div>
          </div>
        </div>

        {/* Working counter badge */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs font-medium text-slate-600">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>
            <strong className="text-slate-800">{simState.activeWorkersCount}</strong>/5 working
          </span>
        </div>
      </div>

      {/* Controls & Speed & Audio */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-slate-200/80 pointer-events-auto">
        {/* Play / Pause */}
        <button
          onClick={() => officeSim.setPaused(!simState.isPaused)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            simState.isPaused
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={simState.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {simState.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Speed Buttons */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
          {([1, 2, 4] as const).map(spd => (
            <button
              key={spd}
              onClick={() => officeSim.setSpeed(spd)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                simState.speed === spd
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Trigger Quick Coffee Button */}
        <button
          onClick={() => officeSim.triggerCoffeeBreak()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 transition-all"
          title="Send someone for a coffee break"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Coffee Break</span>
        </button>

        {/* Send All Home */}
        <button
          onClick={() => officeSim.sendEveryoneHome()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all"
          title="Send everyone home for the day"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clock Out</span>
        </button>

        {/* Restart Day */}
        <button
          onClick={() => officeSim.restartOfficeDay()}
          className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          title="Restart Day (8:00 AM)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          className={`p-2 rounded-xl transition-all ${
            isMuted
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
          }`}
          title={isMuted ? 'Unmute cozy office sounds' : 'Mute sounds'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
