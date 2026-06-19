-- ============================================================
--  BASE DE DATOS: Sistema Web DentSalud
--  Empresa:       Reset Software S.A.C.
--  Motor:         SQL Server 2019+
--  Generado:      2026-06-07
--  Nota:          Sin IDENTITY/AUTOINCREMENT - PKs manuales
--                 Se usan SEQUENCES para control de PKs
-- ============================================================

USE master;
GO

-- Eliminar si existe
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'DentSalud')
BEGIN
    ALTER DATABASE DentSalud SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DentSalud;
END
GO

CREATE DATABASE DentSalud
    COLLATE Modern_Spanish_CI_AI;
GO

USE DentSalud;
GO

-- ============================================================
-- SEQUENCES (reemplazo de AUTOINCREMENT)
-- Uso: NEXT VALUE FOR seq_nombre
-- ============================================================
CREATE SEQUENCE seq_usuarios            START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_pacientes           START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_antecedentes        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_examen_clinico      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_odontodiagrama      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_diagnosticos        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_tipos_tratamiento   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_plan_tratamientos   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_sesiones            START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_pagos               START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_config_clinica      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_citas               START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_recordatorios       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_archivos            START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_recetas             START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_recetas_detalle     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_notas               START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_comprobantes        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_auditoria           START WITH 1 INCREMENT BY 1;
GO

-- ============================================================
-- TABLA 1: USUARIOS
-- ============================================================
CREATE TABLE usuarios (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_usuarios),
    nombre_completo  NVARCHAR(150)   NOT NULL,
    email            NVARCHAR(120)   NOT NULL,
    password_hash    NVARCHAR(255)   NOT NULL,
    rol              NVARCHAR(30)    NOT NULL DEFAULT 'odontologo',
    telefono         NVARCHAR(20)    NULL,
    especialidad     NVARCHAR(100)   NULL,
    activo           BIT             NOT NULL DEFAULT 1,
    ultimo_acceso    DATETIME2       NULL,
    created_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_usuarios          PRIMARY KEY (id),
    CONSTRAINT UQ_usuarios_email    UNIQUE (email),
    CONSTRAINT CK_usuarios_rol      CHECK (rol IN ('administrador','odontologo'))
);
GO

CREATE INDEX IX_usuarios_email ON usuarios(email);
GO

-- ============================================================
-- TABLA 2: PACIENTES
-- ============================================================
CREATE TABLE pacientes (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_pacientes),
    numero_hc        NVARCHAR(20)    NOT NULL,
    fecha_apertura   DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    nombres          NVARCHAR(100)   NOT NULL,
    apellidos        NVARCHAR(100)   NOT NULL,
    fecha_nacimiento DATE            NULL,
    telefono         NVARCHAR(20)    NULL,
    dni              NVARCHAR(12)    NULL,
    domicilio        NVARCHAR(MAX)   NULL,
    correo           NVARCHAR(120)   NULL,
    motivo_consulta  NVARCHAR(MAX)   NULL,
    odontologo_id    INT             NULL,
    activo           BIT             NOT NULL DEFAULT 1,
    created_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_pacientes         PRIMARY KEY (id),
    CONSTRAINT UQ_pacientes_hc      UNIQUE (numero_hc),
    CONSTRAINT UQ_pacientes_dni     UNIQUE (dni),
    CONSTRAINT FK_pacientes_usuario FOREIGN KEY (odontologo_id)
        REFERENCES usuarios(id) ON DELETE SET NULL
);
GO

CREATE INDEX IX_pacientes_dni       ON pacientes(dni);
CREATE INDEX IX_pacientes_nombres   ON pacientes(apellidos, nombres);
CREATE INDEX IX_pacientes_odontologo ON pacientes(odontologo_id);
GO

-- Trigger para autogenerar número de HC (HC-00001, HC-00002...)
CREATE OR ALTER TRIGGER trg_generar_hc
ON pacientes
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @maxHC INT;
    SELECT @maxHC = ISNULL(MAX(CAST(SUBSTRING(numero_hc, 4, 10) AS INT)), 0)
    FROM pacientes;

    INSERT INTO pacientes (
        id, numero_hc, fecha_apertura, nombres, apellidos,
        fecha_nacimiento, telefono, dni, domicilio, correo,
        motivo_consulta, odontologo_id, activo, created_at, updated_at
    )
    SELECT
        ISNULL(id, NEXT VALUE FOR seq_pacientes),
        CASE WHEN numero_hc IS NULL OR numero_hc = ''
             THEN 'HC-' + RIGHT('00000' + CAST(@maxHC + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS NVARCHAR), 5)
             ELSE numero_hc END,
        ISNULL(fecha_apertura, CAST(GETDATE() AS DATE)),
        nombres, apellidos, fecha_nacimiento, telefono, dni,
        domicilio, correo, motivo_consulta, odontologo_id,
        ISNULL(activo, 1), ISNULL(created_at, GETDATE()), ISNULL(updated_at, GETDATE())
    FROM inserted;
END;
GO

-- ============================================================
-- TABLA 3: ANTECEDENTES
-- ============================================================
CREATE TABLE antecedentes (
    id                INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_antecedentes),
    paciente_id       INT             NOT NULL,
    patologicos       NVARCHAR(MAX)   NULL,
    es_gestante       BIT             NOT NULL DEFAULT 0,
    edad_gestacional  SMALLINT        NULL,
    medicacion_actual NVARCHAR(MAX)   NULL,
    alergias          NVARCHAR(MAX)   NULL,
    updated_at        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_antecedentes          PRIMARY KEY (id),
    CONSTRAINT UQ_antecedentes_paciente UNIQUE (paciente_id),
    CONSTRAINT FK_antecedentes_paciente FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT CK_antecedentes_eg       CHECK (edad_gestacional BETWEEN 1 AND 42)
);
GO

