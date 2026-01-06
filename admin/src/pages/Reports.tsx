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
