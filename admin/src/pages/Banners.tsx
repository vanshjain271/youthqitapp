import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, IconButton, Chip } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

const Banners: React.FC = () => {
  const [banners, setBanners] = useState([
    { _id: '1', title: 'Summer Sale', position: 'HOME_TOP', isActive: true, clickCount: 234 },
    { _id: '2', title: 'New Arrivals', position: 'HOME_MIDDLE', isActive: true, clickCount: 156 },
    { _id: '3', title: 'Clearance Sale', position: 'CATEGORY', isActive: false, clickCount: 89 },
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Banners</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Banner</Button>
      </Box>

      <Grid container spacing={3}>
        {banners.map((banner) => (
          <Grid item xs={12} md={6} key={banner._id}>
            <Card>
              <CardMedia
                component="div"
                sx={{ height: 140, backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Typography variant="h6" color="text.secondary">Banner Preview</Typography>
              </CardMedia>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{banner.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{banner.position}</Typography>
                  </Box>
                  <Chip 
                    label={banner.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={banner.isActive ? 'success' : 'default'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {banner.clickCount} clicks
                  </Typography>
                  <Box>
                    <IconButton size="small"><Visibility /></IconButton>
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

export default Banners;
