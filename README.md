# Mini ERP + CRM Operations Portal

A full-stack Operations Portal designed for wholesale and distribution companies. Internal employees across **Admin**, **Sales**, **Warehouse**, and **Accounts** teams manage customers, products catalog, stock inventory levels, and sales dispatch challans with automated stock deduction logic.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full access across all modules, including user management and system settings.
   - **Sales**: Manage Customer CRM, log follow-up notes, create/confirm Sales Challans, view product specs.
   - **Warehouse**: Manage Products Catalog, log Stock Movements (IN/OUT), view/confirm Sales Challans.
   - **Accounts**: View-only access to Customers CRM, Sales Challans, and Financial Metrics.

2. **Customer CRM Module**:
   - Filter by status (`Active`, `Lead`, `Inactive`) and type (`Wholesale`, `Retail`, `Distributor`).
   - Track follow-up dates and log call/meeting activity notes.
   - Store GSTIN and contact details.

3. **Product & Inventory Catalog**:
   - Stock alert badges when `Current Stock <= Minimum Stock Alert Quantity`.
   - Track warehouse rack/bin locations.
   - Automated stock movement history logs (`IN` for inwards/restocks, `OUT` for dispatch orders).

4. **Sales Challan Module & Critical Stock Logic**:
   - Auto-generated Challan Numbers (`CHAL-2026-XXXX`).
   - **Product Snapshot Data**: Stores snapshot of Product Name, SKU, Unit Price, and Quantity inside challan line items so historical records remain accurate even if catalog entries change later.
   - **Draft Status**: Stock is **NOT** reduced when saved as Draft.
   - **Confirmation Logic**:
     - Automatically verifies `Requested Quantity <= Available Stock` for every item in the challan.
     - If requested quantity exceeds available stock for **ANY** item, confirmation is rejected with an explicit error: `"Insufficient stock for [Product Name]. Available: X, Requested: Y"`.
     - When confirmed, stock is automatically reduced, `OUT` stock movement logs are created, and status changes to `Confirmed`.
   - **Print / PDF Export**: Print-ready document layout with company letterhead, bill-to, and line-item breakdown.

---

## 🔐 Test Demo Accounts

Use these pre-configured test accounts to demonstrate role-based access control:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `Admin@123` | Full System Access |
| **Sales** | `sales@gmail.com` | `Sales@123` | Customers CRM, Sales Challans, View Products |
| **Warehouse** | `warehouse@gmail.com` | `Warehouse@123` | Products, Stock Movements, View/Confirm Challans |
| **Accounts** | `accounts@gmail.com` | `Accounts@123` | Dashboard Metrics, View Customers, View Challans |

> **Quick Switcher**: The top navigation bar includes a "Demo Role" button group for instant switching between test roles during evaluation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js, TypeScript (`tsx`), JWT Authentication (`jsonwebtoken`)
- **Database**: MySQL / PostgreSQL compatible schema (`schema.sql`) with Node stateful server engine
- **Server Port**: Port `3000` (Unified Express server serving REST APIs under `/api/*` and Vite SPA)

---

## 📂 Project Structure

```
├── server.ts                 # Express entry point (Port 3000)
├── server/
│   ├── data.ts               # Pre-loaded realistic seed dataset
│   └── routes.ts             # REST API routes, JWT auth & stock validation logic
├── src/
│   ├── App.tsx               # Main app layout, router & protected routes
│   ├── types.ts              # Global TypeScript interfaces & enums
│   ├── context/
│   │   └── AuthContext.tsx   # React Auth state & role checker
│   ├── services/
│   │   └── api.ts            # Frontend REST API client
│   ├── components/
│   │   ├── common/           # Modal, Toast, Badge, StatCard
│   │   └── layout/           # Navbar, Sidebar
│   └── pages/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── CustomersPage.tsx
│       ├── ProductsPage.tsx
│       ├── InventoryPage.tsx
│       ├── ChallansPage.tsx
│       ├── CreateChallanPage.tsx
│       ├── UsersPage.tsx
│       └── SettingsPage.tsx
├── schema.sql                # MySQL relational schema & DDL
├── .env.example              # Environment variables template
├── package.json              # Scripts & dependencies
└── tsconfig.json
```

---

## 🚀 How to Run Locally

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=mini-erp-secret-key-2026
```

### 3. Start Development Server
```bash
npm run dev
```
The Express backend starts on `http://localhost:3000`, serving both `/api/*` REST endpoints and Vite frontend hot-reloading.

### 4. Production Build & Execution
```bash
npm run build
npm start
```

---

## 📡 REST API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/dashboard/stats` | Return high-level stats, low stock alerts, trends |
| `GET` | `/api/customers` | Search & filter customer records |
| `POST` | `/api/customers` | Add customer account |
| `PUT` | `/api/customers/:id` | Update customer details |
| `DELETE` | `/api/customers/:id` | Delete customer (Admin only) |
| `POST` | `/api/customers/:id/followups` | Log CRM call / follow-up note |
| `GET` | `/api/products` | Get products catalog & low stock alerts |
| `POST` | `/api/products` | Create product record |
| `PUT` | `/api/products/:id` | Update product price, stock, or location |
| `GET` | `/api/inventory/movements` | Audit log of stock movements (IN/OUT) |
| `POST` | `/api/inventory/movement` | Log manual stock adjustment (IN/OUT) |
| `GET` | `/api/challans` | List sales challans with status filter |
| `POST` | `/api/challans` | Create sales challan (Draft or Confirmed) |
| `PUT` | `/api/challans/:id/confirm` | **Confirm Challan**: Check stock, deduct, log movement |
| `PUT` | `/api/challans/:id/cancel` | Cancel sales challan |
| `GET` | `/api/users` | List team accounts (Admin only) |

---

## 🗄️ Database Setup (MySQL)

To connect to a live MySQL instance, execute the provided `schema.sql` file:
```bash
mysql -u root -p < schema.sql
```
The schema establishes relational tables (`users`, `customers`, `customer_followups`, `products`, `stock_movements`, `challans`, `challan_items`) with foreign key constraints, indexes, and stock non-negativity checks.

---

## 📝 Assumptions & Known Limitations

- **Session Expiry**: JWT tokens are configured for a 24-hour expiration window.
- **Stock Audit Reversals**: Cancelling a confirmed sales challan automatically reverses the stock deduction and logs an inward (`IN`) stock movement.
- **Single-Location Primary Scope**: Product warehouse locations are tracked per product line item.
