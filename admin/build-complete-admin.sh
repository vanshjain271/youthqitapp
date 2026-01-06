#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# Clean
rm -rf src
mkdir -p src/{components/{layout,common},pages,services,store/slices,theme,types}

# TYPES
cat > src/types/api.types.ts << 'EOFILE'
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'CONSUMER' | 'RETAILER';
  hasGSTNo: boolean;
  gstNo?: string;
  isAffiliate: boolean;
  blockCOD: boolean;
  billingAddress?: Address;
  shippingAddress?: Address;
  walletBalance: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface Address {
  _id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: Category;
  brand?: Brand;
  images: string[];
  mrp: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Brand {
  _id: string;
  name: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMode: 'PREPAID' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  shippingAddress: Address;
  createdAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
EOFILE

# THEME
cat > src/theme/theme.ts << 'EOFILE'
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
    },
  },
});

export const SIDEBAR_WIDTH = 250;
export const SIDEBAR_BG = '#0B1437';
export const SIDEBAR_HOVER = '#1a2754';
export const SIDEBAR_ACTIVE = '#2563EB';
EOFILE

# SERVICES
cat > src/services/api.service.ts << 'EOFILE'
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export default new ApiClient();
EOFILE

cat > src/services/customer.service.ts << 'EOFILE'
import apiClient from './api.service';
import { Customer, PaginatedResponse } from '../types/api.types';

class CustomerService {
  async getCustomers(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Customer>> {
    return apiClient.get('/customers', { page, limit, search });
  }

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient.get(`/customers/${id}`);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post('/customers', data);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.patch(`/customers/${id}`, data);
  }

  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete(`/customers/${id}`);
  }
}

export default new CustomerService();
EOFILE

cat > src/services/product.service.ts << 'EOFILE'
import apiClient from './api.service';
import { Product, PaginatedResponse } from '../types/api.types';

class ProductService {
  async getProducts(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> {
    return apiClient.get('/products', { page, limit, search });
  }

  async getProductById(id: string): Promise<Product> {
    return apiClient.get(`/products/${id}`);
  }
}

export default new ProductService();
EOFILE

cat > src/services/order.service.ts << 'EOFILE'
import apiClient from './api.service';
import { Order, PaginatedResponse, OrderStatus } from '../types/api.types';

class OrderService {
  async getOrders(page = 1, limit = 10, status?: OrderStatus): Promise<PaginatedResponse<Order>> {
    return apiClient.get('/orders', { page, limit, status });
  }

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`);
  }
}

export default new OrderService();
EOFILE

# STORE
cat > src/store/slices/authSlice.ts << 'EOFILE'
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('admin_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('admin_token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
EOFILE

cat > src/store/index.ts << 'EOFILE'
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOFILE

echo "✅ Types, Theme, Services, Store created"
