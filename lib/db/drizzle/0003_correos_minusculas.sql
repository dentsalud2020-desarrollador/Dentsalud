-- Guarda todos los correos de usuarios en minúsculas y sin espacios.
-- El índice impide registrar el mismo correo con distintas mayúsculas (Alan@... y alan@...).
-- Si el UPDATE falla por correo duplicado, hay dos usuarios con el mismo correo: corrige uno antes.
UPDATE usuarios SET email = lower(trim(email)) WHERE email <> lower(trim(email));

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_lower_idx ON usuarios (lower(email));
