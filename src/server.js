require('dotenv').config();
const app = require('./app');

// Obtiene el puerto y entorno configurados o asigna valores por defecto
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Inicia el servidor HTTP escuchando en el puerto definido
app.listen(PORT, () => {
  console.log(`EventHub API corriendo en http://localhost:${PORT} [${NODE_ENV}]`);
});