import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';

const Catalog = ({ books, searchTerm, onBooksUpdate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    genero: '',
    autor: '',
    anio_min: '',  // Cambiado de año_min a anio_min
    anio_max: '',  // Cambiado de año_max a anio_max
    rating_min: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Convertir searchParams a objeto
      const paramsObj = Object.fromEntries(searchParams.entries());
      
      // Construir query string con nombres correctos
      const queryParams = new URLSearchParams();
      
      // Mapear parámetros a los nombres que espera el backend
      Object.keys(paramsObj).forEach(key => {
        const value = paramsObj[key];
        if (value) {
          // Usar los nombres correctos que espera el backend
          queryParams.set(key, value);
        }
      });

      const response = await fetch(`/api/books?${queryParams}`);
      if (response.ok) {
        const booksData = await response.json();
        onBooksUpdate(booksData);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Actualizar URL con los filtros usando nombres correctos
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (searchTerm) params.set('search', searchTerm);
    
    setSearchParams(params);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filtros */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
              <input
                type="text"
                value={filters.genero}
                onChange={(e) => handleFilterChange('genero', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filtrar por género"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input
                type="text"
                value={filters.autor}
                onChange={(e) => handleFilterChange('autor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filtrar por autor"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año mínimo</label>
                <input
                  type="number"
                  value={filters.anio_min}
                  onChange={(e) => handleFilterChange('anio_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Año máximo</label>
                <input
                  type="number"
                  value={filters.anio_max}
                  onChange={(e) => handleFilterChange('anio_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2023"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de libros */}
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Catálogo de Libros</h1>
          <p className="text-gray-600">Encuentra tu próximo libro favorito</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(b => (
              <BookCard key={b.id ?? b._id ?? b.isbn ?? Math.random()} book={b} />
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron libros</p>
            <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;