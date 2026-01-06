import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Orders from './pages/Orders';
import PurchaseOrders from './pages/PurchaseOrders';
import AbandonedCarts from './pages/AbandonedCarts';
import Coupons from './pages/Coupons';
import Banners from './pages/Banners';
import Reports from './pages/Reports';
import StoreSettings from './pages/StoreSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      
      // Invoices
      { path: 'invoices', element: <Invoices /> },
      
      // Orders
      { path: 'orders/online', element: <Orders /> },
      { path: 'orders/purchase', element: <PurchaseOrders /> },
      { path: 'orders/abandoned', element: <AbandonedCarts /> },
      
      // Catalog
      { path: 'catalog/products', element: <Products /> },
      { path: 'catalog/products/new', element: <ProductForm /> },
      { path: 'catalog/products/:id', element: <ProductForm /> },
      { path: 'catalog/categories', element: <Categories /> },
      { path: 'catalog/brands', element: <Brands /> },
      
      // Customers
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:id', element: <CustomerDetails /> },
      
      // Promotions
      { path: 'promotions/coupons', element: <Coupons /> },
      { path: 'promotions/banners', element: <Banners /> },
      
      // Reports
      { path: 'reports', element: <Reports /> },
      
      // Store Settings
      { path: 'store/settings', element: <StoreSettings /> },
    ],
  },
]);
