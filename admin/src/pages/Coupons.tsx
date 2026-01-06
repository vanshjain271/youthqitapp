import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState([
    { _id: '1', code: 'WELCOME10', discount: 10, type: 'PERCENTAGE', usageCount: 45, maxUsage: 100, status: 'ACTIVE' },
    { _id: '2', code: 'FLAT500', discount: 500, type: 'FIXED', usageCount: 12, maxUsage: 50, status: 'ACTIVE' },
    { _id: '3', code: 'SUMMER20', discount: 20, type: 'PERCENTAGE', usageCount: 89, maxUsage: 100, status: 'EXPIRED' },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Coupons</Typography>
        <Button variant="contained" startIcon={<Add />}>Create Coupon</Button>
      </Box>

      <Grid container spacing={3}>
        {coupons.map((coupon) => (
          <Grid item xs={12} md={6} lg={4} key={coupon._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                      {coupon.code}
                    </Typography>
                    <IconButton size="small"><ContentCopy fontSize="small" /></IconButton>
                  </Box>
                  <Chip 
                    label={coupon.status} 
                    size="small" 
                    color={coupon.status === 'ACTIVE' ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {coupon.type === 'PERCENTAGE' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Used: {coupon.usageCount}/{coupon.maxUsage}
                  </Typography>
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

export default Coupons;
