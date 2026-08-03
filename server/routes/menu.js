// Menu API routes
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

// GET /api/menu/categories - Get all categories with subcategories
router.get('/categories', (req, res) => {
  try {
    const db = getDb();
    
    const categories = db.prepare(`
      SELECT c.*, 
        (SELECT json_group_array(json_object(
          'id', s.id,
          'name', s.name,
          'description', s.description,
          'sort_order', s.sort_order
        )) FROM subcategories s WHERE s.category_id = c.id ORDER BY s.sort_order) as subcategories
      FROM categories c
      ORDER BY c.sort_order
    `).all();
    
    // Parse JSON subcategories
    categories.forEach(cat => {
      cat.subcategories = JSON.parse(cat.subcategories || '[]');
    });
    
    db.close();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// GET /api/menu/products - Get all products with optional filters
router.get('/products', (req, res) => {
  try {
    const { category, subcategory, active = 'true' } = req.query;
    const db = getDb();
    
    let query = `
      SELECT p.*, s.name as subcategory_name, c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (active === 'true') {
      query += ' AND p.is_active = 1';
    }
    
    if (subcategory) {
      query += ' AND p.subcategory_id = ?';
      params.push(parseInt(subcategory));
    } else if (category) {
      query += ' AND c.id = ?';
      params.push(parseInt(category));
    }
    
    query += ' ORDER BY p.sort_order, p.name';
    
    const products = db.prepare(query).all(...params);
    db.close();
    
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// GET /api/menu/products/:id - Get single product by ID
router.get('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const product = db.prepare(`
      SELECT p.*, s.name as subcategory_name, c.name as category_name
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.id = ?
    `).get(id);
    
    db.close();
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// GET /api/menu/featured - Get featured/promotional products
router.get('/featured', (req, res) => {
  try {
    const db = getDb();
    
    const products = db.prepare(`
      SELECT p.*, s.name as subcategory_name
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_active = 1 AND p.old_price IS NOT NULL
      ORDER BY p.sort_order
      LIMIT 6
    `).all();
    
    db.close();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured products' });
  }
});

module.exports = router;
