const patientRepository = require('../../data-access/repositories/patientRepository');

module.exports = {
    create: (data) => patientRepository.create(data),
    list: () => patientRepository.findAll(),
    get: (id) => patientRepository.findById(id),
    update: (id, data) => patientRepository.update(id, data),
    remove: (id) => patientRepository.delete(id)
};