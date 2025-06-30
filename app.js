const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder for future API endpoints that will be used in later demo stages:

// Start the server
app.listen(PORT, () => {
  console.log(`DevOps Demo App is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
}); 