'use strict';

const { getPool } = require('../db/pool');

const setupPactStates = (app) => {
  app.post('/_pactState', async (req, res) => {
    const { state } = req.body;
    const pool = getPool();

    try {
      switch (state) {

        // Inserta una licencia válida con RUT y folio real
        case 'patient 11111111-1 has issued license folio L-1001':
          await pool.execute(
            'DELETE FROM licenses WHERE folio = ?',
            ['L-1001']
          );
          await pool.execute(`
            INSERT INTO licenses 
              (folio, patient_id, doctor_id, diagnosis, start_date, days, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, ['L-1001', '11111111-1', 'DOC-123', 'Influenza A', '2024-06-01', 7, 'issued']);
          break;

        // Garantiza lista vacía para ese RUT
        case 'no licenses for patient 22222222-2':
          await pool.execute(
            'DELETE FROM licenses WHERE patient_id = ?',
            ['22222222-2']
          );
          break;

        // Borra L-404 si existe para garantizar el 404
        case 'license L-404 does not exist':
          await pool.execute(
            'DELETE FROM licenses WHERE folio = ?',
            ['L-404']
          );
          break;

        // Limpia licencias previas de prueba antes de crear
        case 'issued license days>0 is creatable':
          await pool.execute(
            'DELETE FROM licenses WHERE patient_id = ?',
            ['11111111-1']
          );
          break;

        default:
          console.warn(`[PactState] Estado no reconocido: "${state}"`);
          break;
      }

      return res.status(200).json({ state, result: 'ok' });

    } catch (error) {
      console.error('[PactState] Error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  });
};

module.exports = { setupPactStates };