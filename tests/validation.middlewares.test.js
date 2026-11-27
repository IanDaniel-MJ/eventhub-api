
/**
 * ============================================================
 * EVENTHUB API
 * STORY: EVH-81 - Middlewares de validación
 * TAREA: EVH-85 - Pruebas e integración de middlewares
 * ============================================================
 *
 * OBJETIVO:
 * Verificar mediante pruebas automatizadas el funcionamiento
 * de los middlewares desarrollados para asistentes y eventos.
 *
 * MIDDLEWARES EVALUADOS:
 * - EVH-82: validateAttendee
 * - EVH-83: validateCreateEvent
 * - EVH-84: validatePatchEvent
 * - EVH-84: validateEventStatus
 *
 * También se comprueba que los errores de validación se
 * traduzcan correctamente al español y al inglés.
 *
 * HERRAMIENTAS:
 * - Node.js
 * - node:test
 * - node:assert/strict
 *
 * No se requieren dependencias adicionales.
 *
 * EJECUCIÓN:
 * node --test tests/validation.middlewares.test.js
 *
 * TOTAL DE PRUEBAS: 32
 * ============================================================
 */


// ============================================================
// 1. IMPORTACIÓN DE DEPENDENCIAS
// ============================================================

// Módulo nativo de Node.js para crear pruebas automatizadas.
const test = require('node:test');

// Módulo para realizar comprobaciones estrictas.
const assert = require('node:assert/strict');


// ============================================================
// 2. IMPORTACIÓN DE LOS MIDDLEWARES
// ============================================================

// Middleware que valida los datos de un asistente.
// Se exporta directamente como una función.
const validateAttendee = require(
  '../src/middlewares/validateAttendee'
);

// Middlewares encargados de validar los datos de los eventos.
// Se exportan como propiedades de un objeto.
const {
  validateCreateEvent,
  validatePatchEvent,
  validateEventStatus
} = require('../src/middlewares/validateEvent');

// Middleware que centraliza los errores de la API y
// genera respuestas JSON con soporte para español e inglés.
const errorHandler = require(
  '../src/middlewares/errorHandler'
);

// Funciones que verifican y recuperan las traducciones
// definidas en los archivos de idiomas del proyecto.
const {
  hasTranslation,
  translate
} = require('../src/utils/i18n');


// ============================================================
// 3. FUNCIONES AUXILIARES PARA LAS PRUEBAS
// ============================================================

/**
 * ejecutarMiddleware()
 *
 * OBJETIVO:
 * Ejecutar un middleware simulando una petición HTTP.
 *
 * PARÁMETROS:
 * middleware: función que se desea evaluar.
 * body: datos enviados en el cuerpo de la petición.
 *
 * FUNCIONAMIENTO:
 * 1. Construye un objeto req con los datos recibidos.
 * 2. Crea un objeto res simulado.
 * 3. Ejecuta el middleware.
 * 4. Captura cualquier error enviado mediante next().
 * 5. Devuelve el error para que pueda evaluarse.
 *
 * NOTA:
 * Esta función no realiza una petición HTTP real.
 */
function ejecutarMiddleware(middleware, body) {

  let fueLlamado = false;
  let errorRecibido;

  // Simulación de la petición del cliente.
  const req = {
    body
  };

  // Objeto de respuesta simulado.
  const res = {};

  // Ejecución del middleware.
  middleware(req, res, (error) => {

    // Indica que se ejecutó next().
    fueLlamado = true;

    // Guarda el error, si existe.
    errorRecibido = error;

  });

  // Comprueba que el middleware haya terminado su proceso.
  assert.equal(
    fueLlamado,
    true,
    'El middleware debe llamar a next()'
  );

  return errorRecibido;
}


/**
 * debeAceptar()
 *
 * OBJETIVO:
 * Comprobar que un middleware acepte datos válidos.
 *
 * RESULTADO ESPERADO:
 * El middleware ejecuta next() sin generar un error.
 */
function debeAceptar(middleware, body) {

  const error = ejecutarMiddleware(middleware, body);

  assert.equal(
    error,
    undefined,
    'La solicitud válida no debe generar errores'
  );

}


