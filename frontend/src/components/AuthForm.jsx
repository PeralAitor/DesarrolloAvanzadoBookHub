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
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
      {error && <div className="mb-3 p-2 bg-red-50 border text-red-700 rounded text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        {!isLogin && (
          <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}
            placeholder="Nombre" className="w-full border px-3 py-2 rounded" />
        )}
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
          placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
          type="password" placeholder="Contraseña" className="w-full border px-3 py-2 rounded" />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>
      <div className="mt-3 text-sm text-center">
        <button onClick={()=>{ setIsLogin(!isLogin); setError(null); }} className="text-blue-600 underline">
          {isLogin ? 'Crear cuenta' : 'Ya tengo cuenta'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;