-- ============================================================
-- TABLA 4: EXAMEN_CLINICO
-- ============================================================
CREATE TABLE examen_clinico (
    id                INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_examen_clinico),
    paciente_id       INT             NOT NULL,
    cuello            NVARCHAR(MAX)   NULL,
    atm               NVARCHAR(MAX)   NULL,
    mucosa_yugal      NVARCHAR(MAX)   NULL,
    paladar           NVARCHAR(MAX)   NULL,
    lengua            NVARCHAR(MAX)   NULL,
    piso_boca         NVARCHAR(MAX)   NULL,
    gingiva           NVARCHAR(MAX)   NULL,
    analisis_oclusion NVARCHAR(MAX)   NULL,
    updated_at        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_examen_clinico          PRIMARY KEY (id),
    CONSTRAINT UQ_examen_clinico_paciente UNIQUE (paciente_id),
    CONSTRAINT FK_examen_clinico_paciente FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- TABLA 5: PIEZAS_DENTALES_CATALOGO
-- ============================================================
CREATE TABLE piezas_dentales_catalogo (
    numero_pieza     NVARCHAR(3)     NOT NULL,
    tipo             NVARCHAR(10)    NOT NULL,
    cuadrante        SMALLINT        NOT NULL,
    posicion         SMALLINT        NOT NULL,
    nombre_anatomico NVARCHAR(80)    NOT NULL,
    arcada           NVARCHAR(10)    NOT NULL,
    CONSTRAINT PK_piezas            PRIMARY KEY (numero_pieza),
    CONSTRAINT CK_piezas_tipo       CHECK (tipo IN ('adulto','deciduo')),
    CONSTRAINT CK_piezas_cuadrante  CHECK (cuadrante BETWEEN 1 AND 8),
    CONSTRAINT CK_piezas_posicion   CHECK (posicion BETWEEN 1 AND 8),
    CONSTRAINT CK_piezas_arcada     CHECK (arcada IN ('superior','inferior'))
);
GO

-- Catálogo FDI completo (52 piezas)
INSERT INTO piezas_dentales_catalogo VALUES
('18','adulto',1,8,'Tercer molar superior derecho','superior'),
('17','adulto',1,7,'Segundo molar superior derecho','superior'),
('16','adulto',1,6,'Primer molar superior derecho','superior'),
('15','adulto',1,5,'Segundo premolar superior derecho','superior'),
('14','adulto',1,4,'Primer premolar superior derecho','superior'),
('13','adulto',1,3,'Canino superior derecho','superior'),
('12','adulto',1,2,'Incisivo lateral superior derecho','superior'),
('11','adulto',1,1,'Incisivo central superior derecho','superior'),
('21','adulto',2,1,'Incisivo central superior izquierdo','superior'),
('22','adulto',2,2,'Incisivo lateral superior izquierdo','superior'),
('23','adulto',2,3,'Canino superior izquierdo','superior'),
('24','adulto',2,4,'Primer premolar superior izquierdo','superior'),
('25','adulto',2,5,'Segundo premolar superior izquierdo','superior'),
('26','adulto',2,6,'Primer molar superior izquierdo','superior'),
('27','adulto',2,7,'Segundo molar superior izquierdo','superior'),
('28','adulto',2,8,'Tercer molar superior izquierdo','superior'),
('31','adulto',3,1,'Incisivo central inferior izquierdo','inferior'),
('32','adulto',3,2,'Incisivo lateral inferior izquierdo','inferior'),
('33','adulto',3,3,'Canino inferior izquierdo','inferior'),
('34','adulto',3,4,'Primer premolar inferior izquierdo','inferior'),
('35','adulto',3,5,'Segundo premolar inferior izquierdo','inferior'),
('36','adulto',3,6,'Primer molar inferior izquierdo','inferior'),
('37','adulto',3,7,'Segundo molar inferior izquierdo','inferior'),
('38','adulto',3,8,'Tercer molar inferior izquierdo','inferior'),
('41','adulto',4,1,'Incisivo central inferior derecho','inferior'),
('42','adulto',4,2,'Incisivo lateral inferior derecho','inferior'),
('43','adulto',4,3,'Canino inferior derecho','inferior'),
('44','adulto',4,4,'Primer premolar inferior derecho','inferior'),
('45','adulto',4,5,'Segundo premolar inferior derecho','inferior'),
('46','adulto',4,6,'Primer molar inferior derecho','inferior'),
('47','adulto',4,7,'Segundo molar inferior derecho','inferior'),
('48','adulto',4,8,'Tercer molar inferior derecho','inferior'),
('55','deciduo',5,5,'Segundo molar deciduo superior derecho','superior'),
('54','deciduo',5,4,'Primer molar deciduo superior derecho','superior'),
('53','deciduo',5,3,'Canino deciduo superior derecho','superior'),
('52','deciduo',5,2,'Incisivo lateral deciduo superior derecho','superior'),
('51','deciduo',5,1,'Incisivo central deciduo superior derecho','superior'),
('61','deciduo',6,1,'Incisivo central deciduo superior izquierdo','superior'),
('62','deciduo',6,2,'Incisivo lateral deciduo superior izquierdo','superior'),
('63','deciduo',6,3,'Canino deciduo superior izquierdo','superior'),
('64','deciduo',6,4,'Primer molar deciduo superior izquierdo','superior'),
('65','deciduo',6,5,'Segundo molar deciduo superior izquierdo','superior'),
('71','deciduo',7,1,'Incisivo central deciduo inferior izquierdo','inferior'),
('72','deciduo',7,2,'Incisivo lateral deciduo inferior izquierdo','inferior'),
('73','deciduo',7,3,'Canino deciduo inferior izquierdo','inferior'),
('74','deciduo',7,4,'Primer molar deciduo inferior izquierdo','inferior'),
('75','deciduo',7,5,'Segundo molar deciduo inferior izquierdo','inferior'),
('81','deciduo',8,1,'Incisivo central deciduo inferior derecho','inferior'),
('82','deciduo',8,2,'Incisivo lateral deciduo inferior derecho','inferior'),
('83','deciduo',8,3,'Canino deciduo inferior derecho','inferior'),
('84','deciduo',8,4,'Primer molar deciduo inferior derecho','inferior'),
('85','deciduo',8,5,'Segundo molar deciduo inferior derecho','inferior');
GO

