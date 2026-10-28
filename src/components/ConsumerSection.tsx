import React from 'react';
import { Zap, Play, PauseCircle, Lock, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { Charger, SemaphoresState, SimulationMode } from '../types/ev';

interface ConsumerSectionProps {
  chargers: Charger[];
  onConsumeEV: () => void;
  autoConsume: boolean;
  setAutoConsume: (val: boolean) => void;
  semaphores: SemaphoresState;
  mode: SimulationMode;
  bufferOccupancy: number;
  chargerCount: number;
  setChargerCount: (count: number) => void;
}

export const ConsumerSection: React.FC<ConsumerSectionProps> = ({
  chargers,
  onConsumeEV,
  autoConsume,
  setAutoConsume,
  semaphores,
  mode,
  bufferOccupancy,
  chargerCount,
  setChargerCount,
}) => {
  const isBufferEmpty = bufferOccupancy === 0;
  const isConsumerBlocked = mode === 'with_sync' && isBufferEmpty;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs text-slate-900 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
            <Zap className="w-4 h-4 fill-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-mono">
              CONSUMER
            </h2>
            <p className="text-[11px] text-slate-500">EV Charger Bays</p>
          </div>
        </div>

        <div>
          {isConsumerBlocked ? (
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
              <PauseCircle className="w-3 h-3 text-blue-600" /> BLOCKED
            </span>
          ) : semaphores.activeConsumer ? (
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> LOCKED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onConsumeEV}
          disabled={mode === 'with_sync' && isBufferEmpty}
          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-100 disabled:text-slate-400 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Consume EV
        </button>

        <div className="flex items-center justify-between px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-mono font-bold">Bays:</span>
          <div className="flex items-center gap-0.5">
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setChargerCount(num)}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                  chargerCount === num ? 'bg-emerald-500 text-slate-950' : 'text-slate-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auto Switch */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <span className="font-medium text-slate-700">Auto Consume Queue</span>
        <button
          onClick={() => setAutoConsume(!autoConsume)}
          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 border ${
            autoConsume ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-300 border-slate-400'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white transform transition-transform ${
              autoConsume ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Charger List */}
      <div className="space-y-2">
        {chargers.map((charger) => (
          <div
            key={charger.id}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
          >
            <div className="flex items-center justify-between mb-1 font-mono">
              <span className="font-bold text-slate-900">{charger.name}</span>
              {charger.status === 'charging' ? (
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-600" /> CHARGING
                </span>
              ) : charger.status === 'finished' ? (
                <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" /> CHARGED
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">IDLE</span>
              )}
            </div>

            {charger.currentEV ? (
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 mb-1">
                  <span>{charger.currentEV.id}</span>
                  <span className="text-emerald-700">
                    {Math.min(100, Math.round(charger.currentEV.currentBattery))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round(charger.currentEV.currentBattery))}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 font-mono text-center">Ready</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
