const db = require('../db');

module.exports = {
    create: (patient) => {
        // La consulta ahora incluye el campo 'id'
        db.prepare('INSERT INTO patient (id, name_patient, phone_patient, email_patient) VALUES (?, ?, ?, ?)')
            .run(patient.id, patient.name_patient, patient.phone_patient || null, patient.email_patient || null);
        // Devolvemos el objeto 'patient' que ya contiene el ID que le pasamos
        return patient;
    },

    findAll: () => db.prepare('SELECT * FROM patient').all(),

    findById: (id) => db.prepare('SELECT * FROM patient WHERE id = ?').get(id),

    update: (id, patient) => {
        db.prepare('UPDATE patient SET name_patient = ?, phone_patient = ?, email_patient = ? WHERE id = ?')
            .run(patient.name_patient, patient.phone_patient || null, patient.email_patient || null, id);
        return module.exports.findById(id);
    },

    delete: (id) => {
        const info = db.prepare('DELETE FROM patient WHERE id = ?').run(id);
        return info.changes > 0;
    }
};