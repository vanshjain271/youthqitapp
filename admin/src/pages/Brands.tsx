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
