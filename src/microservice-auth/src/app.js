const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
console.log('🔌 Conectando a MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/bookhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB exitosamente');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
});

// Modelo de Usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  fechaRegistro: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    service: 'Auth Service',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    console.log(`📝 Intento de registro: ${email}`);

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ Registro fallido: Email ya registrado - ${email}`);
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = new User({
      nombre,
      email,
      password: hashedPassword
    });

    await user.save();
    
    console.log(`✅ Usuario registrado exitosamente: ${user._id}`);

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('💥 Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Intento de login: ${email}`);

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ Login fallido: Usuario no encontrado - ${email}`);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ Login fallido: Contraseña incorrecta - ${email}`);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log(`✅ Login exitoso: ${user._id}`);
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Buscar usuario para verificar que aún existe
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ valid: false, error: 'Usuario no encontrado' });
    }

    console.log(`✅ Token verificado para usuario: ${user.email}`);
    
    res.json({ 
      valid: true, 
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
});

// Actualizar perfil de usuario
app.put('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { nombre, email, currentPassword, newPassword } = req.body;

    // Actualizar campos básicos
    if (nombre) user.nombre = nombre;
    if (email) user.email = email;

    // Si se proporciona una nueva contraseña, verificar la contraseña actual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'La contraseña actual es requerida para cambiar la contraseña' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    console.log(`✅ Perfil actualizado para usuario: ${user._id}`);

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('💥 Error actualizando perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil de usuario
app.get('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        fechaRegistro: user.fechaRegistro
      }
    });
  } catch (error) {
    console.error('💥 Error obteniendo perfil:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`✅ Auth Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});