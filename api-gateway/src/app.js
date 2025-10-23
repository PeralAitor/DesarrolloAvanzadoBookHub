const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Configuración de Swagger mejorada con schemas reales
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookHub API Gateway',
      version: '1.0.0',
      description: 'API Gateway completo para el ecosistema BookHub - Documentación con schemas reales de los microservicios',
      contact: {
        name: 'BookHub API Support',
        email: 'support@bookhub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.bookhub.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en el formato: Bearer <token>'
        }
      },
      schemas: {
        // Schemas basados en los microservicios reales
        User: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
                  format: 'email',
              description: 'Email del usuario',
              example: 'usuario@ejemplo.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario',
              example: 'user'
            },
            fechaRegistro: {
              type: 'string',
                  format: 'date-time',
              description: 'Fecha de registro del usuario'
            }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del libro'
            },
            titulo: {
              type: 'string',
              description: 'Título del libro',
              example: 'Cien años de soledad'
            },
            autor: {
              type: 'string',
              description: 'Autor del libro',
              example: 'Gabriel García Márquez'
            },
            isbn: {
              type: 'string',
              description: 'ISBN del libro',
              example: '978-8437604947'
            },
            anio_publicacion: {
              type: 'integer',
              description: 'Año de publicación',
              example: 1967
            },
            genero: {
              type: 'string',
              description: 'Género literario',
              example: 'Realismo mágico, Ficción'
            },
            editorial: {
              type: 'string',
              description: 'Editorial',
              example: 'Editorial Sudamericana'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del libro'
            },
            portada_url: {
              type: 'string',
                  format: 'uri',
              description: 'URL de la portada del libro'
            },
            fecha_creacion: {
              type: 'string',
                  format: 'date-time',
              description: 'Fecha de creación del registro'
            }
          }
        },
        Review: {
          type: 'object',
          required: ['libro_id', 'usuario_id', 'calificación', 'comentario'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la reseña'
            },
            libro_id: {
              type: 'string',
              description: 'ID del libro reseñado',
              example: '1'
            },
            usuario_id: {
              type: 'string',
              description: 'ID del usuario que creó la reseña',
              example: 'user123'
            },
            usuario_nombre: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'María García'
            },
            usuario_email: {
              type: 'string',
                  format: 'email',
              description: 'Email del usuario',
              example: 'maria@ejemplo.com'
            },
            calificación: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Calificación de 1 a 5 estrellas',
              example: 5
            },
            comentario: {
              type: 'string',
              maxLength: 1000,
              description: 'Texto de la reseña',
              example: 'Excelente libro, muy bien escrito.'
            },
            fecha: {
              type: 'string',
                  format: 'date-time',
              description: 'Fecha de creación de la reseña'
            },
            likes: {
              type: 'integer',
              description: 'Número de likes',
              example: 10
            },
            estado: {
              type: 'string',
              enum: ['active', 'flagged', 'removed'],
              description: 'Estado de la reseña',
              example: 'active'
            }
          }
        },
        ReviewListResponse: {
          type: 'object',
          properties: {
            reviews: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Review'
              }
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas'
            },
            currentPage: {
              type: 'integer',
              description: 'Página actual'
            },
            total: {
              type: 'integer',
              description: 'Total de reseñas'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            token: {
              type: 'string',
              description: 'Token JWT'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            service: {
              type: 'string',
              example: 'API Gateway'
            },
            database: {
              type: 'string',
              example: 'connected'
            },
            timestamp: {
              type: 'string',
                  format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido'
        },
        NotFoundError: {
          description: 'Recurso no encontrado'
        },
        ForbiddenError: {
          description: 'No tiene permisos para acceder a este recurso'
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados'
        },
        ServerError: {
          description: 'Error interno del servidor'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Operaciones de autenticación y gestión de usuarios'
      },
      {
        name: 'Books',
        description: 'Operaciones relacionadas con libros'
      },
      {
        name: 'Reviews',
        description: 'Operaciones relacionadas con reseñas de libros'
      },
      {
        name: 'Health',
        description: 'Verificación del estado de los servicios'
      }
    ]
  },
  apis: ['./src/app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BookHub API Documentation'
}));

// Configuración de logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'gateway.log' })
  ]
});

// Middleware de logging
app.use((req, res, next) => {
  logger.info('Request recibido', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date()
  });
  next();
});

const BOOKS_TARGET = process.env.BOOKS_SERVICE_URL || 'http://books-service:3001';
const REVIEWS_TARGET = process.env.REVIEWS_SERVICE_URL || 'http://reviews-service:3002';
const AUTH_TARGET = process.env.AUTH_SERVICE_URL || 'http://auth-service:3003';

// =============================================
// DOCUMENTACIÓN Y PROXY PARA SERVICIO DE AUTH
// =============================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "password123"
 *                 description: Contraseña (mínimo 6 caracteres)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: El usuario ya existe o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     description: Valida un token JWT y retorna la información del usuario
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token inválido"
 */
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_TARGET,
  changeOrigin: true,
  logLevel: 'debug',
  proxyTimeout: 10000,
  timeout: 20000,
  onProxyReq: (proxyReq, req, res) => {
    logger.info('Proxy -> auth-service request', { method: req.method, url: req.url, ip: req.ip });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('Proxy <- auth-service response', { statusCode: proxyRes.statusCode, url: req.url });
  },
  onError: (err, req, res) => {
    logger.error('Error en servicio de autenticación', { error: err.message, url: req.url });
    if (!res.headersSent) {
      res.status(502).json({ error: 'Servicio de autenticación no disponible' });
    } else {
      try { res.end(); } catch(e) {}
    }
  }
}));

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna la información del perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Permite al usuario actualizar su información de perfil
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del usuario
 *                 example: "Juan Pérez Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email del usuario
 *                 example: "nuevoemail@ejemplo.com"
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual (requerida para cambiar contraseña)
 *                 example: "password123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
