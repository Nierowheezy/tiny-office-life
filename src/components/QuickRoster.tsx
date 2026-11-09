import React from 'react';
import { CharacterData, CharacterId } from '../types';
import { officeSim } from '../simulation/OfficeSimulation';

interface QuickRosterProps {
  characters: Record<CharacterId, CharacterData>;
  selectedId: CharacterId | null;
}

export const QuickRoster: React.FC<QuickRosterProps> = ({ characters, selectedId }) => {
  const getStatusDot = (char: CharacterData) => {
    if (char.isHome) return 'bg-slate-300';
    switch (char.state) {
      case 'WORKING':
        return 'bg-blue-500 animate-pulse';
      case 'DRINKING':
        return 'bg-amber-500';
      case 'SLEEPING':
        return 'bg-purple-500';
      case 'CHATTING':
        return 'bg-emerald-500';
      case 'RESTING':
        return 'bg-teal-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-slate-200/80 pointer-events-auto">
      {Object.values(characters).map((char) => {
        const isSelected = selectedId === char.id;
        return (
          <button
            key={char.id}
            onClick={() => officeSim.selectCharacter(isSelected ? null : char.id)}
            className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
              isSelected
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title={`${char.name} (${char.role}) - ${char.state}`}
          >
            {/* Avatar circle */}
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: char.avatarColor }}
            >
              {char.name[0]}
            </div>

            {/* Name */}
            <span className="text-xs font-semibold">{char.name}</span>

            {/* Status dot */}
            <span
              className={`w-2 h-2 rounded-full ${getStatusDot(char)}`}
              title={char.state}
            />

            {/* Energy mini bar on hover or when selected */}
            <div className="hidden sm:block w-8 h-1 bg-slate-200 rounded-full overflow-hidden ml-0.5">
              <div
                className={`h-full ${
                  char.energy > 60
                    ? 'bg-emerald-500'
                    : char.energy > 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${char.energy}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
