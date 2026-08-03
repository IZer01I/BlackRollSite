// Database initialization script
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'sushi.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove existing database for fresh start
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

// Create new database and run schema
const db = new Database(dbPath);

console.log('Initializing database...');

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database initialized successfully!');
console.log(`Database location: ${dbPath}`);

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nCreated tables:');
tables.forEach(table => console.log(`  - ${table.name}`));

// Verify sample data
const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
const promoCodes = db.prepare('SELECT COUNT(*) as count FROM promo_codes').get();

console.log('\nSample data:');
console.log(`  - Categories: ${categories.count}`);
console.log(`  - Products: ${products.count}`);
console.log(`  - Promo codes: ${promoCodes.count}`);

db.close();
console.log('\nDatabase initialization complete!');
