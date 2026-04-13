CREATE DATABASE IF NOT EXISTS licenses_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE licenses_db;

-- Tabla de secuencia para generar folios correlativos
-- Garantiza que nunca haya dos folios iguales aunque haya
-- múltiples instancias del servicio corriendo en paralelo.
CREATE TABLE IF NOT EXISTS license_sequence (
  id            INT          NOT NULL PRIMARY KEY DEFAULT 1,
  last_number   INT          NOT NULL DEFAULT 1000,

  -- Solo puede existir una fila en esta tabla
  CONSTRAINT single_row CHECK (id = 1)
) ENGINE=InnoDB;

-- Inserta la fila inicial si no existe
-- El primer folio generado será L-1001
INSERT IGNORE INTO license_sequence (id, last_number) VALUES (1, 1000);

CREATE TABLE IF NOT EXISTS licenses (
  folio       VARCHAR(20)   NOT NULL PRIMARY KEY,  -- Formato: L-1001, L-1002...
  patient_id  VARCHAR(20)   NOT NULL,              -- RUT: 11111111-1
  doctor_id   VARCHAR(20)   NOT NULL,              -- Formato: DOC-123
  diagnosis   TEXT          NOT NULL,
  start_date  DATE          NOT NULL,
  days        SMALLINT      NOT NULL CHECK (days > 0),
  status      VARCHAR(20)   NOT NULL DEFAULT 'issued',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_patient_id (patient_id),
  INDEX idx_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;