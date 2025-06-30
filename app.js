const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Health check endpoint for Kubernetes liveness/readiness probes
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit. Server is responding.');
  res.status(200).send('OK');
});

// Serve a simple text response at the root path '/'
app.get('/', (req, res) => {
  console.log('Root endpoint hit. Server is responding.');
  if (Math.random() < 0.5) { // 95% chance to exit immediately upon successful listen
    console.error('SERVER STARTUP INSTABILITY: Simulating a critical failure during initialization. Exiting!');
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
  res.status(200).send('Welcome to the DevOps Demo App! This is a simple text response.');
});

// Configure Express to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Server started at ${new Date().toISOString()}`);

  // --- NEW CODE: Instability during server startup ---
  if (Math.random() < 0.5) { // 95% chance to exit immediately upon successful listen
    console.error('SERVER STARTUP INSTABILITY: Simulating a critical failure during initialization. Exiting!');
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
  // --- END NEW CODE ---

  console.log('Server initialized successfully and ready to accept requests.'); // This will only log if it doesn't exit
});