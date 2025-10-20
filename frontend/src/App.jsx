import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import './styles/global.css';

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Verificar autenticación al cargar la app
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user} 
          onLogout={handleLogout}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home books={books} />} />
            <Route path="/catalog" element={
              <Catalog 
                books={books} 
                searchTerm={searchTerm}
                onBooksUpdate={setBooks}
              />
            } />
            <Route path="/book/:id" element={<BookDetail user={user} />} />
            <Route path="/profile" element={
              <UserProfile user={user} onLogin={handleLogin} />
            } />
            <Route path="/admin" element={<AdminPanel user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;