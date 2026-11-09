import React from 'react';
import {
  X,
  Coffee,
  Sparkles,
  Laptop,
  BatteryCharging,
  MessageSquare,
  Moon,
  Footprints,
  Compass,
} from 'lucide-react';
import { CharacterData } from '../types';
import { officeSim } from '../simulation/OfficeSimulation';

interface CharacterPanelProps {
  character: CharacterData;
  onClose: () => void;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ character, onClose }) => {
  const getStatusBadge = () => {
    switch (character.state) {
      case 'WORKING':
        return {
          icon: <Laptop className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Focused & Working',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'DRINKING':
        return {
          icon: <Coffee className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Coffee Break',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'CHATTING':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Catching Up',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'SLEEPING':
        return {
          icon: <Moon className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Power Napping 😴',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'RESTING':
        return {
          icon: <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />,
          label: 'Resting on Sofa',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'WALKING':
        return {
          icon: <Footprints className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Walking Around',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'GOING_HOME':
        return {
          icon: <Compass className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Heading Home',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          icon: <Compass className="w-3.5 h-3.5 text-slate-600" />,
          label: 'Taking a breath',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const status = getStatusBadge();

  // Energy color
  const energyPercent = Math.round(character.energy);
  const energyColor =
    energyPercent > 60 ? 'bg-emerald-500' : energyPercent > 25 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="absolute top-18 right-3 z-30 w-80 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-4 transition-all animate-in fade-in slide-in-from-right-3 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-white"
            style={{ backgroundColor: character.avatarColor }}
          >
            {character.name[0]}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {character.name}
            </h2>
            <p className="text-xs font-medium text-slate-500">{character.role}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Badge & Bio */}
      <div className="space-y-2 mb-3">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${status.bg}`}
        >
          {status.icon}
          <span>{status.label}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          {character.bio}
        </p>
      </div>

      {/* Energy Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600 flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-slate-500" />
            Energy Level
          </span>
          <span className="text-slate-900 font-mono">{energyPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${energyColor}`}
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
            <Coffee className="w-3 h-3 text-amber-500" />
            Espressos
          </div>
          <div className="text-sm font-bold text-slate-800">{character.coffeeCount} cups</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
            <Laptop className="w-3 h-3 text-blue-500" />
            Productivity
          </div>
          <div className="text-sm font-bold text-slate-800">
            {character.linesOfCodeOrTasks} pts
          </div>
        </div>
      </div>

      {/* Current Thought */}
      <div className="mb-4 bg-amber-50/70 border border-amber-100/80 p-2.5 rounded-xl">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-amber-600" />
          Current Thought
        </div>
        <p className="text-xs text-amber-900 italic font-medium">
          "{character.currentThought}"
        </p>
      </div>

      {/* Interactive Command Buttons */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
        <button
          onClick={() => officeSim.triggerCoffeeBreak(character.id)}
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all border border-amber-200/50"
          title="Send to Coffee Machine"
        >
          <Coffee className="w-4 h-4 text-amber-600" />
          <span>Coffee</span>
        </button>

        <button
          onClick={() => officeSim.cheerUpCharacter(character.id)}
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all border border-emerald-200/50"
          title="Cheer up and boost energy"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Cheer Up</span>
        </button>

        <button
          onClick={() => officeSim.sendToDesk(character.id)}
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 transition-all border border-blue-200/50"
          title="Send back to assigned desk"
        >
          <Laptop className="w-4 h-4 text-blue-600" />
          <span>To Desk</span>
        </button>
      </div>
    </div>
  );
};
