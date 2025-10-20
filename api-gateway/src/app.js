const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configurar trust proxy para manejar correctamente X-Forwarded-For
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check simple
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Gateway', 
    timestamp: new Date().toISOString() 
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'BookHub API Gateway is running!',
    endpoints: {
      books: '/api/books',
      reviews: '/api/reviews'
    }
  });
});

// Proxy para microservicio de libros - RUTA CORREGIDA
app.use('/api/books', createProxyMiddleware({
  target: 'http://books-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/books': '/api/v1/books'  // Cambiado de '/api/v1' a '/api/v1/books'
  },
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error (books):', err.message);
    res.status(500).json({ 
      error: 'Books service unavailable',
      details: err.message 
    });
  }
}));

// Proxy para microservicio de reseñas - RUTA CORREGIDA
app.use('/api/reviews', createProxyMiddleware({
  target: 'http://reviews-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/reviews': '/api/v1/reviews'  // Cambiado de '/api/v1' a '/api/v1/reviews'
  },
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error (reviews):', err.message);
    res.status(500).json({ 
      error: 'Reviews service unavailable',
      details: err.message 
    });
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});