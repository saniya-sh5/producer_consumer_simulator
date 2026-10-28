import React from 'react';
import { Activity, Zap, ShieldCheck, Gauge, CheckCircle2 } from 'lucide-react';
import { Metrics, SimulationMode } from '../types/ev';

interface MetricsDashboardProps {
  metrics: Metrics;
  mode: SimulationMode;
  bufferOccupancy: number;
  bufferCapacity: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  mode,
  bufferOccupancy,
  bufferCapacity,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Buffer Occupancy */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>Buffer Queue</span>
          <Gauge className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="text-lg font-extrabold text-slate-900 font-mono mt-1">
          {bufferOccupancy} / {bufferCapacity}
        </div>
      </div>

      {/* 2. Total Produced */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>EVs Produced</span>
          <Activity className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="text-lg font-extrabold text-blue-700 font-mono mt-1">
          {metrics.totalProduced}
        </div>
      </div>

      {/* 3. Total Charged */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>EVs Charged</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1">
          {metrics.totalConsumed}
        </div>
      </div>

      {/* 4. Active Power Draw */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>Grid Power</span>
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
        </div>
        <div className="text-lg font-extrabold text-amber-800 font-mono mt-1">
          {metrics.gridLoadkW} <span className="text-xs font-normal">kW</span>
        </div>
      </div>

      {/* 5. Energy Delivered */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>Total Energy</span>
          <Zap className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <div className="text-lg font-extrabold text-teal-700 font-mono mt-1">
          {metrics.totalEnergyDeliveredkWh.toFixed(1)} <span className="text-xs font-normal">kWh</span>
        </div>
      </div>

      {/* 6. Faults / Races */}
      <div className={`p-3 rounded-xl border shadow-2xs ${
        mode === 'without_sync' && metrics.raceConditionsCount > 0
          ? 'bg-rose-50 border-rose-300'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
          <span>Race Faults</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className={`text-lg font-extrabold font-mono mt-1 ${
          metrics.raceConditionsCount > 0 ? 'text-rose-700' : 'text-emerald-700'
        }`}>
          {metrics.raceConditionsCount}
        </div>
      </div>
    </div>
  );
};
