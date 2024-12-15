import React from 'react';
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
} from '@mui/material';
import * as Icons from '@mui/icons-material'; // Import all icons as an alias
import { Link, useNavigate } from 'react-router-dom';
import styles from './Layout.styles';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true); // Set drawer to be visible initially

  const toggleDrawer = () => {
    setOpen((prevOpen) => !prevOpen); // Toggle the open state
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawer = (
    <List>
      <ListItem component={Link} to="/home" onClick={toggleDrawer}>
        <Icons.Home />
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem component={Link} to="/transfers" onClick={toggleDrawer}>
        <Icons.LocalShipping />
        <ListItemText primary="Wydanie sprzętu" />
      </ListItem>
      <ListItem component={Link} to="/list" onClick={toggleDrawer}>
        <Icons.List />
        <ListItemText primary="Lista sprzętu" />
      </ListItem>
      <ListItem component={Link} to="/add-item" onClick={toggleDrawer}>
        <Icons.Add />
        <ListItemText primary="Dodaj sprzęt" />
      </ListItem>
      <ListItem component={Link} to="/categories" onClick={toggleDrawer}>
        <Icons.Category />
        <ListItemText primary="Kategorie" />
      </ListItem>
      <ListItem component={Link} to="/locations" onClick={toggleDrawer}>
        <Icons.EditLocationAlt />
        <ListItemText primary="Lokalizacje" />
      </ListItem>
      <ListItem component={Link} to="/users" onClick={toggleDrawer}>
        <Icons.People />
        <ListItemText primary="Użyszkodnicy" />
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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Pyrhouse App
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            Logout
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
