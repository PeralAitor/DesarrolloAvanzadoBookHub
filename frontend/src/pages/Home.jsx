// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

const Home = ({ books }) => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    const featured = books.slice(0, 6);
    const recent = books.slice(-6);
    setFeaturedBooks(featured);
    setRecentBooks(recent);
  }, [books]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl gradient-bg text-white p-12 
                        shadow-2xl animate-fade-in">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Descubre tu próxima{' '}
            <span className="text-yellow-300">aventura literaria</span>
          </h1>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Explora miles de libros, comparte tus reseñas y conecta con una comunidad 
            apasionada por la lectura. Tu próxima historia favorita te espera.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/catalog"
              className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold 
                       shadow-2xl hover:shadow-3xl transform hover:scale-105 
                       transition-all duration-300 text-center"
            >
              Explorar Catálogo
            </Link>
            <Link
              to="/profile"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold 
                       hover:bg-white hover:text-primary-600 transition-all duration-300 text-center"
            >
              Unirse a la Comunidad
            </Link>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <div className="absolute top-1/4 right-1/4 text-9xl">📚</div>
          <div className="absolute bottom-1/4 right-1/3 text-7xl">✨</div>
        </div>
      </section>

      {/* Libros Destacados */}
      <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Libros Destacados
            </h2>
            <p className="text-gray-600">Lo más popular entre nuestros lectores</p>
          </div>
          <Link 
            to="/catalog" 
            className="btn-secondary hidden sm:inline-flex"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBooks.map((book, index) => (
            <div 
              key={book.id} 
              className="animate-fade-in" 
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </section>

      {/* Libros Recientes */}
      <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Recién Llegados
            </h2>
            <p className="text-gray-600">Las últimas incorporaciones a nuestra biblioteca</p>
          </div>
          <Link 
            to="/catalog" 
            className="btn-secondary hidden sm:inline-flex"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBooks.map((book, index) => (
            <div 
              key={book.id} 
              className="animate-fade-in" 
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="glass-card rounded-3xl p-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-gradient mb-2">1,234+</div>
            <div className="text-gray-600">Libros Disponibles</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-gradient mb-2">5,678+</div>
            <div className="text-gray-600">Reseñas Publicadas</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-gradient mb-2">890+</div>
            <div className="text-gray-600">Lectores Activos</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-gradient mb-2">50+</div>
            <div className="text-gray-600">Géneros Literarios</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;