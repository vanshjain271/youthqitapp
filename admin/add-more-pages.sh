#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# COUPONS PAGE
cat > src/pages/Coupons.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState([
    { _id: '1', code: 'WELCOME10', discount: 10, type: 'PERCENTAGE', usageCount: 45, maxUsage: 100, status: 'ACTIVE' },
    { _id: '2', code: 'FLAT500', discount: 500, type: 'FIXED', usageCount: 12, maxUsage: 50, status: 'ACTIVE' },
    { _id: '3', code: 'SUMMER20', discount: 20, type: 'PERCENTAGE', usageCount: 89, maxUsage: 100, status: 'EXPIRED' },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Coupons</Typography>
        <Button variant="contained" startIcon={<Add />}>Create Coupon</Button>
      </Box>

      <Grid container spacing={3}>
        {coupons.map((coupon) => (
          <Grid item xs={12} md={6} lg={4} key={coupon._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                      {coupon.code}
                    </Typography>
                    <IconButton size="small"><ContentCopy fontSize="small" /></IconButton>
                  </Box>
                  <Chip 
                    label={coupon.status} 
                    size="small" 
                    color={coupon.status === 'ACTIVE' ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {coupon.type === 'PERCENTAGE' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Used: {coupon.usageCount}/{coupon.maxUsage}
                  </Typography>
                  <Box>
                    <IconButton size="small"><Edit /></IconButton>
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Coupons;
EOFILE

# BANNERS PAGE
cat > src/pages/Banners.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, IconButton, Chip } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

const Banners: React.FC = () => {
  const [banners, setBanners] = useState([
    { _id: '1', title: 'Summer Sale', position: 'HOME_TOP', isActive: true, clickCount: 234 },
    { _id: '2', title: 'New Arrivals', position: 'HOME_MIDDLE', isActive: true, clickCount: 156 },
    { _id: '3', title: 'Clearance Sale', position: 'CATEGORY', isActive: false, clickCount: 89 },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Banners</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Banner</Button>
      </Box>

      <Grid container spacing={3}>
        {banners.map((banner) => (
          <Grid item xs={12} md={6} key={banner._id}>
            <Card>
              <CardMedia
                component="div"
                sx={{ height: 140, backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Typography variant="h6" color="text.secondary">Banner Preview</Typography>
              </CardMedia>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{banner.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{banner.position}</Typography>
                  </Box>
                  <Chip 
                    label={banner.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={banner.isActive ? 'success' : 'default'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {banner.clickCount} clicks
                  </Typography>
                  <Box>
                    <IconButton size="small"><Visibility /></IconButton>
                    <IconButton size="small"><Edit /></IconButton>
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Banners;
EOFILE

# REPORTS PAGE
cat > src/pages/Reports.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Tabs, Tab } from '@mui/material';
import { Download, TrendingUp, ShoppingCart, People, Inventory } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Reports: React.FC = () => {
  const [tab, setTab] = useState(0);

  const salesData = [
    { month: 'Jan', sales: 45000, orders: 120 },
    { month: 'Feb', sales: 52000, orders: 145 },
    { month: 'Mar', sales: 61000, orders: 167 },
    { month: 'Apr', sales: 58000, orders: 153 },
    { month: 'May', sales: 67000, orders: 189 },
    { month: 'Jun', sales: 73000, orders: 201 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Reports & Analytics</Typography>
        <Button variant="contained" startIcon={<Download />}>Export Report</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Revenue', value: '₹3,56,000', icon: <TrendingUp />, color: '#2563EB' },
          { label: 'Total Orders', value: '975', icon: <ShoppingCart />, color: '#F59E0B' },
          { label: 'Total Customers', value: '342', icon: <People />, color: '#10B981' },
          { label: 'Products Sold', value: '1,847', icon: <Inventory />, color: '#8B5CF6' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </Box>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Sales Report" />
        <Tab label="Product Report" />
        <Tab label="Customer Report" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Sales Overview - Last 6 Months</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#2563EB" name="Sales (₹)" />
                <Bar dataKey="orders" fill="#10B981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports;
EOFILE

# PURCHASE ORDERS PAGE
cat > src/pages/PurchaseOrders.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';

const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: 'poNumber', headerName: 'PO #', width: 120 },
    { field: 'supplier', headerName: 'Supplier', flex: 1 },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (params) => params.row.items?.length || 0 },
    { field: 'totalAmount', headerName: 'Amount', width: 120, valueFormatter: (params) => `₹${params.value?.toFixed(2)}` },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        const colors: any = { ORDERED: 'info', RECEIVED: 'success', PARTIAL: 'warning', CANCELLED: 'error' };
        return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} />;
      }
    },
    { field: 'orderDate', headerName: 'Order Date', width: 130 },
    { field: 'expectedDate', headerName: 'Expected', width: 130 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Purchase Orders</Typography>
        <Button variant="contained" startIcon={<Add />}>Create PO</Button>
      </Box>

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

export default PurchaseOrders;
EOFILE

echo "✅ Step 2: Created Coupons, Banners, Reports, Purchase Orders"
