import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import PGDetails from './pages/PGDetails';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import AdminPanel from './pages/AdminPanel';
import { useState } from 'react';

function App() {
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
  };

  return (
    <AuthProvider>
      <div className="App">
        <Navbar onSearch={handleGlobalSearch} />
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={<Home searchQuery={globalSearchQuery} />} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/pg/:id" element={<PGDetails />} />
          
          {/* Protected routes */}
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;