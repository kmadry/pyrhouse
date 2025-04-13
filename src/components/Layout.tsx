import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import * as Icons from '@mui/icons-material'; // Import all icons as an alias
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.styles';
import pyrkonLogo from '../assets/images/p-logo.png';
import { useThemeMode } from '../theme/ThemeContext';
import { jwtDecode } from 'jwt-decode';
import { useTokenValidation } from '../hooks/useTokenValidation';

interface JwtPayload {
  role: string;
  userID: number;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isTokenValid } = useTokenValidation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = React.useState(!isMobile);
  const { themeMode, setThemeMode } = useThemeMode();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeItem, setActiveItem] = useState<string>('');
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setOpen(!mobile);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setScrollDirection('down');
      } else {
        // Scrolling up
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Ustaw aktywny element na podstawie aktualnej ścieżki
  useEffect(() => {
    const path = window.location.pathname;
    setActiveItem(path);
  }, []);

  const token = localStorage.getItem('token');
  if (!token || !isTokenValid) {
    navigate('/login');
    return null;
  }

  const decodedToken = jwtDecode<JwtPayload>(token);
  const userRole = decodedToken.role;
  const userId = decodedToken.userID;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDrawer = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    handleThemeMenuClose();
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Icons.LightMode />;
      case 'dark':
        return <Icons.DarkMode />;
      default:
        return <Icons.BrightnessAuto />;
    }
  };

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/users/${userId}`);
    }
  };

  // Funkcja sprawdzająca, czy użytkownik ma uprawnienia administratora
  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handleMenuItemClick = (path: string) => {
    setActiveItem(path);
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const menuItems = [
    { path: '/home', label: 'Home', icon: <Icons.Home /> },
    { path: '/transfers', label: 'Wydania', icon: <Icons.PublishedWithChanges /> },
    { path: '/add-item', label: 'Dodaj sprzęt', icon: <Icons.Add /> },
    { path: '/list', label: 'Stan Magazynowy', icon: <Icons.List /> },
    { path: '/locations', label: 'Lokalizacje', icon: <Icons.EditLocationAlt /> },
    { path: '/quests', label: 'Quest Board', icon: <Icons.Security /> },
  ];

  const adminMenuItems = [
    { path: '/categories', label: 'Kategorie', icon: <Icons.Category /> },
    { path: '/users', label: 'Użytkownicy', icon: <Icons.People /> },
  ];

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      pt: 1
    }}>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.path)}
              sx={{
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                backgroundColor: activeItem === item.path ? 'primary.light' : 'transparent',
                color: activeItem === item.path ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeItem === item.path ? 'primary.main' : 'action.hover',
                },
                transition: 'all 0.2s ease',
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ 
                color: activeItem === item.path ? 'primary.contrastText' : 'primary.main',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: activeItem === item.path ? 600 : 400,
                  fontSize: '0.95rem'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {hasAdminAccess() && (
        <>
          <Divider sx={{ my: 2, mx: 2 }} />
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              px: 3, 
              py: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Icons.AdminPanelSettings fontSize="small" />
            Admin
          </Typography>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    backgroundColor: activeItem === item.path ? 'primary.light' : 'transparent',
                    color: activeItem === item.path ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: activeItem === item.path ? 'primary.main' : 'action.hover',
                    },
                    transition: 'all 0.2s ease',
                    py: 1.5,
                    pl: 4,
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: activeItem === item.path ? 'primary.contrastText' : 'primary.main',
                    minWidth: '40px'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: activeItem === item.path ? 600 : 400,
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <Icons.Menu />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link 
              to="/home" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              <img 
                src={pyrkonLogo} 
                alt="Pyrkon Logo" 
                style={{ height: '40px', marginRight: '1px' }} 
              />
              <Typography variant="h6" noWrap>
                yrhouse
              </Typography>
            </Link>
          </Box>
          <IconButton color="inherit" onClick={handleThemeMenuOpen}>
            {getThemeIcon()}
          </IconButton>
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleThemeMenuClose}
          >
            <MenuItem onClick={() => handleThemeChange('light')}>
              <Icons.LightMode sx={{ mr: 1 }} /> Jasny
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')}>
              <Icons.DarkMode sx={{ mr: 1 }} /> Ciemny
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('system')}>
              <Icons.BrightnessAuto sx={{ mr: 1 }} /> Systemowy
            </MenuItem>
          </Menu>
          <Tooltip title="Profil użytkownika">
            <IconButton color="inherit" onClick={handleProfileClick}>
              <Icons.Person />
            </IconButton>
          </Tooltip>
          <IconButton color="inherit" onClick={handleLogout}>
            <Icons.Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          ...styles.navigation,
          '& .MuiDrawer-paper': {
            borderRadius: isMobile ? 0 : '0 16px 16px 0',
            boxShadow: isMobile ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRight: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          ...styles.mainContent,
          marginLeft: open && !isMobile ? '240px' : '0px',
          width: open && !isMobile ? 'calc(100% - 240px)' : '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          '& > *': {
            maxWidth: '100%',
            overflowX: 'hidden'
          }
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Layout;
