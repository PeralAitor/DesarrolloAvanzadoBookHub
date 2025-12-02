// AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email:'', password:'', nombre:'' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || 'Error');
        setLoading(false);
        return;
      }
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      if (onLogin) onLogin(data.user, data.token);
      nav('/profile');
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Bienvenido de nuevo a BookHub' : 'Únete a nuestra comunidad de lectores'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input 
                  value={form.nombre} 
                  onChange={e=>setForm({...form,nombre:e.target.value})}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input 
                value={form.email} 
                onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="tu@email.com"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input 
                value={form.password} 
                onChange={e=>setForm({...form,password:e.target.value})}
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={()=>{ setIsLogin(!isLogin); setError(null); }} 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;