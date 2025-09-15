/**
 * @fileoverview Rutas de la API para la gestión de consultorios.
 * Define los endpoints para listar, obtener, crear, actualizar y eliminar consultorios.
 * Utiliza `officeService` como capa de servicios de dominio y Joi para validaciones.
 * @module routes/offices
 */
const express = require('express');
const router = express.Router();
const officeService = require('../../domain/services/officeService');
const Joi = require('joi');
/**
 * Esquema de validación para la creación/actualización de consultorios.
 * - name_office: requerido.
 * - location_office: opcional, puede ser null o string vacío.
 * @constant {Joi.ObjectSchema}
 */
const schema = Joi.object({
    name_office: Joi.string().required(),
    location_office: Joi.string().allow(null, '')
});
/**
 * Obtiene todos los consultorios.
 * @name GET /
 * @function
 * @memberof module:routes/offices
 * @returns {Office[]} Lista de consultorios.
 */
router.get('/', (req, res) => res.json(officeService.list()));
/**
 * Obtiene un consultorio por su ID.
 * @name GET /:id
 * @function
 * @memberof module:routes/offices
 * @param {number} id - ID del consultorio.
 * @returns {Office|404} Consultorio encontrado o error 404 si no existe.
 */
router.get('/:id', (req, res) => {
    const office = officeService.get(Number(req.params.id));
    if (!office) return res.status(404).json({ error: 'Office not found' });
    res.json(office);
});
/**
 * Crea un nuevo consultorio.
 * @name POST /
 * @function
 * @memberof module:routes/offices
 * @param {Object} body - Datos del consultorio.
 * @param {string} body.name_office - Nombre del consultorio (requerido).
 * @param {string|null} [body.location_office] - Ubicación del consultorio (opcional).
 * @returns {201} Consultorio creado.
 * @returns {400} Error de validación.
 */
router.post('/', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const created = officeService.create(value);
    res.status(201).json(created);
});
/**
 * Actualiza un consultorio existente por ID.
 * @name PUT /:id
 * @function
 * @memberof module:routes/offices
 * @param {number} id - ID del consultorio a actualizar.
 * @param {Object} body - Datos del consultorio.
 * @param {string} body.name_office - Nombre del consultorio (requerido).
 * @param {string|null} [body.location_office] - Ubicación del consultorio (opcional).
 * @returns {Office|400} Consultorio actualizado o error de validación.
 */
router.put('/:id', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const updated = officeService.update(Number(req.params.id), value);
    res.json(updated);
});
/**
 * Elimina un consultorio por su ID.
 * @name DELETE /:id
 * @function
 * @memberof module:routes/offices
 * @param {number} id - ID del consultorio a eliminar.
 * @returns {204} Eliminación exitosa sin contenido.
 * @returns {404} Consultorio no encontrado.
 */
router.delete('/:id', (req, res) => {
    const ok = officeService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;