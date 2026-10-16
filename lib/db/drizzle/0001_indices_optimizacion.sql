-- Índices para acelerar las consultas por paciente y la agenda de citas.
-- Se puede ejecutar varias veces sin problema (IF NOT EXISTS).
-- Los nombres coinciden con el esquema de Drizzle, así que "pnpm push" no los duplica.
CREATE INDEX IF NOT EXISTS citas_odontologo_fecha_idx ON citas (odontologo_id, fecha_cita);
CREATE INDEX IF NOT EXISTS citas_fecha_idx ON citas (fecha_cita);
CREATE INDEX IF NOT EXISTS citas_paciente_idx ON citas (paciente_id);
CREATE INDEX IF NOT EXISTS pagos_paciente_idx ON pagos (paciente_id);
CREATE INDEX IF NOT EXISTS sesiones_paciente_idx ON sesiones_realizadas (paciente_id);
CREATE INDEX IF NOT EXISTS imagenes_paciente_idx ON imagenes_pacientes (paciente_id);
CREATE INDEX IF NOT EXISTS plan_tratamientos_paciente_idx ON plan_tratamientos (paciente_id);
CREATE INDEX IF NOT EXISTS diagnosticos_paciente_idx ON diagnosticos_cie10 (paciente_id);

-- Libera el espacio de filas viejas y actualiza estadísticas
VACUUM ANALYZE;
