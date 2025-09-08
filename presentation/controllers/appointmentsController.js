const express = require('express');
const router = express.Router();
const appointmentService = require('../../domain/services/appointmentService');
const Joi = require('joi');

const schema = Joi.object({
    office_id: Joi.number().integer().required(),
    date_appointment: Joi.string().isoDate().required(),
    reason_appointment: Joi.string().allow(null, ''),
    patient_ids: Joi.array().items(Joi.number().integer()).required()
});

router.get('/', (req, res) => res.json(appointmentService.list()));

router.get('/:id', (req, res) => {
    const appointment = appointmentService.get(Number(req.params.id));
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
});

router.post('/', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    try {
        const appointmentData = {
            office_id: value.office_id,
            date_appointment: value.date_appointment,
            reason_appointment: value.reason_appointment
        };
        const created = appointmentService.create(appointmentData, value.patient_ids);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    try {
        const appointmentData = {
            office_id: value.office_id,
            date_appointment: value.date_appointment,
            reason_appointment: value.reason_appointment
        };
        const updated = appointmentService.update(Number(req.params.id), appointmentData, value.patient_ids);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    const ok = appointmentService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;