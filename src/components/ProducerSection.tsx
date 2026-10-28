import React from 'react';
import { Car, Plus, Zap, Lock, PauseCircle } from 'lucide-react';
import { EV, SemaphoresState, SimulationMode } from '../types/ev';

interface ProducerSectionProps {
  onGenerateEV: () => void;
  onBurstGenerate: () => void;
  autoProduce: boolean;
  setAutoProduce: (val: boolean) => void;
  pendingEVs: EV[];
  semaphores: SemaphoresState;
  mode: SimulationMode;
  bufferOccupancy: number;
  bufferCapacity: number;
}

export const ProducerSection: React.FC<ProducerSectionProps> = ({
  onGenerateEV,
  onBurstGenerate,
  autoProduce,
  setAutoProduce,
  pendingEVs,
  semaphores,
  mode,
  bufferOccupancy,
  bufferCapacity,
}) => {
  const isBufferFull = bufferOccupancy >= bufferCapacity;
  const isProducerBlocked = mode === 'with_sync' && isBufferFull;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs text-slate-900 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-mono">
              PRODUCER
            </h2>
            <p className="text-[11px] text-slate-500">EV Traffic Dispatch</p>
          </div>
        </div>

        <div>
          {isProducerBlocked ? (
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
              <PauseCircle className="w-3 h-3 text-amber-600" /> BLOCKED
            </span>
          ) : semaphores.activeProducer ? (
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-600" /> LOCKED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onGenerateEV}
          disabled={mode === 'with_sync' && isBufferFull}
          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          +1 EV
        </button>

        <button
          onClick={onBurstGenerate}
          disabled={mode === 'with_sync' && isBufferFull}
          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-400 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          +3 Burst
        </button>
      </div>

      {/* Auto Switch */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <span className="font-medium text-slate-700">Auto Generate Traffic</span>
        <button
          onClick={() => setAutoProduce(!autoProduce)}
          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 border ${
            autoProduce ? 'bg-blue-600 border-blue-500' : 'bg-slate-300 border-slate-400'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white transform transition-transform ${
              autoProduce ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Queue List */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
          <span>Outgoing Stream</span>
          <span>{pendingEVs.length} queued</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {pendingEVs.length === 0 ? (
            <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 font-mono bg-slate-50">
              Queue empty. Click [+1 EV].
            </div>
          ) : (
            pendingEVs.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{ev.id}</span>
                  <span className="text-slate-700 font-medium">{ev.model}</span>
                </div>
                <span className="font-mono text-amber-700 font-bold">{ev.initialBattery}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
