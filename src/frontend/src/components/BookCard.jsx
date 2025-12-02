// src/components/BookCard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // helper para extraer aliases
  const get = (o, ...keys) => {
    for (const k of keys) {
      if (o == null) continue;
      if (o[k] !== undefined && o[k] !== null) return o[k];
    }
    return undefined;
  };

  const id = String(get(book, 'id', '_id', 'bookId', 'isbn') || '');
  const title = get(book, 'title', 'name', 'titulo', 'nombre') || 'Título desconocido';
  const author = get(book, 'author', 'authors', 'autor', 'authorName') || 'Autor desconocido';
  const createdRaw = get(book, 'createdAt', 'created_at', 'fecha', 'fecha_creacion') || get(book, 'date', null);
  const created = createdRaw ? new Date(createdRaw).toLocaleDateString() : 'Fecha desconocida';
  const genre = get(book, 'genre', 'genero', 'categories', 'category', 'tags') || 'Sin género';

  const initialAvg = get(book, 'average_rating', 'avgRating', 'rating') || 0;
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // si el objeto ya trae rating y count, úsalo si existe
    if (initialAvg && initialAvg > 0 && (book.reviewsCount || book.ratingCount)) {
      setAvg(initialAvg);
      setCount(book.reviewsCount || book.ratingCount || 0);
      return;
    }

    if (!id) {
      setAvg(0);
      setCount(0);
      return;
    }

    let mounted = true;
    const fetchAvg = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reviews?bookId=${encodeURIComponent(id)}`);
        if (!res.ok) {
          setAvg(0);
          setCount(0);
        } else {
          const data = await res.json();
          const reviews = Array.isArray(data) ? data : (data.reviews || []);
          const values = reviews.map(r => Number(r.calificación ?? r.rating ?? 0)).filter(n => !isNaN(n) && n > 0);
          if (!mounted) return;
          if (values.length === 0) {
            setAvg(0);
            setCount(0);
          } else {
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            setAvg(Math.round(average * 10) / 10);
            setCount(values.length);
          }
        }
      } catch (err) {
        if (mounted) {
          setAvg(0);
          setCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAvg();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const renderStars = (val) => {
    const full = Math.round(val);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <Link to={id ? `/books/${id}` : '#'} className="block no-underline text-current">
      <article className="bg-white rounded shadow p-4 h-full flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500">{Array.isArray(author) ? author.join(', ') : author}</p>

          <div className="mt-2 text-xs text-gray-500">
            <span className="mr-3">Creado: <span className="font-medium text-gray-700">{created}</span></span>
            <span>Género: <span className="font-medium text-gray-700">{Array.isArray(genre) ? genre.join(', ') : genre}</span></span>
          </div>

          {book.description || book.sinopsis ? (
            <p className="mt-3 text-sm text-gray-700 line-clamp-3">{book.description || book.sinopsis}</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-yellow-500 font-medium">
            {loading ? '—' : (avg ? `${renderStars(avg)} ${avg}` : 'Sin valoraciones')}
          </div>
          <div className="text-xs text-gray-500">{count > 0 ? `(${count}) valoraciones` : '0 valoraciones'}</div>
        </div>
      </article>
    </Link>
  );
};

export default BookCard;