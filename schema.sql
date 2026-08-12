-- ====================================================
-- MINI ERP + CRM OPERATIONS PORTAL
-- MySQL Database Schema Definition
-- ====================================================

CREATE DATABASE IF NOT EXISTS mini_erp_crm;
USE mini_erp_crm;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Sales', 'Warehouse', 'Accounts') NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  business_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  gst_number VARCHAR(30) DEFAULT NULL,
  type ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL,
  status ENUM('Lead', 'Active', 'Inactive') DEFAULT 'Active',
  address TEXT DEFAULT NULL,
  follow_up_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. CUSTOMER FOLLOW-UP NOTES
CREATE TABLE IF NOT EXISTS customer_followups (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  note TEXT NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_alert INT NOT NULL DEFAULT 10 CHECK (min_stock_alert >= 0),
  warehouse_location VARCHAR(100) DEFAULT 'Warehouse 1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. STOCK MOVEMENTS LOG TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  product_sku VARCHAR(50) NOT NULL,
  quantity_changed INT NOT NULL CHECK (quantity_changed > 0),
  movement_type ENUM('IN', 'OUT') NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. SALES CHALLANS TABLE
CREATE TABLE IF NOT EXISTS challans (
  id VARCHAR(50) PRIMARY KEY,
  challan_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_business VARCHAR(150) NOT NULL,
  total_quantity INT NOT NULL CHECK (total_quantity > 0),
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  status ENUM('Draft', 'Confirmed', 'Cancelled') DEFAULT 'Draft',
  notes TEXT DEFAULT NULL,
  created_by VARCHAR(50) NOT NULL,
  created_by_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL DEFAULT NULL,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 7. CHALLAN ITEMS TABLE (PRODUCT SNAPSHOT DATA)
CREATE TABLE IF NOT EXISTS challan_items (
  id VARCHAR(50) PRIMARY KEY,
  challan_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL, -- Product Snapshot
  sku VARCHAR(50) NOT NULL,          -- Product Snapshot
  unit_price DECIMAL(10,2) NOT NULL, -- Price Snapshot
  quantity INT NOT NULL CHECK (quantity > 0),
  total_amount DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (challan_id) REFERENCES challans(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(current_stock, min_stock_alert);
CREATE INDEX idx_customers_status ON customers(status, type);
CREATE INDEX idx_challans_number ON challans(challan_number);
CREATE INDEX idx_challans_status ON challans(status);
CREATE INDEX idx_movements_prod ON stock_movements(product_id, movement_type);

-- SAMPLE INITIAL SEED DATA
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('u-1', 'Admin User', 'admin@gmail.com', 'Admin@123', 'Admin', 'Active'),
('u-2', 'Sales Manager', 'sales@gmail.com', 'Sales@123', 'Sales', 'Active'),
('u-3', 'Warehouse Supervisor', 'warehouse@gmail.com', 'Warehouse@123', 'Warehouse', 'Active'),
('u-4', 'Accounts Officer', 'accounts@gmail.com', 'Accounts@123', 'Accounts', 'Active');

INSERT INTO customers (id, name, business_name, mobile, email, gst_number, type, status, address, follow_up_date, notes) VALUES
('c-101', 'Rajesh Sharma', 'ABC Distributors', '+91 98765 43210', 'contact@abcdistributors.com', '27AABCU9603R1ZM', 'Distributor', 'Active', 'Plot 42, Industrial Zone 2, Mumbai, MH', '2026-08-15', 'Key distributor in Western region.'),
('c-102', 'Anita Patel', 'Shree Retail Mart', '+91 98123 45678', 'anita@shreeretail.in', '24AAPCS1234F1ZP', 'Retail', 'Active', 'Shop 14, City Mall, Ahmedabad, GJ', '2026-08-12', 'Weekly stock delivery schedule.'),
('c-103', 'Suresh Patel', 'Patel Wholesale', '+91 99887 76655', 'orders@patelwholesale.co.in', '24AABCP5678H1ZQ', 'Wholesale', 'Active', 'Grain Market Complex, Surat, GJ', '2026-08-18', 'High volume buyer.'),
('c-104', 'Vikram Mehta', 'Global Traders', '+91 97654 32109', 'vmehta@globaltraders.org', '27AABCG9101J1ZR', 'Distributor', 'Lead', 'Suite 302, Business Tower, Pune, MH', '2026-08-14', 'New lead from Trade Expo.'),
('c-105', 'Pooja Verma', 'Prime Electronics', '+91 96543 21098', 'pooja@primeelectronics.com', '07AABCP1213K1ZS', 'Retail', 'Active', 'Nehru Place Electronics Hub, New Delhi, DL', '2026-08-20', 'Inquired about LED monitors.');

INSERT INTO products (id, name, sku, category, unit_price, current_stock, min_stock_alert, warehouse_location) VALUES
('p-1', 'Dell Inspiron Laptop 15', 'LAP-DELL-15I', 'Computers', 48500.00, 18, 10, 'Rack A1 - Warehouse 1'),
('p-2', 'HP LaserJet Pro Printer', 'PRN-HP-LJPRO', 'Printers', 16200.00, 6, 8, 'Rack B3 - Warehouse 1'),
('p-3', 'Logitech Wireless Ergonomic Mouse', 'ACC-LOG-MOU350', 'Peripherals', 850.00, 340, 50, 'Bin C12 - Warehouse 2'),
('p-4', 'Mechanical RGB Gaming Keyboard', 'ACC-KEY-MECH100', 'Peripherals', 2450.00, 4, 15, 'Bin C15 - Warehouse 2'),
('p-5', '24-inch IPS LED Monitor Full HD', 'MON-IPS-24FHD', 'Monitors', 9800.00, 22, 12, 'Rack A4 - Warehouse 1'),
('p-6', 'Multi-Port 7-in-1 USB-C Hub', 'ACC-HUB-USBC7', 'Accessories', 1450.00, 1250, 100, 'Bin D05 - Warehouse 2'),
('p-7', 'APC 600VA Line Interactive UPS', 'PWR-APC-600VA', 'Power Supply', 3200.00, 5, 10, 'Rack E2 - Warehouse 1'),
('p-8', 'Cat6 Ethernet Cable Roll 305m', 'NW-CAT6-305M', 'Networking', 4200.00, 197, 20, 'Rack F1 - Warehouse 2');
