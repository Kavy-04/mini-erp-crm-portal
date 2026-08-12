import {
  User,
  Customer,
  Product,
  StockMovement,
  SalesChallan,
  DashboardStats,
  AuthResponse,
  FollowUpNote
} from '../types';

const TOKEN_KEY = 'mini_erp_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(res.token);
    return res;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return request<{ user: User }>('/api/auth/me');
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats & { recentChallans: SalesChallan[]; lowStockProducts: Product[]; recentFollowUps: any[] }> => {
    return request('/api/dashboard/stats');
  },

  // Customers
  getCustomers: async (search = '', status = 'All', type = 'All'): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status !== 'All') params.append('status', status);
    if (type !== 'All') params.append('type', type);

    return request(`/api/customers?${params.toString()}`);
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    return request(`/api/customers/${id}`);
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    return request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    return request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  },

  deleteCustomer: async (id: string): Promise<{ message: string }> => {
    return request(`/api/customers/${id}`, {
      method: 'DELETE'
    });
  },

  addCustomerFollowUp: async (id: string, note: string, followUpDate?: string): Promise<FollowUpNote> => {
    return request(`/api/customers/${id}/followups`, {
      method: 'POST',
      body: JSON.stringify({ note, followUpDate })
    });
  },

  // Products
  getProducts: async (search = '', category = 'All', lowStockOnly = false): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category !== 'All') params.append('category', category);
    if (lowStockOnly) params.append('lowStockOnly', 'true');

    return request(`/api/products?${params.toString()}`);
  },

  getProductById: async (id: string): Promise<Product> => {
    return request(`/api/products/${id}`);
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    return request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    return request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // Inventory
  getStockMovements: async (search = '', productId = 'All', type = 'All'): Promise<StockMovement[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (productId !== 'All') params.append('productId', productId);
    if (type !== 'All') params.append('type', type);

    return request(`/api/inventory/movements?${params.toString()}`);
  },

  createStockMovement: async (data: { productId: string; quantity: number; movementType: 'IN' | 'OUT'; reason: string }): Promise<{ movement: StockMovement; updatedProductStock: number }> => {
    return request('/api/inventory/movement', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Challans
  getChallans: async (search = '', status = 'All', customerId = 'All'): Promise<SalesChallan[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status !== 'All') params.append('status', status);
    if (customerId !== 'All') params.append('customerId', customerId);

    return request(`/api/challans?${params.toString()}`);
  },

  getChallanById: async (id: string): Promise<SalesChallan> => {
    return request(`/api/challans/${id}`);
  },

  createChallan: async (data: { customerId: string; items: { productId: string; quantity: number; unitPrice?: number }[]; notes?: string; confirmImmediately?: boolean }): Promise<{ message: string; challan: SalesChallan }> => {
    return request('/api/challans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  confirmChallan: async (id: string): Promise<{ message: string; challan: SalesChallan }> => {
    return request(`/api/challans/${id}/confirm`, {
      method: 'PUT'
    });
  },

  cancelChallan: async (id: string): Promise<{ message: string; challan: SalesChallan }> => {
    return request(`/api/challans/${id}/cancel`, {
      method: 'PUT'
    });
  },

  // Users (Admin)
  getUsers: async (): Promise<User[]> => {
    return request('/api/users');
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};