-- ============================================================
-- TABLA 6: ODONTODIAGRAMA
-- ============================================================
CREATE TABLE odontodiagrama (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_odontodiagrama),
    paciente_id      INT             NOT NULL,
    numero_pieza     NVARCHAR(3)     NOT NULL,
    estado           NVARCHAR(30)    NOT NULL DEFAULT 'sano',
    superficies      NVARCHAR(10)    NULL,
    observacion      NVARCHAR(MAX)   NULL,
    color_marca      NVARCHAR(10)    NULL,
    registrado_por   INT             NULL,
    updated_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_odontodiagrama        PRIMARY KEY (id),
    CONSTRAINT UQ_odonto_paciente_pieza UNIQUE (paciente_id, numero_pieza),
    CONSTRAINT FK_odonto_paciente       FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_odonto_pieza          FOREIGN KEY (numero_pieza)
        REFERENCES piezas_dentales_catalogo(numero_pieza),
    CONSTRAINT FK_odonto_usuario        FOREIGN KEY (registrado_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_odonto_estado         CHECK (estado IN (
        'sano','caries','obturado','ausente','corona','implante',
        'endodoncia','extraccion_indicada','fractura','movilidad','sellante','otro'))
);
GO

CREATE INDEX IX_odonto_paciente ON odontodiagrama(paciente_id);
GO

-- ============================================================
-- TABLA 7: DIAGNOSTICOS_CIE10
-- ============================================================
CREATE TABLE diagnosticos_cie10 (
    id                INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_diagnosticos),
    paciente_id       INT             NOT NULL,
    codigo_cie10      NVARCHAR(10)    NOT NULL,
    descripcion       NVARCHAR(MAX)   NOT NULL,
    fecha_diagnostico DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    observaciones     NVARCHAR(MAX)   NULL,
    registrado_por    INT             NULL,
    created_at        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_diagnosticos         PRIMARY KEY (id),
    CONSTRAINT FK_diag_paciente        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_diag_usuario         FOREIGN KEY (registrado_por)
        REFERENCES usuarios(id)
);
GO

CREATE INDEX IX_diagnosticos_paciente ON diagnosticos_cie10(paciente_id);
CREATE INDEX IX_diagnosticos_cie10    ON diagnosticos_cie10(codigo_cie10);
GO

-- ============================================================
-- TABLA 8: TIPOS_TRATAMIENTO
-- ============================================================
CREATE TABLE tipos_tratamiento (
    id                INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_tipos_tratamiento),
    nombre            NVARCHAR(80)    NOT NULL,
    subtipo           NVARCHAR(50)    NULL,
    codigo            NVARCHAR(20)    NULL,
    precio_referencia DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    descripcion       NVARCHAR(MAX)   NULL,
    activo            BIT             NOT NULL DEFAULT 1,
    created_at        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_tipos_tratamiento   PRIMARY KEY (id),
    CONSTRAINT UQ_tipos_trat_codigo   UNIQUE (codigo)
);
GO

INSERT INTO tipos_tratamiento (id, nombre, subtipo, codigo, precio_referencia) VALUES
(NEXT VALUE FOR seq_tipos_tratamiento,'Profilaxis',           NULL,           'PROF',     80.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Resina',               'Simple',       'RES-S',   120.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Resina',               'Estética',     'RES-E',   160.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Carilla',              'Resina',       'CAR-R',   250.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Carilla',              'Porcelana',    'CAR-P',   500.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Endodoncia',           'Anterior',     'END-A',   350.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Endodoncia',           'Posterior',    'END-P',   450.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Perno',                'Colado',       'PER-C',   200.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Perno',                'Prefabricado', 'PER-PF',  150.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Exodoncia',            'Simple',       'EXO-S',    80.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Exodoncia',            'Compleja',     'EXO-C',   150.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Exodoncia',            'Terciario',    'EXO-T',   250.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Corona',               'Metal',        'COR-M',   300.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Corona',               'Implante',     'COR-I',   600.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Corona',               'Porcelana',    'COR-P',   500.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Prótesis',             'Fija',         'PRO-F',  1200.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Prótesis',             'Total',        'PRO-T',   800.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Prótesis',             'Parcial',      'PRO-P',   600.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Blanqueamiento',       NULL,           'BLA',     300.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Diseño de sonrisa',    NULL,           'DSO',    1500.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Sellantes',            NULL,           'SEL',      60.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Ortodoncia',           NULL,           'ORT',    2500.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Bichectomía',          NULL,           'BIC',    1200.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Recubrimiento pulpar', NULL,           'REC',     180.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Gingivectomía',        NULL,           'GIN',     250.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Incrustación',         NULL,           'INC',     350.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Implante',             NULL,           'IMP',    2800.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Apicectomía',          NULL,           'API',     400.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Botox',                NULL,           'BOT',     350.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Ácido hialurónico',   NULL,           'AH',      400.00),
(NEXT VALUE FOR seq_tipos_tratamiento,'Otro',                 NULL,           'OTR',       0.00);
GO

-- ============================================================
-- TABLA 9: PLAN_TRATAMIENTOS
-- ============================================================
CREATE TABLE plan_tratamientos (
    id                   INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_plan_tratamientos),
    paciente_id          INT             NOT NULL,
    tipo_tratamiento_id  INT             NOT NULL,
    numero_pieza         NVARCHAR(3)     NULL,
    subtipo_detalle      NVARCHAR(80)    NULL,
    cantidad             SMALLINT        NOT NULL DEFAULT 1,
    precio_unitario      DECIMAL(10,2)   NOT NULL,
    descuento            DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    total                AS (cantidad * precio_unitario * (1 - descuento / 100)) PERSISTED,
    estado               NVARCHAR(20)    NOT NULL DEFAULT 'pendiente',
    prioridad            SMALLINT        NULL DEFAULT 1,
    notas                NVARCHAR(MAX)   NULL,
    creado_por           INT             NULL,
    created_at           DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at           DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_plan_tratamientos     PRIMARY KEY (id),
    CONSTRAINT FK_plan_paciente         FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_plan_tipo             FOREIGN KEY (tipo_tratamiento_id)
        REFERENCES tipos_tratamiento(id),
    CONSTRAINT FK_plan_pieza            FOREIGN KEY (numero_pieza)
        REFERENCES piezas_dentales_catalogo(numero_pieza),
    CONSTRAINT FK_plan_usuario          FOREIGN KEY (creado_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_plan_cantidad         CHECK (cantidad > 0),
    CONSTRAINT CK_plan_estado           CHECK (estado IN (
        'pendiente','en_proceso','completado','cancelado')),
    CONSTRAINT CK_plan_prioridad        CHECK (prioridad BETWEEN 1 AND 3)
);
GO

CREATE INDEX IX_plan_paciente ON plan_tratamientos(paciente_id);
CREATE INDEX IX_plan_estado   ON plan_tratamientos(estado);
GO

-- ============================================================
-- TABLA 10: SESIONES_REALIZADAS
-- ============================================================
CREATE TABLE sesiones_realizadas (
    id                    INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_sesiones),
    plan_tratamiento_id   INT             NULL,
    paciente_id           INT             NOT NULL,
    fecha_sesion          DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    tratamiento_realizado NVARCHAR(MAX)   NOT NULL,
    observaciones         NVARCHAR(MAX)   NULL,
    importe               DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    odontologo_id         INT             NULL,
    confirmado            BIT             NOT NULL DEFAULT 0,
    created_at            DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_sesiones              PRIMARY KEY (id),
    CONSTRAINT FK_sesiones_plan         FOREIGN KEY (plan_tratamiento_id)
        REFERENCES plan_tratamientos(id) ON DELETE SET NULL,
    CONSTRAINT FK_sesiones_paciente     FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id),
    CONSTRAINT FK_sesiones_odontologo   FOREIGN KEY (odontologo_id)
        REFERENCES usuarios(id)
);
GO

