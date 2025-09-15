/**
 * @fileoverview Repositorio de consultorios (office).
 * Proporciona operaciones CRUD sobre la tabla `office` en la base de datos SQLite.
 * @module repositories/officeRepository
 */
const db = require('../db');

module.exports = {
    /**
   * Crea un nuevo consultorio en la base de datos.
   * @function
   * @param {Object} office - Datos del consultorio.
   * @param {string} office.name_office - Nombre del consultorio.
   * @param {string|null} [office.location_office] - Ubicación del consultorio.
   * @returns {Office} Consultorio creado con su ID asignado.
   */
    create: (office) => {
        const info = db.prepare('INSERT INTO office (name_office, location_office) VALUES (?, ?)')
            .run(office.name_office, office.location_office || null);
        return { id: info.lastInsertRowid, ...office };
    },
    /**
   * Obtiene todos los consultorios.
   * @function
   * @returns {Office[]} Lista de consultorios.
   */
    findAll: () => db.prepare('SELECT * FROM office').all(),
    /**
   * Obtiene un consultorio por su ID.
   * @function
   * @param {number} id - ID del consultorio.
   * @returns {Office|null} Consultorio encontrado o null si no existe.
   */
    findById: (id) => db.prepare('SELECT * FROM office WHERE id = ?').get(id),
    /**
   * Actualiza un consultorio existente.
   * @function
   * @param {number} id - ID del consultorio.
   * @param {Object} office - Nuevos datos del consultorio.
   * @param {string} office.name_office - Nombre del consultorio.
   * @param {string|null} [office.location_office] - Ubicación del consultorio.
   * @returns {Office|null} Consultorio actualizado o null si no existe.
   */
    update: (id, office) => {
        db.prepare('UPDATE office SET name_office = ?, location_office = ? WHERE id = ?')
            .run(office.name_office, office.location_office || null, id);
        return module.exports.findById(id);
    },
    /**
   * Elimina un consultorio por su ID.
   * @function
   * @param {number} id - ID del consultorio.
   * @returns {boolean} `true` si fue eliminado, `false` si no existe.
   */
    delete: (id) => {
        const info = db.prepare('DELETE FROM office WHERE id = ?').run(id);
        return info.changes > 0;
    }
};

/**
 * @typedef {Object} Office
 * @property {number} id - Identificador único del consultorio.
 * @property {string} name_office - Nombre del consultorio.
 * @property {string|null} [location_office] - Ubicación del consultorio.
 */