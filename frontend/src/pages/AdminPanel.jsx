import React from 'react';

const AdminPanel = ({ user }) => {
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Gestión de Libros</h3>
          <p className="text-gray-600 mb-4">Administra el catálogo de libros</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Gestionar Libros
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
          <p className="text-gray-600 mb-4">Administra usuarios y permisos</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Gestionar Usuarios
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Moderación de Reseñas</h3>
          <p className="text-gray-600 mb-4">Revisa y modera contenido</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Moderar Reseñas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Estadísticas Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <div className="text-gray-600">Libros Totales</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">5,678</div>
            <div className="text-gray-600">Reseñas Totales</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">890</div>
            <div className="text-gray-600">Usuarios Registrados</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">23</div>
            <div className="text-gray-600">Reseñas por Moderar</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;