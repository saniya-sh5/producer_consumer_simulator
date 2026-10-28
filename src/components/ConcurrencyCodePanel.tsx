import React, { useState } from 'react';
import { Cpu, ShieldCheck, AlertTriangle, BookOpen, Terminal } from 'lucide-react';
import { SemaphoresState, SimulationMode } from '../types/ev';

interface ConcurrencyCodePanelProps {
  mode: SimulationMode;
  semaphores: SemaphoresState;
  capacity: number;
}

export const ConcurrencyCodePanel: React.FC<ConcurrencyCodePanelProps> = ({
  mode,
  semaphores,
  capacity,
}) => {
  const [codeLanguage, setCodeLanguage] = useState<'C' | 'TypeScript'>('C');

  // Highlights active line based on current simulation state
  const activeProducerLine: number = semaphores.activeProducer
    ? semaphores.mutex === 0
      ? 4 // inside critical section
      : 3 // acquiring lock
    : 1;

  const activeConsumerLine: number = semaphores.activeConsumer
    ? semaphores.mutex === 0
      ? 4 // inside critical section
      : 3 // acquiring lock
    : 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-slate-900 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
              Concurrency Algorithm &amp; Dijkstra's Semaphores
            </h2>
            <p className="text-xs text-slate-500">
              Live execution tracer for Producer-Consumer bounded buffer synchronization
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
          <span className="text-slate-600 font-semibold px-1">Language:</span>
          <button
            onClick={() => setCodeLanguage('C')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              codeLanguage === 'C' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            POSIX C (Semaphores)
          </button>
          <button
            onClick={() => setCodeLanguage('TypeScript')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              codeLanguage === 'TypeScript' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TypeScript Async Lock
          </button>
        </div>
      </div>

      {/* Synchronized vs Unsynchronized Mode Warning Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        mode === 'with_sync'
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
          : 'bg-rose-50 border-rose-300 text-rose-900'
      }`}>
        {mode === 'with_sync' ? (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div className="text-xs space-y-1 font-mono">
          <strong className="text-sm block font-extrabold">
            {mode === 'with_sync'
              ? '🟢 SYNCHRONIZED MODE: Semaphores & Mutex Active'
              : '🔴 UNSYNCHRONIZED MODE: Unprotected Direct Buffer Access'}
          </strong>
          <p className="text-slate-700 font-sans leading-relaxed">
            {mode === 'with_sync'
              ? `Counting semaphores 'empty' (init=${capacity}) and 'full' (init=0) together with binary 'mutex' (init=1) prevent race conditions, buffer overflows, and underflows.`
              : 'Without atomic locks or counting semaphores, producers can write past buffer capacity, overwriting unconsumed EV data, and consumers can read garbage data from uninitialized slots!'}
          </p>
        </div>
      </div>

      {/* Code Side-by-Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        
        {/* Producer Algorithm */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-blue-400 font-bold">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              PRODUCER THREAD (dispatch_ev)
            </span>
            {semaphores.activeProducer && (
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 animate-pulse">
                EXECUTING NOW
              </span>
            )}
          </div>

          <div className="p-4 space-y-1 text-slate-300 leading-relaxed overflow-x-auto">
            {codeLanguage === 'C' ? (
              <>
                <div className={`p-1 rounded transition-colors ${activeProducerLine === 1 ? 'bg-slate-800/80 text-white' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">01</span>
                  <span className="text-purple-400">void</span> *producer(<span className="text-purple-400">void</span> *arg) &#123;
                </div>
                <div className={`p-1 rounded transition-colors ${activeProducerLine === 2 ? 'bg-amber-950/80 text-amber-300 font-bold border-l-2 border-amber-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">02</span>
                  &nbsp;&nbsp;sem_wait(&amp;<span className="text-amber-400">empty</span>); <span className="text-slate-500">// Wait for free slot</span>
                </div>
                <div className={`p-1 rounded transition-colors ${activeProducerLine === 3 ? 'bg-amber-950/80 text-amber-300 font-bold border-l-2 border-amber-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">03</span>
                  &nbsp;&nbsp;pthread_mutex_lock(&amp;<span className="text-rose-400">mutex</span>); <span className="text-slate-500">// Acquire lock</span>
                </div>
                <div className={`p-1 rounded transition-colors ${activeProducerLine === 4 ? 'bg-blue-950/90 text-blue-300 font-bold border-l-2 border-blue-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">04</span>
                  &nbsp;&nbsp;buffer[in] = generate_ev(); <span className="text-slate-500">// Critical section</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">05</span>
                  &nbsp;&nbsp;in = (in + 1) % BUFFER_SIZE;
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">06</span>
                  &nbsp;&nbsp;pthread_mutex_unlock(&amp;<span className="text-rose-400">mutex</span>); <span className="text-slate-500">// Release lock</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">07</span>
                  &nbsp;&nbsp;sem_post(&amp;<span className="text-emerald-400">full</span>); <span className="text-slate-500">// Signal item ready</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">08</span>
                  &#125;
                </div>
              </>
            ) : (
              <>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">01</span>
                  <span className="text-purple-400">async function</span> produceEV(ev: EV) &#123;
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">02</span>
                  &nbsp;&nbsp;<span className="text-purple-400">await</span> emptySemaphore.wait();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">03</span>
                  &nbsp;&nbsp;<span className="text-purple-400">await</span> mutexLock.acquire();
                </div>
                <div className="p-1 bg-blue-950/80 text-blue-300 font-bold border-l-2 border-blue-400 pl-2">
                  <span className="text-slate-600 mr-3 select-none">04</span>
                  &nbsp;&nbsp;buffer[inPointer] = ev;
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">05</span>
                  &nbsp;&nbsp;inPointer = (inPointer + 1) % CAPACITY;
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">06</span>
                  &nbsp;&nbsp;mutexLock.release();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">07</span>
                  &nbsp;&nbsp;fullSemaphore.signal();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">08</span>
                  &#125;
                </div>
              </>
            )}
          </div>
        </div>

        {/* Consumer Algorithm */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              CONSUMER THREAD (charge_station)
            </span>
            {semaphores.activeConsumer && (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 animate-pulse">
                EXECUTING NOW
              </span>
            )}
          </div>

          <div className="p-4 space-y-1 text-slate-300 leading-relaxed overflow-x-auto">
            {codeLanguage === 'C' ? (
              <>
                <div className={`p-1 rounded transition-colors ${activeConsumerLine === 1 ? 'bg-slate-800/80 text-white' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">01</span>
                  <span className="text-purple-400">void</span> *consumer(<span className="text-purple-400">void</span> *arg) &#123;
                </div>
                <div className={`p-1 rounded transition-colors ${activeConsumerLine === 2 ? 'bg-amber-950/80 text-amber-300 font-bold border-l-2 border-amber-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">02</span>
                  &nbsp;&nbsp;sem_wait(&amp;<span className="text-emerald-400">full</span>); <span className="text-slate-500">// Wait for available EV</span>
                </div>
                <div className={`p-1 rounded transition-colors ${activeConsumerLine === 3 ? 'bg-amber-950/80 text-amber-300 font-bold border-l-2 border-amber-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">03</span>
                  &nbsp;&nbsp;pthread_mutex_lock(&amp;<span className="text-rose-400">mutex</span>); <span className="text-slate-500">// Acquire lock</span>
                </div>
                <div className={`p-1 rounded transition-colors ${activeConsumerLine === 4 ? 'bg-emerald-950/90 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-2' : ''}`}>
                  <span className="text-slate-600 mr-3 select-none">04</span>
                  &nbsp;&nbsp;ev = buffer[out]; <span className="text-slate-500">// Critical section</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">05</span>
                  &nbsp;&nbsp;out = (out + 1) % BUFFER_SIZE;
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">06</span>
                  &nbsp;&nbsp;pthread_mutex_unlock(&amp;<span className="text-rose-400">mutex</span>); <span className="text-slate-500">// Release lock</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">07</span>
                  &nbsp;&nbsp;sem_post(&amp;<span className="text-amber-400">empty</span>); <span className="text-slate-500">// Signal free space</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">08</span>
                  &nbsp;&nbsp;charge_ev(ev); <span className="text-slate-500">// Process EV</span>
                </div>
                <div className="p-1 rounded">
                  <span className="text-slate-600 mr-3 select-none">09</span>
                  &#125;
                </div>
              </>
            ) : (
              <>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">01</span>
                  <span className="text-purple-400">async function</span> consumeEV() &#123;
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">02</span>
                  &nbsp;&nbsp;<span className="text-purple-400">await</span> fullSemaphore.wait();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">03</span>
                  &nbsp;&nbsp;<span className="text-purple-400">await</span> mutexLock.acquire();
                </div>
                <div className="p-1 bg-emerald-950/80 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-2">
                  <span className="text-slate-600 mr-3 select-none">04</span>
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> ev = buffer[outPointer];
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">05</span>
                  &nbsp;&nbsp;outPointer = (outPointer + 1) % CAPACITY;
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">06</span>
                  &nbsp;&nbsp;mutexLock.release();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">07</span>
                  &nbsp;&nbsp;emptySemaphore.signal();
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">08</span>
                  &nbsp;&nbsp;dockEVToCharger(ev);
                </div>
                <div className="p-1">
                  <span className="text-slate-600 mr-3 select-none">09</span>
                  &#125;
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mathematical Synchronization Invariants */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
        <div className="flex items-center gap-2 font-bold text-amber-800 mb-2">
          <BookOpen className="w-4 h-4 text-amber-600" />
          KEY CONCURRENCY INVARIANTS (Dijkstra Proof)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-emerald-700 font-bold block mb-1">1. Buffer Invariant:</span>
            <code className="font-bold">empty + full = N</code>
            <p className="text-[11px] text-slate-600 mt-1 font-sans">
              Sum of empty and filled slots always equals total buffer capacity N.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-blue-700 font-bold block mb-1">2. Mutual Exclusion:</span>
            <code className="font-bold">mutex &isin; &#123;0, 1&#125;</code>
            <p className="text-[11px] text-slate-600 mt-1 font-sans">
              At most one process (Producer OR Consumer) modifies buffer indices at a time.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-purple-700 font-bold block mb-1">3. Circular Indexing:</span>
            <code className="font-bold">in = (in + 1) mod N</code>
            <p className="text-[11px] text-slate-600 mt-1 font-sans">
              Indices wrap seamlessly without memory leaks or buffer overflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