CREATE INDEX IX_sesiones_paciente   ON sesiones_realizadas(paciente_id);
CREATE INDEX IX_sesiones_fecha      ON sesiones_realizadas(fecha_sesion);
CREATE INDEX IX_sesiones_odontologo ON sesiones_realizadas(odontologo_id);
GO

-- ============================================================
-- TABLA 11: COMPROBANTES
-- ============================================================
CREATE TABLE comprobantes (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_comprobantes),
    paciente_id      INT             NOT NULL,
    tipo             NVARCHAR(15)    NOT NULL,
    serie            NVARCHAR(5)     NOT NULL,
    correlativo      INT             NOT NULL,
    numero_completo  AS (serie + '-' + RIGHT('00000000' + CAST(correlativo AS NVARCHAR), 8)) PERSISTED,
    fecha_emision    DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    subtotal         DECIMAL(10,2)   NOT NULL,
    igv              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    total            DECIMAL(10,2)   NOT NULL,
    estado           NVARCHAR(15)    NOT NULL DEFAULT 'emitido',
    ruc_receptor     NVARCHAR(11)    NULL,
    razon_social     NVARCHAR(150)   NULL,
    observaciones    NVARCHAR(MAX)   NULL,
    emitido_por      INT             NULL,
    created_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_comprobantes          PRIMARY KEY (id),
    CONSTRAINT UQ_comprobantes_serie    UNIQUE (serie, correlativo),
    CONSTRAINT FK_comp_paciente         FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id),
    CONSTRAINT FK_comp_usuario          FOREIGN KEY (emitido_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_comp_tipo             CHECK (tipo IN ('boleta','factura','nota_credito')),
    CONSTRAINT CK_comp_estado           CHECK (estado IN ('emitido','anulado','pendiente_sunat'))
);
GO

CREATE INDEX IX_comp_paciente ON comprobantes(paciente_id);
CREATE INDEX IX_comp_fecha    ON comprobantes(fecha_emision);
GO

-- ============================================================
-- TABLA 12: PAGOS
-- ============================================================
CREATE TABLE pagos (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_pagos),
    paciente_id      INT             NOT NULL,
    sesion_id        INT             NULL,
    comprobante_id   INT             NULL,
    monto            DECIMAL(10,2)   NOT NULL,
    metodo_pago      NVARCHAR(20)    NOT NULL DEFAULT 'efectivo',
    numero_operacion NVARCHAR(60)    NULL,
    notas            NVARCHAR(MAX)   NULL,
    fecha_pago       DATETIME2       NOT NULL DEFAULT GETDATE(),
    registrado_por   INT             NULL,
    CONSTRAINT PK_pagos                 PRIMARY KEY (id),
    CONSTRAINT FK_pagos_paciente        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id),
    CONSTRAINT FK_pagos_sesion          FOREIGN KEY (sesion_id)
        REFERENCES sesiones_realizadas(id) ON DELETE SET NULL,
    CONSTRAINT FK_pagos_comprobante     FOREIGN KEY (comprobante_id)
        REFERENCES comprobantes(id) ON DELETE SET NULL,
    CONSTRAINT FK_pagos_usuario         FOREIGN KEY (registrado_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_pagos_monto           CHECK (monto > 0),
    CONSTRAINT CK_pagos_metodo          CHECK (metodo_pago IN (
        'efectivo','transferencia','tarjeta','yape','plin','otro'))
);
GO

