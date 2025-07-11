const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const ownerRoutes = require('./routes/owner');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(ownerRoutes);

// Test DB connection
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Postgres connected successfully!');
  } catch (err) {
    console.error('Postgres connection failed:', err);
  }
})();

// Root route
app.get('/', (req, res) => {
  res.send('Store Rating API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 