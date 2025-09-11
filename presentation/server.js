const express = require('express');
const app = express();
const cors = require('cors');
const patientsController = require('./controllers/patientsController');
const officesController = require('./controllers/officesController');
const appointmentsController = require('./controllers/appointmentsController');
//Lo que se pone en postman:
app.use(express.json());
app.use(cors());
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