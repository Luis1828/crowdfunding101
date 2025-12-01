-- ============================================
-- Script de Inicialización - CrowdFunding101
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS crowdfunding_db;
USE crowdfunding_db;

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('usuario', 'administrador') DEFAULT 'usuario',
  activado BOOLEAN DEFAULT FALSE,
  token_activacion VARCHAR(255),
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  icono VARCHAR(100),
  descripcion TEXT,
  INDEX idx_nombre (nombre)
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria_id INT NOT NULL,
  meta DECIMAL(10, 2) NOT NULL,
  fecha_limite DATE NOT NULL,
  imagen VARCHAR(500),
  creador_id INT NOT NULL,
  estado ENUM('Borrador', 'En Revisión', 'Observado', 'Rechazado', 'Publicado') DEFAULT 'Borrador',
  campaña_estado ENUM('No Iniciada', 'En Progreso', 'En Pausa', 'Finalizada') DEFAULT 'No Iniciada',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (creador_id) REFERENCES usuarios(id),
  INDEX idx_estado (estado),
  INDEX idx_campaña_estado (campaña_estado),
  INDEX idx_creador (creador_id),
  INDEX idx_categoria (categoria_id)
);

-- Tabla de donaciones
CREATE TABLE IF NOT EXISTS donaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proyecto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  nombre_mostrado VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (fecha)
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  proyecto_id INT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (usuario_id, proyecto_id),
  INDEX idx_usuario (usuario_id)
);

-- Tabla de observaciones
CREATE TABLE IF NOT EXISTS observaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proyecto_id INT NOT NULL,
  administrador_id INT NOT NULL,
  texto TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (administrador_id) REFERENCES usuarios(id),
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_fecha (fecha)
);

-- Tabla de pagos pendientes (para integración con payment gateway)
CREATE TABLE IF NOT EXISTS pagos_pendientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pago_id VARCHAR(255) NOT NULL UNIQUE,
  proyecto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  nombre_mostrado VARCHAR(255),
  estado ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_confirmacion DATETIME,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_pago_id (pago_id),
  INDEX idx_proyecto (proyecto_id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_estado (estado)
);

