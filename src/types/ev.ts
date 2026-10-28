export type EVPriority = 'Standard' | 'Fleet' | 'VIP Emergency';

export type EVChargeRate = 'Fast DC 150kW' | 'Standard AC 22kW' | 'Eco Solar 11kW';

export interface EV {
  id: string; // e.g., EV101
  seqNumber: number; // e.g., 101
  model: string;
  initialBattery: number; // %
  currentBattery: number; // %
  targetBattery: number; // %
  capacitykWh: number; // e.g. 75 kWh
  powerNeededkWh: number;
  priority: EVPriority;
  preferredRate: EVChargeRate;
  createdAt: number;
  status: 'Queued' | 'Charging' | 'Completed' | 'Corrupted' | 'Dropped';
}

export interface BufferSlot {
  index: number;
  ev: EV | null;
  state: 'empty' | 'occupied' | 'writing' | 'reading' | 'corrupted';
  lastUpdatedBy?: 'Producer' | 'Consumer' | 'Overflow';
}

export interface Charger {
  id: number;
  name: string;
  status: 'idle' | 'charging' | 'finished' | 'blocked';
  currentEV: EV | null;
  powerkW: number;
  energyDeliveredkWh: number;
  chargingProgress: number; // % from 0 to 100 relative to (target - initial)
  timeElapsedSec: number;
  etaSec: number;
  chargeMode: EVChargeRate;
}

export type SimulationMode = 'with_sync' | 'without_sync';

export interface SemaphoresState {
  mutex: number; // 1 = unlocked, 0 = locked
  empty: number; // free slots count
  full: number; // filled slots count
  activeProducer: boolean;
  activeConsumer: boolean;
  lockOwner: 'Producer' | 'Consumer' | 'None';
}

export interface LogEvent {
  id: string;
  timestamp: string;
  type: 'PRODUCE' | 'CONSUME' | 'MUTEX' | 'SEMAPHORE' | 'RACE_CONDITION' | 'CHARGE_COMPLETE' | 'SYSTEM';
  message: string;
  details?: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface CompletedSession {
  id: string;
  evId: string;
  evModel: string;
  chargerName: string;
  initialBattery: number;
  finalBattery: number;
  capacitykWh: number;
  energyDeliveredkWh: number;
  durationSeconds: number;
  chargeRate: EVChargeRate;
  completedAt: string;
  priority: EVPriority;
}

export interface Metrics {
  totalProduced: number;
  totalConsumed: number;
  raceConditionsCount: number;
  totalEnergyDeliveredkWh: number;
  gridLoadkW: number;
  producerBlockedCount: number;
  consumerBlockedCount: number;
}
