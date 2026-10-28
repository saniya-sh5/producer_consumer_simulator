import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ProducerSection } from './components/ProducerSection';
import { BufferSection } from './components/BufferSection';
import { ConsumerSection } from './components/ConsumerSection';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ConcurrencyCodePanel } from './components/ConcurrencyCodePanel';
import { EventLog } from './components/EventLog';
import { CompletedSessionsList } from './components/CompletedSessionsList';
import { AIGridAdvisorModal } from './components/AIGridAdvisorModal';
import { LhsSidebar, ProcessViewMode } from './components/LhsSidebar';

import {
  EV,
  BufferSlot,
  Charger,
  SimulationMode,
  SemaphoresState,
  LogEvent,
  Metrics,
  CompletedSession,
} from './types/ev';
import { generateEV, formatTimestamp } from './utils/evGenerator';

export default function App() {
  // Core Configuration State
  const [mode, setMode] = useState<SimulationMode>('with_sync');
  const [capacity, setCapacity] = useState<number>(5);
  const [chargerCount, setChargerCount] = useState<number>(3);
  const [speed, setSpeed] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [autoProduce, setAutoProduce] = useState<boolean>(true);
  const [autoConsume, setAutoConsume] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ProcessViewMode>('all');
  const [activeTab, setActiveTab] = useState<'simulation' | 'code' | 'logs' | 'ai'>('simulation');
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // Queue Pointers & Counter
  const [inPointer, setInPointer] = useState<number>(0);
  const [outPointer, setOutPointer] = useState<number>(0);
  const [counter, setCounter] = useState<number>(0);
  const [seqNumber, setSeqNumber] = useState<number>(101);

  // Buffer Slots State
  const [slots, setSlots] = useState<BufferSlot[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      index: i,
      ev: null,
      state: 'empty',
    }))
  );

  // Pending EVs & Active Chargers
  const [pendingEVs, setPendingEVs] = useState<EV[]>([]);
  const [chargers, setChargers] = useState<Charger[]>(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Charger ${i + 1}`,
      status: 'idle',
      currentEV: null,
      powerkW: i === 0 ? 150 : i === 1 ? 50 : 22,
      energyDeliveredkWh: 0,
      chargingProgress: 0,
      timeElapsedSec: 0,
      etaSec: 0,
      chargeMode: i === 0 ? 'Fast DC 150kW' : i === 1 ? 'Standard AC 22kW' : 'Eco Solar 11kW',
    }))
  );

  // Semaphores State
  const [semaphores, setSemaphores] = useState<SemaphoresState>({
    mutex: 1,
    empty: 5,
    full: 0,
    activeProducer: false,
    activeConsumer: false,
    lockOwner: 'None',
  });

  // Metrics & Logs
  const [metrics, setMetrics] = useState<Metrics>({
    totalProduced: 0,
    totalConsumed: 0,
    raceConditionsCount: 0,
    totalEnergyDeliveredkWh: 0,
    gridLoadkW: 0,
    producerBlockedCount: 0,
    consumerBlockedCount: 0,
  });

  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [status, setStatus] = useState<
    'NORMAL' | 'BUFFER_FULL' | 'BUFFER_EMPTY' | 'OVERFLOW_FAULT' | 'CHARGING_ACTIVE'
  >('NORMAL');

  // Sync capacity changes with slots array
  useEffect(() => {
    setSlots((prev) => {
      const newSlots: BufferSlot[] = Array.from({ length: capacity }, (_, i) => {
        const existing = prev.find((s) => s.index === i);
        return (
          existing || {
            index: i,
            ev: null,
            state: 'empty',
          }
        );
      });
      return newSlots;
    });

    setInPointer((prev) => prev % capacity);
    setOutPointer((prev) => prev % capacity);
    setSemaphores((prev) => ({
      ...prev,
      empty: Math.max(0, capacity - counter),
      full: counter,
    }));
  }, [capacity]);

  // Sync chargerCount changes with chargers array
  useEffect(() => {
    setChargers((prev) => {
      if (prev.length === chargerCount) return prev;
      if (prev.length < chargerCount) {
        const added: Charger[] = Array.from(
          { length: chargerCount - prev.length },
          (_, idx) => {
            const id = prev.length + idx + 1;
            return {
              id,
              name: `Charger ${id}`,
              status: 'idle',
              currentEV: null,
              powerkW: id % 2 === 0 ? 150 : 50,
              energyDeliveredkWh: 0,
              chargingProgress: 0,
              timeElapsedSec: 0,
              etaSec: 0,
              chargeMode: 'Fast DC 150kW',
            };
          }
        );
        return [...prev, ...added];
      }
      return prev.slice(0, chargerCount);
    });
  }, [chargerCount]);

  // Helper to add log entries
  const addLog = useCallback(
    (
      type: LogEvent['type'],
      message: string,
      details?: string,
      severity: LogEvent['severity'] = 'info'
    ) => {
      const newLog: LogEvent = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: formatTimestamp(),
        type,
        message,
        details,
        severity,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    []
  );

  // Initial greeting log
  useEffect(() => {
    addLog(
      'SYSTEM',
      'Smart EV Charging Producer-Consumer Simulator Initialized',
      'Bounded Buffer Capacity = 5',
      'info'
    );
  }, [addLog]);

  // 1. PRODUCE EV HANDLER
  const handleProduceEV = useCallback(() => {
    let evToInsert: EV;
    let nextSeq = seqNumber;

    if (pendingEVs.length > 0) {
      evToInsert = pendingEVs[0];
      setPendingEVs((prev) => prev.slice(1));
    } else {
      evToInsert = generateEV(seqNumber);
      nextSeq = seqNumber + 1;
      setSeqNumber(nextSeq);
    }

    if (mode === 'with_sync') {
      // Check semaphore `empty` condition
      if (counter >= capacity) {
        // PRODUCER BLOCKS!
        setStatus('BUFFER_FULL');
        setMetrics((m) => ({ ...m, producerBlockedCount: m.producerBlockedCount + 1 }));
        addLog(
          'SEMAPHORE',
          `Producer BLOCKED on wait(empty). Buffer Full (${counter}/${capacity})`,
          `EV ${evToInsert.id} held in queue`,
          'warning'
        );
        return;
      }

      // Lock Mutex
      setSemaphores((s) => ({
        ...s,
        mutex: 0,
        activeProducer: true,
        lockOwner: 'Producer',
      }));

      addLog(
        'MUTEX',
        `Producer acquired mutex lock for buffer[${inPointer}]`,
        undefined,
        'info'
      );

      // Perform insertion into buffer
      setSlots((prev) =>
        prev.map((slot) =>
          slot.index === inPointer
            ? { ...slot, ev: evToInsert, state: 'writing', lastUpdatedBy: 'Producer' }
            : slot
        )
      );

      const nextIn = (inPointer + 1) % capacity;
      const nextCounter = counter + 1;

      setInPointer(nextIn);
      setCounter(nextCounter);

      setMetrics((m) => ({ ...m, totalProduced: m.totalProduced + 1 }));

      addLog(
        'PRODUCE',
        `${evToInsert.id} inserted into buffer[${inPointer}]`,
        `${evToInsert.model} (${evToInsert.initialBattery}%)`,
        'success'
      );

      // Release Lock & Signal `full` semaphore
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((slot) => (slot.index === inPointer ? { ...slot, state: 'occupied' } : slot))
        );
        setSemaphores((s) => ({
          ...s,
          mutex: 1,
          empty: capacity - nextCounter,
          full: nextCounter,
          activeProducer: false,
          lockOwner: 'None',
        }));
        setStatus('NORMAL');
      }, 300 / speed);
    } else {
      // WITHOUT SYNC MODE (UNPROTECTED DIRECT ACCESS)
      const currentSlot = slots.find((s) => s.index === inPointer);
      const isOverwriteHazard = currentSlot && currentSlot.ev !== null;

      if (isOverwriteHazard) {
        // OVERFLOW FAULT!
        setMetrics((m) => ({ ...m, raceConditionsCount: m.raceConditionsCount + 1 }));
        setStatus('OVERFLOW_FAULT');
        addLog(
          'RACE_CONDITION',
          `OVERFLOW HAZARD! ${evToInsert.id} overwrote unconsumed ${currentSlot.ev?.id} at buffer[${inPointer}]`,
          'Data Corrupted (No Mutex Protection)',
          'danger'
        );

        setSlots((prev) =>
          prev.map((slot) =>
            slot.index === inPointer
              ? { ...slot, ev: evToInsert, state: 'corrupted', lastUpdatedBy: 'Overflow' }
              : slot
          )
        );
      } else {
        setSlots((prev) =>
          prev.map((slot) =>
            slot.index === inPointer
              ? { ...slot, ev: evToInsert, state: 'occupied', lastUpdatedBy: 'Producer' }
              : slot
          )
        );

        addLog(
          'PRODUCE',
          `${evToInsert.id} inserted into buffer[${inPointer}] (Unsynchronized)`,
          `${evToInsert.model}`,
          'info'
        );
      }

      const nextIn = (inPointer + 1) % capacity;
      const nextCounter = Math.min(capacity, counter + 1);

      setInPointer(nextIn);
      setCounter(nextCounter);
      setMetrics((m) => ({ ...m, totalProduced: m.totalProduced + 1 }));
    }
  }, [
    seqNumber,
    pendingEVs,
    mode,
    counter,
    capacity,
    inPointer,
    speed,
    addLog,
    slots,
  ]);

  // Burst generate 3 EVs
  const handleBurstGenerate = useCallback(() => {
    const burstCount = 3;
    const newEVs: EV[] = [];
    let curSeq = seqNumber;

    for (let i = 0; i < burstCount; i++) {
      newEVs.push(generateEV(curSeq));
      curSeq++;
    }

    setSeqNumber(curSeq);
    setPendingEVs((prev) => [...prev, ...newEVs]);
    addLog(
      'PRODUCE',
      `Burst generated 3 EVs (${newEVs.map((e) => e.id).join(', ')})`,
      'Queued for dispatch',
      'info'
    );
  }, [seqNumber, addLog]);

  // 2. CONSUME EV HANDLER
  const handleConsumeEV = useCallback(() => {
    // Find an available idle charger station
    const freeChargerIndex = chargers.findIndex(
      (c) => c.status === 'idle' || c.status === 'finished'
    );

    if (freeChargerIndex === -1) {
      addLog('CONSUME', 'All Charging Stations are currently busy!', 'Wait for charger to free up', 'warning');
      return;
    }

    if (mode === 'with_sync') {
      // Check semaphore `full` condition
      if (counter <= 0) {
        // CONSUMER BLOCKS!
        setStatus('BUFFER_EMPTY');
        setMetrics((m) => ({ ...m, consumerBlockedCount: m.consumerBlockedCount + 1 }));
        addLog(
          'SEMAPHORE',
          'Consumer BLOCKED on wait(full). Buffer Empty (0/5)',
          'Waiting for Producer to dispatch EV',
          'warning'
        );
        return;
      }

      // Lock Mutex
      setSemaphores((s) => ({
        ...s,
        mutex: 0,
        activeConsumer: true,
        lockOwner: 'Consumer',
      }));

      addLog(
        'MUTEX',
        `Consumer acquired mutex lock for buffer[${outPointer}]`,
        undefined,
        'info'
      );

      const targetSlot = slots.find((s) => s.index === outPointer);
      const evToConsume = targetSlot?.ev;

      if (!evToConsume) {
        // Unexpected null in sync mode
        setSemaphores((s) => ({ ...s, mutex: 1, activeConsumer: false, lockOwner: 'None' }));
        return;
      }

      // Mark slot state as reading
      setSlots((prev) =>
        prev.map((slot) =>
          slot.index === outPointer ? { ...slot, state: 'reading', lastUpdatedBy: 'Consumer' } : slot
        )
      );

      const targetCharger = chargers[freeChargerIndex];

      addLog(
        'CONSUME',
        `${targetCharger.name} consumed ${evToConsume.id} from buffer[${outPointer}]`,
        `${evToConsume.model} docked for charging`,
        'success'
      );

      const nextOut = (outPointer + 1) % capacity;
      const nextCounter = Math.max(0, counter - 1);

      setOutPointer(nextOut);
      setCounter(nextCounter);

      // Dock EV into charger bay
      setChargers((prev) =>
        prev.map((c, idx) =>
          idx === freeChargerIndex
            ? {
                ...c,
                status: 'charging',
                currentEV: { ...evToConsume, status: 'Charging' },
                chargingProgress: 0,
                timeElapsedSec: 0,
              }
            : c
        )
      );

      // Clear slot after reading
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((slot) =>
            slot.index === outPointer ? { ...slot, ev: null, state: 'empty' } : slot
          )
        );
        setSemaphores((s) => ({
          ...s,
          mutex: 1,
          empty: capacity - nextCounter,
          full: nextCounter,
          activeConsumer: false,
          lockOwner: 'None',
        }));
        setStatus('CHARGING_ACTIVE');
      }, 300 / speed);
    } else {
      // WITHOUT SYNC MODE (UNPROTECTED)
      const targetSlot = slots.find((s) => s.index === outPointer);

      if (!targetSlot || !targetSlot.ev) {
        // UNDERFLOW FAULT!
        setMetrics((m) => ({ ...m, raceConditionsCount: m.raceConditionsCount + 1 }));
        setStatus('OVERFLOW_FAULT');
        addLog(
          'RACE_CONDITION',
          `UNDERFLOW FAULT! Consumer read empty/uninitialized slot buffer[${outPointer}]`,
          'Station Read Collision / Garbage Data',
          'danger'
        );

        const nextOut = (outPointer + 1) % capacity;
        setOutPointer(nextOut);
        return;
      }

      const evToConsume = targetSlot.ev;
      const targetCharger = chargers[freeChargerIndex];

      addLog(
        'CONSUME',
        `${targetCharger.name} consumed ${evToConsume.id} from buffer[${outPointer}] (Unsynchronized)`,
        `${evToConsume.model}`,
        'info'
      );

      // Clear slot
      setSlots((prev) =>
        prev.map((slot) =>
          slot.index === outPointer ? { ...slot, ev: null, state: 'empty' } : slot
        )
      );

      const nextOut = (outPointer + 1) % capacity;
      const nextCounter = Math.max(0, counter - 1);

      setOutPointer(nextOut);
      setCounter(nextCounter);

      // Dock EV
      setChargers((prev) =>
        prev.map((c, idx) =>
          idx === freeChargerIndex
            ? {
                ...c,
                status: 'charging',
                currentEV: { ...evToConsume, status: 'Charging' },
                chargingProgress: 0,
                timeElapsedSec: 0,
              }
            : c
        )
      );
    }
  }, [
    chargers,
    mode,
    counter,
    capacity,
    outPointer,
    slots,
    speed,
    addLog,
  ]);

  // 3. MAIN SIMULATION TICK LOOP (Updates battery percentages & auto timers)
  const lastAutoProduceTime = useRef<number>(Date.now());
  const lastAutoConsumeTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // A. Update Active Chargers Battery Progress
      setChargers((prevChargers) => {
        let activePowerTotal = 0;

        const updated = prevChargers.map((charger) => {
          if (charger.status !== 'charging' || !charger.currentEV) {
            return charger;
          }

          activePowerTotal += charger.powerkW;

          // Charge rate calculation based on kW
          const chargeDelta = (charger.powerkW / 40) * 1.8 * speed;
          const newBattery = Math.min(
            charger.currentEV.targetBattery,
            charger.currentEV.currentBattery + chargeDelta
          );

          const deliveredkWhDelta =
            (charger.powerkW * (chargeDelta / 100) * charger.currentEV.capacitykWh) / 100;

          // Update metrics
          setMetrics((m) => ({
            ...m,
            totalEnergyDeliveredkWh: m.totalEnergyDeliveredkWh + deliveredkWhDelta / 10,
          }));

          // Check if EV charge finished
          if (newBattery >= charger.currentEV.targetBattery) {
            const finishedEV = charger.currentEV;
            const energyDelivered = finishedEV.powerNeededkWh || 35.0;

            addLog(
              'CHARGE_COMPLETE',
              `⚡ ${charger.name} completed charging ${finishedEV.id}`,
              `Battery reached ${finishedEV.targetBattery}% (${energyDelivered} kWh delivered)`,
              'success'
            );

            // Record completed session telemetry
            const sessionRecord: CompletedSession = {
              id: `SESSION-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              evId: finishedEV.id,
              evModel: finishedEV.model,
              chargerName: charger.name,
              initialBattery: finishedEV.initialBattery,
              finalBattery: Math.round(newBattery),
              capacitykWh: finishedEV.capacitykWh,
              energyDeliveredkWh: energyDelivered,
              durationSeconds: Math.round(120 + Math.random() * 180), // simulated charging duration
              chargeRate: charger.chargeMode,
              completedAt: formatTimestamp(),
              priority: finishedEV.priority,
            };

            setCompletedSessions((prev) => [sessionRecord, ...prev]);
            setMetrics((m) => ({ ...m, totalConsumed: m.totalConsumed + 1 }));

            return {
              ...charger,
              status: 'finished' as const,
              currentEV: null,
            };
          }

          return {
            ...charger,
            currentEV: {
              ...charger.currentEV,
              currentBattery: newBattery,
            },
            energyDeliveredkWh: charger.energyDeliveredkWh + deliveredkWhDelta / 10,
          };
        });

        setMetrics((m) => ({ ...m, gridLoadkW: activePowerTotal }));
        return updated;
      });

      // B. Auto-Produce Timer
      if (autoProduce && now - lastAutoProduceTime.current >= 2500 / speed) {
        lastAutoProduceTime.current = now;
        handleProduceEV();
      }

      // C. Auto-Consume Timer
      if (autoConsume && now - lastAutoConsumeTime.current >= 2200 / speed) {
        lastAutoConsumeTime.current = now;
        handleConsumeEV();
      }
    }, 500 / speed);

    return () => clearInterval(interval);
  }, [
    isRunning,
    speed,
    autoProduce,
    autoConsume,
    handleProduceEV,
    handleConsumeEV,
    addLog,
  ]);

  // 4. RESET SIMULATION HANDLER
  const handleReset = () => {
    setInPointer(0);
    setOutPointer(0);
    setCounter(0);
    setSeqNumber(101);
    setPendingEVs([]);
    setSlots(
      Array.from({ length: capacity }, (_, i) => ({
        index: i,
        ev: null,
        state: 'empty',
      }))
    );
    setChargers(
      Array.from({ length: chargerCount }, (_, i) => ({
        id: i + 1,
        name: `Charger ${i + 1}`,
        status: 'idle',
        currentEV: null,
        powerkW: i === 0 ? 150 : i === 1 ? 50 : 22,
        energyDeliveredkWh: 0,
        chargingProgress: 0,
        timeElapsedSec: 0,
        etaSec: 0,
        chargeMode: 'Fast DC 150kW',
      }))
    );
    setSemaphores({
      mutex: 1,
      empty: capacity,
      full: 0,
      activeProducer: false,
      activeConsumer: false,
      lockOwner: 'None',
    });
    setMetrics({
      totalProduced: 0,
      totalConsumed: 0,
      raceConditionsCount: 0,
      totalEnergyDeliveredkWh: 0,
      gridLoadkW: 0,
      producerBlockedCount: 0,
      consumerBlockedCount: 0,
    });
    setCompletedSessions([]);
    setStatus('NORMAL');
    addLog('SYSTEM', 'Simulation reset to initial state', 'Queue cleared', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950 pb-12">
      {/* Left-Hand Side (LHS) Menu Bar Navigation */}
      <LhsSidebar
        viewMode={viewMode}
        setViewMode={(vm) => {
          setViewMode(vm);
          if (vm === 'code') setActiveTab('code');
          else if (vm === 'logs') setActiveTab('logs');
          else setActiveTab('simulation');
        }}
        mode={mode}
        setMode={setMode}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        speed={speed}
        setSpeed={setSpeed}
        onReset={handleReset}
        status={status}
        bufferOccupancy={counter}
        bufferCapacity={capacity}
        raceConditionsCount={metrics.raceConditionsCount}
        totalProduced={metrics.totalProduced}
        totalConsumed={metrics.totalConsumed}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Main Container Layout shifted right for LHS sidebar */}
      <div className="lg:pl-72 transition-all">
        {/* Top Header Controls */}
        <Header
          mode={mode}
          setMode={setMode}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          speed={speed}
          setSpeed={setSpeed}
          onReset={handleReset}
          status={status}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'code') setViewMode('code');
            else if (tab === 'logs') setViewMode('logs');
            else if (tab === 'simulation') setViewMode('all');
          }}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Telemetry Metrics Dashboard */}
          <MetricsDashboard
            metrics={metrics}
            mode={mode}
            bufferOccupancy={counter}
            bufferCapacity={capacity}
          />

          {/* VIEW MODE 1: ALL PROCESSES OVERVIEW (3-COLUMN GRID) */}
          {viewMode === 'all' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-3">
                  <ProducerSection
                    onGenerateEV={handleProduceEV}
                    onBurstGenerate={handleBurstGenerate}
                    autoProduce={autoProduce}
                    setAutoProduce={setAutoProduce}
                    pendingEVs={pendingEVs}
                    semaphores={semaphores}
                    mode={mode}
                    bufferOccupancy={counter}
                    bufferCapacity={capacity}
                  />
                </div>

                <div className="lg:col-span-6">
                  <BufferSection
                    slots={slots}
                    inPointer={inPointer}
                    outPointer={outPointer}
                    counter={counter}
                    capacity={capacity}
                    setCapacity={setCapacity}
                    semaphores={semaphores}
                    mode={mode}
                    raceConditionsCount={metrics.raceConditionsCount}
                  />
                </div>

                <div className="lg:col-span-3">
                  <ConsumerSection
                    chargers={chargers}
                    onConsumeEV={handleConsumeEV}
                    autoConsume={autoConsume}
                    setAutoConsume={setAutoConsume}
                    semaphores={semaphores}
                    mode={mode}
                    bufferOccupancy={counter}
                    chargerCount={chargerCount}
                    setChargerCount={setChargerCount}
                  />
                </div>
              </div>

              {/* Event Logs & Completed Sessions */}
              <EventLog logs={logs} onClearLogs={() => setLogs([])} />
              <CompletedSessionsList
                sessions={completedSessions}
                onClearSessions={() => setCompletedSessions([])}
              />
            </div>
          )}

          {/* VIEW MODE 2: PRODUCER PROCESS FOCUS */}
          {viewMode === 'producer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <ProducerSection
                  onGenerateEV={handleProduceEV}
                  onBurstGenerate={handleBurstGenerate}
                  autoProduce={autoProduce}
                  setAutoProduce={setAutoProduce}
                  pendingEVs={pendingEVs}
                  semaphores={semaphores}
                  mode={mode}
                  bufferOccupancy={counter}
                  bufferCapacity={capacity}
                />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <BufferSection
                  slots={slots}
                  inPointer={inPointer}
                  outPointer={outPointer}
                  counter={counter}
                  capacity={capacity}
                  setCapacity={setCapacity}
                  semaphores={semaphores}
                  mode={mode}
                  raceConditionsCount={metrics.raceConditionsCount}
                />
                <EventLog
                  logs={logs.filter((l) => l.type === 'PRODUCE' || l.type === 'MUTEX' || l.type === 'SEMAPHORE')}
                  onClearLogs={() => setLogs([])}
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 3: BUFFER MEMORY PROCESS FOCUS */}
          {viewMode === 'buffer' && (
            <div className="space-y-6">
              <BufferSection
                slots={slots}
                inPointer={inPointer}
                outPointer={outPointer}
                counter={counter}
                capacity={capacity}
                setCapacity={setCapacity}
                semaphores={semaphores}
                mode={mode}
                raceConditionsCount={metrics.raceConditionsCount}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProducerSection
                  onGenerateEV={handleProduceEV}
                  onBurstGenerate={handleBurstGenerate}
                  autoProduce={autoProduce}
                  setAutoProduce={setAutoProduce}
                  pendingEVs={pendingEVs}
                  semaphores={semaphores}
                  mode={mode}
                  bufferOccupancy={counter}
                  bufferCapacity={capacity}
                />
                <ConsumerSection
                  chargers={chargers}
                  onConsumeEV={handleConsumeEV}
                  autoConsume={autoConsume}
                  setAutoConsume={setAutoConsume}
                  semaphores={semaphores}
                  mode={mode}
                  bufferOccupancy={counter}
                  chargerCount={chargerCount}
                  setChargerCount={setChargerCount}
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 4: CONSUMER PROCESS FOCUS */}
          {viewMode === 'consumer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <ConsumerSection
                  chargers={chargers}
                  onConsumeEV={handleConsumeEV}
                  autoConsume={autoConsume}
                  setAutoConsume={setAutoConsume}
                  semaphores={semaphores}
                  mode={mode}
                  bufferOccupancy={counter}
                  chargerCount={chargerCount}
                  setChargerCount={setChargerCount}
                />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <BufferSection
                  slots={slots}
                  inPointer={inPointer}
                  outPointer={outPointer}
                  counter={counter}
                  capacity={capacity}
                  setCapacity={setCapacity}
                  semaphores={semaphores}
                  mode={mode}
                  raceConditionsCount={metrics.raceConditionsCount}
                />
                <CompletedSessionsList
                  sessions={completedSessions}
                  onClearSessions={() => setCompletedSessions([])}
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 5: CODE & SEMAPHORES */}
          {viewMode === 'code' && (
            <ConcurrencyCodePanel
              mode={mode}
              semaphores={semaphores}
              capacity={capacity}
            />
          )}

          {/* VIEW MODE 6: EVENT TRACE LOGS & HISTORY */}
          {viewMode === 'logs' && (
            <div className="space-y-6">
              <EventLog logs={logs} onClearLogs={() => setLogs([])} />
              <CompletedSessionsList
                sessions={completedSessions}
                onClearSessions={() => setCompletedSessions([])}
              />
            </div>
          )}
        </main>
      </div>

      {/* AI Advisor Modal Popup */}
      <AIGridAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        mode={mode}
        bufferOccupancy={counter}
        bufferCapacity={capacity}
        chargers={chargers}
        queuedEVs={slots.filter((s) => s.ev !== null).map((s) => s.ev!)}
        raceConditionsCount={metrics.raceConditionsCount}
        totalEnergyDelivered={metrics.totalEnergyDeliveredkWh}
        gridLoadkW={metrics.gridLoadkW}
      />
    </div>
  );
}
