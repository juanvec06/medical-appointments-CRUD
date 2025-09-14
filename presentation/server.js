/**
 * @fileoverview Archivo principal de configuración y arranque del servidor Express.
 * Este archivo inicializa la aplicación Express, configura los middlewares necesarios (como CORS y JSON parsing),
 * monta los controladores de las rutas de la API y pone en marcha el servidor para escuchar peticiones.
 * @module server
 */

const express = require('express');
const app = express();
const cors = require('cors');

// --- Importación de Controladores ---
const patientsController = require('./controllers/patientsController');
const officesController = require('./controllers/officesController');
const appointmentsController = require('./controllers/appointmentsController');

// --- Configuración de Middlewares Globales ---

/**
 * Middleware para parsear los cuerpos de las solicitudes entrantes con formato JSON.
 * Habilita el acceso a `req.body`.
 */
app.use(express.json());

/**
 * Middleware para habilitar Cross-Origin Resource Sharing (CORS).
 * Permite que el frontend (servido en un origen diferente) pueda hacer peticiones a esta API.
 */
app.use(cors());

// --- Montaje de Rutas de la API ---

/**
 * Monta el controlador de pacientes en la ruta base '/api/patients'.
 * Todas las rutas definidas en `patientsController` estarán prefijadas por esta ruta.
 */
app.use('/api/patients', patientsController);

/**
 * Monta el controlador de consultorios en la ruta base '/api/offices'.
 */
app.use('/api/offices', officesController);

/**
 * Monta el controlador de citas en la ruta base '/api/appointments'.
 */
app.use('/api/appointments', appointmentsController);

// --- Middleware de Manejo de Errores ---

/**
 * Middleware de manejo de errores de tipo "catch-all".
 * Se ejecuta si cualquier ruta anterior llama a `next(err)`.
 * Registra el error en la consola y envía una respuesta genérica de error 500.
 * @param {Error} err - El objeto de error.
 * @param {express.Request} req - El objeto de solicitud de Express.
 * @param {express.Response} res - El objeto de respuesta de Express.
 * @param {express.NextFunction} next - La función para pasar al siguiente middleware.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Arranque del Servidor ---

/**
 * El puerto en el que el servidor escuchará las peticiones.
 * Utiliza el puerto definido en las variables de entorno o el puerto 3000 por defecto.
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Inicia el servidor y lo pone a escuchar en el puerto especificado.
 * Imprime un mensaje en la consola una vez que el servidor está listo.
 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});