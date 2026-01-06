import React, { useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Badge, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Notifications, AccountCircle, Storefront, OpenInNew } from '@mui/icons-material';
import { SIDEBAR_WIDTH } from '../../theme/theme';

const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        color: '#1F2937',
      }}
    >
      <Toolbar>
        <Button startIcon={<Storefront />} endIcon={<OpenInNew fontSize="small" />} sx={{ textTransform: 'none', color: '#1F2937' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Raghav Enterprises</Typography>
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={4} color="error"><Notifications /></Badge>
        </IconButton>
        <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <AccountCircle />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
