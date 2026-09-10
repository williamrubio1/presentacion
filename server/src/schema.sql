-- Esquema del Centro de Mando (MySQL 8 / MariaDB 10.4+).
-- Ejecutar con: npm run migrate

CREATE TABLE IF NOT EXISTS emails (
  id              VARCHAR(255) PRIMARY KEY,           -- id del mensaje en Microsoft Graph
  conversation_id VARCHAR(255),
  received_at     DATETIME NOT NULL,
  from_name       VARCHAR(255),
  from_email      VARCHAR(320) NOT NULL,
  subject         VARCHAR(998),
  preview         TEXT,
  body_text       MEDIUMTEXT,
  web_link        TEXT,
  is_read         TINYINT(1) NOT NULL DEFAULT 0,
  from_owner      TINYINT(1) NOT NULL DEFAULT 0,      -- 1 si lo envió el propio buzón

  -- Enriquecimiento por reglas + IA
  category        VARCHAR(64),
  priority        ENUM('alta','media','baja') NOT NULL DEFAULT 'media',
  sentiment       ENUM('positivo','neutral','negativo') NOT NULL DEFAULT 'neutral',
  needs_reply     TINYINT(1) NOT NULL DEFAULT 0,
  ai_summary      TEXT,
  ai_draft        MEDIUMTEXT,
  enriched_at     DATETIME NULL,

  -- Estado operativo del panel (no modifica el buzón)
  status          ENUM('pendiente','en_espera','respondido','resuelto') NOT NULL DEFAULT 'pendiente',
  replied_at      DATETIME NULL,

  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_received (received_at),
  INDEX idx_from (from_email),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_enriched (enriched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
  email        VARCHAR(320) PRIMARY KEY,
  name         VARCHAR(255),
  company      VARCHAR(255),
  first_seen   DATETIME,
  last_seen    DATETIME,
  total_emails INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interactions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  contact_email VARCHAR(320) NOT NULL,
  email_id      VARCHAR(255) NULL,
  occurred_at   DATETIME NOT NULL,
  kind          VARCHAR(32) NOT NULL,   -- correo_entrante | respuesta_enviada | cambio_estado | nota
  description   VARCHAR(500) NOT NULL,
  INDEX idx_contact (contact_email, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_state (
  k VARCHAR(64) PRIMARY KEY,
  v TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ai_summaries (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  period     VARCHAR(24) NOT NULL,
  title      VARCHAR(255),
  body       TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Intenciones de respuesta (lista cerrada, editable desde el panel)
CREATE TABLE IF NOT EXISTS intents (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  intent_key  VARCHAR(64) NOT NULL UNIQUE,
  label       VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL,
  prompt_hint TEXT,
  is_builtin  TINYINT(1) NOT NULL DEFAULT 0,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 100,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reglas de clasificación configurables
CREATE TABLE IF NOT EXISTS rules (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  field        VARCHAR(20) NOT NULL,   -- remitente | dominio | asunto | cuerpo
  op           VARCHAR(20) NOT NULL,   -- contiene | igual | regex
  value        VARCHAR(255) NOT NULL,
  action       VARCHAR(20) NOT NULL,   -- categoria | prioridad | ignorar
  action_value VARCHAR(64),
  active       TINYINT(1) NOT NULL DEFAULT 1,
  sort_order   INT NOT NULL DEFAULT 100,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seguimientos / compromisos (detectados por IA o creados a mano)
CREATE TABLE IF NOT EXISTS followups (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  email_id      VARCHAR(255) NULL,
  contact_email VARCHAR(320) NULL,
  description   VARCHAR(500) NOT NULL,
  due_date      DATE NULL,
  done          TINYINT(1) NOT NULL DEFAULT 0,
  source        VARCHAR(16) NOT NULL DEFAULT 'ia',   -- ia | manual
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_done (done, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
