-- Script SQL para insertar las especialidades en la base de datos
-- Ejecutar este script en tu gestor de base de datos (MySQL/MariaDB)

-- Insertar especialidades en la tabla especialidad
-- Si ya existen, las actualiza (ON DUPLICATE KEY UPDATE)

INSERT INTO especialidad (idEspecialidad, nombre, estado) VALUES
(1, 'ADMINISTRACION LOGISTICA Y DISTRIBUCION', 1),
(2, 'ADMINISTRACION Y OPERACION ADUANERA', 1),
(3, 'GESTION DE LA PRODUCCION', 1),
(4, 'CONFIGURACION Y SOPORTE DE REDES', 1),
(5, 'SALUD OCUPACIONAL', 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    estado = VALUES(estado);

-- Verificar que se insertaron correctamente
SELECT * FROM especialidad ORDER BY idEspecialidad;

-- Contar total de especialidades
SELECT COUNT(*) AS total_especialidades FROM especialidad WHERE estado = 1;
