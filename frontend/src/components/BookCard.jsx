// src/components/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  const rating = book.average_rating || 0;
  
  return (
    <Link 
      to={`/book/${book.id}`} 
      className="glass-card rounded-2xl p-6 card-hover group animate-fade-in"
    >
      <div className="flex space-x-4">
        {/* Portada del libro */}
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-28 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl 
                        flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            {book.portada_url ? (
              <img 
                src={book.portada_url} 
                alt={book.titulo} 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center">
                <span className="text-primary-400 text-2xl font-bold">📚</span>
                <span className="text-primary-400 text-xs block mt-1">Sin portada</span>
              </div>
            )}
          </div>
          <div className="absolute -top-2 -right-2 gradient-bg text-white text-xs 
                        font-bold px-2 py-1 rounded-full shadow-lg">
            {rating.toFixed(1)}
          </div>
        </div>
        
        {/* Información del libro */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
            {book.titulo}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{book.autor}</p>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-2">
              ({book.review_count || 0})
            </span>
          </div>
          
          {/* Género */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 
                        border border-primary-200">
            <span className="text-primary-700 text-xs font-medium">
              {book.genero || 'Sin género'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;