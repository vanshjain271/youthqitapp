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
