// Auth API routes for employees
const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'sushi.db');
const JWT_SECRET = process.env.JWT_SECRET || 'sushi-delivery-secret-key-change-in-production';

// Helper to get database connection
function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

// POST /api/auth/login - Employee login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    
    const db = getDb();
    
    const employee = db.prepare(`
      SELECT * FROM employees 
      WHERE username = ? AND is_active = 1
    `).get(username);
    
    db.close();
    
    if (!employee) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = bcrypt.compareSync(password, employee.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: employee.id, 
        username: employee.username, 
        role: employee.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ 
      success: true, 
      data: {
        token,
        user: {
          id: employee.id,
          username: employee.username,
          role: employee.role
        }
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    
    const employee = db.prepare(`
      SELECT id, username, role, created_at 
      FROM employees 
      WHERE id = ? AND is_active = 1
    `).get(req.user.id);
    
    db.close();
    
    if (!employee) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user info' });
  }
});

// POST /api/auth/logout - Logout (client-side token removal, but we log it)
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ success: true, message: 'Logged out successfully' });
});

// Export middleware for use in other routes
module.exports = router;
module.exports.authenticateToken = authenticateToken;
