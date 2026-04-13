'use strict';

const { v4: uuidv4 } = require('uuid');
const licenseRepository = require('../repositories/license.repository');

class InvalidDaysError extends Error {
  constructor() {
    super('INVALID_DAYS');
    this.name = 'InvalidDaysError';
  }
}

class LicenseNotFoundError extends Error {
  constructor(folio) {
    super(`License ${folio} not found`);
    this.name = 'LicenseNotFoundError';
  }
}


class LicenseService {

  /**
   * Emite una nueva licencia médica.
   *
   * Reglas de negocio aplicadas aquí:
   *  1. Los días deben ser > 0. Si no, se rechaza con InvalidDaysError.
   *  2. El folio es generado por el servidor (UUID v4), nunca por el cliente.
   *  3. El status inicial es siempre "issued". El cliente no puede elegirlo.
   *
   * @param {Object} dto
   * @param {string} dto.patientId  
   * @param {string} dto.doctorId   
   * @param {string} dto.diagnosis  
   * @param {string} dto.startDate  - Fecha inicio (YYYY-MM-DD)
   * @param {number} dto.days       - Días de reposo (debe ser > 0)
   * @returns {Promise<Object>} Licencia creada
   * @throws {InvalidDaysError} Si days <= 0 o no viene
   */
  async issueLicense({ patientId, doctorId, diagnosis, startDate, days }) {
   
    if (!days || Number(days) <= 0) {
      throw new InvalidDaysError();
    }

    const license = {
      folio:     uuidv4(),     
      patientId,
      doctorId,
      diagnosis,
      startDate,
      days:      Number(days),
      status:    'issued',       
    };

    await licenseRepository.create(license);

    return license;
  }

  /**
   * Retorna una licencia por su folio.
   *
   * @param {string} folio
   * @returns {Promise<Object>} La licencia encontrada
   * @throws {LicenseNotFoundError} Si el folio no existe
   */
  async getLicense(folio) {
    const license = await licenseRepository.findByFolio(folio);

    if (!license) {
      throw new LicenseNotFoundError(folio);
    }

    return license;
  }

  /**
   * Retorna todas las licencias de un paciente.
   *
   * Por qué nunca lanza error si no hay resultados:
   *  - Un paciente sin licencias no es un error, es un estado válido.
   *  - Retornar [] es más limpio que un 404 para el consumidor.
   *
   * @param {string} patientId
   * @returns {Promise<Object[]>} Array de licencias (puede ser vacío)
   */
  async getLicensesByPatient(patientId) {
    return licenseRepository.findByPatientId(patientId);
  }

  /**
   * Verifica si una licencia existe y está vigente (status = "issued").
   *
   * Por qué este método existe separado de getLicense:
   *  - El consumidor (ej: Portal Paciente, Nómina) solo necesita saber
   *    si es válida o no. No necesita todos los datos de la licencia.
   *  - Tener un endpoint dedicado hace el contrato más claro y simple.
   *
   * @param {string} folio
   * @returns {Promise<{ valid: boolean }>}
   * @throws {LicenseNotFoundError} Si el folio no existe
   */
  async verifyLicense(folio) {
    const license = await licenseRepository.findByFolio(folio);

    if (!license) {
      throw new LicenseNotFoundError(folio);
    }

    return { valid: license.status === 'issued' };
  }
}

module.exports = {
  licenseService:       new LicenseService(),
  InvalidDaysError,
  LicenseNotFoundError,
};