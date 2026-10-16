-- Documentos firmados por los pacientes (consentimientos informados).
-- Se puede ejecutar varias veces sin problema (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS consentimientos (
  id serial PRIMARY KEY,
  paciente_id integer NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  plantilla varchar(50) NOT NULL,
  titulo varchar(150) NOT NULL,
  contenido text NOT NULL,
  firmante_nombre varchar(150) NOT NULL,
  firmante_documento varchar(20) NOT NULL,
  firmante_relacion varchar(20) NOT NULL DEFAULT 'paciente',
  firma_url varchar(255) NOT NULL,
  firma_public_id varchar(255) NOT NULL,
  hash_sha256 varchar(64) NOT NULL,
  ip varchar(64),
  user_agent varchar(255),
  registrado_por integer REFERENCES usuarios(id),
  firmado_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consentimientos_paciente_idx ON consentimientos (paciente_id);
