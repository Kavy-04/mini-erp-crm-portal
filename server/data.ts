import { User, Customer, Product, StockMovement, SalesChallan, FollowUpNote } from '../src/types.js';

export let users: User[] = [
  {
    id: 'u-1',
    name: 'Admin User',
    email: 'admin@gmail.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'u-2',
    name: 'Sales Manager',
    email: 'sales@gmail.com',
    role: 'Sales',
    status: 'Active',
    createdAt: '2026-01-12T09:30:00.000Z'
  },
  {
    id: 'u-3',
    name: 'Warehouse Supervisor',
    email: 'warehouse@gmail.com',
    role: 'Warehouse',
    status: 'Active',
    createdAt: '2026-01-15T11:00:00.000Z'
  },
  {
    id: 'u-4',
    name: 'Accounts Officer',
    email: 'accounts@gmail.com',
    role: 'Accounts',
    status: 'Active',
    createdAt: '2026-01-18T14:15:00.000Z'
  }
];

export let customers: Customer[] = [
  {
    id: 'c-101',
    name: 'Rajesh Sharma',
    businessName: 'ABC Distributors',
    mobile: '+91 98765 43210',
    email: 'contact@abcdistributors.com',
    gstNumber: '27AABCU9603R1ZM',
    type: 'Distributor',
    status: 'Active',
    address: 'Plot 42, Industrial Zone 2, Mumbai, MH',
    followUpDate: '2026-08-15',
    notes: 'Key distributor in Western region. Negotiating bulk pricing for Q3 laptops.',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z'
  },
  {
    id: 'c-102',
    name: 'Anita Patel',
    businessName: 'Shree Retail Mart',
    mobile: '+91 98123 45678',
    email: 'anita@shreeretail.in',
    gstNumber: '24AAPCS1234F1ZP',
    type: 'Retail',
    status: 'Active',
    address: 'Shop 14, City Mall, Ahmedabad, GJ',
    followUpDate: '2026-08-12',
    notes: 'Requested product catalog update and weekly delivery schedule.',
    createdAt: '2026-02-10T11:30:00.000Z',
    updatedAt: '2026-08-05T09:15:00.000Z'
  },
  {
    id: 'c-103',
    name: 'Suresh Patel',
    businessName: 'Patel Wholesale',
    mobile: '+91 99887 76655',
    email: 'orders@patelwholesale.co.in',
    gstNumber: '24AABCP5678H1ZQ',
    type: 'Wholesale',
    status: 'Active',
    address: 'Grain Market Complex, Surat, GJ',
    followUpDate: '2026-08-18',
    notes: 'High volume wholesale buyer. Prefers Net 30 payment terms.',
    createdAt: '2026-03-01T14:20:00.000Z',
    updatedAt: '2026-08-08T16:00:00.000Z'
  },
  {
    id: 'c-104',
    name: 'Vikram Mehta',
    businessName: 'Global Traders',
    mobile: '+91 97654 32109',
    email: 'vmehta@globaltraders.org',
    gstNumber: '27AABCG9101J1ZR',
    type: 'Distributor',
    status: 'Lead',
    address: 'Suite 302, Business Tower, Pune, MH',
    followUpDate: '2026-08-14',
    notes: 'New lead from Trade Expo. Interested in wireless accessories range.',
    createdAt: '2026-07-20T16:45:00.000Z',
    updatedAt: '2026-08-10T10:30:00.000Z'
  },
  {
    id: 'c-105',
    name: 'Pooja Verma',
    businessName: 'Prime Electronics',
    mobile: '+91 96543 21098',
    email: 'pooja@primeelectronics.com',
    gstNumber: '07AABCP1213K1ZS',
    type: 'Retail',
    status: 'Active',
    address: 'Nehru Place Electronics Hub, New Delhi, DL',
    followUpDate: '2026-08-20',
    notes: 'Inquired about stock availability for 24-inch monitors.',
    createdAt: '2026-04-15T09:10:00.000Z',
    updatedAt: '2026-08-09T11:20:00.000Z'
  }
];

export let followUpNotes: FollowUpNote[] = [
  {
    id: 'fn-1',
    customerId: 'c-101',
    note: 'Discussed volume discount for 50x Dell Inspiron Laptops.',
    createdBy: 'Sales Manager',
    createdAt: '2026-08-01T12:00:00.000Z'
  },
  {
    id: 'fn-2',
    customerId: 'c-102',
    note: 'Sent sample unit of USB-C Hub for testing.',
    createdBy: 'Sales Manager',
    createdAt: '2026-08-05T09:15:00.000Z'
  },
  {
    id: 'fn-3',
    customerId: 'c-104',
    note: 'Initial intro call completed. Sent pricing sheet for approval.',
    createdBy: 'Sales Manager',
    createdAt: '2026-08-10T10:30:00.000Z'
  }
];

