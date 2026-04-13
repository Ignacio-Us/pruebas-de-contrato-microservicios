'use strict';

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

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════════════════

class LicenseService {

  /**
   * Emite una nueva licencia médica.
   *
   * Reglas de negocio:
   *  1. days debe ser > 0, si no lanza InvalidDaysError.
   *  2. El folio es generado por la BD de forma correlativa (L-1001, L-1002...).
   *  3. El status inicial es siempre "issued".
   *
   * @param {Object} dto
   * @param {string} dto.patientId  - RUT del paciente. Ej: "11111111-1"
   * @param {string} dto.doctorId   - ID del médico.   Ej: "DOC-123"
   * @param {string} dto.diagnosis  - Diagnóstico
   * @param {string} dto.startDate  - Fecha inicio (YYYY-MM-DD)
   * @param {number} dto.days       - Días de reposo (debe ser > 0)
   * @returns {Promise<Object>} Licencia creada
   * @throws {InvalidDaysError} Si days <= 0 o no viene
   */
  async issueLicense({ patientId, doctorId, diagnosis, startDate, days }) {

    if (!days || Number(days) <= 0) {
      throw new InvalidDaysError();
    }

    // El folio se genera en el repository de forma atómica
    // para evitar duplicados cuando hay múltiples requests simultáneos
    const folio = await licenseRepository.generateFolio();

    const license = {
      folio,               // Ej: "L-1001"
      patientId,           // RUT: "11111111-1"
      doctorId,            // "DOC-123"
      diagnosis,
      startDate,
      days:   Number(days),
      status: 'issued',
    };

    await licenseRepository.create(license);

    return license;
  }

  /**
   * Retorna una licencia por su folio.
   *
   * @param {string} folio - Ej: "L-1001"
   * @returns {Promise<Object>}
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
   * Nunca lanza error si no hay resultados — retorna [] en su lugar.
   *
   * @param {string} patientId - RUT del paciente
   * @returns {Promise<Object[]>}
   */
  async getLicensesByPatient(patientId) {
    return licenseRepository.findByPatientId(patientId);
  }

  /**
   * Verifica si una licencia existe y está vigente (status = "issued").
   *
   * @param {string} folio - Ej: "L-1001"
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
  licenseService:    new LicenseService(),
  InvalidDaysError,
  LicenseNotFoundError,
};