import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import PrivateRoute from './components/Authorisation'; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/home"
          element={
            // <PrivateRoute requiredRole="user">
            <PrivateRoute> 
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;