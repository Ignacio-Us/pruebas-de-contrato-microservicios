'use strict';

const { getPool } = require('../db/pool');

function mapRowToLicense(row) {
  if (!row) return null;
  return {
    folio:     row.folio,
    patientId: row.patient_id,
    doctorId:  row.doctor_id,
    diagnosis: row.diagnosis,
    startDate: row.start_date instanceof Date
      ? row.start_date.toISOString().slice(0, 10)
      : row.start_date,
    days:      Number(row.days),
    status:    row.status,
  };
}

async function generateFolio() {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.execute(
      'UPDATE license_sequence SET last_number = last_number + 1 WHERE id = 1'
    );

    const [rows] = await conn.execute(
      'SELECT last_number FROM license_sequence WHERE id = 1'
    );

    await conn.commit();

    const nextNumber = rows?.[0]?.last_number;
    return `L-${nextNumber}`;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function create({ folio, patientId, doctorId, diagnosis, startDate, days, status }) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO licenses
      (folio, patient_id, doctor_id, diagnosis, start_date, days, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [folio, patientId, doctorId, diagnosis, startDate, Number(days), status]
  );
}

async function findByFolio(folio) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT folio, patient_id, doctor_id, diagnosis, start_date, days, status
     FROM licenses
     WHERE folio = ?
     LIMIT 1`,
    [folio]
  );
  return mapRowToLicense(rows[0]);
}

async function findByPatientId(patientId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT folio, patient_id, doctor_id, diagnosis, start_date, days, status
     FROM licenses
     WHERE patient_id = ?
     ORDER BY created_at DESC`,
    [patientId]
  );
  return rows.map(mapRowToLicense);
}

module.exports = {
  generateFolio,
  create,
  findByFolio,
  findByPatientId,
};