import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // usar Routes/Route directamente
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('user'); }
    }
    // opcional: si quieres validar token al arrancar, puedes fetchear perfil con token
  }, []);

  // onLogin ahora puede recibir token
  const handleLogin = (userData, token) => {
    setUser(userData);
    if (token) localStorage.setItem('token', token);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <>
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
            <Route path="/books/:id" element={<BookDetail user={user} />} />
            <Route path="/profile" element={
              <UserProfile user={user} onLogin={handleLogin} />
            } />
            <Route path="/admin" element={<AdminPanel user={user} />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;