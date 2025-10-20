const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

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
  libro_id: {
    type: String,
    required: true,
    index: true
  },
  usuario_id: {
    type: String,
    required: true,
    index: true
  },
  calificación: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    required: true,
    maxlength: 1000
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  estado: {
    type: String,
    enum: ['active', 'flagged', 'removed'],
    default: 'active'
  }
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

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = { id: userId, role: userRole };
  next();
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

app.post('/api/v1/reviews', authenticate, async (req, res) => {
  try {
    const { libro_id, calificación, comentario } = req.body;
    
    // Verificar si el usuario ya hizo una reseña para este libro
    const existingReview = await Review.findOne({
      libro_id,
      usuario_id: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }
    
    const review = new Review({
      libro_id,
      usuario_id: req.user.id,
      calificación,
      comentario
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... (el resto de los endpoints se mantienen igual)

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