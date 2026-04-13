'use strict';

const { getPool } = require('../db/pool');


class LicenseRepository {

  /**
   * Inserta una nueva licencia en la base de datos.
   * @param {Object} license - Objeto ya validado con folio generado.
   * @returns {Promise<void>}
   */
  async create(license) {
    const sql = `
      INSERT INTO licenses (folio, patient_id, doctor_id, diagnosis, start_date, days, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      license.folio,
      license.patientId,
      license.doctorId,
      license.diagnosis,
      license.startDate,
      license.days,
      license.status,
    ];

    await getPool().execute(sql, params);
  }

  /**
   * Busca una licencia por su folio (PK).
   * @param {string} folio
   * @returns {Promise<Object|null>} La licencia encontrada o null si no existe.
   */
  async findByFolio(folio) {
    const sql = 'SELECT * FROM licenses WHERE folio = ? LIMIT 1';
    const [rows] = await getPool().execute(sql, [folio]);
    return rows.length ? this._toEntity(rows[0]) : null;
  }

  /**
   * Busca todas las licencias de un paciente.
   * @param {string} patientId
   * @returns {Promise<Object[]>} Array de licencias (puede ser vacío).
   */
  async findByPatientId(patientId) {
    const sql = `
      SELECT * FROM licenses
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await getPool().execute(sql, [patientId]);
    return rows.map(row => this._toEntity(row));
  }

  /**
   * Mapea una fila de la BD (snake_case) al objeto de la aplicación (camelCase).
   * 
   * Por qué se hace este mapeo:
   *  - La BD usa convención SQL (snake_case): patient_id, start_date.
   *  - JavaScript usa convención camelCase: patientId, startDate.
   *  - Este método es el puente entre ambos mundos.
   * 
   * @private
   * @param {Object} row - Fila cruda devuelta por mysql2.
   * @returns {Object} Entidad lista para usar en la aplicación.
   */
  _toEntity(row) {
    return {
      folio:     row.folio,
      patientId: row.patient_id,
      doctorId:  row.doctor_id,
      diagnosis: row.diagnosis,
      startDate: row.start_date instanceof Date
        ? row.start_date.toISOString().split('T')[0]
        : row.start_date,
      days:      row.days,
      status:    row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new LicenseRepository();