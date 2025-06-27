const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CODE FOR SERVER-WIDE INSTABILITY (Optional, keep if you want it) ---
// This middleware will run for every request
app.use((req, res, next) => {
  if (Math.random() < 0.05) { // 5% chance to crash
    console.error('SERVER-WIDE INSTABILITY: Simulating a process crash for all endpoints!');
    process.exit(1);
  }

  if (Math.random() < 0.10) { // 10% chance to introduce a global delay
    const blockingDurationMs = Math.random() * 3000 + 1000;
    console.warn(`SERVER-WIDE INSTABILITY: Simulating a global block for ${blockingDurationMs.toFixed(0)}ms.`);
    const start = Date.now();
    while (Date.now() - start < blockingDurationMs) { }
    console.warn('SERVER-WIDE INSTABILITY: Global block finished. Resuming request processing.');
  }

  next();
});
// --- END SERVER-WIDE INSTABILITY CODE ---


// Configure Express to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// --- NEW FEATURE: /api/stress endpoint with O(n^2) inefficiency ---

/**
 * Deliberately inefficient O(n^2) function to simulate a performance bottleneck.
 * It simulates processing a list and finding duplicate pairs using nested loops.
 * An optimized solution would typically use a Set or Map (O(n)).
 */
function processInefficiently(n) {
  // Create a large array for processing
  const largeArray = Array.from({ length: n }, (_, i) => i % (n / 10 || 1)); // Creates some duplicates

  let pairCount = 0;
  // This nested loop makes the complexity O(n^2)
  for (let i = 0; i < largeArray.length; i++) {
    for (let j = 0; j < largeArray.length; j++) {
      if (i !== j && largeArray[i] === largeArray[j]) {
        pairCount++; // Dummy operation to simulate work
      }
    }
  }
  return pairCount;
}

// Endpoint to simulate high CPU usage due to inefficient algorithm
app.get('/api/stress', (req, res) => {
  const { n } = req.query; // Get 'n' from query parameter, e.g., /api/stress?n=10000

  if (!n || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: 'Please provide a positive number "n" for array size (e.g., /api/stress?n=10000).' });
  }

  const arraySize = parseInt(n, 10);
  console.log(`STRESS TEST: Processing array of size ${arraySize} using O(n^2) algorithm.`);
  const startTime = process.hrtime.bigint(); // High-resolution time start

  const result = processInefficiently(arraySize); // This is the CPU-intensive part

  const endTime = process.hrtime.bigint(); // High-resolution time end
  const durationNs = endTime - startTime;
  const durationMs = Number(durationNs) / 1_000_000;

  console.log(`STRESS TEST: O(n^2) processing completed. Took ${durationMs.toFixed(2)}ms.`);

  res.json({
    status: 'success',
    message: `Processed array of size ${arraySize} (O(n^2) simulation).`,
    result: result,
    calculation_time_ms: durationMs.toFixed(2),
    note: 'This endpoint simulates high CPU load due to an inefficient O(n^2) algorithm. An O(n) optimization is possible.',
  });
});

// --- END NEW FEATURE ---


// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`Stress Test endpoint available at: http://localhost:${PORT}/api/stress?n=10000`);
});