-- Script de inicialización para Payment Gateway
-- Este script crea la tabla de pagos en la misma base de datos

USE crowdfunding_db;

-- Crear tabla de pagos para el payment gateway
CREATE TABLE IF NOT EXISTS pagos (
  id CHAR(36) PRIMARY KEY,
  fechaRegistro DATETIME NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  fechaPago DATETIME NULL,
  identifier VARCHAR(255) NULL,
  INDEX idx_estado (estado),
  INDEX idx_fechaRegistro (fechaRegistro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

