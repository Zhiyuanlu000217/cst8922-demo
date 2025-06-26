// --- VULNERABLE SNIPPET 2: Search with LIKE clause ---
app.get('/api/products/search', (req, res) => {
  const searchTerm = req.query.term;
  // VULNERABLE: Direct concatenation in LIKE clause
  const sql = "SELECT name, price FROM products WHERE name LIKE '%" + searchTerm + "%'";
  console.log('VULNERABLE SQL 2:', sql);
  res.json({ message: 'Product search (VULNERABLE)', sql: sql });
});