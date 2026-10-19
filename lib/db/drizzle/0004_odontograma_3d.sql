-- Detalle del odontograma 3D por paciente (un registro por paciente).
-- Se puede ejecutar varias veces sin problema (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS odontograma_3d (
  paciente_id integer PRIMARY KEY REFERENCES pacientes(id) ON DELETE CASCADE,
  datos jsonb NOT NULL,
  actualizado_por integer REFERENCES usuarios(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
