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
  nombre VARCHAR(60) NOT NULL,
  sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia',
  stock INT         NOT NULL DEFAULT 0,
  color VARCHAR(7)  NOT NULL DEFAULT '#FFFFFF',
  descripcion TEXT,
  UNIQUE KEY uq_cat_nombre_suc (nombre, sucursal)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 3. PRODUCTOS (catálogo virtual, opcional)
-- -----------------------------------------------------------
CREATE TABLE productos (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  categoria  VARCHAR(60)  NOT NULL,
  sucursal   VARCHAR(20)  NOT NULL DEFAULT 'floripondia',
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
  metodo_pago  VARCHAR(20) NOT NULL DEFAULT 'efectivo',
  sucursal     VARCHAR(20) NOT NULL DEFAULT 'floripondia',
  fecha        DATE        NOT NULL,
  vendedor_id  INT         NOT NULL,
  comentario   TEXT,
  grupo_id     VARCHAR(36),
  detalles_pago TEXT,
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

-- -----------------------------------------------------------
-- 5. CIERRES DE CAJA
-- -----------------------------------------------------------
CREATE TABLE cierres (
  id            INT      AUTO_INCREMENT PRIMARY KEY,
  fecha         DATE     NOT NULL,
  sucursal      VARCHAR(20) NOT NULL DEFAULT 'floripondia',
  confirmado_por INT     NOT NULL,
  confirmado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cierre_fecha_suc (fecha, sucursal),
  FOREIGN KEY (confirmado_por) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 6. APARTADOS
-- -----------------------------------------------------------
CREATE TABLE apartados (
  id              INT         AUTO_INCREMENT PRIMARY KEY,
  cliente_nombre  VARCHAR(100) NOT NULL,
  cliente_celular VARCHAR(20)  NOT NULL DEFAULT '',
  cliente_correo  VARCHAR(120) NOT NULL DEFAULT '',
  producto        VARCHAR(120) NOT NULL,
  sucursal        VARCHAR(20)  NOT NULL DEFAULT 'floripondia',
  abono           DECIMAL(12,0) NOT NULL DEFAULT 0,
  saldo           DECIMAL(12,0) NOT NULL DEFAULT 0,
  fecha           DATE        NOT NULL,
  vendedor_id     INT         NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  comentario      TEXT,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 7. APERTURAS DE CAJA
-- -----------------------------------------------------------
CREATE TABLE aperturas_caja (
  id          INT      AUTO_INCREMENT PRIMARY KEY,
  fecha       DATE     NOT NULL,
  sucursal    VARCHAR(20) NOT NULL DEFAULT 'floripondia',
  abierto_por INT      NOT NULL,
  abierto_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (abierto_por) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 8. CONTABILIDAD — categorías
-- -----------------------------------------------------------
CREATE TABLE contabilidad_categorias (
  id     INT          AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60)  NOT NULL,
  tipo   ENUM('inversion','gasto') NOT NULL DEFAULT 'gasto',
  color  VARCHAR(7)   NOT NULL DEFAULT '#E1BEE7'
) ENGINE=InnoDB;

-- Categorías por defecto
INSERT INTO contabilidad_categorias (nombre, tipo, color) VALUES
  ('Compra de ropa',        'inversion', '#E1BEE7'),
  ('Accesorios / Complementos', 'inversion', '#BBDEFB'),
  ('Adecuación del local',  'inversion', '#FFF9C4'),
  ('Equipos y muebles',     'inversion', '#C8E6C9'),
  ('Otros (inversión)',     'inversion', '#F8BBD0'),
  ('Arriendo',              'gasto', '#BBDEFB'),
  ('Servicios públicos',    'gasto', '#FFF9C4'),
  ('Empleados / Salarios',  'gasto', '#C8E6C9'),
  ('Transporte',            'gasto', '#F8BBD0'),
  ('Publicidad / Marketing','gasto', '#E1BEE7'),
  ('Papelería',             'gasto', '#B2EBF2'),
  ('Mantenimiento',         'gasto', '#FFE0B2'),
  ('Otros',                 'gasto', '#BBBBBB');

-- -----------------------------------------------------------
-- 9. CONTABILIDAD — movimientos
-- -----------------------------------------------------------
CREATE TABLE contabilidad (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE         NOT NULL,
  tipo         ENUM('inversion','gasto') NOT NULL DEFAULT 'gasto',
  categoria_id INT,
  descripcion  TEXT,
  monto        DECIMAL(12,0) NOT NULL DEFAULT 0,
  es_diario    TINYINT      NOT NULL DEFAULT 0,
  sucursal     VARCHAR(20)  NOT NULL DEFAULT 'floripondia',
  usuario_id   INT          NOT NULL,
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES contabilidad_categorias(id) ON UPDATE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Migración para bases existentes
ALTER TABLE ventas MODIFY COLUMN metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo';
ALTER TABLE ventas ADD COLUMN comentario TEXT;
ALTER TABLE ventas ADD COLUMN grupo_id VARCHAR(36) AFTER comentario;
ALTER TABLE ventas ADD COLUMN detalles_pago TEXT AFTER grupo_id;
ALTER TABLE ventas ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE productos ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE categorias ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE categorias DROP INDEX nombre;
ALTER TABLE categorias ADD UNIQUE KEY uq_cat_nombre_suc (nombre, sucursal);
ALTER TABLE apartados ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE aperturas_caja ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE contabilidad ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE cierres ADD COLUMN sucursal VARCHAR(20) NOT NULL DEFAULT 'floripondia';
ALTER TABLE cierres DROP INDEX fecha;
ALTER TABLE cierres ADD UNIQUE KEY uq_cierre_fecha_suc (fecha, sucursal);

-- Tablas de contabilidad (para bases con el esquema anterior)
CREATE TABLE IF NOT EXISTS contabilidad_categorias (
  id     INT          AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60)  NOT NULL,
  tipo   ENUM('inversion','gasto') NOT NULL DEFAULT 'gasto',
  color  VARCHAR(7)   NOT NULL DEFAULT '#E1BEE7'
);
CREATE TABLE IF NOT EXISTS contabilidad (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE         NOT NULL,
  tipo         ENUM('inversion','gasto') NOT NULL DEFAULT 'gasto',
  categoria_id INT,
  descripcion  TEXT,
  monto        DECIMAL(12,0) NOT NULL DEFAULT 0,
  es_diario    TINYINT      NOT NULL DEFAULT 0,
  sucursal     VARCHAR(20)  NOT NULL DEFAULT 'floripondia',
  usuario_id   INT          NOT NULL,
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
