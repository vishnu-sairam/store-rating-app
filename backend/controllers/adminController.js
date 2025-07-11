const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    // Check if user already exists
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, address || '', role || 'User']
    );
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed.', error: err.message });
  }
};

exports.createStore = async (req, res) => {
  const { name, email, address } = req.body;
  try {
    // If email is provided, check if store with that email exists
    if (email) {
      const { rows: existing } = await db.query('SELECT id FROM stores WHERE email = $1', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Store email already registered.' });
      }
    }
    // Insert store
    await db.query(
      'INSERT INTO stores (name, email, address) VALUES ($1, $2, $3)',
      [name, email || null, address || '']
    );
    res.status(201).json({ message: 'Store created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Store creation failed.', error: err.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const { rows: userRows } = await db.query('SELECT COUNT(*) AS userCount FROM users');
    const { rows: storeRows } = await db.query('SELECT COUNT(*) AS storeCount FROM stores');
    const { rows: ratingRows } = await db.query('SELECT COUNT(*) AS ratingCount FROM ratings');
    res.json({
      totalUsers: parseInt(userRows[0].usercount),
      totalStores: parseInt(storeRows[0].storecount),
      totalRatings: parseInt(ratingRows[0].ratingcount)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data.', error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { name, email, role, sortBy = 'name', order = 'asc' } = req.query;
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    if (name) {
      query += ` AND name LIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      query += ` AND email LIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    // Only allow sorting by name or email
    const allowedSort = ['name', 'email'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    const { rows: users } = await db.query(query, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
};

exports.listStores = async (req, res) => {
  try {
    const { name, email, sortBy = 'name', order = 'asc' } = req.query;
    let query = `SELECT s.id, s.name, s.email, s.address,
      (SELECT ROUND(AVG(r.rating), 2) FROM ratings r WHERE r.store_id = s.id) AS avgRating
      FROM stores s WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    if (name) {
      query += ` AND s.name LIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      query += ` AND s.email LIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    // Only allow sorting by name or email
    const allowedSort = ['name', 'email'];
    const sortField = allowedSort.includes(sortBy) ? `s.${sortBy}` : 's.name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    const { rows: stores } = await db.query(query, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores.', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, address, role } = req.body;
    const { rows: existing } = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await db.query('UPDATE users SET name = $1, email = $2, address = $3, role = $4 WHERE id = $5', [name, email, address, role, userId]);
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.', error: err.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { name, email, address } = req.body;
    // Check if store exists
    const { rows: existing } = await db.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    // Update store
    await db.query('UPDATE stores SET name = $1, email = $2, address = $3 WHERE id = $4', [name, email, address, storeId]);
    res.json({ message: 'Store updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update store.', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists and get their role and email
    const { rows: userData } = await db.query('SELECT id, role, email, name FROM users WHERE id = $1', [userId]);
    if (userData.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userData[0];
    let deletedData = {
      user: user.name,
      role: user.role,
      storesDeleted: 0,
      ratingsDeleted: 0,
      userRatingsDeleted: 0
    };

    // If user is an owner, delete their associated stores and ratings first
    if (user.role === 'Owner') {
      // Get stores owned by this user (matching by email)
      const { rows: stores } = await db.query('SELECT id, name FROM stores WHERE email = $1', [user.email]);
      deletedData.storesDeleted = stores.length;
      
      // Delete ratings for all stores owned by this user
      for (const store of stores) {
        const { rowCount: ratingResult } = await db.query('DELETE FROM ratings WHERE store_id = $1', [store.id]);
        deletedData.ratingsDeleted += ratingResult;
      }
      
      // Delete the stores owned by this user
      await db.query('DELETE FROM stores WHERE email = $1', [user.email]);
    }

    // Delete ratings made by this user
    const { rowCount: userRatingResult } = await db.query('DELETE FROM ratings WHERE user_id = $1', [userId]);
    deletedData.userRatingsDeleted = userRatingResult;

    // Finally delete the user from the users table
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    
    // Prepare detailed response message
    let message = `User "${user.name}" (${user.role}) deleted successfully.`;
    if (user.role === 'Owner') {
      message += ` Also deleted: ${deletedData.storesDeleted} stores, ${deletedData.ratingsDeleted} store ratings, and ${deletedData.userRatingsDeleted} user ratings.`;
    } else {
      message += ` Also deleted: ${deletedData.userRatingsDeleted} user ratings.`;
    }
    
    res.json({ 
      message: message,
      deletedData: deletedData
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.', error: err.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { rows: existing } = await db.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    // Delete ratings for this store first
    await db.query('DELETE FROM ratings WHERE store_id = $1', [storeId]);
    // Now delete the store
    await db.query('DELETE FROM stores WHERE id = $1', [storeId]);
    res.json({ message: 'Store deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete store.', error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const adminEmail = req.user.email;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required.' });
    }

    // Get current hashed password
    const { rows: users } = await db.query('SELECT password FROM users WHERE email = $1', [adminEmail]);
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
    
    // Update password
    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, adminEmail]);
    
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password.', error: err.message });
  }
}; 