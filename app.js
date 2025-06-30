const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to parse JSON and URL-encoded bodies (common initial setup)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CODE FOR SERVER-WIDE INSTABILITY (MOVED TO THE TOP) ---
// This middleware will run for every request, BEFORE any specific routes are handled.
app.use((req, res, next) => {
  console.log('Instability middleware hit for request to:', req.path); // Log to confirm it's active

  // Option 1: Randomly crash the server process
  // This simulates an unrecoverable error that causes the app to exit.
  if (Math.random() < 0.50) { // 50% chance to crash
    console.error('SERVER-WIDE INSTABILITY: Simulating a process crash for all endpoints!');
    // Using process.exit() will terminate the entire Node.js application.
    process.exit(1); // Exit with a non-zero code to indicate an error
  }

  // Option 2: Randomly introduce a significant delay (block the event loop)
  // This simulates the server becoming unresponsive due to high load or a hung operation.
  // This will only be hit if the process.exit(1) condition was NOT met.
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

// Health check endpoint for Kubernetes liveness/readiness probes
// Now, this route will be affected by the instability middleware
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit.');
  res.status(200).send('OK');
});

// Serve a simple text response at the root path '/'
// Now, this route will be affected by the instability middleware
app.get('/', (req, res) => {
  console.log('Root endpoint hit.');
  res.status(200).send('Welcome to the DevOps Demo App! This is a simple text response.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Server started at ${new Date().toISOString()}`); // Timestamp for clarity
});