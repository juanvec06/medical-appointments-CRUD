const db = require('../db');

module.exports = {
    create: (office) => {
        const info = db.prepare('INSERT INTO office (name_office, location_office) VALUES (?, ?)')
            .run(office.name_office, office.location_office || null);
        return { id: info.lastInsertRowid, ...office };
    },

    findAll: () => db.prepare('SELECT * FROM office').all(),

    findById: (id) => db.prepare('SELECT * FROM office WHERE id = ?').get(id),

    update: (id, office) => {
        db.prepare('UPDATE office SET name_office = ?, location_office = ? WHERE id = ?')
            .run(office.name_office, office.location_office || null, id);
        return module.exports.findById(id);
    },

    delete: (id) => {
        const info = db.prepare('DELETE FROM office WHERE id = ?').run(id);
        return info.changes > 0;
    }
};