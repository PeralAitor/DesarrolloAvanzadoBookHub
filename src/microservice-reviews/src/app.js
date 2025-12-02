const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken'); // <-- añadido

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Conexión a MongoDB con reintentos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/bookhub?authSource=admin';

const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Esquemas de MongoDB
const reviewSchema = new mongoose.Schema({
  libro_id: { type: String, required: true, index: true },
  usuario_id: { type: String, required: true, index: true },
  usuario_nombre: { type: String, required: false, default: '' },
  usuario_email: { type: String, required: false, default: '' }, // <-- nuevo campo
  calificación: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String, required: true, maxlength: 1000 },
  fecha: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  estado: { type: String, enum: ['active','flagged','removed'], default: 'active' }
});

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  preferencias: [String],
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

const Review = mongoose.model('Review', reviewSchema);
const User = mongoose.model('User', userSchema);

// Middleware de autenticación (mejorado: log y compatibilidad con distintos claims)
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret);
      // aceptar userId, id o _id según cómo lo firme el auth-service
      const userId = decoded.userId || decoded.id || decoded._id;
      req.user = { id: userId, role: decoded.role || 'user', raw: decoded };
      return next();
    } catch (err) {
      console.error('JWT verify failed:', err.message, 'token:', (authHeader || '').slice(0,40) + '...');
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  // Fallback a headers personalizados
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.user = { id: userId, role: req.headers['x-user-role'] || 'user' };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

// Endpoints de reseñas
app.get('/api/v1/reviews/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10, sort = 'fecha' } = req.query;
    
    const reviews = await Review.find({ libro_id: bookId, estado: 'active' })
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ libro_id: bookId, estado: 'active' });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/v1/reviews/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Solo permitir ver reseñas propias a menos que sea admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const reviews = await Review.find({ usuario_id: userId })
      .sort({ fecha: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ usuario_id: userId });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Nuevo endpoint GET unificado para /api/v1/reviews (soporta ?bookId=... y ?user=...)
app.get('/api/v1/reviews', async (req, res) => {
  try {
    const { bookId, user: userQuery, page = 1, limit = 10, sort = 'fecha', includeRemoved = 'false' } = req.query;
    const includeRemovedBool = String(includeRemoved).toLowerCase() === 'true';

    const baseFilter = includeRemovedBool ? {} : { estado: 'active' };

    if (bookId) {
      const reviews = await Review.find({ ...baseFilter, libro_id: bookId })
        .sort({ [sort]: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      return res.json(Array.isArray(reviews) ? reviews : []);
    }

    if (userQuery) {
      // verificar token / permisos
      const authHeader = req.headers['authorization'] || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.userId !== userQuery && decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden' });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const reviews = await Review.find({ ...baseFilter, usuario_id: userQuery })
        .sort({ fecha: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      return res.json(Array.isArray(reviews) ? reviews : []);
    }

    // Si no se pasó bookId ni user, devolver últimas reseñas públicas
    const recent = await Review.find({ ...baseFilter })
      .sort({ fecha: -1 })
      .limit(20);
    return res.json(Array.isArray(recent) ? recent : []);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/reviews', authenticate, async (req, res) => {
  try {
    const body = req.body || {};
    const libro_id = body.libro_id || body.bookId || body.book_id || body.book;
    const calificacion = body.calificación ?? body.calificacion ?? body.rating ?? body.rate;
    const comentario = body.comentario ?? body.coment ?? body.text ?? body.comment;

    if (!libro_id || !calificacion || !comentario) {
      return res.status(400).json({ error: 'Campos requeridos: bookId, text, rating' });
    }

    // Buscar reseña existente sin contar las marcadas como 'removed'
    const existingActive = await Review.findOne({
      libro_id,
      usuario_id: req.user.id,
      estado: { $ne: 'removed' }
    });

    if (existingActive) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

    // Si hay una reseña previa marcada como 'removed', reactivar y actualizarla
    const existingRemoved = await Review.findOne({
      libro_id,
      usuario_id: req.user.id,
      estado: 'removed'
    });

    // al crear / reactivar reseña (dentro POST /api/v1/reviews)
    const raw = req.user && req.user.raw ? req.user.raw : {};
    const nombreUsuario = raw.nombre || raw.name || raw.email || `Usuario_${String(req.user.id || '').slice(0,6)}`;
    const emailUsuario = raw.email || raw.mail || '';

    if (existingRemoved) {
      existingRemoved.calificación = Number(calificacion);
      existingRemoved.comentario = comentario;
      existingRemoved.fecha = new Date();
      existingRemoved.estado = 'active';
      existingRemoved.usuario_nombre = existingRemoved.usuario_nombre || nombreUsuario;
      existingRemoved.usuario_email = existingRemoved.usuario_email || emailUsuario; // <-- restaurar email
      await existingRemoved.save();
      return res.status(200).json(existingRemoved);
    }

    // crear nueva reseña
    const review = new Review({
      libro_id,
      usuario_id: req.user.id,
      usuario_nombre: nombreUsuario,
      usuario_email: emailUsuario, // <-- guardar email
      calificación: Number(calificacion),
      comentario
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// EDITAR reseña (solo propietario o admin)
app.put('/api/v1/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const calificacion = body.calificación ?? body.calificacion ?? body.rating ?? body.rate;
    const comentario = body.comentario ?? body.coment ?? body.text ?? body.comment;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (String(review.usuario_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (calificacion !== undefined) review.calificación = Number(calificacion);
    if (comentario !== undefined) review.comentario = comentario;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// BORRAR reseña (propietario o admin) -> marcamos como removed
app.delete('/api/v1/reviews/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (String(review.usuario_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // soft delete
    review.estado = 'removed';
    await review.save();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check mejorado
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'OK', 
      service: 'Reviews', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      service: 'Reviews', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`Reviews service running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Mantener el proceso vivo
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});