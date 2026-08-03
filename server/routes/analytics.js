// Analytics API routes
const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken } = require('./auth');

const dbPath = path.join(__dirname, '..', 'database', 'sushi.db');

// Helper to get database connection
function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

// Apply authentication to all analytics routes
router.use(authenticateToken);

// GET /api/analytics/sales - Get sales statistics
router.get('/sales', (req, res) => {
  try {
    const { period = '7days' } = req.query;
    const db = getDb();
    
    let dateCondition = '';
    switch (period) {
      case 'today':
        dateCondition = "DATE(created_at) = DATE('now')";
        break;
      case '7days':
        dateCondition = "created_at >= datetime('now', '-7 days')";
        break;
      case '30days':
        dateCondition = "created_at >= datetime('now', '-30 days')";
        break;
      case 'all':
        dateCondition = '1=1';
        break;
      default:
        dateCondition = "created_at >= datetime('now', '-7 days')";
    }
    
    // Total sales
    const totalSales = db.prepare(`
      SELECT 
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        SUM(discount_amount) as total_discounts
      FROM orders
      WHERE ${dateCondition} AND status != 'cancelled'
    `).get();
    
    // Sales by status
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      WHERE ${dateCondition}
      GROUP BY status
    `).all();
    
    // Daily sales
    const dailySales = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE ${dateCondition} AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `).all();
    
    db.close();
    
    res.json({ 
      success: true, 
      data: {
        summary: totalSales,
        byStatus,
        dailySales
      }
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales analytics' });
  }
});

// GET /api/analytics/popular - Get popular products
router.get('/popular', (req, res) => {
  try {
    const { limit = 10, period = '7days' } = req.query;
    const db = getDb();
    
    let dateCondition = '';
    switch (period) {
      case 'today':
        dateCondition = "DATE(o.created_at) = DATE('now')";
        break;
      case '7days':
        dateCondition = "o.created_at >= datetime('now', '-7 days')";
        break;
      case '30days':
        dateCondition = "o.created_at >= datetime('now', '-30 days')";
        break;
      default:
        dateCondition = "o.created_at >= datetime('now', '-7 days')";
    }
    
    const popularProducts = db.prepare(`
      SELECT 
        oi.product_name,
        oi.product_id,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE ${dateCondition} AND o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_quantity DESC
      LIMIT ?
    `).all(parseInt(limit));
    
    db.close();
    
    res.json({ success: true, data: popularProducts });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular products' });
  }
});

// GET /api/analytics/orders - Get order statistics
router.get('/orders', (req, res) => {
  try {
    const db = getDb();
    
    // Order stats by status
    const statusStats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_value
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `).all();
    
    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, customer_name, customer_phone, total_amount, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `).all();
    
    db.close();
    
    res.json({ 
      success: true, 
      data: {
        statusStats,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order analytics' });
  }
});

module.exports = router;
