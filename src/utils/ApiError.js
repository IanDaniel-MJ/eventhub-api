// Define una clase de error operacional con el formato exigido por la API
class ApiError extends Error {
  constructor(status, code, message) {
    // Inicializa el mensaje en la clase nativa Error
    super(message);

    // Asigna las propiedades requeridas por el contrato de errores
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isOperational = true;

    // Captura la traza limpia excluyendo el constructor de esta clase
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;