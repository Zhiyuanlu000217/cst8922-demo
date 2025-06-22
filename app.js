const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder for future API endpoints that will be used in later demo stages:

// @TODO: Future /api/users endpoint (for the SELECT * SQL anti-pattern demo)
// app.get('/api/users', (req, res) => {
//   // This endpoint will demonstrate SQL injection vulnerabilities
//   // and the SELECT * anti-pattern in later demo stages
// });

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