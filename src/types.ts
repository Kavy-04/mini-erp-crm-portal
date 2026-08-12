export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  gstNumber?: string;
  type: CustomerType;
  status: CustomerStatus;
  address: string;
  followUpDate?: string;
  notes?: string;
  followUpHistory?: FollowUpNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  timestamp: string;
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerBusiness: string;
  items: ChallanItem[];
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalStock: number;
  pendingChallans: number;
  lowStockItems: number;
  totalSalesVolume: number;
  monthlyTrends: { month: string; sales: number; challans: number }[];
  categoryStock: { category: string; count: number; stock: number }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
