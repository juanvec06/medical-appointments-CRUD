const express = require('express');
const router = express.Router();
const patientService = require('../../domain/services/patientService');
const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(0).optional(),
    email: Joi.string().email().optional()
});

// Get all patients
router.get('/', async (req, res) => res.json(await patientService.getAllPatients()));

// Get patient by ID
router.get('/:id', async (req, res) => {
    const patient = await patientService.getPatientById(parseInt(req.params.id));//TODO fix
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
});

// Create a new patient
router.post('/', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const newPatient = await patientService.createPatient(value); //TODO fix
    res.status(201).json(newPatient);
});

// Update an existing patient
router.put('/:id', async (req, res) => {
    const { error, value } = schema.validate({ ...req.body, id: parseInt(req.params.id) });
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updatedPatient = await patientService.updatePatient(parseInt(req.params.id), value); //TODO fix
    if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });
    res.json(updatedPatient);
});

// Delete a patient
router.delete('/:id', async (req, res) => {
    const success = await patientService.deletePatient(parseInt(req.params.id)); //TODO fix
    if (!success) return res.status(404).json({ message: 'Patient not found' });
    res.status(204).send();
});

module.exports = router;