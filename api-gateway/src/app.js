const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');

const app = express();

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

// Proxy configuration
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
      // devolver 502 para errores de upstream
      res.status(502).json({ error: 'Servicio de reseñas no disponible', details: err && err.message });
    } else {
      try { res.end(); } catch(e) {}
    }
  }
}));

// Nuevo proxy para autenticación
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_TARGET,
  changeOrigin: true,
  logLevel: 'debug',

  // tiempo de espera del proxy (ms)
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
    // responder si aún no se ha enviado cabecera
    if (!res.headersSent) {
      res.status(502).json({ error: 'Servicio de autenticación no disponible' });
    } else {
      try { res.end(); } catch(e) {}
    }
  }
}));

// Ahora aplicamos parseo JSON sólo para rutas internas (si las hay)
// o después de los proxies para evitar consumir el stream antes del proxy
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check realizado');
  res.json({ status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway ejecutándose en puerto ${PORT}`);
});