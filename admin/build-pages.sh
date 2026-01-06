#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# DASHBOARD
cat > src/pages/Dashboard.tsx << 'EOFILE'
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Paper } from '@mui/material';
import { TrendingUp, ShoppingCart, TrendingDown, ShoppingBag, ContentCopy, WhatsApp, Facebook, Twitter } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Sales', value: '₹136211', icon: <TrendingUp />, color: '#3B82F6', bgColor: '#EFF6FF' },
    { label: 'Orders', value: '19', icon: <ShoppingCart />, color: '#F59E0B', bgColor: '#FEF3C7' },
    { label: 'Low Stocks', value: '0', icon: <TrendingDown />, color: '#8B5CF6', bgColor: '#F3E8FF' },
    { label: 'Abandoned Carts', value: '383', icon: <ShoppingBag />, color: '#EF4444', bgColor: '#FEE2E2' },
  ];

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>🎁 Refer & Earn</Typography>
            <Typography variant="body2">Refer your friends and earn 1 month extension on your current plan!</Typography>
          </Box>
          <Button variant="contained" sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1E40AF' } }}>Refer Now</Button>
        </Box>
      </Paper>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </Box>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, backgroundColor: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>🏪 Your Store Link</Typography>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>https://www.youthqit.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<ContentCopy />}>COPY</Button>
              <Button variant="text" sx={{ minWidth: 40 }}><WhatsApp /></Button>
              <Button variant="text" sx={{ minWidth: 40 }}><Facebook /></Button>
              <Button variant="text" sx={{ minWidth: 40 }}><Twitter /></Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Store Insights - Last Week</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>ToDos</Typography>
              <Box sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 2, cursor: 'pointer' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>⭕ Add coupon and grow sales</Typography>
                <Typography variant="caption" color="text.secondary">Create a new coupon and share with your customers and grow the sales</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
EOFILE

# CUSTOMERS
cat > src/pages/Customers.tsx << 'EOFILE'
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
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'RETAILER' ? 'primary' : 'default'} />
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
          <Button size="small" onClick={() => navigate(`/customers/${params.row._id}`)}>View</Button>
          <Button size="small" startIcon={<WhatsApp />} color="success">Chat</Button>
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
      setCustomers([]);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Customers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/customers/new')}>Add Customer</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ width: 400 }}
        />
      </Box>

      <DataGrid
        rows={customers}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        sx={{ backgroundColor: '#fff', borderRadius: 2 }}
      />
    </Box>
  );
};

export default Customers;
EOFILE

echo "✅ Dashboard and Customers pages created"