CREATE INDEX IX_pagos_paciente ON pagos(paciente_id);
CREATE INDEX IX_pagos_sesion   ON pagos(sesion_id);
GO

-- ============================================================
-- TABLA 13: CONFIGURACION_CLINICA
-- ============================================================
CREATE TABLE configuracion_clinica (
    id               INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_config_clinica),
    nombre_clinica   NVARCHAR(150)   NOT NULL DEFAULT 'Centro DentSalud',
    razon_social     NVARCHAR(150)   NULL,
    ruc              NVARCHAR(11)    NULL,
    direccion        NVARCHAR(MAX)   NULL,
    telefono_1       NVARCHAR(20)    NULL,
    telefono_2       NVARCHAR(20)    NULL,
    correo           NVARCHAR(120)   NULL,
    sitio_web        NVARCHAR(120)   NULL,
    facebook         NVARCHAR(120)   NULL,
    instagram        NVARCHAR(120)   NULL,
    logo_ruta        NVARCHAR(MAX)   NULL,
    color_primario   NVARCHAR(7)     NULL DEFAULT '#8DC63F',
    color_secundario NVARCHAR(7)     NULL DEFAULT '#00AEEF',
    texto_pie_reporte NVARCHAR(MAX)  NULL,
    moneda           NVARCHAR(5)     NULL DEFAULT 'S/.',
    igv_porcentaje   DECIMAL(5,2)    NULL DEFAULT 18.00,
    horario_atencion NVARCHAR(MAX)   NULL,
    activo           BIT             NOT NULL DEFAULT 1,
    updated_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_config PRIMARY KEY (id)
);
GO

INSERT INTO configuracion_clinica (
    id, nombre_clinica, direccion, telefono_1, telefono_2,
    correo, facebook, instagram, horario_atencion
) VALUES (
    NEXT VALUE FOR seq_config_clinica,
    'Centro DentSalud – Tu Centro de Armonía Dentofacial',
    'Av. El Ejército N° 831-827 (a media cuadra de la UPN), Trujillo',
    '044-637622', '997054525',
    'info@dentsalud.com', 'Centro DentSalud', 'dentsalud_centro',
    'Lunes a Sábado: 8:00 am – 8:00 pm'
);
GO

-- ============================================================
-- TABLA 14: CITAS
-- ============================================================
CREATE TABLE citas (
    id                  INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_citas),
    paciente_id         INT             NOT NULL,
    odontologo_id       INT             NOT NULL,
    tipo_tratamiento_id INT             NULL,
    fecha_cita          DATE            NOT NULL,
    hora_inicio         TIME            NOT NULL,
    hora_fin            TIME            NOT NULL,
    duracion_minutos    AS (DATEDIFF(MINUTE, hora_inicio, hora_fin)) PERSISTED,
    motivo              NVARCHAR(MAX)   NULL,
    estado              NVARCHAR(20)    NOT NULL DEFAULT 'programada',
    canal_reserva       NVARCHAR(20)    NOT NULL DEFAULT 'presencial',
    notas               NVARCHAR(MAX)   NULL,
    reagendada_de       INT             NULL,
    creado_por          INT             NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_citas                 PRIMARY KEY (id),
    CONSTRAINT FK_citas_paciente        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_citas_odontologo      FOREIGN KEY (odontologo_id)
        REFERENCES usuarios(id),
    CONSTRAINT FK_citas_tipo_trat       FOREIGN KEY (tipo_tratamiento_id)
        REFERENCES tipos_tratamiento(id),
    CONSTRAINT FK_citas_reagendada      FOREIGN KEY (reagendada_de)
        REFERENCES citas(id),
    CONSTRAINT FK_citas_creado_por      FOREIGN KEY (creado_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_citas_hora            CHECK (hora_fin > hora_inicio),
    CONSTRAINT CK_citas_estado          CHECK (estado IN (
        'programada','confirmada','en_atencion',
        'completada','cancelada','no_asistio')),
    CONSTRAINT CK_citas_canal           CHECK (canal_reserva IN (
        'presencial','telefono','whatsapp','web'))
);
GO

CREATE INDEX IX_citas_paciente   ON citas(paciente_id);
CREATE INDEX IX_citas_odontologo ON citas(odontologo_id);
CREATE INDEX IX_citas_fecha      ON citas(fecha_cita);
CREATE INDEX IX_citas_estado     ON citas(estado);
CREATE INDEX IX_citas_fecha_doc  ON citas(odontologo_id, fecha_cita);
GO

-- ============================================================
-- TABLA 15: RECORDATORIOS_CITAS
-- ============================================================
CREATE TABLE recordatorios_citas (
    id                  INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_recordatorios),
    cita_id             INT             NOT NULL,
    paciente_id         INT             NOT NULL,
    canal               NVARCHAR(20)    NOT NULL,
    mensaje             NVARCHAR(MAX)   NULL,
    estado_envio        NVARCHAR(20)    NOT NULL DEFAULT 'pendiente',
    fecha_programada    DATETIME2       NOT NULL,
    fecha_envio         DATETIME2       NULL,
    respuesta_paciente  NVARCHAR(20)    NULL,
    enviado_por         INT             NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_recordatorios         PRIMARY KEY (id),
    CONSTRAINT FK_record_cita           FOREIGN KEY (cita_id)
        REFERENCES citas(id) ON DELETE CASCADE,
    CONSTRAINT FK_record_paciente       FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id),
    CONSTRAINT FK_record_usuario        FOREIGN KEY (enviado_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_record_canal          CHECK (canal IN (
        'whatsapp','sms','email','llamada')),
    CONSTRAINT CK_record_estado         CHECK (estado_envio IN (
        'pendiente','enviado','entregado','fallido','leido')),
    CONSTRAINT CK_record_respuesta      CHECK (respuesta_paciente IN (
        'confirmado','cancelado','sin_respuesta'))
);
GO

