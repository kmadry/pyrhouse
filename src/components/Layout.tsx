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
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import * as Icons from '@mui/icons-material'; // Import all icons as an alias
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.styles';
import pyrkonLogo from '../assets/images/p-logo.png';
import { useThemeMode } from '../theme/ThemeContext';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true); // Set drawer to be visible initially
  const { themeMode, setThemeMode } = useThemeMode();
  const [themeMenuAnchor, setThemeMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Pobierz ID użytkownika z JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setUserId(decodedToken.userID);
      } catch (error) {
        console.error('Błąd dekodowania tokenu:', error);
      }
    }
  }, []);

  const toggleDrawer = () => {
    setOpen((prevOpen) => !prevOpen); // Toggle the open state
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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

  const drawer = (
    <List>
      <ListItem component={Link} to="/home">
        <ListItemText primary="Home" />
        <Icons.Home />
      </ListItem>
      <ListItem component={Link} to="/transfers">
        <ListItemText primary="Wydania" />
        <Icons.PublishedWithChanges />
      </ListItem>
      <ListItem component={Link} to="/add-item">
        <ListItemText primary="Dodaj sprzęt" />
        <Icons.Add />
      </ListItem>
      <ListItem component={Link} to="/list">
        <ListItemText primary="Stan Magazynowy" />
        <Icons.List />
      </ListItem>
      <ListItem component={Link} to="/locations">
        <ListItemText primary="Lokalizacje" />
        <Icons.EditLocationAlt />
      </ListItem>
      <ListItem component={Link} to="/quests">
        <ListItemText primary="Quest Board" />
        <Icons.Security />
      </ListItem>
      
      {/* Sekcja Admin */}
      <ListItem sx={{ mt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <ListItemText 
          primary="Admin" 
          primaryTypographyProps={{ 
            variant: 'subtitle2', 
            color: 'text.secondary',
            sx: { fontWeight: 'bold' }
          }} 
        />
        <Icons.AdminPanelSettings />
      </ListItem>
      <ListItem component={Link} to="/categories" sx={{ pl: 4 }}>
        <ListItemText primary="Kategorie" />
        <Icons.Category />
      </ListItem>
      <ListItem component={Link} to="/users" sx={{ pl: 4 }}>
        <ListItemText primary="Użytkownicy" />
        <Icons.People />
      </ListItem>
    </List>
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer} // Toggle drawer visibility
          >
            <Icons.Menu />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={pyrkonLogo} 
              alt="Pyrkon Logo" 
              style={{ height: '40px', marginRight: '10px' }} 
            />
            <Typography variant="h6" noWrap>
              Pyrhouse App
            </Typography>
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
        variant="persistent" // Persistent drawer that stays open initially
        anchor="left"
        open={open} // Controlled by the `open` state
        sx={styles.navigation}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          ...styles.mainContent,
          marginLeft: open ? '240px' : '0px', // Adjust content margin based on drawer state
          transition: 'margin 0.3s', // Smooth transition
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Layout;
