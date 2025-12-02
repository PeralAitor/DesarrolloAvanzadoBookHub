// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="text-center px-6 max-w-4xl mx-auto">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
            Book<span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Descubre tu próxima aventura literaria
          </p>
        </div>

        {/* Main CTA */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Miles de libros te esperan
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Explora nuestro catálogo, comparte tus reseñas y conecta con una comunidad 
            apasionada por la lectura. Tu próxima historia favorita está a un click de distancia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold 
                       shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 
                       text-lg flex items-center justify-center gap-2"
            >
              <span>Explorar Catálogo</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/profile"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white 
                       px-8 py-4 rounded-2xl font-semibold transition-all duration-300 text-lg
                       flex items-center justify-center gap-2"
            >
              <span>Unirse a la Comunidad</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Catálogo Completo</h3>
            <p className="text-gray-600 text-sm">Miles de libros organizados por género y autor</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Reseñas Reales</h3>
            <p className="text-gray-600 text-sm">Opiniones de lectores como tú</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Comunidad Activa</h3>
            <p className="text-gray-600 text-sm">Conecta con otros amantes de la lectura</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;