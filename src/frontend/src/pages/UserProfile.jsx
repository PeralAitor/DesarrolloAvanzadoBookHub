// UserProfile.jsx
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

  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    nombre: '', 
    email: '', 
    currentPassword: '', 
    newPassword: '' 
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

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

  // Inicializar formulario de perfil cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setProfileForm({
        nombre: user.nombre || user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

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

  // Función para manejar la edición del perfil
  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        nombre: profileForm.nombre,
        email: profileForm.email
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error al actualizar el perfil');
      }

      // Actualizar el usuario en el estado global y localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) onLogin(data.user, token);
      }

      setProfileSuccess('Perfil actualizado correctamente');
      setIsEditingProfile(false);
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));

    } catch (err) {
      setProfileError(err.message || 'Error al actualizar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      nombre: user.nombre || user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: ''
    });
    setProfileError(null);
    setProfileSuccess(null);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* User Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(user.nombre || user.name || 'U').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{user.nombre || user.name || 'Usuario'}</h1>
                  <p className="text-gray-600 text-lg">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {recentReviews.length} reseñas
                    </span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                      Miembro
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar Perfil</span>
              </button>
            </div>

            {/* Formulario de edición de perfil */}
            {isEditingProfile && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar Información de Perfil</h3>
                
                {profileError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleProfileEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={profileForm.nombre}
                        onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña actual (para cambiar contraseña)
                      </label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Dejar en blanco para no cambiar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Dejar en blanco para no cambiar"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Mis Reseñas</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {recentReviews.length} total
              </span>
            </div>

            {actionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {actionError}
              </div>
            )}

            {recentReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">Aún no has publicado reseñas</p>
                <p className="text-gray-400">Comienza explorando el catálogo y comparte tus opiniones</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentReviews.map(review => {
                  const isEditing = String(editingId) === String(review.id);
                  return (
                    <div key={review.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {review.bookTitle || 'Libro'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : ''}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500 text-lg">
                          {'★'.repeat(Math.round(review.rating || 0))}
                          <span className="text-gray-400 text-sm ml-2">({review.rating || 0})</span>
                        </div>
                      </div>

                      {!isEditing ? (
                        <>
                          <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => startEdit(review)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200"
                            >
                              Editar reseña
                            </button>
                            <button 
                              onClick={() => deleteReview(review.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={submitEdit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Puntuación
                            </label>
                            <select 
                              value={editForm.rating} 
                              onChange={(e)=>setEditForm({...editForm, rating: Number(e.target.value)})} 
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {[5,4,3,2,1].map(n => (
                                <option key={n} value={n}>{n} ★ - {n === 5 ? 'Excelente' : n === 4 ? 'Muy Bueno' : n === 3 ? 'Bueno' : n === 2 ? 'Regular' : 'Malo'}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tu reseña
                            </label>
                            <textarea 
                              value={editForm.text} 
                              onChange={(e)=>setEditForm({...editForm, text: e.target.value})} 
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                              rows="4"
                              placeholder="Comparte tu opinión sobre este libro..."
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button 
                              type="submit" 
                              disabled={actionLoading}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2"
                            >
                              {actionLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  <span>Guardando...</span>
                                </>
                              ) : (
                                'Guardar cambios'
                              )}
                            </button>
                            <button 
                              type="button" 
                              onClick={cancelEdit}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {success}
            </div>
          )}

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tu nombre"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
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
                  <span>{isLogin ? 'Iniciando...' : 'Registrando...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ nombre: '', email: '', password: '' });
                setError(null);
                setSuccess(null);
              }}
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

export default UserProfile;