import React from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  Bot
} from 'lucide-react';
import { SimulationMode } from '../types/ev';

interface HeaderProps {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  onReset: () => void;
  status: 'NORMAL' | 'BUFFER_FULL' | 'BUFFER_EMPTY' | 'OVERFLOW_FAULT' | 'CHARGING_ACTIVE';
  activeTab: 'simulation' | 'code' | 'logs' | 'ai';
  setActiveTab: (tab: 'simulation' | 'code' | 'logs' | 'ai') => void;
  onOpenAIModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  setIsRunning,
  onReset,
  status,
  onOpenAIModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-2xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="text-base font-extrabold font-mono text-slate-900 tracking-tight">
              EV CHARGING SIMULATOR
            </span>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-slate-200 bg-slate-50">
              {status === 'NORMAL' && <span className="text-emerald-700">🟢 Normal</span>}
              {status === 'BUFFER_FULL' && <span className="text-amber-700">🟡 Buffer Full</span>}
              {status === 'BUFFER_EMPTY' && <span className="text-blue-700">🔵 Consumers Idle</span>}
              {status === 'OVERFLOW_FAULT' && <span className="text-rose-700">🔴 Fault</span>}
              {status === 'CHARGING_ACTIVE' && <span className="text-emerald-700">⚡ Charging</span>}
            </div>

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>

            {/* Run / Pause */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                isRunning
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-600 text-white font-extrabold'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title="Reset Simulation"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
