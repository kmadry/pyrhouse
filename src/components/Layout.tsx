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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawer = (
      <List>
        <ListItem component={Link} to="/home">
          <Icons.Home />
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={Link} to="/transfers">
          <Icons.LocalShipping />
          <ListItemText primary="Wydanie sprzętu" />
        </ListItem>
        <ListItem component={Link} to="/list">
          <Icons.List />
          <ListItemText primary="Lista sprzętu" />
        </ListItem>
        <ListItem component={Link} to="/add-item">
          <Icons.Add />
          <ListItemText primary="Dodaj sprzęt" />
        </ListItem>
        <ListItem component={Link} to="/locations">
          <Icons.EditLocationAlt />
          <ListItemText primary="Lokalizacje" />
        </ListItem>
        <ListItem component={Link} to="/users">
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
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
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
        variant="permanent"
        anchor="left"
        open={true}
        ModalProps={{ keepMounted: true }}
        sx={styles.navigation}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={styles.mainContent}
      >
        {children}
      </Box>
      </>
  );
};

export default Layout;