CREATE INDEX IX_recordatorios_cita     ON recordatorios_citas(cita_id);
CREATE INDEX IX_recordatorios_paciente ON recordatorios_citas(paciente_id);
CREATE INDEX IX_recordatorios_fecha    ON recordatorios_citas(fecha_programada);
GO

-- ============================================================
-- TABLA 16: ARCHIVOS_CLINICOS
-- ============================================================
CREATE TABLE archivos_clinicos (
    id                INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_archivos),
    paciente_id       INT             NOT NULL,
    sesion_id         INT             NULL,
    tipo_archivo      NVARCHAR(40)    NOT NULL,
    nombre_original   NVARCHAR(255)   NOT NULL,
    nombre_almacenado NVARCHAR(255)   NOT NULL,
    ruta_archivo      NVARCHAR(MAX)   NOT NULL,
    mime_type         NVARCHAR(80)    NULL,
    tamanio_bytes     INT             NULL,
    descripcion       NVARCHAR(MAX)   NULL,
    numero_pieza      NVARCHAR(3)     NULL,
    subido_por        INT             NULL,
    created_at        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_archivos              PRIMARY KEY (id),
    CONSTRAINT UQ_archivos_nombre       UNIQUE (nombre_almacenado),
    CONSTRAINT FK_archivos_paciente     FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_archivos_sesion       FOREIGN KEY (sesion_id)
        REFERENCES sesiones_realizadas(id) ON DELETE SET NULL,
    CONSTRAINT FK_archivos_pieza        FOREIGN KEY (numero_pieza)
        REFERENCES piezas_dentales_catalogo(numero_pieza),
    CONSTRAINT FK_archivos_usuario      FOREIGN KEY (subido_por)
        REFERENCES usuarios(id),
    CONSTRAINT CK_archivos_tipo         CHECK (tipo_archivo IN (
        'radiografia_periapical','radiografia_panoramica','radiografia_bitewing',
        'foto_intraoral','foto_extraoral','foto_antes','foto_despues',
        'documento_pdf','otro'))
);
GO

CREATE INDEX IX_archivos_paciente ON archivos_clinicos(paciente_id);
CREATE INDEX IX_archivos_tipo     ON archivos_clinicos(tipo_archivo);
CREATE INDEX IX_archivos_sesion   ON archivos_clinicos(sesion_id);
GO

-- ============================================================
-- TABLA 17: RECETAS_MEDICAS
-- ============================================================
CREATE TABLE recetas_medicas (
    id              INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_recetas),
    paciente_id     INT             NOT NULL,
    sesion_id       INT             NULL,
    odontologo_id   INT             NOT NULL,
    fecha_emision   DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    diagnostico     NVARCHAR(MAX)   NULL,
    indicaciones    NVARCHAR(MAX)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_recetas               PRIMARY KEY (id),
    CONSTRAINT FK_recetas_paciente      FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_recetas_sesion        FOREIGN KEY (sesion_id)
        REFERENCES sesiones_realizadas(id) ON DELETE SET NULL,
    CONSTRAINT FK_recetas_odontologo    FOREIGN KEY (odontologo_id)
        REFERENCES usuarios(id)
);
GO

CREATE INDEX IX_recetas_paciente   ON recetas_medicas(paciente_id);
CREATE INDEX IX_recetas_odontologo ON recetas_medicas(odontologo_id);
GO

-- ============================================================
-- TABLA 18: RECETAS_DETALLE
-- ============================================================
CREATE TABLE recetas_detalle (
    id              INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_recetas_detalle),
    receta_id       INT             NOT NULL,
    medicamento     NVARCHAR(120)   NOT NULL,
    presentacion    NVARCHAR(80)    NULL,
    dosis           NVARCHAR(80)    NULL,
    duracion        NVARCHAR(60)    NULL,
    cantidad        SMALLINT        NULL,
    via_admin       NVARCHAR(40)    NOT NULL DEFAULT 'oral',
    observaciones   NVARCHAR(MAX)   NULL,
    CONSTRAINT PK_recetas_detalle       PRIMARY KEY (id),
    CONSTRAINT FK_recdet_receta         FOREIGN KEY (receta_id)
        REFERENCES recetas_medicas(id) ON DELETE CASCADE,
    CONSTRAINT CK_recdet_via            CHECK (via_admin IN (
        'oral','topica','inyectable','otra'))
);
GO

CREATE INDEX IX_recdet_receta ON recetas_detalle(receta_id);
GO

-- ============================================================
-- TABLA 19: NOTAS_EVOLUCION
-- ============================================================
CREATE TABLE notas_evolucion (
    id              INT             NOT NULL DEFAULT (NEXT VALUE FOR seq_notas),
    paciente_id     INT             NOT NULL,
    sesion_id       INT             NULL,
    odontologo_id   INT             NOT NULL,
    fecha_nota      DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    contenido       NVARCHAR(MAX)   NOT NULL,
    es_privada      BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_notas_evolucion       PRIMARY KEY (id),
    CONSTRAINT FK_notas_paciente        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT FK_notas_sesion          FOREIGN KEY (sesion_id)
        REFERENCES sesiones_realizadas(id) ON DELETE SET NULL,
    CONSTRAINT FK_notas_odontologo      FOREIGN KEY (odontologo_id)
        REFERENCES usuarios(id)
);
GO

CREATE INDEX IX_notas_paciente   ON notas_evolucion(paciente_id);
CREATE INDEX IX_notas_odontologo ON notas_evolucion(odontologo_id);
CREATE INDEX IX_notas_fecha      ON notas_evolucion(fecha_nota);
GO

