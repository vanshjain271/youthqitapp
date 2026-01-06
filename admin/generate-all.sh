#!/bin/bash
echo "🚀 Generating Complete YouthQit Admin Panel..."

# Create directories
mkdir -p src/{pages,components/{layout,customers,products,orders,settings,common},services,store/slices,theme,types,utils} public

# ============= PAGES =============
cat > src/pages/Customers.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search, Add, WhatsApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import customerService from '../services/customer.service';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'RETAILER' ? 'primary' : 'default'}
        />
      )
    },
    { field: 'totalOrders', headerName: 'Orders', width: 100 },
    { 
      field: 'totalSpent', 
      headerName: 'Total Spent', 
      width: 130,
      valueFormatter: (params) => `₹${params.value?.toFixed(2) || 0}`
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => navigate(`/customers/${params.row._id}`)}>
            View
          </Button>
          <Button size="small" startIcon={<WhatsApp />} color="success">
            Chat
          </Button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomers(1, 50, search);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Customers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/customers/new')}>
          Add Customer
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />
      </Box>

      <DataGrid
        rows={customers}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Customers;
EOF

cat > src/pages/CustomerDetails.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, MenuItem, Checkbox, FormControlLabel, Breadcrumbs, Link } from '@mui/material';
import { WhatsApp, Edit, Delete } from '@mui/icons-material';
import customerService from '../services/customer.service';

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadCustomer();
    } else {
      setEditing(true);
      setCustomer({ name: '', phone: '', email: '', type: 'CONSUMER', hasGSTNo: false, isAffiliate: false, blockCOD: false });
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await customerService.getCustomerById(id!);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to load customer', error);
    }
  };

  const handleSave = async () => {
    try {
      if (id === 'new') {
        await customerService.createCustomer(customer);
      } else {
        await customerService.updateCustomer(id!, customer);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Failed to save customer', error);
    }
  };

  if (!customer) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="primary" href="/customers" sx={{ cursor: 'pointer' }}>
          Customers
        </Link>
        <Typography color="text.primary">{customer.name || 'New Customer'}</Typography>
        <Typography color="text.primary">{editing ? 'Edit' : 'View'}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {customer.name || 'New Customer'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!editing && (
            <>
              <Button startIcon={<WhatsApp />} variant="outlined" color="success">WhatsApp</Button>
              <Button startIcon={<Edit />} onClick={() => setEditing(true)}>Edit</Button>
              <Button startIcon={<Delete />} color="error">Delete</Button>
            </>
          )}
          {editing && (
            <>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave}>Save</Button>
            </>
          )}
        </Box>
      </Box>

      {!editing && customer._id && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#EF4444' }}>₹{customer.totalSpent?.toFixed(2) || '0.00'}</Typography>
                <Typography variant="body2" color="text.secondary">You Recieve</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{customer.walletBalance || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Wallet Balance</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{customer.totalOrders || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Orders</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>0</Typography>
                <Typography variant="body2" color="text.secondary">Invoices</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={customer.email || ''}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Type"
                value={customer.type}
                onChange={(e) => setCustomer({ ...customer, type: e.target.value })}
                disabled={!editing}
              >
                <MenuItem value="CONSUMER">Consumer</MenuItem>
                <MenuItem value="RETAILER">Retailer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customer.hasGSTNo}
                    onChange={(e) => setCustomer({ ...customer, hasGSTNo: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Customer has GST No. (Optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customer.isAffiliate}
                    onChange={(e) => setCustomer({ ...customer, isAffiliate: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Affiliate Customer (Optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customer.blockCOD}
                    onChange={(e) => setCustomer({ ...customer, blockCOD: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Block Cash on Delivery for this Customer"
              />
            </Grid>
          </Grid>

          {customer.billingAddress && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Billing Address</Typography>
              <Typography variant="body2">{customer.billingAddress.name}</Typography>
              <Typography variant="body2">{customer.billingAddress.phone}</Typography>
              <Typography variant="body2">{customer.billingAddress.addressLine1}</Typography>
              {customer.billingAddress.addressLine2 && (
                <Typography variant="body2">{customer.billingAddress.addressLine2}</Typography>
              )}
              <Typography variant="body2">
                {customer.billingAddress.city}, {customer.billingAddress.state} - {customer.billingAddress.pincode}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDetails;
EOF

cat > src/pages/Products.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import productService from '../services/product.service';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      valueGetter: (params) => params.row.category?.name || '-'
    },
    { 
      field: 'salePrice', 
      headerName: 'Price', 
      width: 120,
      valueFormatter: (params) => `₹${params.value}`
    },
    { field: 'stock', headerName: 'Stock', width: 100 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/catalog/products/${params.row._id}`)}>
          Edit
        </Button>
      ),
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(1, 50);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products', error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Products</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Product</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search products..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[25, 50, 100]}
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Products;
EOF

cat > src/pages/Orders.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import { OrderStatus } from '../types/api.types';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Order #', width: 120 },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      flex: 1,
      valueGetter: (params) => params.row.customer?.name || '-'
    },
    { 
      field: 'totalAmount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params) => `₹${params.value?.toFixed(2)}`
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        const colors: any = {
          PENDING: 'warning',
          CONFIRMED: 'info',
          SHIPPED: 'primary',
          DELIVERED: 'success',
          CANCELLED: 'error',
        };
        return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} />;
      }
    },
    { field: 'paymentMode', headerName: 'Payment', width: 100 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/orders/${params.row._id}`)}>
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    loadOrders();
  }, [status]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filterStatus = status === 'ALL' ? undefined : (status as OrderStatus);
      const response = await orderService.getOrders(1, 50, filterStatus);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Orders</Typography>

      <Tabs value={status} onChange={(_, v) => setStatus(v)} sx={{ mb: 3 }}>
        <Tab label="All" value="ALL" />
        <Tab label="Pending" value="PENDING" />
        <Tab label="Confirmed" value="CONFIRMED" />
        <Tab label="Shipped" value="SHIPPED" />
        <Tab label="Delivered" value="DELIVERED" />
        <Tab label="Cancelled" value="CANCELLED" />
      </Tabs>

      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[25, 50, 100]}
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Orders;
EOF

cat > src/pages/StoreSettings.tsx << 'EOF'
import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Paper } from '@mui/material';
import { 
  Storefront, Language, Inventory, ShoppingCart, LocalShipping, 
  Payment, Receipt, Replay, Label, Search, Notifications, Login, Redo, SmartToy, Description
} from '@mui/icons-material';
import CheckoutSettings from './CheckoutSettings';
import PaymentSettings from './PaymentSettings';

const StoreSettings: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('checkout');

  const sections = [
    { id: 'store', label: 'Store Details', icon: <Storefront /> },
    { id: 'domain', label: 'Store Domain', icon: <Language /> },
    { id: 'products', label: 'Products Settings', icon: <Inventory /> },
    { id: 'checkout', label: 'Checkout Settings', icon: <ShoppingCart /> },
    { id: 'delivery', label: 'Delivery Settings', icon: <LocalShipping /> },
    { id: 'payment', label: 'Payment Settings', icon: <Payment /> },
    { id: 'order', label: 'Order Settings', icon: <Receipt /> },
    { id: 'return', label: 'Return Order Settings', icon: <Replay /> },
    { id: 'label', label: 'Label Settings', icon: <Label /> },
    { id: 'seo', label: 'SEO Settings', icon: <Search /> },
    { id: 'notifications', label: 'Notifications Settings', icon: <Notifications /> },
    { id: 'login', label: 'Login Settings', icon: <Login /> },
    { id: 'redirects', label: 'URL Redirects', icon: <Redo /> },
    { id: 'robots', label: 'Robots TXT', icon: <SmartToy /> },
    { id: 'policies', label: 'Policies', icon: <Description /> },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case 'checkout':
        return <CheckoutSettings />;
      case 'payment':
        return <PaymentSettings />;
      default:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {sections.find(s => s.id === selectedSection)?.label}
              </Typography>
              <Typography color="text.secondary">
                Settings for this section will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Store Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              {sections.map((section) => (
                <ListItem key={section.id} disablePadding>
                  <ListItemButton 
                    selected={selectedSection === section.id}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {renderContent()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreSettings;
EOF

cat > src/pages/CheckoutSettings.tsx << 'EOF'
import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Switch, FormControlLabel, MenuItem, Box, Button } from '@mui/material';

const CheckoutSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    roundingMode: 'No Rounding',
    showTaxInfo: true,
    minOrderAmount: 3000,
    cartNote: '',
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Checkout</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            fullWidth
            label="Cart Total Amount - Rounding Mode"
            value={settings.roundingMode}
            onChange={(e) => setSettings({ ...settings, roundingMode: e.target.value })}
            helperText="Choose how you want to round Cart Total"
          >
            <MenuItem value="No Rounding">No Rounding</MenuItem>
            <MenuItem value="Round Up">Round Up</MenuItem>
            <MenuItem value="Round Down">Round Down</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch 
                checked={settings.showTaxInfo}
                onChange={(e) => setSettings({ ...settings, showTaxInfo: e.target.checked })}
              />
            }
            label="Show Tax Information"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -2 }}>
            Display tax details during checkout
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Minimum Order Amount"
            value={settings.minOrderAmount}
            onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
            helperText="Only accept delivery orders above this minimum amount"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
          />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Cart Note</Typography>
            <Box sx={{ border: '1px solid #E5E5EA', borderRadius: 1, p: 1, minHeight: 100 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter cart note..."
                value={settings.cartNote}
                onChange={(e) => setSettings({ ...settings, cartNote: e.target.value })}
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            </Box>
            <Button size="small" sx={{ mt: 1 }}>Expand and Edit Field</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined">Cancel</Button>
            <Button variant="contained">Save Changes</Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CheckoutSettings;
EOF

cat > src/pages/PaymentSettings.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const PaymentSettings: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Payment Settings</Typography>
        <Box>
          <Typography color="text.secondary">
            Configure payment gateway settings (Razorpay, COD, etc.)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentSettings;
EOF

echo "✅ All pages created"

# ============= ROUTING & APP =============
cat > src/routes.tsx << 'EOF'
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
EOF

cat > src/App.tsx << 'EOF'
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
EOF

cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOF

echo "✅ App setup complete!"
echo ""
echo "🎉 YouthQit Admin Panel Generated Successfully!"
echo ""
echo "📦 Next steps:"
echo "1. npm install"
echo "2. cp .env.example .env (and update API URL)"
echo "3. npm run dev"
echo ""
echo "🚀 Admin panel will run on http://localhost:3001"

