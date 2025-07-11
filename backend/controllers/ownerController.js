const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getStoreRatings = async (req, res) => {
  try {
    // Find the store owned by this owner (by matching user email to store email)
    const ownerEmail = req.user.email;
    const [stores] = await db.query('SELECT id FROM stores WHERE email = ?', [ownerEmail]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner.' });
    }
    const storeId = stores[0].id;
    // Get users and their ratings for this store
    const [ratings] = await db.query(
      `SELECT users.id AS userId, users.name, users.email, ratings.rating, ratings.comment
       FROM ratings
       JOIN users ON ratings.user_id = users.id
       WHERE ratings.store_id = ?`,
      [storeId]
    );
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings for your store.', error: err.message });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    // Find the store owned by this owner (by matching user email to store email)
    const ownerEmail = req.user.email;
    const [stores] = await db.query('SELECT id FROM stores WHERE email = ?', [ownerEmail]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner.' });
    }
    const storeId = stores[0].id;
    // Get average rating for this store
    const [[result]] = await db.query(
      'SELECT AVG(rating) AS averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    );
    res.json({ averageRating: result.averageRating ? Number(result.averageRating).toFixed(2) : null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch average rating for your store.', error: err.message });
  }
};

exports.getMyStore = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const [stores] = await db.query(
      'SELECT id, name, email, address FROM stores WHERE email = ?',
      [ownerEmail]
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner.' });
    }
    res.json(stores[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch store info.', error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const ownerEmail = req.user.email;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required.' });
    }
    // Get current hashed password
    const [users] = await db.query('SELECT password FROM users WHERE email = ?', [ownerEmail]);
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
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, ownerEmail]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password.', error: err.message });
  }
}; 