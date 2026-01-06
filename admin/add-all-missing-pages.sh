#!/bin/bash
cd /mnt/user-data/outputs/youthqit-admin

# INVOICES PAGE
cat > src/pages/Invoices.tsx << 'EOFILE'
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
EOFILE

# ABANDONED CARTS PAGE
cat > src/pages/AbandonedCarts.tsx << 'EOFILE'
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
EOFILE

# ADD/EDIT PRODUCT PAGE
cat > src/pages/ProductForm.tsx << 'EOFILE'
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, Grid, TextField, Button, 
  MenuItem, Switch, FormControlLabel, IconButton, Chip 
} from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    mrp: 0,
    salePrice: 0,
    stock: 0,
    isActive: true,
    images: [],
    variants: [{ name: '', values: [''], stock: [0], prices: [0] }],
  });

  const handleAddVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, { name: '', values: [''], stock: [0], prices: [0] }],
    });
  };

  const handleAddVariantValue = (variantIndex: number) => {
    const newVariants = [...product.variants];
    newVariants[variantIndex].values.push('');
    newVariants[variantIndex].stock.push(0);
    newVariants[variantIndex].prices.push(0);
    setProduct({ ...product, variants: newVariants });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {id === 'new' ? 'Add New Product' : 'Edit Product'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => navigate('/catalog/products')}>Cancel</Button>
          <Button variant="contained">Save Product</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Product Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth select label="Category" value={product.category}>
                    <MenuItem value="accessories">Accessories</MenuItem>
                    <MenuItem value="cables">Cables</MenuItem>
                    <MenuItem value="cases">Cases</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} label="Description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Pricing & Stock</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="number" label="MRP" value={product.mrp} onChange={(e) => setProduct({ ...product, mrp: parseFloat(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="number" label="Sale Price" value={product.salePrice} onChange={(e) => setProduct({ ...product, salePrice: parseFloat(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth type="number" label="Stock Quantity" value={product.stock} onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Variants (Color, Size, etc.)</Typography>
                <Button startIcon={<Add />} onClick={handleAddVariant}>Add Variant</Button>
              </Box>

              {product.variants.map((variant, vIdx) => (
                <Box key={vIdx} sx={{ mb: 3, p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Variant Name (e.g., Color, Size)" 
                        value={variant.name}
                        placeholder="Color"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Variant Options:</Typography>
                      {variant.values.map((value, vvIdx) => (
                        <Grid container spacing={2} key={vvIdx} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Option Name" placeholder="Red" />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField fullWidth type="number" label="Stock" />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField fullWidth type="number" label="Price Adjustment" />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <IconButton color="error"><Delete /></IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button size="small" onClick={() => handleAddVariantValue(vIdx)}>+ Add Option</Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Images & Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Product Images</Typography>
              <Button fullWidth variant="outlined" startIcon={<CloudUpload />} sx={{ mb: 2 }}>
                Upload Images
              </Button>
              <Typography variant="caption" color="text.secondary">
                Upload up to 5 images. First image will be the main product image.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Status</Typography>
              <FormControlLabel
                control={<Switch checked={product.isActive} onChange={(e) => setProduct({ ...product, isActive: e.target.checked })} />}
                label="Product Active"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Active products are visible in the store
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
EOFILE

# CATEGORIES PAGE
cat > src/pages/Categories.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, TextField, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState([
    { _id: '1', name: 'Phone Accessories', slug: 'phone-accessories', productCount: 45 },
    { _id: '2', name: 'Charging Cables', slug: 'charging-cables', productCount: 32 },
    { _id: '3', name: 'Phone Cases', slug: 'phone-cases', productCount: 78 },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Categories</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Category</Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{category.slug}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small"><Edit /></IconButton>
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {category.productCount} products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Categories;
EOFILE

# BRANDS PAGE
cat > src/pages/Brands.tsx << 'EOFILE'
import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, IconButton, Avatar } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState([
    { _id: '1', name: 'Samsung', logo: '', productCount: 23 },
    { _id: '2', name: 'Apple', logo: '', productCount: 45 },
    { _id: '3', name: 'OnePlus', logo: '', productCount: 12 },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Brands</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Brand</Button>
      </Box>

      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid item xs={12} sm={6} md={4} key={brand._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56 }}>{brand.name[0]}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{brand.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {brand.productCount} products
                    </Typography>
                  </Box>
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

export default Brands;
EOFILE

echo "✅ Step 1: Created Invoices, Abandoned Carts, Product Form, Categories, Brands"
