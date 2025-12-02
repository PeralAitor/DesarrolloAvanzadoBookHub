import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout, searchTerm, onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="glass-card sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-gradient">BookHub</span>
          </Link>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar libros, autores, géneros..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-6 py-3 pl-12 pr-6 rounded-2xl border border-white/30 
                         bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 
                         focus:ring-primary-500/20 focus:border-primary-500/30 
                         placeholder-gray-500 transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/catalog" 
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50"
            >
              Catálogo
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50"
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={onLogout}
                  className="btn-secondary"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/profile" className="btn-primary">
                Iniciar Sesión
              </Link>
            )}
          </nav>

          {/* Menú móvil */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-slide-up">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/catalog" 
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50"
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-500 hover:text-red-600 text-left px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link 
                  to="/profile" 
                  className="text-primary-600 hover:text-primary-700 font-medium px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;