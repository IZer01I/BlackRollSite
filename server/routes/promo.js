// Promo codes API routes
const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'sushi.db');

// Helper to get database connection
function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

// POST /api/promo/validate - Validate promo code
router.post('/validate', (req, res) => {
  try {
    const { code, order_total } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, error: 'Promo code is required' });
    }
    
    const db = getDb();
    
    const promo = db.prepare(`
      SELECT * FROM promo_codes 
      WHERE code = ? AND is_active = 1
      AND (valid_from IS NULL OR valid_from <= datetime('now'))
      AND (valid_until IS NULL OR valid_until >= datetime('now'))
      AND (max_uses IS NULL OR current_uses < max_uses)
    `).get(code.toUpperCase());
    
    db.close();
    
    if (!promo) {
      return res.json({ 
        success: false, 
        valid: false,
        error: 'Промокод не найден или не активен' 
      });
    }
    
    // Check minimum order amount
    if (order_total && order_total < promo.min_order_amount) {
      return res.json({ 
        success: true, 
        valid: false,
        message: `Минимальная сумма заказа для этого промокода: ${promo.min_order_amount}₽`
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === 'percent') {
      discountAmount = (order_total * promo.discount_value) / 100;
    } else {
      discountAmount = promo.discount_value;
    }
    
    res.json({ 
      success: true, 
      valid: true,
      data: {
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        min_order_amount: promo.min_order_amount
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ success: false, error: 'Failed to validate promo code' });
  }
});

// GET /api/promo/active - Get active promo codes
router.get('/active', (req, res) => {
  try {
    const db = getDb();
    
    const promos = db.prepare(`
      SELECT code, description, discount_type, discount_value, min_order_amount,
             CASE 
               WHEN valid_until IS NOT NULL THEN valid_until
               ELSE '9999-12-31'
             END as valid_until
      FROM promo_codes
      WHERE is_active = 1
      AND (valid_from IS NULL OR valid_from <= datetime('now'))
      AND (valid_until IS NULL OR valid_until >= datetime('now'))
      AND (max_uses IS NULL OR current_uses < max_uses)
      ORDER BY discount_value DESC
    `).all();
    
    db.close();
    res.json({ success: true, data: promos });
  } catch (error) {
    console.error('Error fetching active promos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active promos' });
  }
});

module.exports = router;
