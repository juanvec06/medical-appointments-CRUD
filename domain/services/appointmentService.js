/**
 * @fileoverview Servicio de dominio para la gestión de citas médicas.
 * Valida reglas de negocio antes de interactuar con la capa de repositorios:
 * - Verifica que el consultorio exista.
 * - Valida que los pacientes existan.
 * - Controla que las citas tengan entre 1 y 3 pacientes.
 * @module services/appointmentService
 */

const appointmentRepository = require('../../data-access/repositories/appointmentRepository');
const officeRepository = require('../../data-access/repositories/officeRepository');
const patientRepository = require('../../data-access/repositories/patientRepository');
/**
 * Valida que los IDs de pacientes cumplan con las reglas:
 * - Debe ser un array.
 * - Debe contener entre 1 y 3 pacientes.
 * @private
 * @param {number[]} patientIds - Array de IDs de pacientes.
 * @throws {Error} Si la validación falla.
 */
function validatePatientIds(patientIds) {
    if (!Array.isArray(patientIds)) throw new Error('patient_ids must be an array of ids');
    if (patientIds.length < 1 || patientIds.length > 3) throw new Error('An appointment must have between 1 and 3 patients');
}

module.exports = {
    /**
   * Crea una nueva cita médica.
   * - Valida pacientes y consultorio.
   * - Requiere entre 1 y 3 pacientes.
   * @function
   * @param {Appointment} appointment - Datos de la cita (sin pacientes).
   * @param {number[]} patientIds - IDs de pacientes asociados.
   * @returns {Appointment} Cita creada.
   * @throws {Error} Si las validaciones fallan.
   */
    create: (appointment, patientIds) => {
        validatePatientIds(patientIds);
        const office = officeRepository.findById(appointment.office_id);
        if (!office) throw new Error('Office does not exist');

        // validate that patients exist
        for (const patientId of patientIds) {
            const p = patientRepository.findById(patientId);
            if (!p) throw new Error(`Patient with id ${patientId} does not exist`);
        }
        return appointmentRepository.create(appointment, patientIds);
    },
    /**
   * Obtiene la lista de todas las citas médicas.
   * @function
   * @returns {Appointment[]} Lista de citas médicas.
   */
    list: () => appointmentRepository.findAll(),
    /**
   * Obtiene una cita médica por su ID.
   * @function
   * @param {number} id - ID de la cita.
   * @returns {Appointment|null} Cita encontrada o null si no existe.
   */
    get: (id) => appointmentRepository.findById(id),
    /**
   * Actualiza una cita médica existente.
   * - Valida pacientes y consultorio.
   * @function
   * @param {number} id - ID de la cita.
   * @param {Appointment} appointment - Datos de la cita (sin pacientes).
   * @param {number[]} patientIds - IDs de pacientes asociados.
   * @returns {Appointment} Cita actualizada.
   * @throws {Error} Si las validaciones fallan.
   */
    update: (id, appointment, patientIds) => {
        validatePatientIds(patientIds);
        const office = officeRepository.findById(appointment.office_id);
        if (!office) throw new Error('Office does not exist');

        for (const patientId of patientIds) {
            const p = patientRepository.findById(patientId);
            if (!p) throw new Error(`Patient with id ${patientId} does not exist`);
        }
        return appointmentRepository.update(id, appointment, patientIds);
    },
    /**
   * Elimina una cita médica por su ID.
   * @function
   * @param {number} id - ID de la cita.
   * @returns {boolean} `true` si fue eliminada, `false` si no existe.
   */
    remove: (id) => appointmentRepository.delete(id)
};