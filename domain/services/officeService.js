/**
 * @fileoverview Servicio de dominio para la gestión de consultorios.
 * Actúa como intermediario entre la capa de repositorios (persistencia)
 * y la capa de rutas/controladores.
 * @module services/officeService
 */
const officeRepository = require('../../data-access/repositories/officeRepository');

module.exports = {
     /**
   * Crea un nuevo consultorio.
   * @function
   * @param {Object} data - Datos del consultorio.
   * @param {string} data.name_office - Nombre del consultorio.
   * @param {string|null} [data.location_office] - Ubicación del consultorio.
   * @returns {Office} Consultorio creado.
   */
    create: (data) => officeRepository.create(data),
    /**
    * Obtiene la lista de todos los consultorios.
    * @function
    * @returns {Office[]} Lista de consultorios.
    */
    list: () => officeRepository.findAll(),
    /**
   * Obtiene un consultorio por su ID.
   * @function
   * @param {number} id - ID del consultorio.
   * @returns {Office|null} Consultorio encontrado o null si no existe.
   */
    get: (id) => officeRepository.findById(id),
    /**
   * Actualiza un consultorio existente.
   * @function
   * @param {number} id - ID del consultorio.
   * @param {Object} data - Nuevos datos del consultorio.
   * @param {string} data.name_office - Nombre del consultorio.
   * @param {string|null} [data.location_office] - Ubicación del consultorio.
   * @returns {Office} Consultorio actualizado.
   */
    update: (id, data) => officeRepository.update(id, data),
    /**
   * Elimina un consultorio por su ID.
   * @function
   * @param {number} id - ID del consultorio.
   * @returns {boolean} `true` si se eliminó, `false` si no existe.
   */
    remove: (id) => officeRepository.delete(id)
};

/**
 * @typedef {Object} Office
 * @property {number} id - Identificador único del consultorio.
 * @property {string} name_office - Nombre del consultorio.
 * @property {string|null} [location_office] - Ubicación del consultorio.
 */