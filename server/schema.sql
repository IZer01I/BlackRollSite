-- Sushi Delivery Database Schema
-- SQLite

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subcategory_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    old_price REAL,
    image_url TEXT,
    weight INTEGER,
    ingredients TEXT,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    status TEXT DEFAULT 'new',
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    promo_code TEXT,
    delivery_address TEXT,
    delivery_time DATETIME,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    customer_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK(discount_type IN ('percent', 'fixed')) NOT NULL,
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from DATETIME,
    valid_until DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'manager', 'courier')) NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    customer_id INTEGER,
    order_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);

-- Insert default admin user (password: admin123)
-- Password hash is generated using bcrypt
INSERT OR IGNORE INTO employees (username, password_hash, role) 
VALUES ('admin', '$2a$10$rQZ9vXJXL5K5Z5Z5Z5Z5ZeYhQGYhQGYhQGYhQGYhQGYhQGYhQGYhQ', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description, sort_order) VALUES
('Роллы', 'Классические и авторские роллы', 1),
('Суши', 'Традиционные японские суши', 2),
('Сеты', 'Выгодные наборы для компании', 3),
('Закуски', 'Дополнения к основному заказу', 4),
('Напитки', 'Освежающие напитки', 5);

-- Insert sample subcategories
INSERT INTO subcategories (category_id, name, description, sort_order) VALUES
(1, 'Классические роллы', 'Традиционные рецепты', 1),
(1, 'Запечённые роллы', 'Горячие роллы с шапочкой', 2),
(1, 'Премиум роллы', 'Авторские рецепты с деликатесами', 3),
(2, 'Нигири', 'Классические nigiri sushi', 1),
(2, 'Гунканы', 'Sushi в обёртке из нори', 2),
(3, 'Для двоих', 'Наборы на 2 персоны', 1),
(3, 'Для компании', 'Наборы на 3-5 персон', 2),
(4, 'Супы', 'Тёплые мисо супы', 1),
(4, 'Салаты', 'Свежие салаты', 2),
(5, 'Газированные', 'Прохлаждающие напитки', 1),
(5, 'Горячие', 'Тёплые напитки', 2);

-- Insert sample products
INSERT INTO products (subcategory_id, name, description, price, old_price, weight, ingredients, is_active, sort_order) VALUES
(1, 'Филадельфия', 'Нежный лосось, сливочный сыр, огурец, рис', 590, 690, 280, 'лосось, сливочный сыр, огурец, рис, нори', 1, 1),
(1, 'Калифорния', 'Краб, авокадо, огурец, икра масаго', 450, null, 240, 'снежный краб, авокадо, огурец, икра масаго, рис', 1, 2),
(1, 'Каппа маки', 'Классический ролл с огурцом', 250, null, 150, 'огурец, рис, нори', 1, 3),
(2, 'Запечённый с лососем', 'Лосось, сырная шапочка, рис', 520, null, 260, 'лосось, сырный соус, рис, нори', 1, 1),
(2, 'Запечённый с крабом', 'Краб, сырная шапочка, рис', 480, null, 250, 'снежный краб, сырный соус, рис, нори', 1, 2),
(3, 'Дракон', 'Угорь, лосось, унаги соус, кунжут', 790, 890, 320, 'угорь, лосось, сливочный сыр, унаги соус, кунжут', 1, 1),
(3, 'Царский', 'Икра, лосось, угорь, премиум ингредиенты', 990, null, 350, 'икра, лосось, угорь, сливочный сыр, авокадо', 1, 2),
(4, 'Нигири с лососем', 'Свежий лосось на рисе', 180, null, 50, 'лосось, рис', 1, 1),
(4, 'Нигири с угрем', 'Копчёный угорь на рисе', 220, null, 55, 'угорь, рис, унаги соус', 1, 2),
(5, 'Гункан с икрой', 'Икра лосося в нори', 200, null, 60, 'икра лосося, рис, нори', 1, 1),
(6, 'Сет "Романтика"', 'Филадельфия, Калифорния, нигири', 1200, 1500, 600, 'набор роллов для двоих', 1, 1),
(6, 'Сет "Вечеринка"', 'Большой набор для компании', 2500, 3000, 1200, 'ассорти роллов и суши', 1, 2),
(7, 'Мисо суп', 'Традиционный японский суп', 250, null, 300, 'мисо паста, тофу, водоросли вакаме', 1, 1),
(7, 'Салат Чука', 'Водоросли чука, кунжут', 280, null, 200, 'водоросли чука, кунжут, соус', 1, 2),
(8, 'Coca-Cola', 'Газированный напиток 0.5л', 120, null, 500, '', 1, 1),
(8, 'Зелёный чай', 'Традиционный японский чай', 150, null, 300, '', 1, 2);

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Скидка 10% на первый заказ', 'percent', 10, 1000, null, datetime('now'), datetime('now', '+30 days'), 1),
('SUMMER200', 'Скидка 200₽ от 1500₽', 'fixed', 200, 1500, 100, datetime('now'), datetime('now', '+60 days'), 1),
('FREEROLL', 'Бесплатный ролл при заказе от 2000₽', 'fixed', 0, 2000, 50, datetime('now'), datetime('now', '+14 days'), 1);

-- Insert sample analytics events
INSERT INTO analytics_events (event_type, event_data) VALUES
('site_launch', '{"message": "Site launched successfully"}');
