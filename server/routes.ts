import { Express, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  users,
  customers,
  products,
  stockMovements,
  challans,
  followUpNotes
} from './data.js';
import {
  User,
  Customer,
  Product,
  StockMovement,
  SalesChallan,
  ChallanItem,
  UserRole,
  FollowUpNote
} from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mini-erp-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    const currentUser = users.find(u => u.id === decoded.id || u.email === decoded.email);
    if (!currentUser) {
      return res.status(401).json({ error: 'Invalid user token or user no longer exists.' });
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Role authorization middleware factory
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: [${allowedRoles.join(', ')}], your role: ${req.user.role}`
      });
    }
    next();
  };
}

export function setupApiRoutes(app: Express) {
  // ----------------------------------------------------
  // 1. AUTHENTICATION ROUTES
  // ----------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Check credentials against test accounts
    const validCredentials: Record<string, { pass: string; role: UserRole }> = {
      'admin@gmail.com': { pass: 'Admin@123', role: 'Admin' },
      'sales@gmail.com': { pass: 'Sales@123', role: 'Sales' },
      'warehouse@gmail.com': { pass: 'Warehouse@123', role: 'Warehouse' },
      'accounts@gmail.com': { pass: 'Accounts@123', role: 'Accounts' }
    };

    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (validCredentials[cleanEmail]) {
      if (validCredentials[cleanEmail].pass !== password) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } else if (user) {
      // Fallback for custom created users
      if (password !== 'Password@123' && password !== 'Admin@123') {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } else {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is deactivated. Please contact administrator.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      user,
      token
    });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    return res.json({ user: req.user });
  });

  // ----------------------------------------------------
  // 2. DASHBOARD ROUTES
  // ----------------------------------------------------
  app.get('/api/dashboard/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const totalCustomers = customers.length + 123; // base 128 including sample list
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
    const pendingChallans = challans.filter(c => c.status === 'Draft').length;
    const lowStockItems = products.filter(p => p.currentStock <= p.minStockAlert).length;
    
    const recentChallansList = [...challans]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const lowStockList = products.filter(p => p.currentStock <= p.minStockAlert);

    const recentFollowUpsList = [...followUpNotes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(note => {
        const cust = customers.find(c => c.id === note.customerId);
        return {
          ...note,
          customerName: cust ? cust.name : 'Unknown Customer',
          businessName: cust ? cust.businessName : 'N/A'
        };
      });

    const monthlyTrends = [
      { month: 'Mar', sales: 340000, challans: 14 },
      { month: 'Apr', sales: 420000, challans: 18 },
      { month: 'May', sales: 390000, challans: 15 },
      { month: 'Jun', sales: 510000, challans: 22 },
      { month: 'Jul', sales: 580000, challans: 26 },
      { month: 'Aug', sales: 736600, challans: challans.length }
    ];

    // Category stock distribution
    const categoryMap: Record<string, { count: number; stock: number }> = {};
    products.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, stock: 0 };
      }
      categoryMap[p.category].count += 1;
      categoryMap[p.category].stock += p.currentStock;
    });

    const categoryStock = Object.keys(categoryMap).map(cat => ({
      category: cat,
      count: categoryMap[cat].count,
      stock: categoryMap[cat].stock
    }));

    return res.json({
      totalCustomers,
      totalProducts,
      totalStock,
      pendingChallans,
      lowStockItems,
      recentChallans: recentChallansList,
      lowStockProducts: lowStockList,
      recentFollowUps: recentFollowUpsList,
      monthlyTrends,
      categoryStock
    });
  });

  // ----------------------------------------------------
  // 3. CUSTOMER CRM ROUTES
  // ----------------------------------------------------
  app.get('/api/customers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const { search, status, type } = req.query;

    let filtered = [...customers];

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(c => c.status === status);
    }

    if (type && type !== 'All') {
      filtered = filtered.filter(c => c.type === type);
    }

    // Attach recent follow-up history
    const result = filtered.map(c => {
      const history = followUpNotes.filter(f => f.customerId === c.id);
      return {
        ...c,
        followUpHistory: history
      };
    });

    return res.json(result);
  });

  app.get('/api/customers/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const cust = customers.find(c => c.id === req.params.id);
    if (!cust) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    const history = followUpNotes.filter(f => f.customerId === cust.id);
    return res.json({ ...cust, followUpHistory: history });
  });

  app.post(
    '/api/customers',
    authenticateToken,
    requireRole(['Admin', 'Sales']),
    (req: AuthenticatedRequest, res: Response) => {
      const { name, businessName, mobile, email, gstNumber, type, status, address, followUpDate, notes } = req.body;

      if (!name || !businessName || !mobile || !email || !type || !status) {
        return res.status(400).json({ error: 'Name, Business Name, Mobile, Email, Type, and Status are required.' });
      }

      const newCust: Customer = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        businessName: businessName.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : '',
        type,
        status,
        address: address ? address.trim() : '',
        followUpDate: followUpDate || '',
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      customers.unshift(newCust);

      if (notes && notes.trim()) {
        followUpNotes.unshift({
          id: `fn-${Date.now()}`,
          customerId: newCust.id,
          note: notes.trim(),
          createdBy: req.user?.name || 'User',
          createdAt: new Date().toISOString()
        });
      }

      return res.status(201).json(newCust);
    }
  );

  app.put(
    '/api/customers/:id',
    authenticateToken,
    requireRole(['Admin', 'Sales']),
    (req: AuthenticatedRequest, res: Response) => {
      const index = customers.findIndex(c => c.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Customer not found.' });
      }

      const { name, businessName, mobile, email, gstNumber, type, status, address, followUpDate, notes } = req.body;

      const existing = customers[index];
      const updatedCust: Customer = {
        ...existing,
        name: name !== undefined ? name.trim() : existing.name,
        businessName: businessName !== undefined ? businessName.trim() : existing.businessName,
        mobile: mobile !== undefined ? mobile.trim() : existing.mobile,
        email: email !== undefined ? email.trim().toLowerCase() : existing.email,
        gstNumber: gstNumber !== undefined ? gstNumber.trim().toUpperCase() : existing.gstNumber,
        type: type || existing.type,
        status: status || existing.status,
        address: address !== undefined ? address.trim() : existing.address,
        followUpDate: followUpDate !== undefined ? followUpDate : existing.followUpDate,
        notes: notes !== undefined ? notes.trim() : existing.notes,
        updatedAt: new Date().toISOString()
      };

      customers[index] = updatedCust;
      return res.json(updatedCust);
    }
  );

  app.delete(
    '/api/customers/:id',
    authenticateToken,
    requireRole(['Admin']),
    (req: AuthenticatedRequest, res: Response) => {
      const index = customers.findIndex(c => c.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Customer not found.' });
      }
      customers.splice(index, 1);
      return res.json({ message: 'Customer deleted successfully.' });
    }
  );

  app.post(
    '/api/customers/:id/followups',
    authenticateToken,
    requireRole(['Admin', 'Sales']),
    (req: AuthenticatedRequest, res: Response) => {
      const cust = customers.find(c => c.id === req.params.id);
      if (!cust) {
        return res.status(404).json({ error: 'Customer not found.' });
      }

      const { note, followUpDate } = req.body;
      if (!note || !note.trim()) {
        return res.status(400).json({ error: 'Follow-up note text is required.' });
      }

      const newNote: FollowUpNote = {
        id: `fn-${Date.now()}`,
        customerId: cust.id,
        note: note.trim(),
        createdBy: req.user?.name || 'User',
        createdAt: new Date().toISOString()
      };

      followUpNotes.unshift(newNote);

      if (followUpDate) {
        cust.followUpDate = followUpDate;
      }
      cust.notes = note.trim();
      cust.updatedAt = new Date().toISOString();

      return res.status(201).json(newNote);
    }
  );

  // ----------------------------------------------------
  // 4. PRODUCT MODULE ROUTES
  // ----------------------------------------------------
  app.get('/api/products', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const { search, category, lowStockOnly } = req.query;

    let filtered = [...products];

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.warehouseLocation.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (lowStockOnly === 'true') {
      filtered = filtered.filter(p => p.currentStock <= p.minStockAlert);
    }

    return res.json(filtered);
  });

  app.get('/api/products/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const p = products.find(prod => prod.id === req.params.id);
    if (!p) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(p);
  });

  app.post(
    '/api/products',
    authenticateToken,
    requireRole(['Admin', 'Warehouse']),
    (req: AuthenticatedRequest, res: Response) => {
      const { name, sku, category, unitPrice, currentStock, minStockAlert, warehouseLocation } = req.body;

      if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined) {
        return res.status(400).json({ error: 'Product Name, SKU, Category, Price, and Initial Stock are required.' });
      }

      const cleanSku = sku.trim().toUpperCase();
      if (products.some(p => p.sku === cleanSku)) {
        return res.status(400).json({ error: `Product SKU "${cleanSku}" already exists. SKU must be unique.` });
      }

      const price = Number(unitPrice);
      const stock = Number(currentStock);
      const minAlert = minStockAlert !== undefined ? Number(minStockAlert) : 10;

      if (price < 0 || stock < 0 || minAlert < 0) {
        return res.status(400).json({ error: 'Price, Stock, and Min Alert values must be non-negative.' });
      }

      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: name.trim(),
        sku: cleanSku,
        category: category.trim(),
        unitPrice: price,
        currentStock: stock,
        minStockAlert: minAlert,
        warehouseLocation: warehouseLocation ? warehouseLocation.trim() : 'Warehouse 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      products.unshift(newProduct);

      // Log initial stock inward movement if initial stock > 0
      if (stock > 0) {
        stockMovements.unshift({
          id: `sm-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          productSku: newProduct.sku,
          quantityChanged: stock,
          movementType: 'IN',
          reason: 'Initial Product Stock Setup',
          createdBy: req.user?.name || 'User',
          timestamp: new Date().toISOString()
        });
      }

      return res.status(201).json(newProduct);
    }
  );

  app.put(
    '/api/products/:id',
    authenticateToken,
    requireRole(['Admin', 'Warehouse']),
    (req: AuthenticatedRequest, res: Response) => {
      const index = products.findIndex(p => p.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const existing = products[index];
      const { name, sku, category, unitPrice, currentStock, minStockAlert, warehouseLocation } = req.body;

      let cleanSku = existing.sku;
      if (sku) {
        cleanSku = sku.trim().toUpperCase();
        if (cleanSku !== existing.sku && products.some(p => p.sku === cleanSku)) {
          return res.status(400).json({ error: `Product SKU "${cleanSku}" is already taken by another product.` });
        }
      }

      const newPrice = unitPrice !== undefined ? Number(unitPrice) : existing.unitPrice;
      const newMinAlert = minStockAlert !== undefined ? Number(minStockAlert) : existing.minStockAlert;
      const newStock = currentStock !== undefined ? Number(currentStock) : existing.currentStock;

      if (newPrice < 0 || newStock < 0 || newMinAlert < 0) {
        return res.status(400).json({ error: 'Price, Stock, and Min Alert values must be non-negative numbers.' });
      }

      // Check stock adjustment if current stock changed directly
      const stockDiff = newStock - existing.currentStock;
      if (stockDiff !== 0) {
        stockMovements.unshift({
          id: `sm-${Date.now()}`,
          productId: existing.id,
          productName: name || existing.name,
          productSku: cleanSku,
          quantityChanged: Math.abs(stockDiff),
          movementType: stockDiff > 0 ? 'IN' : 'OUT',
          reason: 'Direct Product Stock Manual Edit',
          createdBy: req.user?.name || 'User',
          timestamp: new Date().toISOString()
        });
      }

      const updatedProduct: Product = {
        ...existing,
        name: name ? name.trim() : existing.name,
        sku: cleanSku,
        category: category ? category.trim() : existing.category,
        unitPrice: newPrice,
        currentStock: newStock,
        minStockAlert: newMinAlert,
        warehouseLocation: warehouseLocation ? warehouseLocation.trim() : existing.warehouseLocation,
        updatedAt: new Date().toISOString()
      };

      products[index] = updatedProduct;
      return res.json(updatedProduct);
    }
  );

  // ----------------------------------------------------
  // 5. INVENTORY & STOCK MOVEMENTS ROUTES
  // ----------------------------------------------------
  app.get('/api/inventory/movements', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const { productId, type, search } = req.query;

    let filtered = [...stockMovements];

    if (productId && productId !== 'All') {
      filtered = filtered.filter(m => m.productId === productId);
    }

    if (type && type !== 'All') {
      filtered = filtered.filter(m => m.movementType === type);
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        m =>
          m.productName.toLowerCase().includes(q) ||
          m.productSku.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q) ||
          m.createdBy.toLowerCase().includes(q)
      );
    }

    return res.json(filtered);
  });

  app.post(
    '/api/inventory/movement',
    authenticateToken,
    requireRole(['Admin', 'Warehouse']),
    (req: AuthenticatedRequest, res: Response) => {
      const { productId, quantity, movementType, reason } = req.body;

      if (!productId || !quantity || !movementType || !reason) {
        return res.status(400).json({ error: 'Product, Quantity, Movement Type (IN/OUT), and Reason are required.' });
      }

      const prod = products.find(p => p.id === productId);
      if (!prod) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const qty = Number(quantity);
      if (qty <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer.' });
      }

      if (movementType === 'OUT' && prod.currentStock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested reduction: ${qty}`
        });
      }

      if (movementType === 'IN') {
        prod.currentStock += qty;
      } else {
        prod.currentStock -= qty;
      }
      prod.updatedAt = new Date().toISOString();

      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        quantityChanged: qty,
        movementType,
        reason: reason.trim(),
        createdBy: req.user?.name || 'User',
        timestamp: new Date().toISOString()
      };

      stockMovements.unshift(newMovement);

      return res.status(201).json({
        movement: newMovement,
        updatedProductStock: prod.currentStock
      });
    }
  );

  // ----------------------------------------------------
  // 6. SALES CHALLAN MODULE (CRITICAL BUSINESS LOGIC)
  // ----------------------------------------------------
  app.get('/api/challans', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const { search, status, customerId } = req.query;

    let filtered = [...challans];

    if (status && status !== 'All') {
      filtered = filtered.filter(c => c.status === status);
    }

    if (customerId && customerId !== 'All') {
      filtered = filtered.filter(c => c.customerId === customerId);
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        c =>
          c.challanNumber.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.customerBusiness.toLowerCase().includes(q) ||
          c.createdByName.toLowerCase().includes(q)
      );
    }

    return res.json(filtered);
  });

  app.get('/api/challans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const challan = challans.find(c => c.id === req.params.id);
    if (!challan) {
      return res.status(404).json({ error: 'Sales Challan not found.' });
    }
    return res.json(challan);
  });

  // Create Challan (as Draft or directly Confirmed)
  app.post(
    '/api/challans',
    authenticateToken,
    requireRole(['Admin', 'Sales']),
    (req: AuthenticatedRequest, res: Response) => {
      const { customerId, items, notes, confirmImmediately } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: 'Please select a customer for the sales challan.' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'At least one product item is required for the sales challan.' });
      }

      const cust = customers.find(c => c.id === customerId);
      if (!cust) {
        return res.status(404).json({ error: 'Selected customer not found.' });
      }

      // Build Snapshot items and calculate totals
      const challanItems: ChallanItem[] = [];
      let totalQty = 0;
      let totalAmount = 0;

      for (const item of items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found.` });
        }

        const qty = Number(item.quantity);
        if (qty <= 0) {
          return res.status(400).json({ error: `Quantity for product "${prod.name}" must be greater than 0.` });
        }

        const price = item.unitPrice !== undefined ? Number(item.unitPrice) : prod.unitPrice;
        const itemTotal = price * qty;

        totalQty += qty;
        totalAmount += itemTotal;

        // Store Product Snapshot Data
        challanItems.push({
          id: `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unitPrice: price,
          quantity: qty,
          totalAmount: itemTotal
        });
      }

      // Automatically generated Challan Number
      const nextNum = challans.length + 1001;
      const challanNum = `CHAL-2026-${String(nextNum).padStart(4, '0')}`;

      // CRITICAL STOCK CHECK if confirming immediately
      if (confirmImmediately) {
        for (const ci of challanItems) {
          const prod = products.find(p => p.id === ci.productId)!;
          if (prod.currentStock < ci.quantity) {
            return res.status(400).json({
              error: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${ci.quantity}`
            });
          }
        }
      }

      const newChallan: SalesChallan = {
        id: `ch-${Date.now()}`,
        challanNumber: challanNum,
        customerId: cust.id,
        customerName: cust.name,
        customerBusiness: cust.businessName,
        items: challanItems,
        totalQuantity: totalQty,
        totalAmount,
        status: confirmImmediately ? 'Confirmed' : 'Draft',
        notes: notes ? notes.trim() : '',
        createdBy: req.user?.id || 'u-2',
        createdByName: req.user?.name || 'Sales User',
        createdAt: new Date().toISOString(),
        confirmedAt: confirmImmediately ? new Date().toISOString() : undefined
      };

      // If confirming immediately, reduce stock and record OUT movements
      if (confirmImmediately) {
        for (const ci of challanItems) {
          const prod = products.find(p => p.id === ci.productId)!;
          prod.currentStock -= ci.quantity;
          prod.updatedAt = new Date().toISOString();

          stockMovements.unshift({
            id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            quantityChanged: ci.quantity,
            movementType: 'OUT',
            reason: `Sales Challan Confirmation #${newChallan.challanNumber}`,
            createdBy: req.user?.name || 'Sales User',
            timestamp: new Date().toISOString()
          });
        }
      }

      challans.unshift(newChallan);

      return res.status(201).json({
        message: confirmImmediately
          ? 'Sales Challan created and confirmed successfully! Stock updated.'
          : 'Sales Challan saved as Draft successfully.',
        challan: newChallan
      });
    }
  );

  // Confirm Draft Challan
  app.put(
    '/api/challans/:id/confirm',
    authenticateToken,
    requireRole(['Admin', 'Sales', 'Warehouse']),
    (req: AuthenticatedRequest, res: Response) => {
      const challan = challans.find(c => c.id === req.params.id);
      if (!challan) {
        return res.status(404).json({ error: 'Sales Challan not found.' });
      }

      if (challan.status === 'Confirmed') {
        return res.status(400).json({ error: 'This Sales Challan is already confirmed.' });
      }

      if (challan.status === 'Cancelled') {
        return res.status(400).json({ error: 'Cannot confirm a cancelled Sales Challan.' });
      }

      // CRITICAL BUSINESS LOGIC: STOCK VALIDATION
      for (const item of challan.items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) {
          return res.status(400).json({ error: `Product "${item.productName}" no longer exists in inventory database.` });
        }

        if (prod.currentStock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${item.quantity}`
          });
        }
      }

      // Deduct stock automatically & Create OUT stock movement entries
      for (const item of challan.items) {
        const prod = products.find(p => p.id === item.productId)!;
        prod.currentStock -= item.quantity;
        prod.updatedAt = new Date().toISOString();

        stockMovements.unshift({
          id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          quantityChanged: item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan Confirmation #${challan.challanNumber}`,
          createdBy: req.user?.name || 'User',
          timestamp: new Date().toISOString()
        });
      }

      challan.status = 'Confirmed';
      challan.confirmedAt = new Date().toISOString();

      return res.json({
        message: `Challan ${challan.challanNumber} confirmed and stock updated successfully.`,
        challan
      });
    }
  );

  // Cancel Challan
  app.put(
    '/api/challans/:id/cancel',
    authenticateToken,
    requireRole(['Admin', 'Sales']),
    (req: AuthenticatedRequest, res: Response) => {
      const challan = challans.find(c => c.id === req.params.id);
      if (!challan) {
        return res.status(404).json({ error: 'Sales Challan not found.' });
      }

      if (challan.status === 'Cancelled') {
        return res.status(400).json({ error: 'Challan is already cancelled.' });
      }

      // If it was already confirmed, restore product stock
      if (challan.status === 'Confirmed') {
        for (const item of challan.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.currentStock += item.quantity;
            prod.updatedAt = new Date().toISOString();

            stockMovements.unshift({
              id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              productId: prod.id,
              productName: prod.name,
              productSku: prod.sku,
              quantityChanged: item.quantity,
              movementType: 'IN',
              reason: `Sales Challan Cancellation #${challan.challanNumber} Stock Reversal`,
              createdBy: req.user?.name || 'User',
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      challan.status = 'Cancelled';
      challan.cancelledAt = new Date().toISOString();

      return res.json({
        message: `Challan ${challan.challanNumber} has been cancelled.`,
        challan
      });
    }
  );

  // ----------------------------------------------------
  // 7. USERS MANAGEMENT ROUTES (Admin)
  // ----------------------------------------------------
  app.get('/api/users', authenticateToken, requireRole(['Admin']), (req: AuthenticatedRequest, res: Response) => {
    return res.json(users);
  });

  app.post('/api/users', authenticateToken, requireRole(['Admin']), (req: AuthenticatedRequest, res: Response) => {
    const { name, email, role, status } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, Email, and Role are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: `User with email "${cleanEmail}" already exists.` });
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role,
      status: status || 'Active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    return res.status(201).json(newUser);
  });

  app.put('/api/users/:id', authenticateToken, requireRole(['Admin']), (req: AuthenticatedRequest, res: Response) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, email, role, status } = req.body;
    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;
    if (status) user.status = status;

    return res.json(user);
  });
}
