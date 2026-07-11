-- ============================================================
-- Floripondía Boutique — Esquema MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS floripondia
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE floripondia;

-- -----------------------------------------------------------
-- 1. USUARIOS
-- -----------------------------------------------------------
CREATE TABLE usuarios (
  id       INT          AUTO_INCREMENT PRIMARY KEY,
  email    VARCHAR(120) NOT NULL UNIQUE,
  nombre   VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role     ENUM('cliente','vendedor','admin') NOT NULL DEFAULT 'cliente',
  creado   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 2. CATEGORÍAS (inventario)
-- -----------------------------------------------------------
CREATE TABLE categorias (
  id    INT         AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  stock INT         NOT NULL DEFAULT 0,
  color VARCHAR(7)  NOT NULL DEFAULT '#FFFFFF'
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 3. PRODUCTOS (catálogo virtual, opcional)
-- -----------------------------------------------------------
CREATE TABLE productos (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  categoria  VARCHAR(60)  NOT NULL,
  imagen     VARCHAR(255) NOT NULL DEFAULT '',
  color      VARCHAR(7)   NOT NULL DEFAULT '#FFFFFF',
  creado     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria) REFERENCES categorias(nombre) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 4. VENTAS
-- -----------------------------------------------------------
CREATE TABLE ventas (
  id           INT         AUTO_INCREMENT PRIMARY KEY,
  producto     VARCHAR(120) NOT NULL,
  cliente      VARCHAR(100) NOT NULL DEFAULT 'Cliente',
  cantidad     INT         NOT NULL DEFAULT 1,
  total        DECIMAL(12,0) NOT NULL DEFAULT 0,
  recibido     DECIMAL(12,0) NOT NULL DEFAULT 0,
  cambio       DECIMAL(12,0) NOT NULL DEFAULT 0,
  metodo_pago  ENUM('efectivo','tarjeta','transaccion') NOT NULL DEFAULT 'efectivo',
  fecha        DATE        NOT NULL DEFAULT (CURRENT_DATE),
  vendedor_id  INT         NOT NULL,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------
CREATE INDEX idx_ventas_fecha   ON ventas(fecha);
CREATE INDEX idx_ventas_vendedor ON ventas(vendedor_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

-- Admin por defecto
INSERT INTO usuarios (email, nombre, password, role) VALUES
  ('admin@floripondia.co', 'Admin', '$2b$10$oo77YmQPdEZTSopu5vaLYe5uoPh99YFKWTYOCGYjuHYTIZs0oET9O', 'admin');

-- Categorías con stock inicial
INSERT INTO categorias (nombre, stock, color) VALUES
  ('Chaquetas',       8,  '#FFF9C4'),
  ('Sacos',           9,  '#BBDEFB'),
  ('Jeanes',         16,  '#E1BEE7'),
  ('Pantalones',     15,  '#F8BBD0'),
  ('Pañoletas',       3,  '#C8E6C9'),
  ('Pantalonetas',    5,  '#FFE0B2'),
  ('Faldas / Vestidos', 14, '#F8BBD0'),
  ('Corsés',          7,  '#E1BEE7'),
  ('Blusas',         16,  '#F8BBD0'),
  ('Básicas',        11,  '#FFFFFF'),
  ('Bodies',          5,  '#F3E5F5'),
  ('Tenis',           2,  '#BBDEFB'),
  ('Sombreros',       2,  '#FFF9C4'),
  ('Camisetas',       6,  '#C8E6C9'),
  ('Gorras',          4,  '#FFF9C4'),
  ('Medias',          2,  '#E1BEE7'),
  ('Aretes',         39,  '#FFE0B2'),
  ('Collares',        9,  '#F8BBD0'),
  ('Bolsos',          7,  '#BBDEFB'),
  ('Caimanes',       16,  '#C8E6C9'),
  ('Pulseras',        8,  '#F3E5F5'),
  ('Correas',        12,  '#FFF9C4');

-- Productos de catálogo (cada categoría es un producto)
INSERT INTO productos (nombre, categoria, imagen, color) VALUES
  ('Chaquetas',       'Chaquetas',       '', '#FFF9C4'),
  ('Sacos',           'Sacos',           '', '#BBDEFB'),
  ('Jeanes',          'Jeanes',          '', '#E1BEE7'),
  ('Pantalones',      'Pantalones',      '', '#F8BBD0'),
  ('Pañoletas',       'Pañoletas',       '', '#C8E6C9'),
  ('Pantalonetas',    'Pantalonetas',    '', '#FFE0B2'),
  ('Faldas / Vestidos','Faldas / Vestidos','', '#F8BBD0'),
  ('Corsés',          'Corsés',          '', '#E1BEE7'),
  ('Blusas',          'Blusas',          '', '#F8BBD0'),
  ('Básicas',         'Básicas',         '', '#FFFFFF'),
  ('Bodies',          'Bodies',          '', '#F3E5F5'),
  ('Tenis',           'Tenis',           '', '#BBDEFB'),
  ('Sombreros',       'Sombreros',       '', '#FFF9C4'),
  ('Camisetas',       'Camisetas',       '', '#C8E6C9'),
  ('Gorras',          'Gorras',          '', '#FFF9C4'),
  ('Medias',          'Medias',          '', '#E1BEE7'),
  ('Aretes',          'Aretes',          '', '#FFE0B2'),
  ('Collares',        'Collares',        '', '#F8BBD0'),
  ('Bolsos',          'Bolsos',          '', '#BBDEFB'),
  ('Caimanes',        'Caimanes',        '', '#C8E6C9'),
  ('Pulseras',        'Pulseras',        '', '#F3E5F5'),
  ('Correas',         'Correas',         '', '#FFF9C4');

-- Ventas de ejemplo (asumiendo que admin tiene id = 1)
INSERT INTO ventas (producto, cliente, cantidad, total, recibido, cambio, metodo_pago, fecha, vendedor_id) VALUES
  ('Vestido Girasol',   'María López',   2, 129800, 130000,   200, 'efectivo', '2026-06-28', 1),
  ('Blusa Flores',      'Carla Mejía',   1,  38900,  40000,  1100, 'tarjeta',  '2026-06-27', 1),
  ('Zapatillas Pastel', 'Ana Torres',    1,  67900,  67900,     0, 'efectivo', '2026-06-26', 1),
  ('Pantalón Cargo',    'Sofía Ruiz',    2, 124000, 150000, 26000, 'transaccion', '2026-06-25', 1),
  ('Chaqueta Otoño',    'Valentina Paz', 1,  89900,  90000,   100, 'efectivo', '2026-06-24', 1),
  ('Vestido Vuelo',     'Laura Gil',     1,  59000,  60000,  1000, 'tarjeta',  '2026-06-23', 1);
