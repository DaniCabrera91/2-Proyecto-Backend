const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { dbConnection } = require('./config/config');
const { typeError } = require('./middlewares/errors');

const PORT = process.env.PORT || 3001;

// Configurar CORS para permitir el acceso desde tu frontend
const corsOptions = {
  origin: 'https://tu-frontend-vercel.vercel.app', // Cambia a la URL de tu frontend en Vercel
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept',
  credentials: true, // Si usas cookies o autenticación basada en sesión
};

// Middleware para habilitar CORS
app.use(cors(corsOptions));

// Middleware para el parseo del body
app.use(express.json());

// Conexión a la base de datos
dbConnection();

// Definir las rutas
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));

// Middleware para manejar errores
app.use(typeError);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
