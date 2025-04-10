import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import List from './components/List';
import PrivateRoute from './components/Authorisation';
import Layout from './components/Layout';
import TransferPage from './components/TransferPage';
import AddItemPage from './components/AddItemPage';
import UserManagementPage from './components/UserManagementPage';
import UserDetailsPage from './components/UserDetailsPage';
import CategoryManagementPage from './components/CategoryManagementPage';
import TransfersListPage from './components/TransferListPage';
import TransferDetailsPage from './components/TransferDetailsPage';
import QuestBoard from './components/QuestBoardPage';
import EquipmentDetails from './components/EquipmentDetails';
import LocationsPage from './components/LocationsPage';
import LocationDetailsPage from './components/LocationDetailsPage';
import { ThemeProvider } from './theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
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
                    <Route path="/details/:id" element={<EquipmentDetails />} />
                    <Route path="/transfers/create" element={<PrivateRoute><TransferPage /></PrivateRoute>}/>
                    <Route path="/locations" element={<LocationsPage />} />
                    <Route path="/locations/:locationId" element={<LocationDetailsPage />} />
                    <Route path="/categories" element={<PrivateRoute><CategoryManagementPage /></PrivateRoute>}/>
                    <Route path="/transfers" element={<TransfersListPage />} />
                    <Route path="/transfers/:id" element={<TransferDetailsPage />} />
                    <Route path="/users" element={<PrivateRoute><UserManagementPage /></PrivateRoute>}/>
                    <Route path="/users/:userId" element={<PrivateRoute><UserDetailsPage /></PrivateRoute>}/>
                    <Route path="/quests" element={<QuestBoard />} />
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