/**
 * debeRechazar()
 *
 * OBJETIVO:
 * Comprobar que un middleware rechace datos inválidos.
 *
 * RESULTADO ESPERADO:
 * - Código HTTP: 400
 * - Código de error: VALIDATION_ERROR
 */
function debeRechazar(middleware, body) {

  const error = ejecutarMiddleware(middleware, body);

  // Debe existir un error.
  assert.ok(
    error,
    'Se esperaba un error de validación'
  );

  // Debe ser un error HTTP 400.
  assert.equal(
    error.status,
    400
  );

  // Debe utilizar el código de validación definido en la API.
  assert.equal(
    error.code,
    'VALIDATION_ERROR'
  );

}


// ============================================================
// 4. DATOS VÁLIDOS PARA LAS PRUEBAS
// ============================================================

/**
 * Asistente de ejemplo.
 *
 * Contiene los cuatro campos obligatorios:
 * nombre, email, matricula y carrera.
 */
const asistenteValido = {

  nombre: 'Carlos Perez',

  email: 'carlos@ejemplo.com',

  matricula: '2026630001',

  carrera: 'Ingenieria'

};


/**
 * Evento de ejemplo.
 *
 * Incluye todos los campos requeridos para crear un evento.
 *
 * La fecha se genera automáticamente siete días después
 * del momento en que se ejecutan las pruebas.
 *
 * De esta manera evitamos utilizar una fecha fija que
 * eventualmente podría quedar en el pasado.
 */
const eventoValido = {

  titulo: 'Conferencia de tecnologia',

  descripcion: 'Evento universitario',

  tipo: 'conferencia',

  fecha: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString(),

  sede: 'Auditorio principal',

  cupo: 100,

  speakerId: 'ponente-123'

};


// ============================================================
// 5. EVH-82 - VALIDACIÓN DE ASISTENTES
// ============================================================

/**
 * PRUEBA 1
 *
 * Comprueba que un asistente con todos los datos requeridos
 * y un correo electrónico válido pueda continuar.
 */
test('EVH-82: acepta un asistente valido', () => {

  debeAceptar(
    validateAttendee,
    asistenteValido
  );

});


/**
 * PRUEBA 2
 *
 * Comprueba que el middleware rechace una solicitud
 * cuando faltan campos obligatorios.
 */
test('EVH-82: rechaza campos obligatorios faltantes', () => {

  debeRechazar(validateAttendee, {

    nombre: 'Carlos Perez',

    email: 'carlos@ejemplo.com'

  });

});


/**
 * PRUEBA 3
 *
 * Comprueba que el middleware detecte un correo
 * que no cumple el formato requerido.
 */
test('EVH-82: rechaza un correo invalido', () => {

  debeRechazar(validateAttendee, {

    ...asistenteValido,

    email: 'correo-invalido'

  });

});


// ============================================================
// 6. EVH-83 - VALIDACIÓN DE CREACIÓN DE EVENTOS
// ============================================================

/**
 * PRUEBA 4
 *
 * Verifica que un evento con todos los campos válidos,
 * fecha futura y cupo positivo sea aceptado.
 */
test('EVH-83: acepta un evento valido', () => {

  debeAceptar(
    validateCreateEvent,
    eventoValido
  );

});


/**
 * PRUEBA 5
 *
 * Comprueba que el título no pueda enviarse vacío
 * durante la creación de un evento.
 */
test('EVH-83: rechaza campos faltantes', () => {

  debeRechazar(validateCreateEvent, {

    ...eventoValido,

    titulo: ''

  });

});


/**
 * PRUEBA 6
 *
 * Verifica que solo se admitan los tipos:
 * conferencia, taller y seminario.
 */
test('EVH-83: rechaza un tipo invalido', () => {

  debeRechazar(validateCreateEvent, {

    ...eventoValido,

    tipo: 'concierto'

  });

});


/**
 * PRUEBA 7
 *
 * Comprueba que la capacidad del evento
 * deba ser un número entero mayor que cero.
 */
test('EVH-83: rechaza cupo igual a cero', () => {

  debeRechazar(validateCreateEvent, {

    ...eventoValido,

    cupo: 0

  });

});


/**
 * PRUEBA 8
 *
 * Comprueba que el middleware rechace fechas inexistentes.
 *
 * El 30 de febrero no es una fecha válida.
 */