-- ============================================================
-- TABLA 20: AUDITORIA_LOG
-- ============================================================
CREATE TABLE auditoria_log (
    id                  BIGINT          NOT NULL DEFAULT (NEXT VALUE FOR seq_auditoria),
    usuario_id          INT             NULL,
    nombre_usuario      NVARCHAR(150)   NULL,
    tabla_afectada      NVARCHAR(60)    NOT NULL,
    registro_id         INT             NULL,
    accion              NVARCHAR(10)    NOT NULL,
    datos_anteriores    NVARCHAR(MAX)   NULL,   -- JSON serializado (FOR JSON PATH)
    datos_nuevos        NVARCHAR(MAX)   NULL,   -- JSON serializado (FOR JSON PATH)
    campos_modificados  NVARCHAR(MAX)   NULL,   -- Lista separada por comas
    ip_address          NVARCHAR(50)    NULL,
    user_agent          NVARCHAR(MAX)   NULL,
    sesion_token        NVARCHAR(64)    NULL,
    fecha_accion        DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_auditoria             PRIMARY KEY (id),
    CONSTRAINT FK_audit_usuario         FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT CK_audit_accion          CHECK (accion IN (
        'INSERT','UPDATE','DELETE','SELECT'))
);
GO

CREATE INDEX IX_audit_tabla    ON auditoria_log(tabla_afectada);
CREATE INDEX IX_audit_usuario  ON auditoria_log(usuario_id);
CREATE INDEX IX_audit_fecha    ON auditoria_log(fecha_accion);
CREATE INDEX IX_audit_accion   ON auditoria_log(accion);
CREATE INDEX IX_audit_registro ON auditoria_log(tabla_afectada, registro_id);
GO

-- ============================================================
-- TRIGGERS DE AUDITORÍA
-- SQL Server requiere un trigger por tabla (no función reutilizable)
-- ============================================================

-- Trigger auditoría: PAGOS
CREATE OR ALTER TRIGGER trg_audit_pagos
ON pagos
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    DECLARE @id_reg INT;
    DECLARE @ant NVARCHAR(MAX);
    DECLARE @nue NVARCHAR(MAX);

    IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
        SET @accion = 'UPDATE';
    ELSE IF EXISTS(SELECT 1 FROM inserted)
        SET @accion = 'INSERT';
    ELSE
        SET @accion = 'DELETE';

    SELECT @ant = (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER);
    SELECT @nue = (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER);
    SELECT @id_reg = COALESCE((SELECT TOP 1 id FROM inserted), (SELECT TOP 1 id FROM deleted));

    INSERT INTO auditoria_log (
        id, tabla_afectada, registro_id, accion,
        datos_anteriores, datos_nuevos, fecha_accion
    ) VALUES (
        NEXT VALUE FOR seq_auditoria,
        'pagos', @id_reg, @accion,
        @ant, @nue, GETDATE()
    );
END;
GO

