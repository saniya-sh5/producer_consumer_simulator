import React, { useState } from 'react';
import { Bot, Sparkles, X, RefreshCw, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { Charger, EV, SimulationMode } from '../types/ev';

interface AIGridAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SimulationMode;
  bufferOccupancy: number;
  bufferCapacity: number;
  chargers: Charger[];
  queuedEVs: EV[];
  raceConditionsCount: number;
  totalEnergyDelivered: number;
  gridLoadkW: number;
}

export const AIGridAdvisorModal: React.FC<AIGridAdvisorModalProps> = ({
  isOpen,
  onClose,
  mode,
  bufferOccupancy,
  bufferCapacity,
  chargers,
  queuedEVs,
  raceConditionsCount,
  totalEnergyDelivered,
  gridLoadkW,
}) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeChargers = chargers.filter((c) => c.status === 'charging').length;

  const fetchAIAdvice = async (requestType: 'optimize' | 'diagnose' | 'explain') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-grid-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          bufferOccupancy,
          bufferCapacity,
          activeChargers,
          totalChargers: chargers.length,
          queuedEVs: queuedEVs.slice(0, 5).map((e) => ({ id: e.id, model: e.model, battery: e.initialBattery, priority: e.priority })),
          raceConditionsCount,
          totalEnergyDelivered,
          gridLoadkW,
          requestType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch AI advice');
      }

      setAdvice(data.advice);
    } catch (err: any) {
      console.error('Error in AI Advisor modal:', err);
      setError(err.message || 'An unexpected error occurred while consulting the AI Advisor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-wide flex items-center gap-2">
                Smart Grid AI Advisor &amp; Concurrency Diagnostics
                <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-xs text-slate-500">Powered by Google AI for smart charging load balancing &amp; lock diagnosis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Prompt Buttons */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => fetchAIAdvice('optimize')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            Optimize Grid Load
          </button>

          <button
            onClick={() => fetchAIAdvice('diagnose')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Diagnose Faults
          </button>

          <button
            onClick={() => fetchAIAdvice('explain')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Semaphore Theory
          </button>
        </div>

        {/* Modal Body / Output Area */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-sm text-slate-700 leading-relaxed flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-mono text-indigo-800 font-bold">
                Analyzing grid telemetry &amp; bounded buffer semaphores...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                AI Service Notice
              </div>
              <p>{error}</p>
            </div>
          ) : advice ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
              <div className="flex items-center gap-2 font-bold text-emerald-700 border-b border-slate-200 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                AI Smart Grid Analysis &amp; Recommendations
              </div>
              <div>{advice}</div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50">
              <Bot className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-medium">
                Select an option above to generate real-time AI optimization or concurrency diagnostics.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>Mode: <strong className="text-slate-900">{mode}</strong></span>
          <span>Buffer: <strong className="text-slate-900">{bufferOccupancy}/{bufferCapacity}</strong></span>
          <span>Faults: <strong className="text-rose-700">{raceConditionsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
