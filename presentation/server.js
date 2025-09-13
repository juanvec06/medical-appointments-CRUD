const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const patientsController = require('./controllers/patientsController');
const officesController = require('./controllers/officesController');
const appointmentsController = require('./controllers/appointmentsController');

app.use(express.json());
app.use(cors());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'front')));

app.use('/api/patients', patientsController);
app.use('/api/offices', officesController);
app.use('/api/appointments', appointmentsController);

// simple error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});