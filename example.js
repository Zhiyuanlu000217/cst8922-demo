// --- FIXED: Secure Search with Parameterized Query ---
const mysql = require('mysql2');
const pool = mysql.createPool({
  // your database config here
});

app.get('/api/products/search', (req, res) => {
  const searchTerm = req.query.term || '';
  const sql = "SELECT name, price FROM products WHERE name LIKE ?";
  const likeTerm = `%${searchTerm}%`;

  pool.query(sql, [likeTerm], (err, results) => {
    if (err) {
      // Proper error handling
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.json({ message: 'Product search (SECURE)', results });
  });
});