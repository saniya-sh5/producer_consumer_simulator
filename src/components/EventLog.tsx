import React, { useState } from 'react';
import { Terminal, Search, Trash2, Download, AlertTriangle, ShieldCheck, Zap, Car } from 'lucide-react';
import { LogEvent } from '../types/ev';

interface EventLogProps {
  logs: LogEvent[];
  onClearLogs: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'ALL' | 'PRODUCE' | 'CONSUME' | 'MUTEX' | 'RACE_CONDITION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'ALL' && log.type !== filter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        log.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ev_charging_event_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-slate-900 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono tracking-wide">
              EVENT LOG &amp; CONCURRENCY TRACE
            </h3>
            <p className="text-[11px] text-slate-500">Real-time system events, lock states &amp; fault alerts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={onClearLogs}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono">
          {(['ALL', 'PRODUCE', 'CONSUME', 'MUTEX', 'RACE_CONDITION'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                filter === cat
                  ? cat === 'RACE_CONDITION'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'RACE_CONDITION' ? 'RACES' : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log events..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
            No events match current filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                log.severity === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : log.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : log.severity === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Event Icon Badge */}
                <div className="mt-0.5">
                  {log.type === 'PRODUCE' && <Car className="w-3.5 h-3.5 text-blue-600" />}
                  {log.type === 'CONSUME' && <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />}
                  {log.type === 'MUTEX' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                  {log.type === 'RACE_CONDITION' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                  {log.type === 'CHARGE_COMPLETE' && <Zap className="w-3.5 h-3.5 text-teal-600" />}
                  {log.type === 'SYSTEM' && <Terminal className="w-3.5 h-3.5 text-slate-600" />}
                </div>

                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <span>{log.message}</span>
                    {log.details && (
                      <span className="text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                        {log.details}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 whitespace-nowrap shrink-0 font-bold">
                {log.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