export let products: Product[] = [
  {
    id: 'p-1',
    name: 'Dell Inspiron Laptop 15',
    sku: 'LAP-DELL-15I',
    category: 'Computers',
    unitPrice: 48500,
    currentStock: 18,
    minStockAlert: 10,
    warehouseLocation: 'Rack A1 - Warehouse 1',
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'p-2',
    name: 'HP LaserJet Pro Printer',
    sku: 'PRN-HP-LJPRO',
    category: 'Printers',
    unitPrice: 16200,
    currentStock: 6, // Low stock! minStockAlert is 8
    minStockAlert: 8,
    warehouseLocation: 'Rack B3 - Warehouse 1',
    createdAt: '2026-01-08T11:00:00.000Z',
    updatedAt: '2026-08-02T11:00:00.000Z'
  },
  {
    id: 'p-3',
    name: 'Logitech Wireless Ergonomic Mouse',
    sku: 'ACC-LOG-MOU350',
    category: 'Peripherals',
    unitPrice: 850,
    currentStock: 340,
    minStockAlert: 50,
    warehouseLocation: 'Bin C12 - Warehouse 2',
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'p-4',
    name: 'Mechanical RGB Gaming Keyboard',
    sku: 'ACC-KEY-MECH100',
    category: 'Peripherals',
    unitPrice: 2450,
    currentStock: 4, // Low stock! minStockAlert is 15
    minStockAlert: 15,
    warehouseLocation: 'Bin C15 - Warehouse 2',
    createdAt: '2026-01-12T14:00:00.000Z',
    updatedAt: '2026-08-06T14:00:00.000Z'
  },
  {
    id: 'p-5',
    name: '24-inch IPS LED Monitor Full HD',
    sku: 'MON-IPS-24FHD',
    category: 'Monitors',
    unitPrice: 9800,
    currentStock: 22,
    minStockAlert: 12,
    warehouseLocation: 'Rack A4 - Warehouse 1',
    createdAt: '2026-01-15T15:30:00.000Z',
    updatedAt: '2026-08-07T15:30:00.000Z'
  },
  {
    id: 'p-6',
    name: 'Multi-Port 7-in-1 USB-C Hub',
    sku: 'ACC-HUB-USBC7',
    category: 'Accessories',
    unitPrice: 1450,
    currentStock: 1250,
    minStockAlert: 100,
    warehouseLocation: 'Bin D05 - Warehouse 2',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-08-08T09:00:00.000Z'
  },
  {
    id: 'p-7',
    name: 'APC 600VA Line Interactive UPS',
    sku: 'PWR-APC-600VA',
    category: 'Power Supply',
    unitPrice: 3200,
    currentStock: 5, // Low stock! minStockAlert is 10
    minStockAlert: 10,
    warehouseLocation: 'Rack E2 - Warehouse 1',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-08-09T10:00:00.000Z'
  },
  {
    id: 'p-8',
    name: 'Cat6 Ethernet Cable Roll 305m',
    sku: 'NW-CAT6-305M',
    category: 'Networking',
    unitPrice: 4200,
    currentStock: 197,
    minStockAlert: 20,
    warehouseLocation: 'Rack F1 - Warehouse 2',
    createdAt: '2026-02-05T11:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z'
  }
];

export let stockMovements: StockMovement[] = [
  {
    id: 'sm-101',
    productId: 'p-1',
    productName: 'Dell Inspiron Laptop 15',
    productSku: 'LAP-DELL-15I',
    quantityChanged: 25,
    movementType: 'IN',
    reason: 'Initial Vendor Bulk Shipment Inward',
    createdBy: 'Warehouse Supervisor',
    timestamp: '2026-07-15T09:00:00.000Z'
  },
  {
    id: 'sm-102',
    productId: 'p-1',
    productName: 'Dell Inspiron Laptop 15',
    productSku: 'LAP-DELL-15I',
    quantityChanged: 7,
    movementType: 'OUT',
    reason: 'Sales Challan Confirmation #CHAL-2026-0001',
    createdBy: 'Sales Manager',
    timestamp: '2026-08-02T11:30:00.000Z'
  },
  {
    id: 'sm-103',
    productId: 'p-3',
    productName: 'Logitech Wireless Ergonomic Mouse',
    productSku: 'ACC-LOG-MOU350',
    quantityChanged: 500,
    movementType: 'IN',
    reason: 'Direct Factory Restock',
    createdBy: 'Warehouse Supervisor',
    timestamp: '2026-08-04T14:10:00.000Z'
  },
  {
    id: 'sm-104',
    productId: 'p-3',
    productName: 'Logitech Wireless Ergonomic Mouse',
    productSku: 'ACC-LOG-MOU350',
    quantityChanged: 160,
    movementType: 'OUT',
    reason: 'Sales Challan Confirmation #CHAL-2026-0001',
    createdBy: 'Sales Manager',
    timestamp: '2026-08-05T16:20:00.000Z'
  },
  {
    id: 'sm-105',
    productId: 'p-4',
    productName: 'Mechanical RGB Gaming Keyboard',
    productSku: 'ACC-KEY-MECH100',
    quantityChanged: 20,
    movementType: 'OUT',
    reason: 'Sales Challan Confirmation #CHAL-2026-0002',
    createdBy: 'Warehouse Supervisor',
    timestamp: '2026-08-06T10:00:00.000Z'
  }
];

