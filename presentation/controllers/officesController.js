const express = require('express');
const router = express.Router();
const officeService = require('../../domain/services/officeService');
const Joi = require('joi');

const schema = Joi.object({
    name_office: Joi.string().required(),
    location_office: Joi.string().allow(null, '')
});

router.get('/', (req, res) => res.json(officeService.list()));

router.get('/:id', (req, res) => {
    const office = officeService.get(Number(req.params.id));
    if (!office) return res.status(404).json({ error: 'Office not found' });
    res.json(office);
});

router.post('/', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const created = officeService.create(value);
    res.status(201).json(created);
});

router.put('/:id', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const updated = officeService.update(Number(req.params.id), value);
    res.json(updated);
});

router.delete('/:id', (req, res) => {
    const ok = officeService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;