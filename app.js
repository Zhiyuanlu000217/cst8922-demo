const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure Express to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Express to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock database for SQL injection demo
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', created_at: '2024-01-01' },
  { id: 2, username: 'john_doe', email: 'john@example.com', password: 'password123', role: 'user', created_at: '2024-01-02' },
  { id: 3, username: 'jane_smith', email: 'jane@example.com', password: 'secret456', role: 'user', created_at: '2024-01-03' },
  { id: 4, username: 'bob_wilson', email: 'bob@example.com', password: 'bobpass789', role: 'moderator', created_at: '2024-01-04' }
];

// SQL Injection Demo Endpoints

// VULNERABLE: Demonstrates SQL injection with SELECT * and string concatenation
app.get('/api/users/vulnerable', (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({
      error: 'Username parameter is required',
      demo: 'This endpoint demonstrates SQL injection vulnerabilities',
      example: 'Try: /api/users/vulnerable?username=admin OR 1=1--'
    });
  }

  // VULNERABLE: String concatenation (simulating SQL injection)
  // In real SQL: SELECT * FROM users WHERE username = 'admin' OR 1=1--'
  const mockQuery = `SELECT * FROM users WHERE username = '${username}'`;
  
  // Simulate vulnerable query execution
  let results = [];
  try {
    // This simulates what would happen with a real vulnerable query
    if (username.includes("'") || username.includes('--') || username.includes('OR') || username.includes('1=1')) {
      // Simulate SQL injection - return all users when injection is detected
      results = mockUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password, // VULNERABLE: Exposing sensitive data
        role: user.role,
        created_at: user.created_at
      }));
    } else {
      // Normal query
      results = mockUsers.filter(user => user.username === username);
    }
    
    res.json({
      message: 'VULNERABLE: This endpoint demonstrates SQL injection risks',
      query: mockQuery,
      warning: 'This query uses SELECT * and string concatenation - VULNERABLE!',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      error: 'Query execution failed',
      query: mockQuery,
      message: 'This simulates a real SQL injection vulnerability'
    });
  }
});

// VULNERABLE: Login endpoint demonstrating SQL injection in authentication
app.post('/api/login/vulnerable', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required',
      demo: 'This endpoint demonstrates SQL injection in login authentication',
      example: 'Try with: username=admin&password=wrong OR 1=1--'
    });
  }

  // VULNERABLE: String concatenation in authentication query
  // In real SQL: SELECT * FROM users WHERE username = 'admin' AND password = 'wrong OR 1=1--'
  const mockQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  try {
    // Simulate vulnerable authentication
    let authenticatedUser = null;
    let isInjection = false;
    
    // Check if this looks like an injection attempt
    if (password.includes("'") || password.includes('--') || password.includes('OR') || password.includes('1=1')) {
      isInjection = true;
      // Simulate SQL injection bypassing authentication
      authenticatedUser = mockUsers[0]; // Return first user (admin)
    } else {
      // Normal authentication check
      authenticatedUser = mockUsers.find(user => 
        user.username === username && user.password === password
      );
    }
    
    if (authenticatedUser) {
      res.json({
        message: isInjection ? 'VULNERABLE: SQL injection bypassed authentication!' : 'Login successful',
        query: mockQuery,
        warning: isInjection ? 'This query was vulnerable to SQL injection - VULNERABLE!' : 'Normal authentication',
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          password: authenticatedUser.password // VULNERABLE: Exposing password
        }
      });
    } else {
      res.status(401).json({
        message: 'Login failed - Invalid credentials',
        query: mockQuery,
        suggestion: 'Try SQL injection: password=wrong OR 1=1--'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Authentication failed',
      query: mockQuery,
      message: 'This simulates a real SQL injection vulnerability in authentication'
    });
  }
});

// SECURE: Placeholder for secure endpoint (to be implemented later)
app.get('/api/users/secure', (req, res) => {
  res.json({
    message: 'Secure endpoint - To be implemented',
    note: 'This endpoint will demonstrate secure SQL practices in a future update'
  });
});

// Demo endpoint to show the difference between vulnerable and secure approaches
app.get('/api/sql-demo', (req, res) => {
  res.json({
    title: 'SQL Injection and Best Practices Demo',
    description: 'This demo shows the difference between vulnerable and secure SQL practices',
    endpoints: {
      vulnerable: {
        url: '/api/users/vulnerable?username=admin',
        description: 'Demonstrates SQL injection vulnerabilities with SELECT * and string concatenation',
        risks: [
          'SQL injection attacks',
          'Exposure of sensitive data',
          'Unauthorized access to all records'
        ]
      },
      login_vulnerable: {
        url: '/api/login/vulnerable',
        method: 'POST',
        description: 'Demonstrates SQL injection in login authentication',
        risks: [
          'Authentication bypass',
          'Unauthorized access',
          'Password exposure'
        ]
      },
      secure: {
        url: '/api/users/secure?username=admin',
        description: 'Demonstrates secure practices with parameterized queries and specific columns',
        status: 'Coming soon - To be implemented'
      }
    },
    test_cases: [
      {
        name: 'Normal Query',
        vulnerable: '/api/users/vulnerable?username=admin',
        secure: '/api/users/secure?username=admin'
      },
      {
        name: 'SQL Injection Attempt',
        vulnerable: '/api/users/vulnerable?username=admin OR 1=1--',
        secure: '/api/users/secure?username=admin OR 1=1--'
      },
      {
        name: 'Login Injection',
        vulnerable: 'POST /api/login/vulnerable with password=wrong OR 1=1--',
        secure: 'Coming soon'
      }
    ]
  });
});

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
  console.log(`SQL Injection Demo available at: http://localhost:${PORT}/api/sql-demo`);
}); 