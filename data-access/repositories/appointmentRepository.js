const db = require('../db');

module.exports = {
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

    findAll: () => db.prepare(
        `SELECT a.*, o.name_office as office_name
         FROM appointment a
         LEFT JOIN office o ON o.id = a.office_id`
    ).all(),

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

    delete: (id) => {
        const info = db.prepare('DELETE FROM appointment WHERE id = ?').run(id);
        return info.changes > 0;
    }
};