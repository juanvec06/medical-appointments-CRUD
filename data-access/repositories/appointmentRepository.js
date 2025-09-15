/**
 * @fileoverview Repositorio de citas médicas (appointment).
 * Gestiona operaciones CRUD sobre las tablas `appointment` y `appointment_patient`
 * en la base de datos SQLite.
 * @module repositories/appointmentRepository
 */
const db = require('../db');

module.exports = {
    /**
   * Crea una nueva cita y asocia pacientes a ella.
   * @function
   * @param {Appointment} appointment - Datos de la cita.
   * @param {number[]} patientIds - IDs de los pacientes asociados (1 a 3).
   * @returns {AppointmentDetail} Cita creada con detalles de pacientes y oficina.
   */
    create: (appointment, patientIds) => {
        const insertAppointment = db.prepare('INSERT INTO appointment (office_id, date_appointment, reason_appointment) VALUES (?, ?, ?)');
        const info = insertAppointment.run(appointment.office_id, appointment.date_appointment, appointment.reason_appointment || null);
        const appointmentId = info.lastInsertRowid;

        const insertAppointmentPatient = db.prepare('INSERT INTO appointment_patient (appointment_id, patient_id) VALUES (?, ?)');
        const insertMany = db.transaction((ids) => {
            for (const patientId of ids) insertAppointmentPatient.run(appointmentId, patientId);
        });

        insertMany(patientIds);

        return module.exports.findById(appointmentId);
    },
    /**
   * Obtiene todas las citas con sus pacientes y nombre del consultorio.
   * @function
   * @returns {AppointmentList[]} Lista de citas.
   */
    findAll: () => {
        const appointments = db.prepare(
            `SELECT a.*, o.name_office as office_name
             FROM appointment a
             LEFT JOIN office o ON o.id = a.office_id`
        ).all();
        const patients = db.prepare(
            `SELECT ap.appointment_id, p.name_patient
             FROM patient p
             INNER JOIN appointment_patient ap ON ap.patient_id = p.id`
        ).all();
        return appointments.map(app => ({
            ...app,
            patients: patients.filter(p => p.appointment_id === app.id).map(p => p.name_patient)
        }));
    },
    /**
   * Obtiene una cita por su ID, incluyendo pacientes y consultorio.
   * @function
   * @param {number} id - ID de la cita.
   * @returns {AppointmentDetail|null} Cita encontrada o null si no existe.
   */
    findById: (id) => {
        const appointment = db.prepare('SELECT * FROM appointment WHERE id = ?').get(id);
        if (!appointment) return null;

        const patients = db.prepare(
            `SELECT p.* FROM patient p
             INNER JOIN appointment_patient ap ON ap.patient_id = p.id
             WHERE ap.appointment_id = ?`
        ).all(id);

        const office = db.prepare('SELECT * FROM office WHERE id = ?').get(appointment.office_id);

        return { ...appointment, patients, office };
    },
    /**
   * Actualiza una cita existente y reemplaza los pacientes asociados.
   * @function
   * @param {number} id - ID de la cita.
   * @param {Appointment} appointment - Nuevos datos de la cita.
   * @param {number[]} patientIds - Nuevos IDs de pacientes asociados.
   * @returns {AppointmentDetail|null} Cita actualizada o null si no existe.
   */
    update: (id, appointment, patientIds) => {
        const upd = db.prepare('UPDATE appointment SET office_id = ?, date_appointment = ?, reason_appointment = ? WHERE id = ?');
        upd.run(appointment.office_id, appointment.date_appointment, appointment.reason_appointment || null, id);

        // Replace patients (transaction)
        const del = db.prepare('DELETE FROM appointment_patient WHERE appointment_id = ?');
        const insert = db.prepare('INSERT INTO appointment_patient (appointment_id, patient_id) VALUES (?, ?)');
        const replacePatients = db.transaction((ids) => {
            del.run(id);
            for (const patientId of ids) insert.run(id, patientId);
        });

        replacePatients(patientIds);

        return module.exports.findById(id);
    },
    /**
   * Elimina una cita por su ID.
   * @function
   * @param {number} id - ID de la cita.
   * @returns {boolean} `true` si fue eliminada, `false` si no existe.
   */
    delete: (id) => {
        const info = db.prepare('DELETE FROM appointment WHERE id = ?').run(id);
        return info.changes > 0;
    }
};

/**
 * @typedef {Object} Appointment
 * @property {number} office_id - ID del consultorio.
 * @property {string} date_appointment - Fecha de la cita en formato ISO.
 * @property {string|null} [reason_appointment] - Motivo de la cita.
 */

/**
 * @typedef {Object} AppointmentList
 * @property {number} id - ID de la cita.
 * @property {number} office_id - ID del consultorio.
 * @property {string} date_appointment - Fecha de la cita en formato ISO.
 * @property {string|null} [reason_appointment] - Motivo de la cita.
 * @property {string} office_name - Nombre del consultorio.
 * @property {string[]} patients - Nombres de pacientes asociados.
 */

/**
 * @typedef {Object} AppointmentDetail
 * @property {number} id - ID de la cita.
 * @property {number} office_id - ID del consultorio.
 * @property {string} date_appointment - Fecha de la cita en formato ISO.
 * @property {string|null} [reason_appointment] - Motivo de la cita.
 * @property {Office} office - Consultorio asociado.
 * @property {Patient[]} patients - Pacientes asociados.
 */