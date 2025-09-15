/**
 * @fileoverview Repositorio de Pacientes para el acceso directo a la base de datos.
 * Este archivo contiene todas las funciones que ejecutan consultas SQL en la tabla `patient`,
 * abstrayendo las operaciones de la base de datos del resto de la aplicación.
 * @module data-access/repositories/patientRepository
 */

const db = require('../db');

/**
 * Representa un paciente. (Definido para coherencia con otras capas).
 * @typedef {import('../../domain/services/patientService').Patient} Patient
 */

/**
 * @description Objeto que encapsula los métodos para interactuar con la tabla `patient` en la base de datos.
 */
module.exports = {
    /**
     * Inserta un nuevo registro de paciente en la base de datos.
     * @param {Patient} patient - El objeto paciente con los datos a insertar, incluyendo el ID.
     * @returns {Patient} El objeto paciente que fue insertado.
     */
    create: (patient) => {
        db.prepare('INSERT INTO patient (id, name_patient, phone_patient, email_patient) VALUES (?, ?, ?, ?)')
            .run(patient.id, patient.name_patient, patient.phone_patient || null, patient.email_patient || null);
        // Devuelve el objeto original para confirmar la creación.
        return patient;
    },

    /**
     * Recupera todos los registros de pacientes de la base de datos.
     * @returns {Array<Patient>} Un array con todos los pacientes encontrados.
     */
    findAll: () => db.prepare('SELECT * FROM patient').all(),

    /**
     * Busca y devuelve un único paciente por su ID.
     * @param {number} id - El ID del paciente a buscar.
     * @returns {Patient|undefined} El paciente encontrado, o undefined si no existe un paciente con ese ID.
     */
    findById: (id) => db.prepare('SELECT * FROM patient WHERE id = ?').get(id),

    /**
     * Actualiza la información de un paciente existente en la base de datos.
     * @param {number} id - El ID del paciente cuyo registro se va a actualizar.
     * @param {Partial<Patient>} patient - Un objeto que contiene los nuevos datos para el paciente.
     * @returns {Patient|undefined} El objeto del paciente con los datos actualizados, o undefined si no se encontró.
     */
    update: (id, patient) => {
        db.prepare('UPDATE patient SET name_patient = ?, phone_patient = ?, email_patient = ? WHERE id = ?')
            .run(patient.name_patient, patient.phone_patient || null, patient.email_patient || null, id);
        // Devuelve el registro actualizado para confirmar los cambios.
        return module.exports.findById(id);
    },

    /**
     * Elimina un registro de paciente de la base de datos por su ID.
     * @param {number} id - El ID del paciente a eliminar.
     * @returns {boolean} `true` si se eliminó una fila, `false` en caso contrario.
     */
    delete: (id) => {
        const info = db.prepare('DELETE FROM patient WHERE id = ?').run(id);
        return info.changes > 0;
    }
};