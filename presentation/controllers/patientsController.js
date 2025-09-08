const express = require('express');
const router = express.Router();
const patientService = require('../../domain/services/patientService');
const Joi = require('joi');

const schema = Joi.object({
    name_patient: Joi.string().required(),
    phone_patient: Joi.string().allow(null, ''),
    email_patient: Joi.string().email().allow(null, '')
});

// List all patients
router.get('/', (req, res) => res.json(patientService.list()));

// Get a specific patient by ID
router.get('/:id', (req, res) => {
    const patient = patientService.get(Number(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
});

// Create a new patient
router.post('/', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const created = patientService.create(value);
    res.status(201).json(created);
});

// Update an existing patient
router.put('/:id', (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const updated = patientService.update(Number(req.params.id), value);
    res.json(updated);
});

// Delete a patient
router.delete('/:id', (req, res) => {
    const ok = patientService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});

module.exports = router;