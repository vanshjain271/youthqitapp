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
