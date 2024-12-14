import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import List from './components/List';
import PrivateRoute from './components/Authorisation'; // Import PrivateRoute
import Layout from './components/Layout'; // Import the new Layout component
import TransferPage from './components/TransferPage'; // Import the TransferPage component
import AddItemPage from './components/AddItemPage';
import LocationManagementPage from './components/LocationManagementPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff9800', // Orange accent
    },
    secondary: {
      main: '#ffffff', // White accent
    },
    background: {
      // default: '#f7f7f7', // Light gray background
      paper: '#ffffff', // White for cards and containers
    },
    text: {
      primary: '#333333', // Dark gray text
      secondary: '#757575', // Lighter gray text
    },
  },
  typography: {
    fontFamily: `'Roboto', 'Arial', sans-serif`,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/list" element={<List />} />
                    <Route path="/add-item" element={<AddItemPage />} />
                    <Route path="/transfers" element={<PrivateRoute><TransferPage /></PrivateRoute>}/>
                    <Route path="/locations" element={<PrivateRoute><LocationManagementPage /></PrivateRoute>}/>
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
