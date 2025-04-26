import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import LoginForm from './components/features/LoginForm';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import PrivateRoute from './components/features/Authorisation';
import Layout from './components/layout/Layout';
import TransferPage from './components/features/TransferPage';
import AddItemPage from './components/features/AddItemPage';
import { ThemeProvider } from './theme/ThemeContext';
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import QuestLoadingBar from './components/features/QuestLoadingBar';

// Lazy loaded components
const UserManagementPage = lazy(() => import('./components/features/UserManagementPage'));
const UserDetailsPage = lazy(() => import('./components/features/UserDetailsPage'));
const CategoryManagementPage = lazy(() => import('./components/features/CategoryManagementPage'));
const TransfersListPage = lazy(() => import('./components/features/TransferListPage'));
const TransferDetailsPage = lazy(() => import('./components/features/TransferDetailsPage'));
const QuestBoard = lazy(() => import('./components/features/QuestBoardPage'));
const EquipmentDetails = lazy(() => import('./components/features/EquipmentDetails'));
const LocationsPage = lazy(() => import('./components/features/LocationsPage'));
const LocationDetailsPage = lazy(() => import('./components/features/LocationDetailsPage'));
const TutorialPage = lazy(() => import('./components/features/TutorialPage'));
const Home = lazy(() => import('./components/features/Home'));
const List = lazy(() => import('./components/features/List'));

// Konfiguracja flag React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router future={routerFutureConfig}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<PrivateRoute><Layout><Outlet /></Layout></PrivateRoute>}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <Home />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="list" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <List />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="add-item" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <AddItemPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="transfers/create" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <TransferPage />
                </Suspense>
              </ErrorBoundary>
            } />
            
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
