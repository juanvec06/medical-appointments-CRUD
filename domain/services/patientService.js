/**
 * @fileoverview Servicio de dominio para gestionar la lógica de negocio de los pacientes.
 * Este archivo actúa como una capa intermedia entre los controladores (presentación) y el repositorio (acceso a datos),
 * encapsulando la lógica de negocio relacionada con las operaciones CRUD de pacientes.
 * @module domain/services/patientService
 */

const patientRepository = require('../../data-access/repositories/patientRepository');

/**
 * Representa un paciente.
 * @typedef {object} Patient
 * @property {number} id - El número de identificación único del paciente.
 * @property {string} name_patient - El nombre completo del paciente.
 * @property {string|null} phone_patient - El número de teléfono del paciente (opcional).
 * @property {string|null} email_patient - La dirección de correo electrónico del paciente (opcional).
 */

/**
 * @description Objeto que encapsula los métodos del servicio de pacientes.
 * Cada método delega la llamada a la función correspondiente en el repositorio de pacientes.
 */
module.exports = {
    /**
     * Crea un nuevo paciente.
     * @param {Patient} data - El objeto con los datos del paciente a crear.
     * @returns {Patient} El paciente recién creado.
     */
    create: (data) => patientRepository.create(data),

    /**
     * Obtiene una lista de todos los pacientes.
     * @returns {Array<Patient>} Un array con todos los pacientes.
     */
    list: () => patientRepository.findAll(),

    /**
     * Busca y devuelve un paciente por su ID.
     * @param {number} id - El ID del paciente a buscar.
     * @returns {Patient|undefined} El objeto del paciente encontrado o undefined si no se encuentra.
     */
    get: (id) => patientRepository.findById(id),

    /**
     * Actualiza los datos de un paciente existente.
     * @param {number} id - El ID del paciente a actualizar.
     * @param {Partial<Patient>} data - Un objeto con los campos del paciente a actualizar.
     * @returns {Patient|undefined} El paciente actualizado o undefined si no se encontró.
     */
    update: (id, data) => patientRepository.update(id, data),

    /**
     * Elimina un paciente por su ID.
     * @param {number} id - El ID del paciente a eliminar.
     * @returns {boolean} `true` si el paciente fue eliminado con éxito, `false` en caso contrario.
     */
    remove: (id) => patientRepository.delete(id)
};