test('EVH-83: rechaza una fecha invalida', () => {

  debeRechazar(validateCreateEvent, {

    ...eventoValido,

    fecha: '2026-02-30T10:00:00Z'

  });

});


/**
 * PRUEBA 9
 *
 * Verifica que no se puedan crear eventos
 * cuya fecha sea anterior al momento actual.
 */
test('EVH-83: rechaza una fecha pasada', () => {

  debeRechazar(validateCreateEvent, {

    ...eventoValido,

    fecha: '2020-01-01T10:00:00Z'

  });

});


// ============================================================
// 7. EVH-84 - VALIDACIÓN DE ACTUALIZACIÓN PARCIAL
// ============================================================

/**
 * PRUEBA 10
 *
 * Verifica que PATCH permita actualizar únicamente
 * el título del evento.
 */
test('EVH-84: PATCH acepta un titulo valido', () => {

  debeAceptar(validatePatchEvent, {

    titulo: 'Nuevo titulo'

  });

});


/**
 * PRUEBA 11
 *
 * Verifica que PATCH permita actualizar el cupo
 * sin necesidad de enviar los demás campos.
 */
test('EVH-84: PATCH acepta un cupo valido', () => {

  debeAceptar(validatePatchEvent, {

    cupo: 50

  });

});


/**
 * PRUEBA 12
 *
 * Comprueba que no se permita una actualización
 * cuando el cuerpo de la petición esté vacío.
 */
test('EVH-84: PATCH rechaza un objeto vacio', () => {

  debeRechazar(
    validatePatchEvent,
    {}
  );

});


/**
 * PRUEBA 13
 *
 * Comprueba que el estado del evento no pueda
 * modificarse mediante el PATCH general.
 *
 * El estado tiene su propio endpoint.
 */
test('EVH-84: PATCH rechaza modificar estado', () => {

  debeRechazar(validatePatchEvent, {

    estado: 'publicado'

  });

});


/**
 * PRUEBA 14
 *
 * Verifica que el campo tipo solo acepte
 * los valores permitidos.
 */
test('EVH-84: PATCH rechaza un tipo invalido', () => {

  debeRechazar(validatePatchEvent, {

    tipo: 'concierto'

  });

});


/**
 * PRUEBA 15
 *
 * Comprueba que no se permitan propiedades
 * que no forman parte de los campos editables.
 */
test('EVH-84: PATCH rechaza campos desconocidos', () => {

  debeRechazar(validatePatchEvent, {

    precio: 200

  });

});


/**
 * PRUEBA 16
 *
 * Comprueba que los campos de texto no puedan
 * contener únicamente espacios en blanco.
 */
test('EVH-84: PATCH rechaza texto vacio', () => {

  debeRechazar(validatePatchEvent, {

    titulo: '   '

  });

});


/**
 * PRUEBA 17
 *
 * Verifica que el cupo no pueda actualizarse
 * utilizando una cantidad negativa.
 */
test('EVH-84: PATCH rechaza cupo negativo', () => {

  debeRechazar(validatePatchEvent, {

    cupo: -10

  });

});


// ============================================================
// 8. EVH-84 - VALIDACIÓN DE ESTADOS DEL EVENTO
// ============================================================

/**
 * PRUEBAS 18 A 21
 *
 * Comprueba que el middleware permita los cuatro
 * estados definidos en el proyecto:
 *
 * - borrador
 * - publicado
 * - cerrado
 * - cancelado
 *
 * Se utiliza un ciclo para generar una prueba
 * independiente para cada estado.
 */
for (const estado of [

  'borrador',

  'publicado',

  'cerrado',

  'cancelado'

]) {

  test(`EVH-84: STATUS acepta ${estado}`, () => {

    debeAceptar(validateEventStatus, {

      estado

    });

  });

}


/**
 * PRUEBA 22
 *
 * Comprueba que un estado no permitido
 * genere un error HTTP 400.
 */
test('EVH-84: STATUS rechaza un estado invalido', () => {

  debeRechazar(validateEventStatus, {

    estado: 'activo'

  });

});


