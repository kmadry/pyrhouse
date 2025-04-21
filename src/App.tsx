import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import List from './components/List';
import PrivateRoute from './components/Authorisation';
import Layout from './components/Layout';
import TransferPage from './components/TransferPage';
import AddItemPage from './components/AddItemPage';
import { ThemeProvider } from './theme/ThemeContext';
import LoadingSkeleton from './components/LoadingSkeleton';
import QuestLoadingBar from './components/QuestLoadingBar';

// Lazy loaded components
const UserManagementPage = lazy(() => import('./components/UserManagementPage'));
const UserDetailsPage = lazy(() => import('./components/UserDetailsPage'));
const CategoryManagementPage = lazy(() => import('./components/CategoryManagementPage'));
const TransfersListPage = lazy(() => import('./components/TransferListPage'));
const TransferDetailsPage = lazy(() => import('./components/TransferDetailsPage'));
const QuestBoard = lazy(() => import('./components/QuestBoardPage'));
const EquipmentDetails = lazy(() => import('./components/EquipmentDetails'));
const LocationsPage = lazy(() => import('./components/LocationsPage'));
const LocationDetailsPage = lazy(() => import('./components/LocationDetailsPage'));
const TutorialPage = lazy(() => import('./components/TutorialPage'));

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<PrivateRoute><Layout><Outlet /></Layout></PrivateRoute>}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="list" element={<List />} />
            <Route path="add-item" element={<AddItemPage />} />
            <Route path="transfers/create" element={<TransferPage />} />
            
            {/* Lazy loaded routes */}
            <Route path="users" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <UserManagementPage />
              </Suspense>
            } />
            <Route path="users/:id" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <UserDetailsPage />
              </Suspense>
            } />
            <Route path="categories" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CategoryManagementPage />
              </Suspense>
            } />
            <Route path="transfers" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TransfersListPage />
              </Suspense>
            } />
            <Route path="transfers/:id" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TransferDetailsPage />
              </Suspense>
            } />
            <Route path="quests" element={
              <Suspense fallback={<QuestLoadingBar />}>
                <QuestBoard />
              </Suspense>
            } />
            <Route path="equipment/:id" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <EquipmentDetails />
              </Suspense>
            } />
            <Route path="locations" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LocationsPage />
              </Suspense>
            } />
            <Route path="locations/:id" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LocationDetailsPage />
              </Suspense>
            } />
            <Route path="tutorial" element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TutorialPage />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
