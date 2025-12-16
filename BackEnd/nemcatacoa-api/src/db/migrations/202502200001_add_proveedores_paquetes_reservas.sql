CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rol adicional para proveedores
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'proveedor';

-- Perfil de proveedor
CREATE TABLE IF NOT EXISTS proveedor (
  id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  nombre_comercial VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  descripcion TEXT,
  verificado BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Estados de paquete
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_paquete') THEN
    CREATE TYPE public.estado_paquete AS ENUM ('pendiente','aprobado','rechazado','activo','inactivo');
  END IF;
END $$;

-- Paquetes turísticos
CREATE TABLE IF NOT EXISTS paquete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proveedor UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_ciudad VARCHAR(50) NOT NULL REFERENCES ciudad(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  incluye JSONB,
  no_incluye JSONB,
  precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  fecha_inicio DATE,
  fecha_fin DATE,
  cupo_max INTEGER NOT NULL CHECK (cupo_max > 0),
  imagenes TEXT[] NOT NULL DEFAULT '{}'::text[],
  estado public.estado_paquete NOT NULL DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paquete_ciudad ON paquete(id_ciudad);
CREATE INDEX IF NOT EXISTS idx_paquete_proveedor ON paquete(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_paquete_estado ON paquete(estado);

-- Estados de reservas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reserva') THEN
    CREATE TYPE public.estado_reserva AS ENUM ('reservada','cancelada','pagada');
  END IF;
END $$;

-- Reservas de paquetes
CREATE TABLE IF NOT EXISTS reserva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_paquete UUID NOT NULL REFERENCES paquete(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  cantidad_personas INTEGER NOT NULL CHECK (cantidad_personas > 0),
  estado public.estado_reserva NOT NULL DEFAULT 'reservada',
  fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reserva_paquete ON reserva(id_paquete);
CREATE INDEX IF NOT EXISTS idx_reserva_cliente ON reserva(id_cliente);
