# BookHub - Plataforma de Libros

## 📖 Descripción
BookHub es una aplicación web para explorar libros y gestionar reseñas, construida con arquitectura de microservicios.

## Software que se necesita instalar

### Prerequisitos esenciales
- **Docker Desktop (incluye Docker Engine y Docker Compose)**: Descargar Docker Desktop
- **Git (para clonar el repositorio)**: Descargar Git

## Servicios que se arrancan automaticamente
Al ejecutar Docker Compose, se levantan 8 servicios en contenedores independientes:

- frontend --> React + Nginx --> 5173 -->	Interfaz web del usuario
- api-gateway	--> Node.js + Express	--> 3000 --> Punto de entrada único de todas las APIs
- books-service --> Python + FastAPI --> 3001 --> Microservicio de catálogo de libros
- reviews-service	--> Node.js + Express --> 3002 --> Microservicio de reseñas y comentarios
- auth-service --> Node.js + Express --> 3003 --> Microservicio de autenticación
- mysql --> MySQL 8.0	--> 3306 --> Base de datos relacional para libros
- mongodb --> MongoDB	6.0 --> 27017 --> Base de datos NoSQL para usuarios/reseñas
- nginx --> Nginx	--> 80 --> Proxy inverso para servir el frontend

## Dependencias gestionadas por Docker Compose
No necesitas instalar ninguna dependencia manualmente. Cada contenedor incluye:

- Node.js 18+ para: api-gateway, reviews-service, auth-service

- Python 3.9+ con FastAPI para: books-service

- MySQL 8.0 con base de datos preconfigurada

- MongoDB 6.0 con colecciones inicializadas

- Todas las dependencias de npm/pip instaladas automáticamente

Las dependencias se instalan durante la construcción de las imágenes Docker (docker-compose build).

## Como arrancar toda la aplicación
### Prerequisitos
- Docker Desktop ejecutándose
- Git instalado

### 1. Clonar y ejecutar el proyecto

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd BookHub
cd src

# Ejecutar todos los servicios (desde la carpeta con docker-compose.yml)
docker compose up --build 
```

### 2. Acceder a la aplicación localmente
- **Frontend (via Nginx)**: http://localhost
- **Frontend (directo)**: http://localhost:5173
- **API Gateway**: http://localhost:3000


## 📡 Consultar la API
Visita http://localhost:3000/api-docs para ver todos los endpoints disponibles con Swagger UI.