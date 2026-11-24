// Registra en consola el método, ruta, código de estado y tiempo de respuesta de cada petición
const logger = (req, res, next) => {
  // Captura el instante inicial en nanosegundos con alta precisión
  const startTime = process.hrtime.bigint();

  // Escucha el cierre de la respuesta para leer el código de estado final real
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    // Calcula la duración transcurrida y la convierte de nanosegundos a milisegundos
    const durationMs = Number(endTime - startTime) / 1e6;
    const timestamp = new Date().toISOString();

    // Muestra el resumen de la petición en consola
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)} ms`
    );
  });

  // Continúa con el siguiente middleware o controlador de la cadena
  next();
};

module.exports = logger;