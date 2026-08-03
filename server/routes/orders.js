// Orders API routes
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

// GET /api/orders - Get all orders (admin only)
router.get('/', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const db = getDb();
    
    let query = `
      SELECT o.*, 
        (SELECT json_group_array(json_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price,
          'subtotal', oi.subtotal
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const orders = db.prepare(query).all(...params);
    
    // Parse JSON items
    orders.forEach(order => {
      order.items = JSON.parse(order.items || '[]');
    });
    
    db.close();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const order = db.prepare(`
      SELECT o.*, 
        (SELECT json_group_array(json_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price,
          'subtotal', oi.subtotal
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.id = ?
    `).get(id);
    
    db.close();
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    order.items = JSON.parse(order.items || '[]');
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_phone, delivery_address, delivery_time, customer_comment, promo_code, items } = req.body;
    
    if (!customer_phone || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Phone number and items are required' });
    }
    
    const db = getDb();
    
    // Calculate totals
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });
    
    // Apply promo code if provided
    let discountAmount = 0;
    let appliedPromoCode = null;
    
    if (promo_code) {
      const promo = db.prepare(`
        SELECT * FROM promo_codes 
        WHERE code = ? AND is_active = 1
        AND (valid_from IS NULL OR valid_from <= datetime('now'))
        AND (valid_until IS NULL OR valid_until >= datetime('now'))
        AND (max_uses IS NULL OR current_uses < max_uses)
      `).get(promo_code.toUpperCase());
      
      if (promo && totalAmount >= promo.min_order_amount) {
        if (promo.discount_type === 'percent') {
          discountAmount = (totalAmount * promo.discount_value) / 100;
        } else {
          discountAmount = promo.discount_value;
        }
        
        // Don't allow discount to exceed total
        if (discountAmount > totalAmount) {
          discountAmount = totalAmount;
        }
        
        appliedPromoCode = promo.code;
        
        // Increment promo usage
        db.prepare('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ?').run(promo.id);
      }
    }
    
    const finalTotal = totalAmount - discountAmount;
    
    // Create order in transaction
    const insertOrder = db.prepare(`
      INSERT INTO orders (customer_name, customer_phone, delivery_address, delivery_time, customer_comment, promo_code, total_amount, discount_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `);
    
    const result = insertOrder.run(customer_name, customer_phone, delivery_address, delivery_time, customer_comment, appliedPromoCode, finalTotal, discountAmount);
    const orderId = result.lastInsertRowid;
    
    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    items.forEach(item => {
      insertItem.run(orderId, item.product_id, item.product_name, item.quantity, item.price, item.price * item.quantity);
    });
    
    // Log analytics event
    db.prepare(`
      INSERT INTO analytics_events (event_type, event_data, order_id)
      VALUES ('order_created', json_object('order_id', ?, 'total', ?, 'items_count', ?), ?)
    `).run(orderId, finalTotal, items.length, orderId);
    
    db.close();
    
    res.status(201).json({ 
      success: true, 
      data: { 
        id: orderId,
        order_number: `ORD-${String(orderId).padStart(6, '0')}`,
        total: finalTotal
      },
      message: 'Заказ успешно создан!'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['new', 'confirmed', 'cooking', 'ready', 'delivering', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    const db = getDb();
    
    const result = db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);
    
    if (result.changes === 0) {
      db.close();
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Log analytics event
    db.prepare(`
      INSERT INTO analytics_events (event_type, event_data, order_id)
      VALUES ('order_status_changed', json_object('order_id', ?, 'new_status', ?), ?)
    `).run(id, status, id);
    
    db.close();
    
    res.json({ success: true, message: 'Статус заказа обновлён' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// PUT /api/orders/:id - Update order details (admin)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_address, delivery_time, customer_comment } = req.body;
    
    const db = getDb();
    
    const result = db.prepare(`
      UPDATE orders 
      SET delivery_address = COALESCE(?, delivery_address),
          delivery_time = COALESCE(?, delivery_time),
          customer_comment = COALESCE(?, customer_comment),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(delivery_address, delivery_time, customer_comment, id);
    
    db.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Данные заказа обновлены' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

module.exports = router;
