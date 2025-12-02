import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import UserProfile from './pages/UserProfile';

function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('user'); }
    }
    
    // CARGAR LIBROS INICIALES
    fetchInitialBooks();
  }, []);

  // Función para cargar libros iniciales
  const fetchInitialBooks = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando libros iniciales...');
      const response = await fetch('/api/books?limit=50');
      if (response.ok) {
        const booksData = await response.json();
        console.log(`✅ ${booksData.length} libros cargados`);
        setBooks(booksData);
      } else {
        console.error('❌ Error al cargar libros:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching initial books:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando libros...</span>
            </div>
          ) : (
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
            </Routes>
          )}
        </main>
      </div>
    </>
  );
}

export default App;