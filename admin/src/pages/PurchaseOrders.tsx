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
