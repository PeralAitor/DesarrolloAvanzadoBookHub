// mongo-init.js
db = db.getSiblingDB('bookhub');

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'bookhub'
    },
    {
      role: 'dbAdmin',
      db: 'bookhub'
    }
  ]
});

// Crear algunas colecciones iniciales
db.createCollection('reviews');
db.createCollection('users');

print('MongoDB initialized successfully');