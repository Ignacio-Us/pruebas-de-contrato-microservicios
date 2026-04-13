CREATE DATABASE IF NOT EXISTS licenses_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE licenses_db;

CREATE TABLE IF NOT EXISTS licenses (
  folio       VARCHAR(36)   NOT NULL PRIMARY KEY,  -- UUID v4 generado por el servidor
  patient_id  VARCHAR(100)  NOT NULL,
  doctor_id   VARCHAR(100)  NOT NULL,
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