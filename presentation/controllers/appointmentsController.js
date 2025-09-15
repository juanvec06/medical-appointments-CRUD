/**
 * @fileoverview Rutas de la API para la gestión de citas médicas.
 * Define los endpoints para listar, obtener, crear, actualizar y eliminar citas.
 * Utiliza `appointmentService` como capa de servicios de dominio y Joi para validaciones.
 * @module routes/appointments
 */
const express = require('express');
const router = express.Router();
const appointmentService = require('../../domain/services/appointmentService');
const Joi = require('joi');
/**
 * Esquema de validación para la creación/actualización de citas médicas.
 * - office_id: requerido, entero.
 * - date_appointment: requerido, fecha en formato ISO.
 * - reason_appointment: opcional, puede ser null o string vacío.
 * - patient_ids: array requerido de enteros.
 * @constant {Joi.ObjectSchema}
 */
const schema = Joi.object({
    office_id: Joi.number().integer().required(),
    date_appointment: Joi.string().isoDate().required(),
    reason_appointment: Joi.string().allow(null, ''),
    patient_ids: Joi.array().items(Joi.number().integer()).required()
});
/**
 * Obtiene todas las citas médicas.
 * @name GET /
 * @function
 * @memberof module:routes/appointments
 * @returns {Appointment[]} Lista de citas médicas.
 */
router.get('/', (req, res) => res.json(appointmentService.list()));
/**
 * Obtiene una cita médica por su ID.
 * @name GET /:id
 * @function
 * @memberof module:routes/appointments
 * @param {number} id - ID de la cita médica.
 * @returns {Appointment|404} Cita encontrada o error 404 si no existe.
 */
router.get('/:id', (req, res) => {
    const appointment = appointmentService.get(Number(req.params.id));
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
});
/**
 * Crea una nueva cita médica.
 * @name POST /
 * @function
 * @memberof module:routes/appointments
 * @param {Object} body - Datos de la cita.
 * @param {number} body.office_id - ID del consultorio asociado (requerido).
 * @param {string} body.date_appointment - Fecha de la cita en formato ISO (requerido).
 * @param {string|null} [body.reason_appointment] - Motivo de la cita (opcional).
 * @param {number[]} body.patient_ids - IDs de los pacientes asociados (requerido).
 * @returns {201} Cita creada.
 * @returns {400} Error de validación o de negocio.
 */
router.post('/', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    try {
        const appointmentData = {
            office_id: value.office_id,
            date_appointment: value.date_appointment,
            reason_appointment: value.reason_appointment
        };
        const created = appointmentService.create(appointmentData, value.patient_ids);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * Actualiza una cita médica existente por ID.
 * @name PUT /:id
 * @function
 * @memberof module:routes/appointments
 * @param {number} id - ID de la cita médica a actualizar.
 * @param {Object} body - Datos de la cita.
 * @param {number} body.office_id - ID del consultorio asociado (requerido).
 * @param {string} body.date_appointment - Fecha de la cita en formato ISO (requerido).
 * @param {string|null} [body.reason_appointment] - Motivo de la cita (opcional).
 * @param {number[]} body.patient_ids - IDs de los pacientes asociados (requerido).
 * @returns {Appointment|400} Cita actualizada o error.
 */
router.put('/:id', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    try {
        const appointmentData = {
            office_id: value.office_id,
            date_appointment: value.date_appointment,
            reason_appointment: value.reason_appointment
        };
        const updated = appointmentService.update(Number(req.params.id), appointmentData, value.patient_ids);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
/**
 * Elimina una cita médica por su ID.
 * @name DELETE /:id
 * @function
 * @memberof module:routes/appointments
 * @param {number} id - ID de la cita a eliminar.
 * @returns {204} Eliminación exitosa sin contenido.
 * @returns {404} Cita no encontrada.
 */
router.delete('/:id', (req, res) => {
    const ok = appointmentService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;