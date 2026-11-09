import React from 'react';
import { X, Coffee, Droplets, Armchair, BookOpen, Clock, Sparkles } from 'lucide-react';
import { FurnitureItem } from '../types';
import { officeSim } from '../simulation/OfficeSimulation';

interface FurniturePanelProps {
  furniture: FurnitureItem;
  onClose: () => void;
}

export const FurniturePanel: React.FC<FurniturePanelProps> = ({ furniture, onClose }) => {
  const getIcon = () => {
    switch (furniture.type) {
      case 'COFFEE_MACHINE':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'WATER_DISPENSER':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'SOFA':
        return <Armchair className="w-5 h-5 text-teal-600" />;
      case 'PLANT':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'BOOKSHELF':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'WALL_CLOCK':
        return <Clock className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleAction = () => {
    if (furniture.type === 'COFFEE_MACHINE') {
      officeSim.triggerCoffeeBreak();
    } else if (furniture.assignedCharacterId) {
      officeSim.selectCharacter(furniture.assignedCharacterId);
    }
  };

  return (
    <div className="absolute top-18 right-3 z-30 w-80 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-4 transition-all animate-in fade-in slide-in-from-right-3 duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
            {getIcon()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {furniture.name}
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {furniture.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
        {furniture.description}
      </p>

      {furniture.assignedCharacterId && (
        <div className="mb-3 p-2 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between">
          <span className="text-xs text-blue-900 font-medium">Assigned to:</span>
          <button
            onClick={() => officeSim.selectCharacter(furniture.assignedCharacterId!)}
            className="text-xs font-bold text-blue-700 hover:underline capitalize"
          >
            {furniture.assignedCharacterId} →
          </button>
        </div>
      )}

      {furniture.type === 'COFFEE_MACHINE' && (
        <button
          onClick={handleAction}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
        >
          <Coffee className="w-4 h-4" />
          <span>Call Colleague for Coffee</span>
        </button>
      )}
    </div>
  );
};
