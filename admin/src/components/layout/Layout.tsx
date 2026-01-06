import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { SIDEBAR_WIDTH } from '../../theme/theme';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <TopBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
