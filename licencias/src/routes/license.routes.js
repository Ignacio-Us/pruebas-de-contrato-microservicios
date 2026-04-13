'use strict';

const { Router } = require('express');
const {
  issueLicense,
  getLicense,
  getLicensesByPatient,
  verifyLicense,
} = require('../controllers/license.controller');

const router = Router();

/**
 * @route  POST /licenses
 * @desc   Emite una nueva licencia médica
 * @body   { patientId, doctorId, diagnosis, startDate, days }
 * @return 201 { folio, patientId, doctorId, diagnosis, startDate, days, status }
 * @return 400 { error: 'INVALID_DAYS' }
 */
router.post('/', issueLicense);

/**
 * @route  GET /licenses?patientId={id}
 * @desc   Lista todas las licencias de un paciente
 * @return 200 [ ...licencias ] (puede ser vacío)
 *
 * IMPORTANTE: debe declararse ANTES de /:folio
 * Si estuviera después, Express intentaría interpretar
 * la query string como si fuera un parámetro de ruta.
 */
router.get('/', getLicensesByPatient);

/**
 * @route  GET /licenses/:folio
 * @desc   Consulta una licencia por su folio
 * @return 200 { ...licencia }
 * @return 404 { error: 'NOT_FOUND' }
 */
router.get('/:folio', getLicense);

/**
 * @route  GET /licenses/:folio/verify
 * @desc   Verifica si una licencia existe y está vigente
 * @return 200 { valid: true }
 * @return 404 { valid: false }
 */
router.get('/:folio/verify', verifyLicense);

module.exports = router;