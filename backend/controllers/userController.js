const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getStores = async (req, res) => {
  try {
    const { name, email, sortBy = 'name', order = 'asc' } = req.query;
    let query = `SELECT s.id, s.name, s.email, s.address, 
      (SELECT ROUND(AVG(r.rating), 2) FROM ratings r WHERE r.store_id = s.id) AS avgRating
      FROM stores s WHERE 1=1`;
    const params = [];
    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    const allowedSort = ['name', 'email'];
    const sortField = allowedSort.includes(sortBy) ? `s.${sortBy}` : 's.name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores.', error: err.message });
  }
};

exports.submitRating = async (req, res) => {
  const { storeId, rating, comment } = req.body;
  const userId = req.user.id;
  try {
    // Check if store exists
    const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    // Check if user already rated this store
    const [existing] = await db.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'You have already rated this store. Use update instead.' });
    }
    // Insert rating with comment
    await db.query('INSERT INTO ratings (user_id, store_id, rating, comment) VALUES (?, ?, ?, ?)', [userId, storeId, rating, comment]);
    res.status(201).json({ message: 'Rating submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating.', error: err.message });
  }
};

exports.updateRating = async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user.id;
  const storeId = req.params.storeId;
  try {
    // Check if rating exists
    const [existing] = await db.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'No existing rating to update for this store.' });
    }
    // Update rating and comment
    await db.query('UPDATE ratings SET rating = ?, comment = ? WHERE user_id = ? AND store_id = ?', [rating, comment, userId, storeId]);
    res.json({ message: 'Rating updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rating.', error: err.message });
  }
};

exports.getUserStoreRating = async (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;
  try {
    const [rows] = await db.query(
      'SELECT rating, comment FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No rating found for this store.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rating.', error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required.' });
    }
    // Get current hashed password
    const [users] = await db.query('SELECT password FROM users WHERE email = ?', [userEmail]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = users[0];
    // Compare old password
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }
    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, userEmail]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password.', error: err.message });
  }
}; 