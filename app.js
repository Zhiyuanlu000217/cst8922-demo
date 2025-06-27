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


// --- NEW FEATURE: /api/data-analysis endpoint ---

/**
 * Processes a collection of data to identify relationships or patterns.
 * This function performs computations on a list of items.
 */
function analyzeData(dataSize) {
  // Create a dataset for processing
  const dataset = Array.from({ length: dataSize }, (_, i) => i % (dataSize / 10 || 1)); // Creates some values that may appear multiple times

  let relevantCount = 0;
  // Iterate through the dataset to perform calculations
  for (let i = 0; i < dataset.length; i++) {
    for (let j = 0; j < dataset.length; j++) {
      if (i !== j && dataset[i] === dataset[j]) {
        relevantCount++; // Accumulate based on certain conditions
      }
    }
  }
  return relevantCount;
}

// Endpoint for data analysis processing
app.get('/api/data-analysis', (req, res) => {
  const { size } = req.query; // Get 'size' from query parameter, e.g., /api/data-analysis?size=10000

  if (!size || isNaN(size) || size <= 0) {
    return res.status(400).json({ error: 'Please provide a positive number "size" for dataset processing (e.g., /api/data-analysis?size=10000).' });
  }

  const datasetSize = parseInt(size, 10);
  console.log(`DATA ANALYSIS: Processing dataset of size ${datasetSize}.`);
  const startTime = process.hrtime.bigint(); // High-resolution time start

  const result = analyzeData(datasetSize); // Perform the data analysis

  const endTime = process.hrtime.bigint(); // High-resolution time end
  const durationNs = endTime - startTime;
  const durationMs = Number(durationNs) / 1_000_000;

  console.log(`DATA ANALYSIS: Processing completed. Took ${durationMs.toFixed(2)}ms.`);

  res.json({
    status: 'success',
    message: `Processed dataset of size ${datasetSize}.`,
    result: result,
    processing_time_ms: durationMs.toFixed(2),
  });
});

// --- END NEW FEATURE ---


// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`Data Analysis endpoint available at: http://localhost:${PORT}/api/data-analysis?size=10000`);
});