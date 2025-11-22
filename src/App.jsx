import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/login';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import PGDetails from './pages/PGDetails';
import './App.css';

function App() {
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
  };

  return (
    <div className="App">
      <Navbar onSearch={handleGlobalSearch} />
      <Routes>
        <Route 
          path="/" 
          element={<Home searchQuery={globalSearchQuery} />} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pg/:id" element={<PGDetails />} />
      </Routes>
    </div>
  );
}

export default App;
