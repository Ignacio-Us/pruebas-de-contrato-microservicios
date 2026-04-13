'use strict';

const {
  licenseService,
  InvalidDaysError,
  LicenseNotFoundError,
} = require('../services/license.service');

const issueLicense = async (req, res, next) => {
  try {
    const { patientId, doctorId, diagnosis, startDate, days } = req.body;

    const license = await licenseService.issueLicense({
      patientId,
      doctorId,
      diagnosis,
      startDate,
      days,
    });

    return res.status(201).json(license);

  } catch (error) {
    if (error instanceof InvalidDaysError) {
      return res.status(400).json({ error: 'INVALID_DAYS' });
    }
    next(error);
  }
};

/**
 * GET /licenses/:folio
 * Consulta una licencia por su folio.
 *
 * Extrae de params: folio
 * Delega al servicio: getLicense()
 * Responde:
 *   200 → objeto completo de la licencia
 *   404 → folio no existe
 */
const getLicense = async (req, res, next) => {
  try {
    const { folio } = req.params;

    const license = await licenseService.getLicense(folio);

    return res.status(200).json(license);

  } catch (error) {
    if (error instanceof LicenseNotFoundError) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    next(error);
  }
};

const getLicensesByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.query;

    const licenses = await licenseService.getLicensesByPatient(patientId);

    return res.status(200).json(licenses);

  } catch (error) {
    next(error);
  }
};

/**
 * GET /licenses/:folio/verify
 * Verifica si una licencia existe y está vigente.
 *
 * Extrae de params: folio
 * Delega al servicio: verifyLicense()
 * Responde:
 *   200 → { valid: true }  si existe y status = "issued"
 *   404 → { valid: false } si el folio no existe
 *
 * Por qué el 404 retorna { valid: false } y no { error: 'NOT_FOUND' }:
 *   El consumidor de este endpoint solo necesita saber si es válida o no.
 *   Retornar siempre el campo "valid" evita que el consumidor maneje
 *   dos estructuras de respuesta distintas.
 */
const verifyLicense = async (req, res, next) => {
  try {
    const { folio } = req.params;

    const result = await licenseService.verifyLicense(folio);

    return res.status(200).json(result);

  } catch (error) {
    if (error instanceof LicenseNotFoundError) {
      return res.status(404).json({ valid: false });
    }
    next(error);
  }
};

module.exports = {
  issueLicense,
  getLicense,
  getLicensesByPatient,
  verifyLicense,
};