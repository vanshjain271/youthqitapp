import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard, Receipt, ShoppingCart, Inventory, People, LocalOffer,
  Assessment, Storefront, Apps, AccountBalanceWallet, ExpandLess, ExpandMore,
} from '@mui/icons-material';
import { SIDEBAR_WIDTH, SIDEBAR_BG, SIDEBAR_HOVER, SIDEBAR_ACTIVE } from '../../theme/theme';

interface NavItem {
  title: string;
  path?: string;
  icon: React.ReactElement;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/', icon: <Dashboard /> },
  { title: 'Invoices', path: '/invoices', icon: <Receipt /> },
  {
    title: 'Orders',
    icon: <ShoppingCart />,
    children: [
      { title: 'Online', path: '/orders/online', icon: <></> },
      { title: 'Purchase', path: '/orders/purchase', icon: <></> },
      { title: 'Abandoned Carts', path: '/orders/abandoned', icon: <></> },
    ],
  },
  {
    title: 'Catalog',
    icon: <Inventory />,
    children: [
      { title: 'Products', path: '/catalog/products', icon: <></> },
      { title: 'Categories', path: '/catalog/categories', icon: <></> },
      { title: 'Brands', path: '/catalog/brands', icon: <></> },
    ],
  },
  { title: 'Customers', path: '/customers', icon: <People /> },
  {
    title: 'Promotions',
    icon: <LocalOffer />,
    children: [
      { title: 'Coupons', path: '/promotions/coupons', icon: <></> },
      { title: 'Banners', path: '/promotions/banners', icon: <></> },
    ],
  },
  { title: 'Reports', path: '/reports', icon: <Assessment /> },
  {
    title: 'Online Store',
    icon: <Storefront />,
    children: [
      { title: 'Store Settings', path: '/store/settings', icon: <></> },
      { title: 'Display Settings', path: '/store/display', icon: <></> },
      { title: 'Themes', path: '/store/themes', icon: <></> },
    ],
  },
  { title: 'App Store', path: '/app-store', icon: <Apps /> },
  { title: 'Billing Plans', path: '/billing', icon: <AccountBalanceWallet /> },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
    Orders: true,
    'Online Store': true,
  });

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      setOpenItems((prev) => ({ ...prev, [item.title]: !prev[item.title] }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path?: string) => path && location.pathname === path;

  const renderNavItem = (item: NavItem, depth = 0) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.title];

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              px: depth === 0 ? 2.5 : 4,
              py: 1,
              color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: active ? SIDEBAR_ACTIVE : 'transparent',
              borderRadius: depth === 0 ? 2 : 0,
              mx: depth === 0 ? 1 : 0,
              '&:hover': {
                backgroundColor: depth === 0 ? SIDEBAR_HOVER : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
              },
            }}
          >
            {depth === 0 && (
              <ListItemIcon sx={{ minWidth: 0, mr: 2, color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: depth === 0 ? 14 : 13,
                fontWeight: active ? 600 : 500,
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: SIDEBAR_BG,
          color: '#fff',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: SIDEBAR_BG, fontWeight: 700 }}>Y</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>YouthQit</Typography>
        <Typography sx={{ fontSize: 24 }}>👑</Typography>
      </Box>

      <List sx={{ px: 0, py: 1 }}>{navItems.map((item) => renderNavItem(item))}</List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet />
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Wallet:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>₹385</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
