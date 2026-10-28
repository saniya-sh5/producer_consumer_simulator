import React from 'react';
import { Layers, ArrowUp, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BufferSlot, SemaphoresState, SimulationMode } from '../types/ev';

interface BufferSectionProps {
  slots: BufferSlot[];
  inPointer: number;
  outPointer: number;
  counter: number;
  capacity: number;
  setCapacity: (cap: number) => void;
  semaphores: SemaphoresState;
  mode: SimulationMode;
  raceConditionsCount: number;
}

export const BufferSection: React.FC<BufferSectionProps> = ({
  slots,
  inPointer,
  outPointer,
  counter,
  capacity,
  setCapacity,
  semaphores,
  mode,
  raceConditionsCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-slate-900 relative overflow-hidden flex flex-col justify-between">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500" />

      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-wide flex items-center gap-2">
                📦 BUFFER (QUEUE)
                <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Shared Array
                </span>
              </h2>
              <p className="text-xs text-slate-500">Fixed-capacity circular queue for EV charging requests</p>
            </div>
          </div>

          {/* Buffer Capacity Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-600 font-mono px-1 font-semibold">Capacity N:</span>
            {[3, 5, 8, 10].map((cap) => (
              <button
                key={cap}
                onClick={() => setCapacity(cap)}
                className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                  capacity === cap
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Status Telemetry Strip */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex flex-wrap items-center justify-between gap-3 mb-6 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">BUFFER:</span>
            <span className={`font-extrabold ${counter === capacity ? 'text-amber-700' : 'text-emerald-700'}`}>
              {counter}/{capacity}
            </span>
            <div className="w-16 h-2.5 bg-slate-200 rounded-full overflow-hidden inline-block ml-1">
              <div
                className={`h-full transition-all duration-300 ${
                  counter === capacity ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(counter / capacity) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">IN:</span>
            <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {inPointer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">OUT:</span>
            <span className="font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {outPointer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">COUNTER:</span>
            <span className="font-extrabold text-emerald-700">{counter}</span>
          </div>
        </div>

        {/* Semaphores Dashboard Panel (With Sync mode) */}
        {mode === 'with_sync' && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                SEMAPHORES &amp; MUTEX LOCKS
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                {semaphores.mutex === 0 ? (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> MUTEX LOCKED BY {semaphores.lockOwner}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">🔓 MUTEX UNLOCKED</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">mutex</div>
                <div className={`text-base font-extrabold ${semaphores.mutex === 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {semaphores.mutex}
                </div>
                <div className="text-[9px] text-slate-500">Binary Lock</div>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">empty</div>
                <div className="text-base font-extrabold text-blue-700">
                  {semaphores.empty}
                </div>
                <div className="text-[9px] text-slate-500">Free Slots</div>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">full</div>
                <div className="text-base font-extrabold text-amber-700">
                  {semaphores.full}
                </div>
                <div className="text-[9px] text-slate-500">Occupied Slots</div>
              </div>
            </div>
          </div>
        )}

        {/* Without Sync Fault Warning */}
        {mode === 'without_sync' && raceConditionsCount > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>RACE CONDITION FAULTS DETECTED: <strong>{raceConditionsCount}</strong></span>
            </div>
            <span className="text-[10px] bg-rose-200 px-2 py-0.5 rounded text-rose-800 font-bold">Unprotected Access</span>
          </div>
        )}

        {/* Buffer Slots Grid Display */}
        <div className="mb-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {slots.map((slot) => {
              const isInPointerHere = inPointer === slot.index;
              const isOutPointerHere = outPointer === slot.index;

              return (
                <div key={slot.index} className="flex flex-col items-center">
                  {/* Slot Container */}
                  <div
                    className={`w-full p-3 rounded-xl border transition-all duration-300 relative min-h-[110px] flex flex-col justify-between ${
                      slot.state === 'corrupted'
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/50 shadow-md'
                        : slot.state === 'writing'
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/50 shadow-md'
                        : slot.state === 'reading'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/50 shadow-md'
                        : slot.ev
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 border-slate-300 border-dashed'
                    }`}
                  >
                    {/* Slot Header Index */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold">
                      <span>buffer[{slot.index}]</span>
                      {slot.ev && (
                        <span className="text-emerald-700 font-bold font-mono">
                          {slot.ev.initialBattery}%
                        </span>
                      )}
                    </div>

                    {/* Slot Content */}
                    <div className="my-1">
                      {slot.state === 'corrupted' ? (
                        <div className="text-center">
                          <span className="text-xs font-mono font-bold text-rose-700 block uppercase tracking-wider">
                            💥 OVERWRITE
                          </span>
                          <span className="text-[10px] text-rose-800 font-mono">
                            Data Corrupted
                          </span>
                        </div>
                      ) : slot.ev ? (
                        <div>
                          <div className="text-sm font-extrabold text-slate-900 font-mono flex items-center justify-between">
                            <span>{slot.ev.id}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                              Queued
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 truncate mt-0.5 font-sans font-medium">
                            {slot.ev.model}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-[11px] font-mono text-slate-400 font-bold block">
                            [ EMPTY ]
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Slot Footer Details */}
                    <div className="text-[9px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>{slot.ev ? `${slot.ev.powerNeededkWh} kWh` : 'Free'}</span>
                      {slot.ev?.priority === 'VIP Emergency' && (
                        <span className="text-rose-700 font-bold">VIP</span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Pointer Badges directly under the slot */}
                  <div className="mt-2 flex flex-col items-center gap-1 h-12">
                    {isInPointerHere && (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 shadow-xs animate-bounce">
                        <ArrowUp className="w-3 h-3 text-blue-700" />
                        ↑in ({inPointer})
                      </div>
                    )}
                    {isOutPointerHere && (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-300 shadow-xs animate-bounce">
                        <ArrowUp className="w-3 h-3 text-purple-700" />
                        ↑out ({outPointer})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Pointer Operations Info */}
      <div className="mt-2 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-mono">
        <div>
          <span className="text-blue-700 font-bold">in = (in + 1) % {capacity}</span>
        </div>
        <div>
          <span className="text-purple-700 font-bold">out = (out + 1) % {capacity}</span>
        </div>
      </div>
    </div>
  );
};
