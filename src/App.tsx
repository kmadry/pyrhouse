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
  colorSchemes: {
    light: true,
    dark: {
      palette: {
        primary: {
          main: '#ff9800',
        }
      },
    }
   },
   palette: {
    primary: {
      main: '#ff9800',
    }
   },
   components: { // probably bad solution, to refactor
    MuiListItem: {
      styleOverrides: {
        root: {
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Hardcoded hover color
          },
        },
      },
    },
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
