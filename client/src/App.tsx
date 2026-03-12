import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Lazily load components if needed, or static import
import Login from './pages/Login';
import Register from './pages/Register';
// Mocks for now - will be created next
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectList from './pages/admin/ProjectList';
import UserDashboard from './pages/user/UserDashboard';
import WeeklyView from './pages/user/WeeklyView';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes directly wrapped within Layout */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ProjectList />
                </PrivateRoute>
              } 
            />

            {/* User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <UserDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/user/weekly" 
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <WeeklyView />
                </PrivateRoute>
              } 
            />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
