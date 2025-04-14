import React, { useState, useEffect, useCallback } from 'react';
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
  Switch,
} from '@mui/material';
import * as Icons from '@mui/icons-material'; // Import all icons as an alias
import { useNavigate } from 'react-router-dom';
import styles from './Layout.styles';
import pyrkonLogo from '../assets/images/p-logo.svg';
import { useThemeMode } from '../theme/ThemeContext';
import { jwtDecode } from 'jwt-decode';
import { useTokenValidation } from '../hooks/useTokenValidation';
import { useStorage } from '../hooks/useStorage';
import { useAnimationPreference } from '../hooks/useAnimationPreference';

interface JwtPayload {
  role: string;
  userID: number;
  exp: number;
}

// Stała określająca margines bezpieczeństwa w sekundach (5 minut)
const SAFETY_MARGIN = 5 * 60;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isTokenValid } = useTokenValidation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const { themeMode, setThemeMode } = useThemeMode();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeItem, setActiveItem] = useState<string>('');
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const { getToken, removeToken } = useStorage();
  const { prefersAnimations, toggleAnimations, isSystemReducedMotion } = useAnimationPreference();
  const [animationMenuAnchor, setAnimationMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = useCallback(() => {
    removeToken();
    navigate('/login');
  }, [navigate, removeToken]);

  // Walidacja tokenu
  useEffect(() => {
    const token = getToken();
    if (!token || !isTokenValid) {
      handleLogout();
      return;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Dodajemy margines bezpieczeństwa - token jest uznawany za nieważny 5 minut przed faktycznym wygaśnięciem
      if (decodedToken.exp < currentTime + SAFETY_MARGIN) {
        handleLogout();
        return;
      }
      
      setUserRole(decodedToken.role);
      setUserId(decodedToken.userID);
    } catch (error) {
      console.error('Błąd dekodowania tokenu:', error);
      handleLogout();
    }
  }, [isTokenValid, handleLogout, getToken]);

  // Obsługa resize i scroll
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setOpen(!mobile);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
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

  const toggleDrawer = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // Jeśli token jest nieważny, nie renderuj komponentu
  if (!isTokenValid) {
    return null;
  }

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
      <Divider sx={{ mb: 2 }} />
      
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

  const handleAnimationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnimationMenuAnchor(event.currentTarget);
  };

  const handleAnimationMenuClose = () => {
    setAnimationMenuAnchor(null);
  };

  return (
    <Box sx={styles.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          ...styles.appBar,
          transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <Icons.Menu />
          </IconButton>

          <Box
            component="img"
            src={pyrkonLogo}
            alt="Pyrkon Logo"
            sx={{
              height: '40px',
              width: 'auto',
              mr: 2,
              mt: -1,
              filter: theme.palette.mode === 'light' 
                ? 'invert(0.2) drop-shadow(0px 0px 2px rgba(0,0,0,0.3))'
                : 'invert(1) brightness(1.2) drop-shadow(0px 0px 2px rgba(255,255,255,0.3))',
              '&:hover': {
                filter: theme.palette.mode === 'light'
                  ? 'invert(0.3) drop-shadow(0px 0px 3px rgba(0,0,0,0.4))'
                  : 'invert(1) brightness(1.3) drop-shadow(0px 0px 3px rgba(255,255,255,0.4))',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          />

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Pyrhouse
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Przycisk animacji */}
            <Tooltip title="Ustawienia animacji">
              <IconButton
                onClick={handleAnimationMenuOpen}
                color="inherit"
                sx={{
                  opacity: isSystemReducedMotion ? 0.5 : 1,
                }}
              >
                {prefersAnimations ? <Icons.Animation /> : <Icons.BlockTwoTone />}
              </IconButton>
            </Tooltip>

            {/* Menu animacji */}
            <Menu
              anchorEl={animationMenuAnchor}
              open={Boolean(animationMenuAnchor)}
              onClose={handleAnimationMenuClose}
              onClick={handleAnimationMenuClose}
            >
              <MenuItem>
                <ListItemText 
                  primary="Animacje"
                  secondary={isSystemReducedMotion ? "Wyłączone przez system" : ""}
                />
                <Switch
                  checked={prefersAnimations}
                  onChange={toggleAnimations}
                  disabled={isSystemReducedMotion}
                />
              </MenuItem>
            </Menu>

            {/* Przycisk motywu */}
            <Tooltip title="Ustawienia motywu">
              <IconButton onClick={handleThemeMenuOpen} color="inherit">
                {getThemeIcon()}
              </IconButton>
            </Tooltip>

            {/* Menu motywu */}
            <Menu
              anchorEl={themeMenuAnchor}
              open={Boolean(themeMenuAnchor)}
              onClose={handleThemeMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => handleThemeChange('light')}>
                <Icons.LightMode sx={{ mr: 2 }} />
                Jasny
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('dark')}>
                <Icons.DarkMode sx={{ mr: 2 }} />
                Ciemny
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('system')}>
                <Icons.BrightnessAuto sx={{ mr: 2 }} />
                Systemowy
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
          </Box>
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
    </Box>
  );
};

export default Layout;
