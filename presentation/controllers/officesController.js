const express = require('express');
const router = express.Router();
const officeService = require('../../domain/services/officeService');
const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(100).required()
});

// Get all offices
router.get('/', async (req, res) => res.json(await officeService.getAllOffices())); //TODO fix

// Get office by ID
router.get('/:id', async (req, res) => {
    const office = await officeService.getOfficeById(parseInt(req.params.id));  //TODO fix
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(office);
});

// Create a new office
router.post('/', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const newOffice = await officeService.createOffice(value);  //TODO fix
    res.status(201).json(newOffice);
});

// Update an existing office
router.put('/:id', async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updatedOffice = await officeService.updateOffice(value);
    if (!updatedOffice) return res.status(404).json({ message: 'Office not found' });
    res.json(updatedOffice);
});

// Delete an office
router.delete('/:id', async (req, res) => {
    const success = await officeService.deleteOffice(parseInt(req.params.id)); //TODO fix
    if (!success) return res.status(404).json({ message: 'Office not found' });
    res.status(204).send();
});

module.exports = router;