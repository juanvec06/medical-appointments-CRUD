const express = require('express');
const router = express.Router();
const appointmentService = require('../../domain/services/appointmentService');
const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    date: Joi.string().isoDate().required(),
    reason: Joi.string().min(2).max(255).allow(null, ''),
    patientIds: Joi.array().items(Joi.number().integer().min(1)).required(),
});

// Get all appointments
router.get('/', async (req, res) => res.json(await appointmentService.getAllAppointments())); //TODO fix

// Get appointment by ID
router.get('/:id', async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(parseInt(req.params.id));  //TODO fix
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
});

// Create a new appointment
router.post('/', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    try{
        const newAppointment = await appointmentService.createAppointment(value);
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(500).json({ message: 'Error creating appointment' });
    }
});

// Update an existing appointment
router.put('/:id', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    try{
        const updatedAppointment = await appointmentService.updateAppointment(parseInt(req.params.id), value);
        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ message: 'Error updating appointment' });
    }
});