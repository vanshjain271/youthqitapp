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