-- Tabla de requisitos por categoría (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS categorias_requisitos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria_id INT NOT NULL,
  nombre_requisito VARCHAR(255) NOT NULL,
  tipo ENUM('texto', 'archivo', 'numero') DEFAULT 'texto',
  obligatorio BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
  INDEX idx_categoria (categoria_id)
);

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Insertar categorías
INSERT INTO categorias (nombre, icono, descripcion) VALUES
('Tecnología', 'fi fi-rr-laptop', 'Innovaciones tecnológicas y gadgets'),
('Arte', 'fi fi-rr-palette', 'Proyectos creativos y artísticos'),
('Cine', 'fi fi-rr-film', 'Películas y documentales'),
('Música', 'fi fi-rr-music', 'Álbumes y giras'),
('Publicación', 'fi fi-rr-book', 'Libros y revistas'),
('Medio Ambiente', 'fi fi-rr-leaf', 'Proyectos sostenibles')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar usuarios (contraseñas hasheadas con bcrypt: "admin123", "user123")
-- Para producción, usar bcrypt.hash() en el código
INSERT INTO usuarios (nombre, email, password, rol, activado) VALUES
('Admin User', 'admin@crowdfunding101.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'administrador', TRUE),
('María González', 'maria@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'usuario', TRUE),
('Carlos Ruiz', 'carlos@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'usuario', TRUE),
('Ana López', 'ana@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'usuario', TRUE),
('Test User', 'test@test.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'usuario', FALSE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Nota: Las contraseñas deben ser hasheadas con bcrypt en el código
-- Por ahora usamos placeholders. El script de inicialización real debería
-- usar bcrypt.hash() o insertar después de que el backend esté corriendo

-- Insertar proyectos de prueba
INSERT INTO proyectos (titulo, descripcion, categoria_id, meta, fecha_limite, imagen, creador_id, estado, campaña_estado) VALUES
('SmartWatch Pro - El reloj del futuro', 'SmartWatch Pro es el reloj inteligente más avanzado con funciones de salud, GPS y conectividad total.', 1, 20000.00, DATE_ADD(NOW(), INTERVAL 15 DAY), 'assets/images/tech_startup.jpg', 2, 'Publicado', 'En Progreso'),
('EcoBottle - Botella reutilizable inteligente', 'Botella de agua que rastrea tu hidratación y te recuerda beber agua.', 6, 10000.00, DATE_ADD(NOW(), INTERVAL 0 DAY), 'assets/images/eco_project.jpg', 3, 'Publicado', 'Finalizada'),
('Arte Abstracto: Universo Interior', 'Colección de pinturas abstractas que exploran emociones y conceptos universales.', 2, 10000.00, DATE_ADD(NOW(), INTERVAL 28 DAY), 'assets/images/art_creative.jpg', 4, 'Publicado', 'En Progreso'),
('Documental: Voces del Amazonas', 'Documental sobre la riqueza cultural del Amazonas y las comunidades indígenas.', 3, 30000.00, DATE_ADD(NOW(), INTERVAL 42 DAY), 'assets/images/nuevos/documental-amazonas.jpg', 2, 'Publicado', 'En Progreso'),
('Álbum: Sueños Electrónicos', 'Viaje sonoro de paisajes electrónicos y ambientales.', 4, 10000.00, DATE_ADD(NOW(), INTERVAL 10 DAY), 'assets/images/music_campaign.jpg', 3, 'Publicado', 'En Progreso'),
('Libro: Fronteras de la Ciencia', 'Exploración de avances en física y inteligencia artificial.', 5, 10000.00, DATE_ADD(NOW(), INTERVAL 5 DAY), 'assets/images/book_publication.jpg', 4, 'Publicado', 'En Progreso'),
('HealthApp - Tu salud en tus manos', 'Aplicación móvil para monitoreo de salud y bienestar personal.', 1, 25000.00, DATE_ADD(NOW(), INTERVAL 20 DAY), 'assets/images/nuevos/app-salud.jpg', 2, 'Publicado', 'En Progreso'),
('Proyecto Nuevo - Esperando Revisión', 'Este es un proyecto nuevo que está esperando revisión por parte del administrador.', 1, 15000.00, DATE_ADD(NOW(), INTERVAL 30 DAY), 'assets/images/tech_startup.jpg', 2, 'En Revisión', 'No Iniciada'),
('Proyecto con Observaciones', 'Este proyecto necesita algunas correcciones antes de ser publicado.', 6, 20000.00, DATE_ADD(NOW(), INTERVAL 45 DAY), 'assets/images/eco_project.jpg', 3, 'Observado', 'No Iniciada'),
('Proyecto Rechazado', 'Este proyecto fue rechazado por no cumplir con los lineamientos de la plataforma.', 2, 10000.00, DATE_ADD(NOW(), INTERVAL 0 DAY), 'assets/images/art_creative.jpg', 4, 'Rechazado', 'No Iniciada'),
('Proyecto en Borrador', 'Este proyecto aún está en borrador y no ha sido enviado para revisión.', 4, 12000.00, DATE_ADD(NOW(), INTERVAL 60 DAY), 'assets/images/music_campaign.jpg', 5, 'Borrador', 'No Iniciada')
ON DUPLICATE KEY UPDATE titulo=titulo;

-- Insertar donaciones de prueba
INSERT INTO donaciones (proyecto_id, usuario_id, monto, nombre_mostrado, fecha) VALUES
(1, 2, 500.00, 'María González', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 3, 1000.00, 'Carlos Ruiz', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 4, 750.00, 'Ana López', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 800.00, 'María González', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 3, 1200.00, 'Carlos Ruiz', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(3, 2, 500.00, 'María González', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 1000.00, 'Carlos Ruiz', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE monto=monto;

-- Insertar favoritos de prueba
INSERT INTO favoritos (usuario_id, proyecto_id) VALUES
(2, 3),
(2, 4),
(3, 1),
(3, 5),
(4, 1),
(4, 2)
ON DUPLICATE KEY UPDATE usuario_id=usuario_id;

-- Insertar observaciones de prueba
INSERT INTO observaciones (proyecto_id, administrador_id, texto, fecha) VALUES
(9, 1, 'Falta información sobre el impacto ambiental. Por favor agregue más detalles sobre los materiales utilizados.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 1, 'El proyecto no cumple con los requisitos de contenido apropiado.', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE texto=texto;

-- ============================================
-- ACTUALIZAR CONTRASEÑAS REALES
-- ============================================
-- Nota: Las contraseñas deben ser hasheadas con bcrypt
-- Este script se ejecutará después de que el backend esté corriendo
-- o se puede hacer manualmente con el código de inicialización

-- Para desarrollo, puedes usar este comando SQL después de que el backend haya hasheado las contraseñas:
-- UPDATE usuarios SET password = '$2a$10$...' WHERE email = 'admin@crowdfunding101.com';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