-- Trigger auditoría: SESIONES_REALIZADAS
CREATE OR ALTER TRIGGER trg_audit_sesiones
ON sesiones_realizadas
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    IF EXISTS(SELECT 1 FROM inserted) SET @accion = 'UPDATE' ELSE SET @accion = 'DELETE';
    INSERT INTO auditoria_log (id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, fecha_accion)
    SELECT NEXT VALUE FOR seq_auditoria, 'sesiones_realizadas',
           COALESCE(i.id, d.id), @accion,
           (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           GETDATE()
    FROM (SELECT TOP 1 id FROM inserted UNION SELECT TOP 1 id FROM deleted) x(id)
    LEFT JOIN inserted i ON i.id = x.id
    LEFT JOIN deleted  d ON d.id = x.id;
END;
GO

-- Trigger auditoría: PLAN_TRATAMIENTOS
CREATE OR ALTER TRIGGER trg_audit_plan
ON plan_tratamientos
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    IF EXISTS(SELECT 1 FROM inserted) SET @accion = 'UPDATE' ELSE SET @accion = 'DELETE';
    INSERT INTO auditoria_log (id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, fecha_accion)
    VALUES (NEXT VALUE FOR seq_auditoria, 'plan_tratamientos',
            COALESCE((SELECT TOP 1 id FROM inserted),(SELECT TOP 1 id FROM deleted)),
            @accion,
            (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            GETDATE());
END;
GO

-- Trigger auditoría: USUARIOS
CREATE OR ALTER TRIGGER trg_audit_usuarios
ON usuarios
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    IF EXISTS(SELECT 1 FROM inserted) AND EXISTS(SELECT 1 FROM deleted)
        SET @accion = 'UPDATE';
    ELSE IF EXISTS(SELECT 1 FROM inserted) SET @accion = 'INSERT';
    ELSE SET @accion = 'DELETE';
    INSERT INTO auditoria_log (id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, fecha_accion)
    VALUES (NEXT VALUE FOR seq_auditoria, 'usuarios',
            COALESCE((SELECT TOP 1 id FROM inserted),(SELECT TOP 1 id FROM deleted)),
            @accion,
            (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            GETDATE());
END;
GO

-- Trigger auditoría: PACIENTES
CREATE OR ALTER TRIGGER trg_audit_pacientes
ON pacientes
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    IF EXISTS(SELECT 1 FROM inserted) SET @accion = 'UPDATE' ELSE SET @accion = 'DELETE';
    INSERT INTO auditoria_log (id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, fecha_accion)
    VALUES (NEXT VALUE FOR seq_auditoria, 'pacientes',
            COALESCE((SELECT TOP 1 id FROM inserted),(SELECT TOP 1 id FROM deleted)),
            @accion,
            (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            GETDATE());
END;
GO

-- Trigger auditoría: COMPROBANTES
CREATE OR ALTER TRIGGER trg_audit_comprobantes
ON comprobantes
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @accion NVARCHAR(10);
    IF EXISTS(SELECT 1 FROM deleted) SET @accion = 'UPDATE' ELSE SET @accion = 'INSERT';
    INSERT INTO auditoria_log (id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos, fecha_accion)
    VALUES (NEXT VALUE FOR seq_auditoria, 'comprobantes',
            COALESCE((SELECT TOP 1 id FROM inserted),(SELECT TOP 1 id FROM deleted)),
            @accion,
            (SELECT * FROM deleted  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT * FROM inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            GETDATE());
END;
GO

-- ============================================================
-- TRIGGERS updated_at (SQL Server no tiene ON UPDATE automático)
-- ============================================================
CREATE OR ALTER TRIGGER trg_pacientes_updated
ON pacientes AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE pacientes SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO

CREATE OR ALTER TRIGGER trg_plan_updated
ON plan_tratamientos AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE plan_tratamientos SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO

CREATE OR ALTER TRIGGER trg_citas_updated
ON citas AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE citas SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO

CREATE OR ALTER TRIGGER trg_notas_updated
ON notas_evolucion AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE notas_evolucion SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO

-- ============================================================
-- VISTAS
-- ============================================================

-- Vista: resumen por paciente
CREATE OR ALTER VIEW v_resumen_paciente AS
SELECT
    p.id,
    p.numero_hc,
    p.nombres + ' ' + p.apellidos          AS nombre_completo,
    p.telefono,
    p.dni,
    u.nombre_completo                       AS odontologo,
    COUNT(DISTINCT pt.id)                   AS total_tratamientos,
    COUNT(DISTINCT CASE WHEN pt.estado = 'completado' THEN pt.id END) AS completados,
    COUNT(DISTINCT CASE WHEN pt.estado = 'pendiente'  THEN pt.id END) AS pendientes,
    ISNULL(SUM(pt.total), 0)                AS monto_total_plan,
    ISNULL(SUM(pg.monto), 0)                AS monto_pagado,
    ISNULL(SUM(pt.total), 0) - ISNULL(SUM(pg.monto), 0) AS saldo_pendiente,
    p.created_at
FROM pacientes p
LEFT JOIN usuarios u               ON p.odontologo_id     = u.id
LEFT JOIN plan_tratamientos pt     ON pt.paciente_id       = p.id
LEFT JOIN pagos pg                 ON pg.paciente_id       = p.id
WHERE p.activo = 1
GROUP BY p.id, p.numero_hc, p.nombres, p.apellidos,
         p.telefono, p.dni, u.nombre_completo, p.created_at;
GO

-- Vista: agenda diaria
CREATE OR ALTER VIEW v_agenda_diaria AS
SELECT
    c.id                                            AS cita_id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.duracion_minutos,
    p.numero_hc,
    p.nombres + ' ' + p.apellidos                  AS paciente,
    p.telefono                                      AS telefono_paciente,
    u.nombre_completo                               AS odontologo,
    tt.nombre + ISNULL(' – ' + tt.subtipo, '')      AS tratamiento,
    c.estado,
    c.canal_reserva,
    c.notas,
    COUNT(rc.id)                                    AS recordatorios_enviados
FROM citas c
JOIN pacientes  p  ON c.paciente_id           = p.id
JOIN usuarios   u  ON c.odontologo_id         = u.id
LEFT JOIN tipos_tratamiento tt ON c.tipo_tratamiento_id = tt.id
LEFT JOIN recordatorios_citas rc ON rc.cita_id = c.id
GROUP BY c.id, c.fecha_cita, c.hora_inicio, c.hora_fin,
         c.duracion_minutos, p.numero_hc, p.nombres, p.apellidos,
         p.telefono, u.nombre_completo, tt.nombre, tt.subtipo,
         c.estado, c.canal_reserva, c.notas;
GO

-- Vista: estadísticas de tratamientos
CREATE OR ALTER VIEW v_estadisticas_tratamientos AS
SELECT
    tt.nombre,
    tt.subtipo,
    COUNT(pt.id)                                AS cantidad_planificada,
    SUM(CASE WHEN pt.estado = 'completado' THEN 1 ELSE 0 END) AS cantidad_completada,
    ISNULL(SUM(pt.total), 0)                    AS ingresos_proyectados
FROM tipos_tratamiento tt
LEFT JOIN plan_tratamientos pt ON pt.tipo_tratamiento_id = tt.id
GROUP BY tt.id, tt.nombre, tt.subtipo;
GO

-- Vista: log de auditoría legible
CREATE OR ALTER VIEW v_auditoria_legible AS
SELECT
    id,
    fecha_accion,
    ISNULL(nombre_usuario, 'Sistema')   AS realizado_por,
    accion,
    tabla_afectada,
    registro_id,
    campos_modificados,
    ip_address,
    datos_anteriores,
    datos_nuevos
FROM auditoria_log;
GO

-- ============================================================
-- DATOS SEMILLA
-- ============================================================
INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol) VALUES
(NEXT VALUE FOR seq_usuarios,
 'Administrador DentSalud',
 'admin@dentsalud.com',
 '$2b$12$placeholder_hash_cambiar_en_produccion',
 'administrador');

INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol, especialidad) VALUES
(NEXT VALUE FOR seq_usuarios,
 'Dr. Juan Pérez Torres',
 'jperez@dentsalud.com',
 '$2b$12$placeholder_hash_cambiar_en_produccion',
 'odontologo',
 'Odontología General');
GO

-- ============================================================
-- RESUMEN FINAL
-- ============================================================
-- Tablas      : 20
-- Sequences   : 19 (una por tabla)
-- Vistas      :  4
-- Triggers    : 13
-- Índices     : 22
-- Registros   : 52 piezas FDI + 31 tratamientos + seed usuarios
--
-- DIFERENCIAS CLAVE vs PostgreSQL:
--   SERIAL          → SEQUENCE + DEFAULT (NEXT VALUE FOR seq_x)
--   BOOLEAN         → BIT  (0/1)
--   TEXT            → NVARCHAR(MAX)
--   GENERATED ALWAYS AS ... STORED → AS (...) PERSISTED
--   NOW()           → GETDATE()
--   JSONB           → NVARCHAR(MAX) con FOR JSON PATH
--   INET            → NVARCHAR(50)
--   TEXT[]          → NVARCHAR(MAX) separado por comas
-- ============================================================
