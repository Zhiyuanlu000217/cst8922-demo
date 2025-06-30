const express = require('express');
const path = require('path'); // Path is no longer strictly needed but often kept

const app = express();
const PORT = 3000;

// Health check endpoint for Kubernetes liveness/readiness probes
// app.get('/health', (req, res) => {
//   res.status(200).send('OK');
// });

// Serve a simple text response at the root path '/'
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the DevOps Demo App! This is a simple text response.');
});

// Configure Express to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CODE FOR SERVER-WIDE INSTABILITY ---
// This middleware will run for every request
app.use((req, res, next) => {
  // Option 1: Randomly crash the server process
  // This simulates an unrecoverable error that causes the app to exit.
  if (Math.random() < 0.50) { // 50% chance to crash
    console.error('SERVER-WIDE INSTABILITY: Simulating a process crash for all endpoints!');
    // Using process.exit() will terminate the entire Node.js application.
    process.exit(1); // Exit with a non-zero code to indicate an error
  }

  // Option 2: Randomly introduce a significant delay (block the event loop)
  // This simulates the server becoming unresponsive due to high load or a hung operation.
  if (Math.random() < 0.50) { // 50% chance to introduce a global delay
    const blockingDurationMs = Math.random() * 3000 + 1000; // Random delay between 1 to 4 seconds
    console.warn(`SERVER-WIDE INSTABILITY: Simulating a global block for ${blockingDurationMs.toFixed(0)}ms.`);
    const start = Date.now();
    while (Date.now() - start < blockingDurationMs) {
      // Busy-wait to block the Node.js event loop
    }
    console.warn('SERVER-WIDE INSTABILITY: Global block finished. Resuming request processing.');
  }

  next(); // Continue to the next middleware/route handler
});
// --- END SERVER-WIDE INSTABILITY CODE ---

// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
});