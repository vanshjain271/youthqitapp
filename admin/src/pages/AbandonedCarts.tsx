import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { WhatsApp, Email } from '@mui/icons-material';

const AbandonedCarts: React.FC = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: 'customer', headerName: 'Customer', flex: 1, valueGetter: (params) => params.row.customer?.name || 'Guest' },
    { field: 'phone', headerName: 'Phone', width: 130, valueGetter: (params) => params.row.customer?.phone || '-' },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (params) => params.row.items?.length || 0 },
    { field: 'cartValue', headerName: 'Cart Value', width: 120, valueFormatter: (params) => `₹${params.value?.toFixed(2)}` },
    { field: 'abandonedAt', headerName: 'Abandoned', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'CONTACTED' ? 'Contacted' : 'Not Contacted'} 
          size="small" 
          color={params.value === 'CONTACTED' ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<WhatsApp />} color="success">WhatsApp</Button>
          <Button size="small" startIcon={<Email />}>Email</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Abandoned Carts</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Recover lost sales by reaching out to customers who left items in their cart
      </Typography>

      <DataGrid
        rows={carts}
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

export default AbandonedCarts;
