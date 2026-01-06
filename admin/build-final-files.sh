#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# ROUTES
cat > src/routes.tsx << 'EOFILE'
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Orders from './pages/Orders';
import StoreSettings from './pages/StoreSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:id', element: <CustomerDetails /> },
      { path: 'catalog/products', element: <Products /> },
      { path: 'orders/online', element: <Orders /> },
      { path: 'store/settings', element: <StoreSettings /> },
    ],
  },
]);
EOFILE

# APP
cat > src/App.tsx << 'EOFILE'
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { theme } from './theme/theme';
import { store } from './store';
import { router } from './routes';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
EOFILE

# MAIN
cat > src/main.tsx << 'EOFILE'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOFILE

# VITE ENV
cat > src/vite-env.d.ts << 'EOFILE'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOFILE

echo "✅ Routes, App, and Main files created"
echo ""
echo "🎉 COMPLETE ADMIN PANEL GENERATED!"
echo ""
echo "📦 All files created successfully:"
echo "  - Types and Theme"
echo "  - Services (API, Customer, Product, Order)"
echo "  - Redux Store"
echo "  - Layout Components (Sidebar, TopBar, Layout)"
echo "  - All Pages (Dashboard, Customers, Products, Orders, Settings)"
echo "  - Routes and App configuration"
echo ""
echo "🚀 To run:"
echo "  cd /mnt/user-data/outputs/youthqit-admin"
echo "  npm install"
echo "  cp .env.example .env"
echo "  npm run dev"
echo ""
echo "✅ Admin panel will be fully functional with dark blue sidebar!"
