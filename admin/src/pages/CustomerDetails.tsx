import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, MenuItem, Checkbox, FormControlLabel, Breadcrumbs, Link } from '@mui/material';
import { WhatsApp, Edit, Delete } from '@mui/icons-material';
import customerService from '../services/customer.service';

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadCustomer();
    } else {
      setEditing(true);
      setCustomer({ name: '', phone: '', email: '', type: 'CONSUMER', hasGSTNo: false, isAffiliate: false, blockCOD: false });
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await customerService.getCustomerById(id!);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to load customer', error);
    }
  };

  const handleSave = async () => {
    try {
      if (id === 'new') {
        await customerService.createCustomer(customer);
      } else {
        await customerService.updateCustomer(id!, customer);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Failed to save customer', error);
    }
  };

  if (!customer) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="primary" onClick={() => navigate('/customers')} sx={{ cursor: 'pointer' }}>Customers</Link>
        <Typography color="text.primary">{customer.name || 'New Customer'}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>{customer.name || 'New Customer'}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!editing && (
            <>
              <Button startIcon={<WhatsApp />} variant="outlined" color="success">WhatsApp</Button>
              <Button startIcon={<Edit />} onClick={() => setEditing(true)}>Edit</Button>
              <Button startIcon={<Delete />} color="error">Delete</Button>
            </>
          )}
          {editing && (
            <>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave}>Save</Button>
            </>
          )}
        </Box>
      </Box>

      {!editing && customer._id && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'You Receive', value: `₹${customer.totalSpent?.toFixed(2) || '0.00'}`, color: '#EF4444' },
            { label: 'Wallet Balance', value: customer.walletBalance || 0 },
            { label: 'Orders', value: customer.totalOrders || 0 },
            { label: 'Invoices', value: 0 },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone Number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={customer.email || ''} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} disabled={!editing} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Type" value={customer.type} onChange={(e) => setCustomer({ ...customer, type: e.target.value })} disabled={!editing}>
                <MenuItem value="CONSUMER">Consumer</MenuItem>
                <MenuItem value="RETAILER">Retailer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.hasGSTNo} onChange={(e) => setCustomer({ ...customer, hasGSTNo: e.target.checked })} disabled={!editing} />} label="Customer has GST No. (Optional)" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.isAffiliate} onChange={(e) => setCustomer({ ...customer, isAffiliate: e.target.checked })} disabled={!editing} />} label="Affiliate Customer (Optional)" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={customer.blockCOD} onChange={(e) => setCustomer({ ...customer, blockCOD: e.target.checked })} disabled={!editing} />} label="Block Cash on Delivery for this Customer" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDetails;
