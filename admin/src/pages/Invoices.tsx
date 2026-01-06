import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search, Add, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 130 },
    { field: 'customer', headerName: 'Customer', flex: 1, valueGetter: (params) => params.row.customer?.name || '-' },
    { field: 'orderNumber', headerName: 'Order #', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: (params) => `₹${params.value?.toFixed(2)}` },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const colors: any = { PAID: 'success', PENDING: 'warning', OVERDUE: 'error' };
        return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} />;
      }
    },
    { field: 'date', headerName: 'Date', width: 130, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => navigate(`/invoices/${params.row._id}`)}>View</Button>
          <Button size="small" startIcon={<Download />}>PDF</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Invoices</Typography>
        <Button variant="contained" startIcon={<Add />}>Create Invoice</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search invoices..."
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ width: 400 }}
        />
      </Box>

      <DataGrid
        rows={invoices}
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

export default Invoices;
