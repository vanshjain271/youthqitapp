#!/bin/bash

# YouthQit Admin Panel - Complete File Generator
echo "🚀 Generating complete YouthQit Admin Panel..."

# Create all directories
mkdir -p src/{pages,components/{layout,customers,products,orders,settings,common},services,store/slices,theme,types,utils}
mkdir -p public

# ============= CONFIG FILES =============

# vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
});
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YouthQit Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# .env.example
cat > .env.example << 'EOF'
VITE_API_BASE_URL=http://localhost:5000/api
EOF

# ============= SERVICES =============

# customer.service.ts
cat > src/services/customer.service.ts << 'EOF'
import apiClient from './api.service';
import { Customer, PaginatedResponse, Address } from '../types/api.types';

class CustomerService {
  async getCustomers(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Customer>> {
    return apiClient.get('/customers', { page, limit, search });
  }

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient.get(\`/customers/\${id}\`);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post('/customers', data);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.patch(\`/customers/\${id}\`, data);
  }

  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete(\`/customers/\${id}\`);
  }
}

export default new CustomerService();
EOF

# product.service.ts
cat > src/services/product.service.ts << 'EOF'
import apiClient from './api.service';
import { Product, PaginatedResponse, Category, Brand } from '../types/api.types';

class ProductService {
  async getProducts(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> {
    return apiClient.get('/products', { page, limit, search });
  }

  async getProductById(id: string): Promise<Product> {
    return apiClient.get(\`/products/\${id}\`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return apiClient.post('/products', data);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient.patch(\`/products/\${id}\`, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return apiClient.delete(\`/products/\${id}\`);
  }

  async getCategories(): Promise<Category[]> {
    return apiClient.get('/categories');
  }

  async getBrands(): Promise<Brand[]> {
    return apiClient.get('/brands');
  }
}

export default new ProductService();
EOF

# order.service.ts
cat > src/services/order.service.ts << 'EOF'
import apiClient from './api.service';
import { Order, PaginatedResponse, OrderStatus } from '../types/api.types';

class OrderService {
  async getOrders(page = 1, limit = 10, status?: OrderStatus): Promise<PaginatedResponse<Order>> {
    return apiClient.get('/orders', { page, limit, status });
  }

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get(\`/orders/\${id}\`);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiClient.patch(\`/orders/\${id}/status\`, { status });
  }

  async cancelOrder(id: string, reason: string): Promise<Order> {
    return apiClient.post(\`/orders/\${id}/cancel\`, { reason });
  }
}

export default new OrderService();
EOF

# ============= STORE =============

# store/index.ts
cat > src/store/index.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

# store/slices/authSlice.ts
cat > src/store/slices/authSlice.ts << 'EOF'
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
EOF

echo "✅ Services and Store created"

# ============= PAGES =============

# Pages will be created in next part due to length
# Continuing...

