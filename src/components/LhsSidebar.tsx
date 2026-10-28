import React, { useState } from 'react';
import { 
  Zap, 
  Car, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Terminal, 
  Bot, 
  Menu, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Sliders
} from 'lucide-react';
import { SimulationMode } from '../types/ev';

export type ProcessViewMode = 'all' | 'producer' | 'buffer' | 'consumer' | 'code' | 'logs' | 'ai';

interface LhsSidebarProps {
  viewMode: ProcessViewMode;
  setViewMode: (mode: ProcessViewMode) => void;
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  onReset: () => void;
  status: 'NORMAL' | 'BUFFER_FULL' | 'BUFFER_EMPTY' | 'OVERFLOW_FAULT' | 'CHARGING_ACTIVE';
  bufferOccupancy: number;
  bufferCapacity: number;
  raceConditionsCount: number;
  totalProduced: number;
  totalConsumed: number;
  onOpenAIModal: () => void;
}

export const LhsSidebar: React.FC<LhsSidebarProps> = ({
  viewMode,
  setViewMode,
  mode,
  setMode,
  isRunning,
  setIsRunning,
  speed,
  setSpeed,
  onReset,
  status,
  bufferOccupancy,
  bufferCapacity,
  totalProduced,
  totalConsumed,
  onOpenAIModal,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const navItems: {
    id: ProcessViewMode;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'all',
      label: 'System Overview',
      icon: <Sliders className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'producer',
      label: 'Producer (EV Dispatch)',
      icon: <Car className="w-4 h-4 text-blue-600" />,
      badge: `${totalProduced}`,
    },
    {
      id: 'buffer',
      label: 'Buffer Queue Memory',
      icon: <Layers className="w-4 h-4 text-amber-600" />,
      badge: `${bufferOccupancy}/${bufferCapacity}`,
    },
    {
      id: 'consumer',
      label: 'Consumer Chargers',
      icon: <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />,
      badge: `${totalConsumed}`,
    },
    {
      id: 'code',
      label: 'Code & Semaphores',
      icon: <Cpu className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'logs',
      label: 'Event History & Logs',
      icon: <Terminal className="w-4 h-4 text-slate-700" />,
    },
    {
      id: 'ai',
      label: 'AI Grid Advisor',
      icon: <Bot className="w-4 h-4 text-purple-600" />,
      badge: 'AI',
    },
  ];

  const handleSelectNav = (id: ProcessViewMode) => {
    if (id === 'ai') {
      onOpenAIModal();
    } else {
      setViewMode(id);
    }
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold text-sm font-mono text-slate-900">
            EV CHARGING SIM
          </span>
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
        />
      )}

      {/* Main LHS Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-500 flex items-center justify-center shadow-xs shrink-0">
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900 font-mono tracking-tight">
                  SMART EV GRID
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Producer-Consumer
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div className="mt-3 p-1.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-between bg-slate-50 border-slate-200">
              <span className="text-slate-500 text-[10px]">Status:</span>
              {status === 'NORMAL' && <span className="text-emerald-700">🟢 Normal</span>}
              {status === 'BUFFER_FULL' && <span className="text-amber-700">🟡 Full</span>}
              {status === 'BUFFER_EMPTY' && <span className="text-blue-700">🔵 Idle</span>}
              {status === 'OVERFLOW_FAULT' && <span className="text-rose-700">🔴 Fault</span>}
              {status === 'CHARGING_ACTIVE' && <span className="text-emerald-700">⚡ Charging</span>}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-2 text-[10px] font-mono font-bold text-slate-400 uppercase py-1">
              Navigation
            </div>

            {navItems.map((item) => {
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between text-xs font-semibold ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md ${isActive ? 'bg-slate-800 text-amber-400' : ''}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
          {/* Mode Switch */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-0.5 rounded-lg font-mono text-[10px]">
            <button
              onClick={() => setMode('with_sync')}
              className={`py-1 rounded font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'with_sync' ? 'bg-emerald-600 text-white' : 'text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Sync
            </button>

            <button
              onClick={() => setMode('without_sync')}
              className={`py-1 rounded font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'without_sync' ? 'bg-rose-600 text-white' : 'text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              No Sync
            </button>
          </div>

          {/* Run/Pause & Reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 transition-all ${
                isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>

            <button
              onClick={onReset}
              title="Reset Simulation"
              className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span>Speed:</span>
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded border border-slate-200">
              {[0.5, 1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    speed === s ? 'bg-amber-500 text-slate-950' : 'text-slate-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