/**
 * PRUEBA 23
 *
 * Comprueba que el campo estado sea obligatorio
 * para utilizar el endpoint de cambio de estado.
 */
test('EVH-84: STATUS rechaza estado faltante', () => {

  debeRechazar(
    validateEventStatus,
    {}
  );

});


/**
 * PRUEBA 24
 *
 * Verifica que la solicitud de cambio de estado
 * no permita modificar otras propiedades del evento.
 */
test('EVH-84: STATUS rechaza campos adicionales', () => {

  debeRechazar(validateEventStatus, {

    estado: 'publicado',

    titulo: 'Nuevo titulo'

  });

});


// ============================================================
// 9. EVH-85 - FUNCIÓN AUXILIAR PARA TRADUCCIONES
// ============================================================

/**
 * comprobarErrorTraducido()
 *
 * OBJETIVO:
 * Validar el funcionamiento conjunto del middleware
 * de validación y del manejador de errores.
 *
 * PARÁMETROS:
 * middleware: middleware que se desea probar.
 * body: cuerpo de la solicitud.
 * lang: idioma solicitado ('es' o 'en').
 * messageKey: clave de traducción esperada.
 *
 * FUNCIONAMIENTO:
 * 1. Simula una petición con un idioma específico.
 * 2. Ejecuta el middleware de validación.
 * 3. Captura el error generado.
 * 4. Envía el error a errorHandler.
 * 5. Comprueba el código HTTP y la respuesta JSON.
 * 6. Verifica que la traducción exista.
 * 7. Compara el mensaje recibido con el traducido.
 * 8. Comprueba el formato del timestamp.
 *
 * NOTA:
 * Se simula req.lang directamente, por lo que estas pruebas
 * no evalúan la detección automática de idioma desde HTTP.
 */
function comprobarErrorTraducido(
  middleware,
  body,
  lang,
  messageKey
) {

  let httpStatus;
  let respuestaJSON;
  let errorGenerado;
  let siguienteLlamado = false;

  // Guarda las cabeceras enviadas por errorHandler.
  const headers = {};

  // Simulación de la petición HTTP.
  const req = {

    lang,

    body

  };

  // Simulación de los métodos de respuesta de Express.
  const res = {

    /**
     * Guarda una cabecera HTTP.
     *
     * Ejemplo:
     * Content-Language: es
     */
    set(nombre, valor) {

      headers[nombre] = valor;

      return this;

    },

    /**
     * Guarda el código de estado HTTP.
     */
    status(codigo) {

      httpStatus = codigo;

      return this;

    },

    /**
     * Guarda el cuerpo JSON de la respuesta.
     */
    json(datos) {

      respuestaJSON = datos;

      return this;

    }

  };

  // Ejecuta el middleware de validación.
  middleware(req, res, (error) => {

    siguienteLlamado = true;

    // Guarda el error de validación.
    errorGenerado = error;

    // Si existe un error, lo procesa errorHandler.
    if (error) {

      errorHandler(
        error,
        req,
        res,
        () => {}
      );

    }

  });

  // ========================================================
  // COMPROBACIONES
  // ========================================================

  // El middleware debe llamar a next().
  assert.equal(
    siguienteLlamado,
    true,
    'El middleware debe ejecutar next()'
  );

  // Debe haberse generado un error.
  assert.ok(
    errorGenerado,
    'Se esperaba un error de validación'
  );

  // El error HTTP debe ser 400.
  assert.equal(
    httpStatus,
    400
  );

  // La cabecera debe coincidir con el idioma solicitado.
  assert.equal(
    headers['Content-Language'],
    lang
  );

  // Debe existir una respuesta JSON.
  assert.ok(
    respuestaJSON,
    'Se esperaba una respuesta JSON'
  );

  // El objeto JSON debe contener el error.
  assert.ok(
    respuestaJSON.error,
    'La respuesta debe contener la propiedad error'
  );

  // Comprueba el estado HTTP dentro del JSON.
  assert.equal(
    respuestaJSON.error.status,
    400
  );

  // Comprueba el código de error.
  assert.equal(
    respuestaJSON.error.code,
    'VALIDATION_ERROR'
  );

  // Comprueba que el middleware utilice la clave correcta.
  assert.equal(
    errorGenerado.messageKey,
    messageKey,
    'La clave de traducción no coincide'
  );

  // Verifica que exista la traducción en el idioma solicitado.
  assert.equal(
    hasTranslation(lang, messageKey),
    true,
    'No se encontró la traducción solicitada'
  );

  // Obtiene el mensaje que debería devolver la API.
  const mensajeEsperado = translate(
    lang,
    messageKey
  );

  // Compara el mensaje generado con la traducción esperada.
  assert.equal(
    respuestaJSON.error.message,
    mensajeEsperado
  );

  // Verifica que exista un timestamp.
  assert.equal(
    typeof respuestaJSON.error.timestamp,
    'string'
  );

  // Comprueba que pueda interpretarse como una fecha válida.
  assert.ok(
    !Number.isNaN(
      Date.parse(respuestaJSON.error.timestamp)
    ),
    'La respuesta debe contener un timestamp válido'
  );

}


