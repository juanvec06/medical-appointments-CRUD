const appointmentRepository = require('../../data-access/repositories/appointmentRepository');
const officeRepository = require('../../data-access/repositories/officeRepository');
const patientRepository = require('../../data-access/repositories/patientRepository');

function validatePatientIds(patientIds) {
    if (!Array.isArray(patientIds)) throw new Error('patient_ids must be an array of ids');
    if (patientIds.length < 1 || patientIds.length > 3) throw new Error('An appointment must have between 1 and 3 patients');
}

module.exports = {
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

    list: () => appointmentRepository.findAll(),

    get: (id) => appointmentRepository.findById(id),

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

    remove: (id) => appointmentRepository.delete(id)
};