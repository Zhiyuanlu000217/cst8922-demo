const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CODE FOR SERVER-WIDE INSTABILITY ---
// This middleware will run for every request
app.use((req, res, next) => {
  // Option 1: Randomly crash the server process
  // This simulates an unrecoverable error that causes the app to exit.
  if (Math.random() < 0.95) { // 5% chance to crash
    console.error('SERVER-WIDE INSTABILITY: Simulating a process crash for all endpoints!');
    // Using process.exit() will terminate the entire Node.js application.
    process.exit(1); // Exit with a non-zero code to indicate an error
  }

  // Option 2: Randomly introduce a significant delay (block the event loop)
  // This simulates the server becoming unresponsive due to high load or a hung operation.
  if (Math.random() < 0.70) { // 10% chance to introduce a global delay
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


// Configure Express to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Placeholder for future API endpoints that will be used in later demo stages:

// @TODO: Future /api/unstable endpoint (for the health probe demo's deliberate instability)
// app.get('/api/unstable', (req, res) => {
//   // This endpoint will be deliberately unstable for health probe testing
//   // in later demo stages
// });

// @TODO: Future /api/stress endpoint (for the high-concurrency/performance demo)
// app.get('/api/stress', (req, res) => {
//   // This endpoint will be used for stress testing and performance optimization
//   // in later demo stages
// });

// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
});