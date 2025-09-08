const officeRepository = require('../../data-access/repositories/officeRepository');

module.exports = {
    create: (data) => officeRepository.create(data),
    list: () => officeRepository.findAll(),
    get: (id) => officeRepository.findById(id),
    update: (id, data) => officeRepository.update(id, data),
    remove: (id) => officeRepository.delete(id)
};