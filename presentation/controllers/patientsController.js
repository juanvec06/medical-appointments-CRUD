/**
 * @fileoverview Este archivo contiene el controlador de Express para las rutas relacionadas con los pacientes.
 * Define los endpoints para las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) de pacientes.
 * @module presentation/controllers/patientsController
 */

const express = require('express');
const router = express.Router();
const patientService = require('../../domain/services/patientService');
const Joi = require('joi');

/**
 * @description Esquema de validación de Joi para los datos de un paciente.
 * Se utiliza para asegurar que los datos recibidos en las peticiones POST y PUT
 * tengan el formato y los tipos correctos antes de ser procesados por el servicio.
 * @const {object}
 */
const schema = Joi.object({
    id: Joi.number().integer().required(),
    name_patient: Joi.string().required(),
    phone_patient: Joi.string().allow(null, ''),
    email_patient: Joi.string().email().allow(null, '')
});

/**
 * @route   GET /api/patients
 * @desc    Obtiene una lista de todos los pacientes.
 * @access  Public
 */
router.get('/', (req, res) => res.json(patientService.list()));

/**
 * @route   GET /api/patients/:id
 * @desc    Obtiene un paciente específico por su ID.
 * @access  Public
 * @param   {object} req - El objeto de solicitud de Express.
 * @param   {object} req.params - Parámetros de la ruta.
 * @param   {string} req.params.id - El ID del paciente a buscar.
 * @returns {object} 200 - El objeto del paciente encontrado.
 * @returns {object} 404 - Si no se encuentra ningún paciente con ese ID.
 */
router.get('/:id', (req, res) => {
    const patient = patientService.get(Number(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
});

/**
 * @route   POST /api/patients
 * @desc    Crea un nuevo paciente.
 * @access  Public
 * @param   {object} req - El objeto de solicitud de Express.
 * @param   {object} req.body - El cuerpo de la solicitud, debe contener los datos del paciente que coinciden con el esquema.
 * @returns {object} 201 - El objeto del paciente recién creado.
 * @returns {object} 400 - Si los datos del cuerpo no pasan la validación de Joi.
 * @returns {object} 409 - Si ya existe un paciente con el mismo ID.
 */
router.post('/', (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    try {
        const existingPatient = patientService.get(value.id);
        if (existingPatient) {
            return res.status(409).json({ error: `El paciente con ID ${value.id} ya existe.` });
        }
        
        const created = patientService.create(value);
        res.status(201).json(created);

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: `El paciente con ID ${value.id} ya existe.` });
        }
        // Para otros errores, usamos el middleware de error genérico
        next(err);
    }
});

/**
 * @route   PUT /api/patients/:id
 * @desc    Actualiza un paciente existente.
 * @access  Public
 * @param   {object} req - El objeto de solicitud de Express.
 * @param   {string} req.params.id - El ID del paciente a actualizar.
 * @param   {object} req.body - El cuerpo de la solicitud con los datos actualizados del paciente.
 * @returns {object} 200 - El objeto del paciente actualizado.
 * @returns {object} 400 - Si los datos del cuerpo no son válidos o si el ID de la URL no coincide con el del cuerpo.
 * @returns {object} 404 - Si no se encuentra el paciente a actualizar.
 */
router.put('/:id', (req, res) => {
    if (Number(req.params.id) !== req.body.id) {
        return res.status(400).json({ error: 'El ID en la URL y en el cuerpo de la petición no coinciden.' });
    }
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    
    const updated = patientService.update(Number(req.params.id), value);
    if (!updated) {
        return res.status(404).json({ error: 'No se encontró el paciente para actualizar.' });
    }
    res.json(updated);
});

/**
 * @route   DELETE /api/patients/:id
 * @desc    Elimina un paciente por su ID.
 * @access  Public
 * @param   {object} req - El objeto de solicitud de Express.
 * @param   {string} req.params.id - El ID del paciente a eliminar.
 * @returns {object} 204 - Respuesta vacía que indica éxito en la eliminación.
 * @returns {object} 404 - Si no se encuentra el paciente a eliminar.
 */
router.delete('/:id', (req, res) => {
    const ok = patientService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;