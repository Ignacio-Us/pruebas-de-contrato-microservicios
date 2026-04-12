const express = require('express');
const { getPatientLicenses } = require('./controllers/patientController');

const app = express();
app.use(express.json());

app.get('/patient/:patientId/licenses', getPatientLicenses);

module.exports = app;