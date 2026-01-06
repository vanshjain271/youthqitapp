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
