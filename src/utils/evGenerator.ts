import { EV, EVPriority, EVChargeRate } from '../types/ev';

const EV_MODELS = [
  { model: 'Tesla Model Y', capacity: 75 },
  { model: 'Rivian R1T', capacity: 135 },
  { model: 'Porsche Taycan', capacity: 93 },
  { model: 'Hyundai Ioniq 5', capacity: 77 },
  { model: 'Chevy Bolt EV', capacity: 65 },
  { model: 'Lucid Air', capacity: 112 },
  { model: 'Ford F-150 Lightning', capacity: 131 },
  { model: 'BMW i4 M50', capacity: 84 },
  { model: 'Mercedes EQS', capacity: 108 },
  { model: 'Kia EV6 GT', capacity: 77 },
];

const PRIORITIES: EVPriority[] = ['Standard', 'Standard', 'Standard', 'Fleet', 'VIP Emergency'];
const CHARGE_RATES: EVChargeRate[] = ['Fast DC 150kW', 'Standard AC 22kW', 'Eco Solar 11kW'];

export function generateEV(seqNumber: number): EV {
  const modelTemplate = EV_MODELS[Math.floor(Math.random() * EV_MODELS.length)];
  const initialBattery = Math.floor(Math.random() * 35) + 10; // 10% to 45%
  const targetBattery = Math.floor(Math.random() * 20) + 80; // 80% to 100%
  const powerNeededkWh = Math.round(modelTemplate.capacity * ((targetBattery - initialBattery) / 100) * 10) / 10;
  
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  const preferredRate = CHARGE_RATES[Math.floor(Math.random() * CHARGE_RATES.length)];

  return {
    id: `EV${seqNumber}`,
    seqNumber,
    model: modelTemplate.model,
    initialBattery,
    currentBattery: initialBattery,
    targetBattery,
    capacitykWh: modelTemplate.capacity,
    powerNeededkWh,
    priority,
    preferredRate,
    createdAt: Date.now(),
    status: 'Queued',
  };
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}
