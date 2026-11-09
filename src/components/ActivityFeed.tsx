import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Laptop,
  Moon,
  MessageSquare,
  Sparkles,
  Bell,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { ActivityLog } from '../types';
import { officeSim } from '../simulation/OfficeSimulation';

export const ActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(officeSim.getLogs());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    return officeSim.subscribeLogs(() => {
      setLogs(officeSim.getLogs());
    });
  }, []);

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'work':
        return <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'sleep':
        return <Moon className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'break':
        return <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const displayedLogs = isExpanded ? logs.slice(0, 15) : logs.slice(0, 3);

  return (
    <div className="absolute bottom-3 left-3 z-20 w-84 max-w-[calc(100vw-24px)] bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 p-3 pointer-events-auto">
      {/* Title & Toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          <span>Office Activity</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'History'}</span>
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* Log list */}
      <div className={`space-y-1.5 transition-all ${isExpanded ? 'max-h-56 overflow-y-auto pr-1' : ''}`}>
        {displayedLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50/80 transition-colors"
          >
            <div className="mt-0.5">{getLogIcon(log.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 text-[11px] leading-snug break-words">
                <span className="font-mono text-[10px] text-slate-400 mr-1.5">
                  {log.timeString}
                </span>
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
