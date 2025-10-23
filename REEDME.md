BookHub - Plataforma de Libros
📖 Descripción
BookHub es una aplicación web para explorar libros y gestionar reseñas, construida con arquitectura de microservicios.

🏗️ Estructura
Frontend: Interfaz web (React) en puerto 5173

API Gateway: (Node.js) Punto de entrada único en puerto 3000

Microservicios:

Books: Gestión de libros (Python + FastAPI + MySQL + Open Library API)

Reviews: Gestión de reseñas (Node.js + MongoDB)

Auth: Autenticación de usuarios (Node.js + MongoDB)

🔄 Flujo de Datos
Frontend → API Gateway → Microservicios
El frontend solo se comunica con el API Gateway, que redirige las peticiones al microservicio correspondiente.

🚀 Inicio Rápido

Docker tiene que estar runeando (Teniendo abierto el docker desktop sirve)

1. Ejecutar el proyecto (A la altura del archivo docker-compose.yml)
docker-compose up --build
2. Acceder a la aplicación
Frontend: http://localhost:5173

📡 Consultar la API
Documentación
Visita http://localhost:3000/api-docs para ver todos los endpoints disponibles con Swagger UI.

Endpoints principales:
GET /api/books - Listar libros

GET /api/books/{id} - Obtener libro específico

GET /api/reviews/book/{bookId} - Reseñas de un libro

POST /api/auth/register - Registrar usuario

POST /api/auth/login - Iniciar sesión