#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# CUSTOMER DETAILS
cat > src/pages/CustomerDetails.tsx << 'EOFILE'
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
        <Link underline="hover" color="primary" onClick={() => navigate('/customers')} sx={{ cursor: 'pointer' }}>Customers</Link>
        <Typography color="text.primary">{customer.name || 'New Customer'}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{customer.name || 'New Customer'}</Typography>
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
          {[
            { label: 'You Receive', value: `₹${customer.totalSpent?.toFixed(2) || '0.00'}`, color: '#EF4444' },
            { label: 'Wallet Balance', value: customer.walletBalance || 0 },
            { label: 'Orders', value: customer.totalOrders || 0 },
            { label: 'Invoices', value: 0 },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone Number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={customer.email || ''} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Type" value={customer.type} onChange={(e) => setCustomer({ ...customer, type: e.target.value })} disabled={!editing}>
                <MenuItem value="CONSUMER">Consumer</MenuItem>
                <MenuItem value="RETAILER">Retailer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.hasGSTNo} onChange={(e) => setCustomer({ ...customer, hasGSTNo: e.target.checked })} disabled={!editing} />} label="Customer has GST No. (Optional)" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.isAffiliate} onChange={(e) => setCustomer({ ...customer, isAffiliate: e.target.checked })} disabled={!editing} />} label="Affiliate Customer (Optional)" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.blockCOD} onChange={(e) => setCustomer({ ...customer, blockCOD: e.target.checked })} disabled={!editing} />} label="Block Cash on Delivery for this Customer" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDetails;
EOFILE

# PRODUCTS
cat > src/pages/Products.tsx << 'EOFILE'
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
    { field: 'category', headerName: 'Category', width: 150, valueGetter: (params) => params.row.category?.name || '-' },
    { field: 'salePrice', headerName: 'Price', width: 120, valueFormatter: (params) => `₹${params.value}` },
    { field: 'stock', headerName: 'Stock', width: 100 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <Chip label={params.value ? 'Active' : 'Inactive'} size="small" color={params.value ? 'success' : 'default'} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => <Button size="small" onClick={() => navigate(`/catalog/products/${params.row._id}`)}>Edit</Button>,
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
      setProducts([]);
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
        <TextField placeholder="Search products..." InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} sx={{ width: 400 }} />
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[25, 50, 100]}
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Products;
EOFILE

# ORDERS
cat > src/pages/Orders.tsx << 'EOFILE'
import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Chip, Button } from '@mui/material';
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
    { field: 'customer', headerName: 'Customer', flex: 1, valueGetter: (params) => params.row.customer?.name || '-' },
    { field: 'totalAmount', headerName: 'Amount', width: 120, valueFormatter: (params) => `₹${params.value?.toFixed(2)}` },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        const colors: any = { PENDING: 'warning', CONFIRMED: 'info', SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'error' };
        return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} />;
      }
    },
    { field: 'paymentMode', headerName: 'Payment', width: 100 },
    { field: 'createdAt', headerName: 'Date', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => <Button size="small" onClick={() => navigate(`/orders/${params.row._id}`)}>View</Button> },
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
      setOrders([]);
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
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[25, 50, 100]}
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Orders;
EOFILE

# STORE SETTINGS
cat > src/pages/StoreSettings.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Paper, TextField, MenuItem, Switch, FormControlLabel, Button } from '@mui/material';
import { Storefront, Language, Inventory, ShoppingCart, LocalShipping, Payment } from '@mui/icons-material';

const StoreSettings: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('checkout');
  const [settings, setSettings] = useState({
    roundingMode: 'No Rounding',
    showTaxInfo: true,
    minOrderAmount: 3000,
    cartNote: '',
  });

  const sections = [
    { id: 'store', label: 'Store Details', icon: <Storefront /> },
    { id: 'domain', label: 'Store Domain', icon: <Language /> },
    { id: 'products', label: 'Products Settings', icon: <Inventory /> },
    { id: 'checkout', label: 'Checkout Settings', icon: <ShoppingCart /> },
    { id: 'delivery', label: 'Delivery Settings', icon: <LocalShipping /> },
    { id: 'payment', label: 'Payment Settings', icon: <Payment /> },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Store Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              {sections.map((section) => (
                <ListItem key={section.id} disablePadding>
                  <ListItemButton selected={selectedSection === section.id} onClick={() => setSelectedSection(section.id)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
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

                <Box>
                  <FormControlLabel
                    control={<Switch checked={settings.showTaxInfo} onChange={(e) => setSettings({ ...settings, showTaxInfo: e.target.checked })} />}
                    label="Show Tax Information"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">Display tax details during checkout</Typography>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Order Amount"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
                  helperText="Only accept delivery orders above this minimum amount"
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="outlined">Cancel</Button>
                  <Button variant="contained">Save Changes</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreSettings;
EOFILE

echo "✅ All pages created"
