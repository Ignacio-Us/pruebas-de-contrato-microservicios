const express = require('express');
const { verifyLicense, getPatientLicenses } = require('./controllers/insurerController');

const app = express();
app.use(express.json());

app.get('/insurer/licenses/:folio/verify', verifyLicense);
app.get('/insurer/patients/:patientId/licenses', getPatientLicenses);

module.exports = app;