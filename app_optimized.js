const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001; // Use a different port for canary

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: Replicate server-wide instability if needed
app.use((req, res, next) => {
  if (Math.random() < 0.05) {
    console.error('SERVER-WIDE INSTABILITY: Simulating a process crash for all endpoints!');
    process.exit(1);
  }
  if (Math.random() < 0.10) {
    const blockingDurationMs = Math.random() * 3000 + 1000;
    const start = Date.now();
    while (Date.now() - start < blockingDurationMs) { }
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- OPTIMIZED /api/stress ENDPOINT ---
function processEfficiently(n) {
  const largeArray = Array.from({ length: n }, (_, i) => i % (n / 10 || 1));
  const freq = new Map();
  let pairCount = 0;
  for (const num of largeArray) {
    const count = freq.get(num) || 0;
    pairCount += count;
    freq.set(num, count + 1);
  }
  // Each pair is counted once per duplicate
  return pairCount * 2; // To match the original O(n^2) logic
}

app.get('/api/stress', (req, res) => {
  const { n } = req.query;
  if (!n || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: 'Please provide a positive number "n" for array size (e.g., /api/stress?n=10000).' });
  }
  const arraySize = parseInt(n, 10);
  console.log(`STRESS TEST (OPTIMIZED): Processing array of size ${arraySize} using O(n) algorithm.`);
  const startTime = process.hrtime.bigint();
  const result = processEfficiently(arraySize);
  const endTime = process.hrtime.bigint();
  const durationNs = endTime - startTime;
  const durationMs = Number(durationNs) / 1_000_000;
  console.log(`STRESS TEST (OPTIMIZED): O(n) processing completed. Took ${durationMs.toFixed(2)}ms.`);
  res.json({
    status: 'success',
    message: `Processed array of size ${arraySize} (O(n) simulation).`,
    result: result,
    calculation_time_ms: durationMs.toFixed(2),
    note: 'This endpoint uses an optimized O(n) algorithm for high performance.'
  });
});

app.listen(PORT, () => {
  console.log(`DevOps Demo App (Optimized) is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`Optimized Stress Test endpoint available at: http://localhost:${PORT}/api/stress?n=10000`);
});
