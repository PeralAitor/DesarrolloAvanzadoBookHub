// src/pages/UserProfile.jsx
import React, { useState } from 'react';

const UserProfile = ({ user, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mockUser = {
      _id: '1',
      nombre: formData.nombre || 'Usuario',
      email: formData.email,
      role: 'user'
    };
    const mockToken = 'mock-jwt-token';
    onLogin(mockUser, mockToken);
  };

  if (user) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-gradient mb-8">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del usuario */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user.nombre}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                  <p className="text-lg font-semibold text-gray-800">{user.nombre}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 border border-primary-200">
                    <span className="text-primary-700 font-medium capitalize">{user.role}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Miembro desde</label>
                  <p className="text-lg font-semibold text-gray-800">Enero 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-1">12</div>
              <div className="text-gray-600">Libros Leídos</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-1">8</div>
              <div className="text-gray-600">Reseñas Escritas</div>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-1">4.2</div>
              <div className="text-gray-600">Rating Promedio</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="glass-card rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            {isLogin ? 'Bienvenido de nuevo' : 'Únete a BookHub'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Ingresa a tu cuenta' : 'Crea tu cuenta para comenzar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none 
                         focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 
                         transition-all duration-200"
                placeholder="Tu nombre"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 
                       transition-all duration-200"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 
                       transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-4"
          >
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;