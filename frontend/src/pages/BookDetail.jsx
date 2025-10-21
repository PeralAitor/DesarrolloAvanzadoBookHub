import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BookDetail = ({ user }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // nuevo estado para mensajes del formulario de reseña
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener el libro');
      const data = await res.json();
      setBook(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el libro');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('No se pudieron obtener las reseñas');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('fetchReviews error', err);
    }
  };

  useEffect(() => {
    fetchBook();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!user) {
      setReviewError('Debes iniciar sesión para publicar una reseña.');
      return;
    }

    const form = e.target;
    const text = form.elements['text'].value;
    const rating = Number(form.elements['rating'].value);

    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ bookId: id, text, rating })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || data.message || 'Error publicando reseña';
        setReviewError(msg);
        setReviewLoading(false);
        return;
      }

      setReviewSuccess('Reseña publicada correctamente.');
      form.reset();
      // añadir la nueva reseña si viene en la respuesta
      if (data && (data._id || data.id)) {
        setReviews(prev => [data, ...prev]);
      } else {
        fetchReviews();
      }
    } catch (err) {
      setReviewError('Error de red. Intenta de nuevo.');
    } finally {
      setReviewLoading(false);
    }
  };

  // helper para ocultar token si por error está en usuario_id
  const maskId = (v='') => {
    if (!v) return '';
    // si es email, devolver entero; si parece token largo, mostrar solo inicio...
    return v.includes('@') ? v : (String(v).slice(0,6) + '...' + String(v).slice(-4));
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!book) return <div className="p-6">Libro no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-2">{book.title}</h1>
        <p className="text-sm text-gray-500 mb-4">{book.author}</p>
        <p className="text-gray-700 mb-6">{book.description}</p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Reseñas</h2>
          {reviews.length === 0 && <p className="text-sm text-gray-500">Aún no hay reseñas. Sé el primero.</p>}
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id || r.id || `${r.usuario_id}-${r.fecha}`} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {r.usuario_email || r.usuario_nombre || maskId(r.usuario_id) || 'Usuario'}
                  </div>
                  <div className="text-sm text-yellow-500">{'★'.repeat(r.calificación || r.rating || 0)}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(r.fecha || Date.now()).toLocaleString()}</div>
                <p className="mt-2 text-gray-700 text-sm">{r.comentario || r.text || r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Publicar reseña</h3>

        {reviewError && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{reviewError}</div>}
        {reviewSuccess && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{reviewSuccess}</div>}

        <form onSubmit={handleReviewSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Puntuación</label>
            <select name="rating" defaultValue="5" className="border px-2 py-1 rounded w-full">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Tu reseña</label>
            <textarea name="text" className="w-full border px-3 py-2 rounded" rows="4" required />
          </div>

          <div>
            <button type="submit" disabled={reviewLoading} className="w-full bg-blue-600 text-white px-4 py-2 rounded">
              {reviewLoading ? 'Publicando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default BookDetail;