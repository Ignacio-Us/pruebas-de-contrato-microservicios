'use strict';

const mysql = require('mysql2/promise');

let pool = null;

/**
 * Retorna un pool de conexiones singleton hacia MariaDB.
 * Se crea solo una vez y se reutiliza en toda la aplicación.
 *
 * Por qué un pool y no una conexión directa:
 * - Una conexión directa por request sería lenta (overhead de handshake TCP cada vez).
 * - El pool mantiene conexiones abiertas y las reutiliza, mejorando el rendimiento.
 * - connectionLimit: 10 significa que máximo 10 queries corren en paralelo.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      port:               Number(process.env.DB_PORT) || 3306,
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'licenses_db',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
    });
  }
  return pool;
}

module.exports = { getPool };