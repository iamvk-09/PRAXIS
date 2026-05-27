import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogEntry from './pages/LogEntry';
import Habits from './pages/Habits';
import Goals from './pages/Goals';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 1rem' }} />
          <p style={{ color: '#9090B0' }}>Loading Praxis...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Navbar />
          <div className="page-content"><Dashboard /></div>
        </ProtectedRoute>
      } />
      <Route path="/log" element={
        <ProtectedRoute>
          <Navbar />
          <div className="page-content"><LogEntry /></div>
        </ProtectedRoute>
      } />
      <Route path="/habits" element={
        <ProtectedRoute>
          <Navbar />
          <div className="page-content"><Habits /></div>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <Navbar />
          <div className="page-content"><Goals /></div>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
