# BookHub - Plataforma de Libros

## 📖 Descripción
BookHub es una aplicación web para explorar libros y gestionar reseñas, construida con arquitectura de microservicios.

## 🏗️ Estructura

### Frontend
- **Tecnología**: React
- **Puerto**: 5173

### API Gateway
- **Tecnología**: Node.js
- **Puerto**: 3000
- **Función**: Punto de entrada único

### Microservicios
- **Books**: Gestión de libros (Python + FastAPI + MySQL + Open Library API)
- **Reviews**: Gestión de reseñas (Node.js + MongoDB)
- **Auth**: Autenticación de usuarios (Node.js + MongoDB)

## 🔄 Flujo de Datos
Frontend → API Gateway → Microservicios

El frontend solo se comunica con el API Gateway, que redirige las peticiones al microservicio correspondiente.

## 🚀 Inicio Rápido Local

### Prerrequisitos
- Docker Desktop ejecutándose
- Git instalado

### 1. Clonar y ejecutar el proyecto

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd BookHub

# Ejecutar todos los servicios (desde la carpeta con docker-compose.yml)
docker-compose up --build 
```

### 2. Acceder a la aplicación localmente
- **Frontend (via Nginx)**: http://localhost
- **Frontend (directo)**: http://localhost:5173
- **API Gateway**: http://localhost:3000

## Acceso Público desde Internet
Usando Ngrok (Para compartir con compañeros)

- Descargar Ngrok desde https://ngrok.com/download

**Ejecutar en terminal**:

ngrok http 80
Compartir la URL que aparece en "Forwarding"

URLs públicas generadas
- **🌐 Frontend público**: https://xxxx-xxxx.ngrok-free.dev

## 📡 Consultar la API
Visita http://localhost:3000/api-docs para ver todos los endpoints disponibles con Swagger UI.