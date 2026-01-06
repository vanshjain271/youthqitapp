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
