import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API route for AI Smart Grid Advisor using Gemini API
app.post('/api/ai-grid-advisor', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured.' });
    }

    const {
      mode,
      bufferOccupancy,
      bufferCapacity,
      activeChargers,
      totalChargers,
      queuedEVs,
      raceConditionsCount,
      totalEnergyDelivered,
      gridLoadkW,
      requestType, // 'optimize' | 'diagnose' | 'explain'
    } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `You are the Smart Grid & Concurrency AI Advisor for an EV Charging Station running a Producer-Consumer buffer architecture. 
Provide concise, expert, actionable insights formatted with markdown bold headers and clean bullet points.`;

    let prompt = '';

    if (requestType === 'diagnose' || (mode === 'without_sync' && raceConditionsCount > 0)) {
      prompt = `The system is running in "${mode === 'without_sync' ? 'Without Synchronization (Unprotected)' : 'With Synchronization'}" mode.
Current Metrics:
- Buffer Occupancy: ${bufferOccupancy}/${bufferCapacity}
- Race Conditions / Faults Count: ${raceConditionsCount}
- Active Chargers: ${activeChargers}/${totalChargers}
- Queued EVs: ${JSON.stringify(queuedEVs || [])}

Please analyze:
1. The exact concurrency hazards (e.g., race conditions, dirty reads, buffer overflows, or overwritten array elements) that occurred.
2. Why mutex locks and counting semaphores (mutex, empty, full) prevent these errors in operating systems and distributed grid controllers.
3. 2 concrete action steps to stabilize the charging queue.`;
    } else {
      prompt = `Analyze the current EV Charging Smart Grid status:
- Operating Mode: ${mode === 'with_sync' ? 'Synchronized (Mutex & Semaphores Enabled)' : 'Unsynchronized'}
- Bounded Buffer: ${bufferOccupancy}/${bufferCapacity} slots occupied
- Active Chargers: ${activeChargers}/${totalChargers} stations charging
- Grid Power Load: ${gridLoadkW} kW
- Cumulative Energy Delivered: ${totalEnergyDelivered} kWh
- Queued EV Priorities: ${JSON.stringify(queuedEVs || [])}

Provide:
1. ⚡ **Smart Charging Recommendation**: Strategy to optimize throughput and power distribution (e.g., Shortest Charge First, VIP prioritization, solar load shifting).
2. 🔒 **Concurrency & Queue Efficiency Analysis**: How effectively the producer-consumer buffer is handling peak incoming EV demand.
3. 💡 **Grid Load Action Plan**: A short 2-bullet optimization plan for the next 5 minutes.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    return res.json({
      advice: response.text || 'Unable to generate grid advice at this time.',
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: error.message || 'Failed to call AI Advisor' });
  }
});

// Vite middleware in dev mode
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve static assets in production
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Smart EV Charging Producer-Consumer Server running on http://0.0.0.0:${PORT}`);
});
