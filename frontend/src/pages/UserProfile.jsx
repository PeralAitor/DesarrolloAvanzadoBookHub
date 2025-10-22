import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const normalizeReview = (r) => ({
  id: r._id || r.id || r._rid,
  bookId: r.libro_id || r.bookId || r.book_id || r.book,
  bookTitle: r.bookTitle || r.title || r.bookTitle || '',
  rating: r.calificación ?? r.rating ?? r.rate ?? 0,
  text: r.comentario ?? r.text ?? r.comment ?? '',
  createdAt: r.fecha || r.createdAt || r.date || null,
  raw: r
});

const UserProfile = ({ user, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });

  const [recentReviews, setRecentReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, text: '' });
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && !user) {
      try { onLogin(JSON.parse(savedUser), token); } catch {}
    }

    const fetchUserReviews = async () => {
      if (!user) return;
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/reviews?user=${encodeURIComponent(user._id || user.id || user.email)}`, { headers });
        if (!res.ok) {
          const body = await res.json().catch(()=>({}));
          setError(body.error || 'No se pudieron obtener las reseñas');
          return;
        }
        const body = await res.json();
        const reviewsArray = Array.isArray(body) ? body : (Array.isArray(body.reviews) ? body.reviews : []);
        const normalized = await Promise.all(reviewsArray.map(async (r) => {
          const nr = normalizeReview(r);
          if (nr.bookTitle) return nr;
          const bookId = nr.bookId;
          if (!bookId) return nr;
          try {
            const b = await fetch(`/api/books/${encodeURIComponent(bookId)}`);
            if (!b.ok) return nr;
            const bd = await b.json();
            nr.bookTitle = bd.title || bd.name || bd.titulo || nr.bookTitle || 'Libro';
            return nr;
          } catch {
            return nr;
          }
        }));
        setRecentReviews(normalized.slice(0, 50));
      } catch (err) {
        setError('Error de red al cargar reseñas.');
      }
    };

    fetchUserReviews();
  }, [user, onLogin]);

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating || 5, text: review.text || '' });
    setActionError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, text: '' });
    setActionError(null);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ rating: editForm.rating, text: editForm.text })
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Error actualizando reseña');
        setActionLoading(false);
        return;
      }
      const updated = normalizeReview(data);
      const prev = recentReviews.find(r => String(r.id) === String(updated.id)) || {};
      if (!updated.bookTitle && prev.bookTitle) updated.bookTitle = prev.bookTitle;
      setRecentReviews(prevArr => prevArr.map(r => String(r.id) === String(updated.id) ? updated : r));
      setEditingId(null);
    } catch (err) {
      setActionError('Error de red al actualizar reseña');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (id) => {
    setActionError(null);
    if (!confirm('¿Deseas eliminar esta reseña?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        setActionError(body.error || 'Error eliminando reseña');
        setActionLoading(false);
        return;
      }
      setRecentReviews(prev => prev.filter(r => String(r.id) !== String(id)));
    } catch (err) {
      setActionError('Error de red al eliminar reseña');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || data.message || 'Error en la petición';
        setError(msg);
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      if (onLogin) onLogin(data.user || null, data.token || localStorage.getItem('token'));

      setSuccess(isLogin ? 'Inicio de sesión correcto.' : 'Registro completado correctamente.');
      setLoading(false);
      navigate('/profile');
    } catch (err) {
      setError('Error de red. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {(user.nombre || user.name || 'U').slice(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.nombre || user.name || 'Usuario'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Reseñas recientes</h3>

          {actionError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{actionError}</div>}

          {recentReviews.length === 0 ? (
            <p className="text-sm text-gray-500">No hay reseñas recientes.</p>
          ) : (
            <ul className="space-y-3">
              {recentReviews.map(r => {
                const isEditing = String(editingId) === String(r.id);
                return (
                  <li key={r.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{r.bookTitle || 'Libro'}</div>
                        <div className="text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                      </div>
                      <div className="text-sm text-yellow-500">{'★'.repeat(Math.round(r.rating || 0))} <span className="text-gray-700 ml-2">{r.rating || 0}</span></div>
                    </div>

                    {!isEditing ? (
                      <>
                        <p className="mt-2 text-gray-700 text-sm">{r.text}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => startEdit(r)} className="text-sm text-blue-600 underline">Editar</button>
                          <button onClick={() => deleteReview(r.id)} className="text-sm text-red-600 underline">Eliminar</button>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={submitEdit} className="mt-3 space-y-2">
                        <div>
                          <label className="block text-xs mb-1">Puntuación</label>
                          <select value={editForm.rating} onChange={(e)=>setEditForm({...editForm, rating: Number(e.target.value)})} className="border px-2 py-1 rounded">
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Reseña</label>
                          <textarea value={editForm.text} onChange={(e)=>setEditForm({...editForm, text: e.target.value})} className="w-full border px-3 py-2 rounded" rows="3" />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={actionLoading} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">{actionLoading ? 'Guardando...' : 'Guardar'}</button>
                          <button type="button" onClick={cancelEdit} className="bg-gray-100 px-3 py-1 rounded text-sm">Cancelar</button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {success && <div className="text-green-500 text-sm mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required={!isLogin}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? (isLogin ? 'Iniciando...' : 'Registrando...') : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setFormData({ nombre: '', email: '', password: '' });
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-blue-600 underline"
        >
          {isLogin ? 'Crear una cuenta' : 'Ya tengo cuenta'}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;