// ============================================================
// 10. EVH-85 - PRUEBAS DE INTERNACIONALIZACIÓN ES/EN
// ============================================================

/**
 * PRUEBAS 25 A 32
 *
 * Se ejecutan cuatro casos de error en dos idiomas:
 *
 * ESPAÑOL (es):
 * 25. Correo inválido de asistente.
 * 26. Tipo inválido al crear un evento.
 * 27. Campo desconocido durante PATCH.
 * 28. Estado inválido de evento.
 *
 * INGLÉS (en):
 * 29. Correo inválido de asistente.
 * 30. Tipo inválido al crear un evento.
 * 31. Campo desconocido durante PATCH.
 * 32. Estado inválido de evento.
 *
 * Cada prueba comprueba el mensaje traducido y
 * el formato de respuesta establecido por la API.
 */
for (const lang of ['es', 'en']) {

  // --------------------------------------------------------
  // ASISTENTES: CORREO ELECTRÓNICO INVÁLIDO
  // --------------------------------------------------------

  test(`EVH-85: asistente con correo invalido en ${lang}`, () => {

    comprobarErrorTraducido(

      validateAttendee,

      {

        ...asistenteValido,

        email: 'correo-invalido'

      },

      lang,

      'validation.attendee.emailInvalid'

    );

  });


  // --------------------------------------------------------
  // EVENTOS: TIPO NO PERMITIDO
  // --------------------------------------------------------

  test(`EVH-85: tipo de evento invalido en ${lang}`, () => {

    comprobarErrorTraducido(

      validateCreateEvent,

      {

        ...eventoValido,

        tipo: 'concierto'

      },

      lang,

      'validation.event.invalidType'

    );

  });


  // --------------------------------------------------------
  // ACTUALIZACIÓN: CAMPO DESCONOCIDO
  // --------------------------------------------------------

  test(`EVH-85: PATCH con campo desconocido en ${lang}`, () => {

    comprobarErrorTraducido(

      validatePatchEvent,

      {

        precio: 200

      },

      lang,

      'validation.event.unknownFields'

    );

  });


  // --------------------------------------------------------
  // ESTADOS: VALOR NO PERMITIDO
  // --------------------------------------------------------

  test(`EVH-85: estado de evento invalido en ${lang}`, () => {

    comprobarErrorTraducido(

      validateEventStatus,

      {

        estado: 'activo'

      },

      lang,

      'validation.event.invalidStatus'

    );

  });

}


// ============================================================
// FIN DEL ARCHIVO DE PRUEBAS
// ============================================================

/**
 * RESULTADOS ESPERADOS:
 *
 * Total de pruebas: 32
 *
 * - EVH-82: 3 pruebas.
 * - EVH-83: 6 pruebas.
 * - EVH-84 PATCH: 8 pruebas.
 * - EVH-84 STATUS: 7 pruebas.
 * - EVH-85 i18n: 8 pruebas.
 *
 * Todas deben finalizar correctamente.
 *
 * COMANDO:
 * node --test tests/validation.middlewares.test.js
 *
 * NOTA:
 * Estas pruebas verifican los middlewares de forma aislada
 * y su interacción con errorHandler.
 *
 * No sustituyen las pruebas HTTP completas que deberán
 * ejecutarse cuando estén disponibles las rutas de eventos
 * y asistentes.
 */
