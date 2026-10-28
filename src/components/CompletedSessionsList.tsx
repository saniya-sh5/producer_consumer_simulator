import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Download, 
  Trash2, 
  Clock, 
  Zap, 
  BatteryCharging, 
  Car,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { CompletedSession } from '../types/ev';

interface CompletedSessionsListProps {
  sessions: CompletedSession[];
  onClearSessions: () => void;
}

export const CompletedSessionsList: React.FC<CompletedSessionsListProps> = ({
  sessions,
  onClearSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'duration' | 'energy'>('newest');

  const filteredSessions = sessions
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.evId.toLowerCase().includes(q) ||
        s.evModel.toLowerCase().includes(q) ||
        s.chargerName.toLowerCase().includes(q) ||
        s.priority.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'duration') return b.durationSeconds - a.durationSeconds;
      if (sortBy === 'energy') return b.energyDeliveredkWh - a.energyDeliveredkWh;
      return 0; // default newest first since array is prepended
    });

  // Analytics summary calculations
  const totalSessions = sessions.length;
  const totalEnergy = sessions.reduce((acc, s) => acc + s.energyDeliveredkWh, 0);
  const avgDuration = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / totalSessions)
    : 0;
  const avgEnergy = totalSessions > 0 ? totalEnergy / totalSessions : 0;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSec = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remainderSec.toString().padStart(2, '0')}`;
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    const headers = [
      'Session ID',
      'EV ID',
      'Car Model',
      'Priority',
      'Charger Station',
      'Initial Battery %',
      'Final Battery %',
      'Energy Delivered (kWh)',
      'Duration (sec)',
      'Charge Rate',
      'Completed At'
    ];

    const rows = sessions.map((s) => [
      s.id,
      s.evId,
      `"${s.evModel}"`,
      s.priority,
      s.chargerName,
      s.initialBattery,
      s.finalBattery,
      s.energyDeliveredkWh.toFixed(2),
      s.durationSeconds,
      `"${s.chargeRate}"`,
      s.completedAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `completed_ev_sessions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-slate-900 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono tracking-wide flex items-center gap-2">
              COMPLETED CHARGING SESSIONS
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 font-mono">
                {totalSessions} Finished
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Historical EV charging statistics &amp; session telemetry</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={totalSessions === 0}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-colors ${
              totalSessions === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={onClearSessions}
            disabled={totalSessions === 0}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-colors ${
              totalSessions === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Clear History
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Total Sessions</div>
          <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{totalSessions}</div>
          <div className="text-[10px] text-slate-500 font-mono">Vehicles Serviced</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Total Energy</div>
          <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
            {totalEnergy.toFixed(1)} <span className="text-xs">kWh</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Delivered to fleet</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Avg Energy / Session</div>
          <div className="text-lg font-extrabold text-blue-700 font-mono mt-0.5">
            {avgEnergy.toFixed(1)} <span className="text-xs">kWh</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Mean power output</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Avg Charge Time</div>
          <div className="text-lg font-extrabold text-amber-700 font-mono mt-0.5">
            {formatDuration(avgDuration)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Minutes:Seconds</div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search EV ID, Model, or Charger..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-[11px]">
          <span className="text-slate-500 font-semibold px-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-500" /> Sort:
          </span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              sortBy === 'newest' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Newest First
          </button>
          <button
            onClick={() => setSortBy('energy')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              sortBy === 'energy' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Highest kWh
          </button>
          <button
            onClick={() => setSortBy('duration')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              sortBy === 'duration' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Longest Time
          </button>
        </div>
      </div>

      {/* Sessions List Feed */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin font-mono text-xs">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-600">No completed charging sessions recorded yet.</p>
            <p className="text-[11px] text-slate-500 font-sans">
              Producers generate EVs into the queue, and Consumers charge them to 100% target battery.
            </p>
          </div>
        ) : (
          filteredSessions.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
            >
              {/* Left Column: EV & Model */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-mono text-xs font-bold text-emerald-800 shrink-0">
                  {s.evId}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{s.evModel}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        s.priority === 'VIP Emergency'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : s.priority === 'Fleet'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-emerald-700 font-bold">{s.chargerName}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-600">{s.chargeRate}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Battery Gauge Delta */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold">Battery Gain:</div>
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <span className="text-amber-700">{s.initialBattery}%</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">{s.finalBattery}%</span>
                </div>
              </div>

              {/* Right Column: Delivered kWh, Duration & Timestamp */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 justify-end">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {s.energyDeliveredkWh.toFixed(1)} kWh
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDuration(s.durationSeconds)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                  {s.completedAt}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
