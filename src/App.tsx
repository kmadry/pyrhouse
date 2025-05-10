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
import JiraTicketsPage from './components/features/JiraTicketsPage';

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
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <UserManagementPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="users/:id" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <UserDetailsPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="categories" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <CategoryManagementPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="transfers" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <TransfersListPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="transfers/:id" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <TransferDetailsPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="quests" element={
              <ErrorBoundary>
              <Suspense fallback={<QuestLoadingBar />}>
                <QuestBoard />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="equipment/:id" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <EquipmentDetails />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="locations" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <LocationsPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="locations/:id" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <LocationDetailsPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="tutorial" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <TutorialPage />
              </Suspense>
              </ErrorBoundary>
            } />
            <Route path="servicedesk" element={
              <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <JiraTicketsPage />
              </Suspense>
              </ErrorBoundary>
            } />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
