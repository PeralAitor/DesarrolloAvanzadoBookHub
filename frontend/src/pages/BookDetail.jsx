import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BookDetail = ({ user }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    calificación: 5,
    comentario: ''
  });

  useEffect(() => {
    fetchBookDetails();
    fetchReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`/api/books/${id}`);
      if (response.ok) {
        const bookData = await response.json();
        setBook(bookData);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/book/${id}`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para escribir una reseña');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          libro_id: id,
          ...reviewForm
        })
      });

      if (response.ok) {
        setReviewForm({ calificación: 5, comentario: '' });
        fetchReviews(); // Recargar reseñas
        alert('Reseña publicada exitosamente');
      } else {
        alert('Error al publicar la reseña');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return <div>Libro no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Información del libro */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              {book.portada_url ? (
                <img src={book.portada_url} alt={book.titulo} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-400">Sin portada</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.titulo}</h1>
            <p className="text-xl text-gray-600 mb-4">por {book.autor}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="font-semibold">Género:</span> {book.genero || 'No especificado'}
              </div>
              <div>
                <span className="font-semibold">Año:</span> {book.año_publicacion || 'No especificado'}
              </div>
              <div>
                <span className="font-semibold">Editorial:</span> {book.editorial || 'No especificado'}
              </div>
              <div>
                <span className="font-semibold">ISBN:</span> {book.isbn || 'No especificado'}
              </div>
            </div>

            {book.descripcion && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700">{book.descripcion}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Reseñas</h2>

        {/* Formulario de reseña */}
        {user && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Escribe tu reseña</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Calificación</label>
              <select
                value={reviewForm.calificación}
                onChange={(e) => setReviewForm({ ...reviewForm, calificación: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} estrella{num !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Comentario</label>
              <textarea
                value={reviewForm.comentario}
                onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Comparte tu opinión sobre este libro..."
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Publicar Reseña
            </button>
          </form>
        )}

        {/* Lista de reseñas */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {review.usuario_id ? review.usuario_id.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="font-medium">Usuario {review.usuario_id}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">{'★'.repeat(review.calificación)}</span>
                  <span className="text-gray-400">{'☆'.repeat(5 - review.calificación)}</span>
                </div>
              </div>
              <p className="text-gray-700">{review.comentario}</p>
              <p className="text-gray-500 text-sm mt-2">
                {new Date(review.fecha).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aún no hay reseñas para este libro.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;