app.use('/api/users', createProxyMiddleware({
  target: AUTH_TARGET,
  changeOrigin: true,
  logLevel: 'debug',
  proxyTimeout: 10000,
  timeout: 20000,
  onProxyReq: (proxyReq, req, res) => {
    logger.info('Proxy -> auth-service request (users)', { method: req.method, url: req.url, ip: req.ip });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('Proxy <- auth-service response (users)', { statusCode: proxyRes.statusCode, url: req.url });
  },
  onError: (err, req, res) => {
    logger.error('Error en servicio de autenticación (users)', { error: err.message, url: req.url });
    if (!res.headersSent) {
      res.status(502).json({ error: 'Servicio de autenticación no disponible' });
    } else {
      try { res.end(); } catch(e) {}
    }
  }
}));

// =============================================
// DOCUMENTACIÓN Y PROXY PARA SERVICIO DE BOOKS
// =============================================

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Obtener lista de libros
 *     description: Retorna una lista paginada de libros con opciones de filtrado y búsqueda
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Número de elementos a saltar (paginación)
 *         example: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de items por página
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda en título, autor o descripción
 *         example: "Gabriel García"
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *         description: Filtrar por género literario
 *         example: "Ficción"
 *       - in: query
 *         name: autor
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *         example: "Gabriel García Márquez"
 *       - in: query
 *         name: anio_min
 *         schema:
 *           type: integer
 *         description: Año de publicación mínimo
 *         example: 1900
 *       - in: query
 *         name: anio_max
 *         schema:
 *           type: integer
 *         description: Año de publicación máximo
 *         example: 2024
 *     responses:
 *       200:
 *         description: Lista de libros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Obtener un libro específico
 *     description: Retorna la información detallada de un libro por su ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro
 *         example: 1
 *     responses:
 *       200:
 *         description: Libro obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Libro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.use('/api/books', createProxyMiddleware({
  target: BOOKS_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api/books': '/api/v1/books'
  },
  logLevel: 'debug',
  onError: (err, req, res) => {
    logger.error('Error en servicio de libros', { error: err.message, url: req.url });
    res.status(500).json({ error: 'Servicio de libros no disponible' });
  }
}));

// ==============================================
// DOCUMENTACIÓN Y PROXY PARA SERVICIO DE REVIEWS
// ==============================================

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Obtener reseñas
 *     description: Retorna reseñas con opciones de filtrado por libro o usuario
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *         description: Filtrar reseñas por ID de libro
 *         example: "1"
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filtrar reseñas por ID de usuario (requiere autenticación)
 *         example: "user123"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de items por página
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [fecha, likes, calificación]
 *         description: Campo para ordenar los resultados
 *         example: "fecha"
 *       - in: query
 *         name: includeRemoved
 *         schema:
 *           type: boolean
 *         description: Incluir reseñas eliminadas (solo administradores)
 *         example: false
 *     responses:
 *       200:
 *         description: Lista de reseñas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para ver estas reseñas
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/reviews/book/{bookId}:
 *   get:
 *     summary: Obtener reseñas de un libro específico
 *     description: Retorna reseñas paginadas para un libro específico
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del libro
 *         example: "1"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de items por página
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [fecha, likes, calificación]
 *         description: Campo para ordenar los resultados
 *         example: "fecha"
 *     responses:
 *       200:
 *         description: Reseñas del libro obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Obtener reseñas de un usuario específico
 *     description: Retorna reseñas paginadas de un usuario (requiere autenticación)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "user123"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Límite de items por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Reseñas del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo puede ver sus propias reseñas a menos que sea admin
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una nueva reseña
 *     description: Crea una nueva reseña para un libro (requiere autenticación)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libro_id
 *               - calificación
 *               - comentario
 *             properties:
 *               libro_id:
 *                 type: string
 *                 description: ID del libro
 *                 example: "1"
 *               calificación:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación de 1 a 5 estrellas
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Texto de la reseña
 *                 example: "Excelente libro, muy bien escrito."
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Ya existe una reseña para este libro o datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Actualizar una reseña existente
 *     description: Actualiza una reseña existente (solo propietario o admin)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calificación:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nueva calificación
 *                 example: 4
 *               comentario:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Nuevo texto de la reseña
 *                 example: "Buen libro, pero tiene algunos defectos."
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       403:
 *         description: No tiene permisos para editar esta reseña
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Eliminar una reseña
 *     description: Elimina (marca como removida) una reseña (solo propietario o admin)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       204:
 *         description: Reseña eliminada exitosamente
 *       403:
 *         description: No tiene permisos para eliminar esta reseña
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
app.use('/api/reviews', createProxyMiddleware({
  target: REVIEWS_TARGET,
  changeOrigin: true,
  pathRewrite: { '^/api/reviews': '/api/v1/reviews' },
  logLevel: 'debug',
  onError: (err, req, res) => {
    logger.error('Error en servicio de reseñas', {
      error: err && err.message,
      stack: err && err.stack,
      url: req.url
    });
    if (!res.headersSent) {
      res.status(502).json({ error: 'Servicio de reseñas no disponible', details: err && err.message });
    } else {
      try { res.end(); } catch(e) {}
    }
  }
}));

app.use(express.json());

// =============================================
// HEALTH CHECK DEL GATEWAY
// =============================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del API Gateway
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API Gateway funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (req, res) => {
  logger.info('Health check realizado');
  res.json({ 
    status: 'OK', 
    service: 'API Gateway', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway ejecutándose en puerto ${PORT}`);
  logger.info(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});