import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Paper, TextField, MenuItem, Switch, FormControlLabel, Button } from '@mui/material';
import { Storefront, Language, Inventory, ShoppingCart, LocalShipping, Payment } from '@mui/icons-material';

const StoreSettings: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('checkout');
  const [settings, setSettings] = useState({
    roundingMode: 'No Rounding',
    showTaxInfo: true,
    minOrderAmount: 3000,
    cartNote: '',
  });

  const sections = [
    { id: 'store', label: 'Store Details', icon: <Storefront /> },
    { id: 'domain', label: 'Store Domain', icon: <Language /> },
    { id: 'products', label: 'Products Settings', icon: <Inventory /> },
    { id: 'checkout', label: 'Checkout Settings', icon: <ShoppingCart /> },
    { id: 'delivery', label: 'Delivery Settings', icon: <LocalShipping /> },
    { id: 'payment', label: 'Payment Settings', icon: <Payment /> },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Store Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              {sections.map((section) => (
                <ListItem key={section.id} disablePadding>
                  <ListItemButton selected={selectedSection === section.id} onClick={() => setSelectedSection(section.id)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Checkout</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Cart Total Amount - Rounding Mode"
                  value={settings.roundingMode}
                  onChange={(e) => setSettings({ ...settings, roundingMode: e.target.value })}
                  helperText="Choose how you want to round Cart Total"
                >
                  <MenuItem value="No Rounding">No Rounding</MenuItem>
                  <MenuItem value="Round Up">Round Up</MenuItem>
                  <MenuItem value="Round Down">Round Down</MenuItem>
                </TextField>

                <Box>
                  <FormControlLabel
                    control={<Switch checked={settings.showTaxInfo} onChange={(e) => setSettings({ ...settings, showTaxInfo: e.target.checked })} />}
                    label="Show Tax Information"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">Display tax details during checkout</Typography>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Order Amount"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
                  helperText="Only accept delivery orders above this minimum amount"
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="outlined">Cancel</Button>
                  <Button variant="contained">Save Changes</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreSettings;