export let challans: SalesChallan[] = [
  {
    id: 'ch-1',
    challanNumber: 'CHAL-2026-0001',
    customerId: 'c-101',
    customerName: 'Rajesh Sharma',
    customerBusiness: 'ABC Distributors',
    items: [
      {
        id: 'ci-1',
        productId: 'p-1',
        productName: 'Dell Inspiron Laptop 15',
        sku: 'LAP-DELL-15I',
        unitPrice: 48500,
        quantity: 7,
        totalAmount: 339500
      },
      {
        id: 'ci-2',
        productId: 'p-3',
        productName: 'Logitech Wireless Ergonomic Mouse',
        sku: 'ACC-LOG-MOU350',
        unitPrice: 850,
        quantity: 160,
        totalAmount: 136000
      }
    ],
    totalQuantity: 167,
    totalAmount: 475500,
    status: 'Confirmed',
    notes: 'First dispatch batch under Q3 agreement.',
    createdBy: 'u-2',
    createdByName: 'Sales Manager',
    createdAt: '2026-08-02T10:00:00.000Z',
    confirmedAt: '2026-08-02T11:30:00.000Z'
  },
  {
    id: 'ch-2',
    challanNumber: 'CHAL-2026-0002',
    customerId: 'c-103',
    customerName: 'Suresh Patel',
    customerBusiness: 'Patel Wholesale',
    items: [
      {
        id: 'ci-3',
        productId: 'p-4',
        productName: 'Mechanical RGB Gaming Keyboard',
        sku: 'ACC-KEY-MECH100',
        unitPrice: 2450,
        quantity: 20,
        totalAmount: 49000
      },
      {
        id: 'ci-4',
        productId: 'p-6',
        productName: 'Multi-Port 7-in-1 USB-C Hub',
        sku: 'ACC-HUB-USBC7',
        unitPrice: 1450,
        quantity: 50,
        totalAmount: 72500
      }
    ],
    totalQuantity: 70,
    totalAmount: 121500,
    status: 'Confirmed',
    notes: 'Dispatched via Express Cargo.',
    createdBy: 'u-2',
    createdByName: 'Sales Manager',
    createdAt: '2026-08-06T09:15:00.000Z',
    confirmedAt: '2026-08-06T10:00:00.000Z'
  },
  {
    id: 'ch-3',
    challanNumber: 'CHAL-2026-0003',
    customerId: 'c-102',
    customerName: 'Anita Patel',
    customerBusiness: 'Shree Retail Mart',
    items: [
      {
        id: 'ci-5',
        productId: 'p-2',
        productName: 'HP LaserJet Pro Printer',
        sku: 'PRN-HP-LJPRO',
        unitPrice: 16200,
        quantity: 3,
        totalAmount: 48600
      },
      {
        id: 'ci-6',
        productId: 'p-5',
        productName: '24-inch IPS LED Monitor Full HD',
        sku: 'MON-IPS-24FHD',
        unitPrice: 9800,
        quantity: 5,
        totalAmount: 49000
      }
    ],
    totalQuantity: 8,
    totalAmount: 97600,
    status: 'Draft',
    notes: 'Awaiting customer PO signoff before confirmation.',
    createdBy: 'u-2',
    createdByName: 'Sales Manager',
    createdAt: '2026-08-10T14:20:00.000Z'
  },
  {
    id: 'ch-4',
    challanNumber: 'CHAL-2026-0004',
    customerId: 'c-105',
    customerName: 'Pooja Verma',
    customerBusiness: 'Prime Electronics',
    items: [
      {
        id: 'ci-7',
        productId: 'p-8',
        productName: 'Cat6 Ethernet Cable Roll 305m',
        sku: 'NW-CAT6-305M',
        unitPrice: 4200,
        quantity: 10,
        totalAmount: 42000
      }
    ],
    totalQuantity: 10,
    totalAmount: 42000,
    status: 'Draft',
    notes: 'Draft quote for Delhi retail outlet expansion.',
    createdBy: 'u-2',
    createdByName: 'Sales Manager',
    createdAt: '2026-08-11T11:00:00.000Z'
  }
];
