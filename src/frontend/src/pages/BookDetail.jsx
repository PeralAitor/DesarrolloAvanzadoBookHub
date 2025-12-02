// BookDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BookDetail = ({ user }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const maskId = (v='') => {
    if (!v) return '';
    return v.includes('@') ? v : (String(v).slice(0,6) + '...' + String(v).slice(-4));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
      {error}
    </div>
  );
  if (!book) return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-xl text-center">
      Libro no encontrado
    </div>
  );

  // Calcular rating promedio
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.calificación || review.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  // Función helper para obtener valores de diferentes nombres de campo
  const getBookField = (book, fieldNames) => {
    for (const field of fieldNames) {
      if (book[field] !== undefined && book[field] !== null) {
        return book[field];
      }
    }
    return null;
  };

  // Obtener datos del libro usando los nombres de campo de la BD
  const titulo = getBookField(book, ['titulo', 'title', 'nombre']) || 'Título no disponible';
  const autor = getBookField(book, ['autor', 'author']) || 'Autor no disponible';
  const genero = getBookField(book, ['genero', 'genre', 'categoria']) || 'Género no disponible';
  const descripcion = getBookField(book, ['descripcion', 'description', 'sinopsis']) || '';
  const anioPublicacion = getBookField(book, ['anio_publicacion', 'anio', 'publishedYear', 'year']) || 'Año no disponible';
  const editorial = getBookField(book, ['editorial', 'publisher']) || 'Editorial no disponible';
  const isbn = getBookField(book, ['isbn']) || 'ISBN no disponible';

  // Generar color de gradiente basado en el título
  const generateGradient = (text) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-blue-600',
      'from-red-500 to-orange-600'
    ];
    const index = text.length % colors.length;
    return colors[index];
  };

  const gradientClass = generateGradient(titulo);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Book Header - Rediseñado */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
        <div className={`bg-gradient-to-br ${gradientClass} p-8 text-white`}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">{titulo}</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-6">por {autor}</p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-2">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {genero}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {anioPublicacion}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {editorial}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Información Principal */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {descripcion || 'No hay descripción disponible para este libro.'}
                </p>
              </div>

              {/* Detalles del Libro */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detalles del Libro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">📚</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Editorial</p>
                      <p className="font-medium text-gray-800">{editorial}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold">🔢</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ISBN</p>
                      <p className="font-mono font-medium text-gray-800">{isbn}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-purple-600 font-bold">🏷️</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Género</p>
                      <p className="font-medium text-gray-800">{genero}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-yellow-600 font-bold">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Año de Publicación</p>
                      <p className="font-medium text-gray-800">{anioPublicacion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas y Rating */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Estadísticas</h3>
                
                <div className="space-y-6">
                  {/* Rating Promedio */}
                  <div className="text-center">
                    <div className="inline-flex items-baseline mb-2">
                      <span className="text-5xl font-bold text-gray-800 mr-2">{averageRating}</span>
                      <span className="text-gray-500 text-lg">/5</span>
                    </div>
                    <div className="flex justify-center mb-2 text-2xl text-yellow-500">
                      {'★'.repeat(Math.round(averageRating))}
                      {'☆'.repeat(5 - Math.round(averageRating))}
                    </div>
                    <p className="text-sm text-gray-500">Rating promedio</p>
                  </div>

                  {/* Número de Reseñas */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{reviews.length}</div>
                    <p className="text-sm text-blue-700">Reseñas totales</p>
                  </div>

                  {/* Distribución de Ratings */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">Distribución de ratings</h4>
                    <div className="space-y-2">
                      {[5,4,3,2,1].map(stars => {
                        const count = reviews.filter(r => (r.calificación || r.rating || 0) === stars).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center text-sm">
                            <span className="w-8 text-yellow-500">{stars}★</span>
                            <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-gray-500 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Mantenemos el mismo diseño pero mejoramos el espaciado */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Reseñas de la Comunidad</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {reviews.length} reseñas
              </span>
            </div>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">Aún no hay reseñas</p>
                <p className="text-gray-400">Sé el primero en compartir tu opinión sobre este libro</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id || review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {(review.usuario_email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {review.usuario_email || maskId(review.usuario_id) || 'Usuario Anónimo'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.fecha || Date.now()).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500 text-lg">
                        {'★'.repeat(review.calificación || review.rating || 0)}
                        <span className="text-gray-400 text-sm ml-2">
                          ({review.calificación || review.rating || 0}/5)
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comentario || review.text || review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Review Section - Mantenemos igual */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Añadir Reseña</h3>

            {reviewError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puntuación</label>
                <select 
                  name="rating" 
                  defaultValue="5" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {[5,4,3,2,1].map(n => (
                    <option key={n} value={n}>
                      {n} ★ - {n === 5 ? 'Excelente' : n === 4 ? 'Muy Bueno' : n === 3 ? 'Bueno' : n === 2 ? 'Regular' : 'Malo'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu reseña</label>
                <textarea 
                  name="text" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  rows="5" 
                  placeholder="Comparte tu opinión sobre este libro..."
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={reviewLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {reviewLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <span>Publicar Reseña</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {!user && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                <p className="font-medium">💡 Inicia sesión para publicar reseñas</p>
                <p className="mt-1">Necesitas tener una cuenta para compartir tu opinión sobre los libros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;