--
-- PostgreSQL database dump
--

\restrict Psbux8pgfMgAygHTTJ9J50ToBpBD6wnH6zW8fAkIbXVWqscf65drbAqOcbBErbK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-13 16:01:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 16746)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 4 (class 3079 OID 16851)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 2 (class 3079 OID 16709)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 985 (class 1247 OID 16958)
-- Name: dificultad_ruta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.dificultad_ruta AS ENUM (
    'facil',
    'medio',
    'dificil'
);


ALTER TYPE public.dificultad_ruta OWNER TO postgres;

--
-- TOC entry 976 (class 1247 OID 16938)
-- Name: estado_general; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_general AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_general OWNER TO postgres;

--
-- TOC entry 979 (class 1247 OID 16944)
-- Name: estado_sugerencia; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_sugerencia AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada'
);


ALTER TYPE public.estado_sugerencia OWNER TO postgres;

--
-- TOC entry 973 (class 1247 OID 16933)
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario AS ENUM (
    'admin',
    'usuario'
);


ALTER TYPE public.rol_usuario OWNER TO postgres;

--
-- TOC entry 982 (class 1247 OID 16952)
-- Name: tipo_consulta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_consulta AS ENUM (
    'vista',
    'ruta_generada'
);


ALTER TYPE public.tipo_consulta OWNER TO postgres;

--
-- TOC entry 988 (class 1247 OID 16966)
-- Name: tipo_ruta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_ruta AS ENUM (
    'cultural',
    'gastronomico',
    'naturaleza',
    'mixto'
);


ALTER TYPE public.tipo_ruta OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 17120)
-- Name: refresh_ciudad_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_ciudad_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  target varchar(50);
BEGIN
  target := COALESCE(NEW.id_ciudad, OLD.id_ciudad);

  UPDATE public.ciudad c
  SET calificacion_promedio = COALESCE(sub.avg::numeric(3,2), 0.00),
      calificacion_count    = COALESCE(sub.cnt, 0)
  FROM (
    SELECT id_ciudad, AVG(calificacion) AS avg, COUNT(*) AS cnt
    FROM public.comentario
    WHERE id_ciudad = target AND estado = 'activo'
    GROUP BY id_ciudad
  ) sub
  WHERE c.id = target;

  IF TG_OP = 'UPDATE' AND NEW.id_ciudad IS DISTINCT FROM OLD.id_ciudad THEN
    UPDATE public.ciudad c
    SET calificacion_promedio = COALESCE(sub2.avg::numeric(3,2), 0.00),
        calificacion_count    = COALESCE(sub2.cnt, 0)
    FROM (
      SELECT id_ciudad, AVG(calificacion) AS avg, COUNT(*) AS cnt
      FROM public.comentario
      WHERE id_ciudad = OLD.id_ciudad AND estado = 'activo'
      GROUP BY id_ciudad
    ) sub2
    WHERE c.id = OLD.id_ciudad;
  END IF;

  RETURN NULL;  -- AFTER trigger
END
$$;


ALTER FUNCTION public.refresh_ciudad_rating() OWNER TO postgres;

--
-- TOC entry 343 (class 1255 OID 17011)
-- Name: touch_ciudad_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_ciudad_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
  RETURN NEW;
END
$$;


ALTER FUNCTION public.touch_ciudad_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16990)
-- Name: ciudad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ciudad (
    id character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    resumen text,
    imagenes text[] DEFAULT '{}'::text[] NOT NULL,
    etiquetas text[] DEFAULT '{}'::text[] NOT NULL,
    duracion character varying(50),
    calificacion_promedio numeric(3,2) DEFAULT 0.00 NOT NULL,
    calificacion_count integer DEFAULT 0 NOT NULL,
    coordenadas jsonb,
    descripcion text,
    mejor_epoca character varying(100),
    puntos_interes jsonb,
    estado public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT city_coords_is_object CHECK (((coordenadas IS NULL) OR (jsonb_typeof(coordenadas) = 'object'::text)))
);


ALTER TABLE public.ciudad OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17013)
-- Name: comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    id_ciudad character varying(50) NOT NULL,
    calificacion integer NOT NULL,
    comentario text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT comentario_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


ALTER TABLE public.comentario OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17100)
-- Name: favorito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorito (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    id_ciudad character varying(50) NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.favorito OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17039)
-- Name: historial_ruta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_ruta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    id_ciudad character varying(50) NOT NULL,
    fecha_consulta timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_consulta public.tipo_consulta NOT NULL,
    detalles jsonb
);


ALTER TABLE public.historial_ruta OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17082)
-- Name: ruta_predefinida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ruta_predefinida (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_ciudad character varying(50) NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    duracion_horas integer,
    puntos_parada jsonb,
    dificultad public.dificultad_ruta,
    tipo public.tipo_ruta,
    estado public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ruta_predefinida OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17060)
-- Name: sugerencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sugerencia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_usuario uuid NOT NULL,
    nombre_lugar character varying(255) NOT NULL,
    ciudad character varying(100) NOT NULL,
    descripcion text,
    coordenadas jsonb,
    estado public.estado_sugerencia DEFAULT 'pendiente'::public.estado_sugerencia NOT NULL,
    fecha_sugerencia timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    respuesta_admin text,
    id_admin_respuesta uuid
);


ALTER TABLE public.sugerencia OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16975)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    fecha_nacimiento date,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rol public.rol_usuario DEFAULT 'usuario'::public.rol_usuario NOT NULL,
    estado public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    ubicacion jsonb
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 16990)
-- Dependencies: 221
-- Data for Name: ciudad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ciudad (id, slug, nombre, resumen, imagenes, etiquetas, duracion, calificacion_promedio, calificacion_count, coordenadas, descripcion, mejor_epoca, puntos_interes, estado, fecha_creacion, fecha_actualizacion) FROM stdin;
bogota	bogota	Bogotá	Capital con museos y arte urbano.	{/IMG/BOGOTA.png}	{Historia,Arte,Gastronomía}	1-2 días	0.00	0	{"lat": 4.711, "lng": -74.072}	Bogotá mezcla historia y modernidad.	Todo el año	[{"nombre": "Museo del Oro", "descripcion": "Orfebrería prehispánica."}]	activo	2025-11-10 20:31:05.8804	2025-11-10 20:31:05.8804
\.


--
-- TOC entry 5183 (class 0 OID 17013)
-- Dependencies: 222
-- Data for Name: comentario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentario (id, id_usuario, id_ciudad, calificacion, comentario, fecha, estado, updated_at) FROM stdin;
\.


--
-- TOC entry 5187 (class 0 OID 17100)
-- Dependencies: 226
-- Data for Name: favorito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorito (id, id_usuario, id_ciudad, fecha_agregado) FROM stdin;
\.


--
-- TOC entry 5184 (class 0 OID 17039)
-- Dependencies: 223
-- Data for Name: historial_ruta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_ruta (id, id_usuario, id_ciudad, fecha_consulta, tipo_consulta, detalles) FROM stdin;
\.


--
-- TOC entry 5186 (class 0 OID 17082)
-- Dependencies: 225
-- Data for Name: ruta_predefinida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ruta_predefinida (id, id_ciudad, nombre, descripcion, duracion_horas, puntos_parada, dificultad, tipo, estado, fecha_creacion) FROM stdin;
\.


--
-- TOC entry 5185 (class 0 OID 17060)
-- Dependencies: 224
-- Data for Name: sugerencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sugerencia (id, id_usuario, nombre_lugar, ciudad, descripcion, coordenadas, estado, fecha_sugerencia, respuesta_admin, id_admin_respuesta) FROM stdin;
\.


--
-- TOC entry 5181 (class 0 OID 16975)
-- Dependencies: 220
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, email, password_hash, nombres, apellidos, fecha_nacimiento, fecha_registro, rol, estado, ubicacion) FROM stdin;
ee2ad4c6-0236-424c-9617-e561aac3b744	admin@nemcatacoa.com	$2b$12$1MXnFQZ13JB5HSc7UrYGi.2gaVyjLta32M5XwBmPQPQJlPUe/Pcs6	Admin	Nemcatacoa	\N	2025-11-10 20:31:05.8804	admin	activo	\N
1c4c5d3d-1c20-457f-b2a8-dcba9aa04e7a	usuario@ejemplo.com	$2b$12$.uw8Nd3Rey..V.kqfv.9/O0PQq.Q2.9PHyP6a8rob5LyfKkykuRLq	Juan	Pérez	\N	2025-11-12 13:03:30.57217	usuario	activo	\N
\.


--
-- TOC entry 4994 (class 2606 OID 17004)
-- Name: ciudad ciudad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciudad
    ADD CONSTRAINT ciudad_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 17006)
-- Name: ciudad ciudad_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciudad
    ADD CONSTRAINT ciudad_slug_key UNIQUE (slug);


--
-- TOC entry 5002 (class 2606 OID 17026)
-- Name: comentario comentario_id_usuario_id_ciudad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_id_usuario_id_ciudad_key UNIQUE (id_usuario, id_ciudad);


--
-- TOC entry 5004 (class 2606 OID 17024)
-- Name: comentario comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 17108)
-- Name: favorito favorito_id_usuario_id_ciudad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_id_usuario_id_ciudad_key UNIQUE (id_usuario, id_ciudad);


--
-- TOC entry 5023 (class 2606 OID 17106)
-- Name: favorito favorito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 17047)
-- Name: historial_ruta historial_ruta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ruta
    ADD CONSTRAINT historial_ruta_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 17091)
-- Name: ruta_predefinida ruta_predefinida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruta_predefinida
    ADD CONSTRAINT ruta_predefinida_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 17069)
-- Name: sugerencia sugerencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencia
    ADD CONSTRAINT sugerencia_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 16987)
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- TOC entry 4992 (class 2606 OID 16985)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 1259 OID 17007)
-- Name: idx_ciudad_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ciudad_estado ON public.ciudad USING btree (estado);


--
-- TOC entry 4998 (class 1259 OID 17009)
-- Name: idx_ciudad_nombre_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ciudad_nombre_gin ON public.ciudad USING gin (nombre public.gin_trgm_ops);


--
-- TOC entry 4999 (class 1259 OID 17010)
-- Name: idx_ciudad_poi_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ciudad_poi_gin ON public.ciudad USING gin (puntos_interes);


--
-- TOC entry 5000 (class 1259 OID 17008)
-- Name: idx_ciudad_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ciudad_slug ON public.ciudad USING btree (slug);


--
-- TOC entry 5005 (class 1259 OID 17037)
-- Name: idx_comentario_ciudad_activos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentario_ciudad_activos ON public.comentario USING btree (id_ciudad) WHERE (estado = 'activo'::public.estado_general);


--
-- TOC entry 5006 (class 1259 OID 17038)
-- Name: idx_comentario_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentario_usuario ON public.comentario USING btree (id_usuario);


--
-- TOC entry 5024 (class 1259 OID 17119)
-- Name: idx_favorito_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorito_usuario ON public.favorito USING btree (id_usuario);


--
-- TOC entry 5009 (class 1259 OID 17059)
-- Name: idx_historial_ciudad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_ciudad ON public.historial_ruta USING btree (id_ciudad);


--
-- TOC entry 5010 (class 1259 OID 17058)
-- Name: idx_historial_usuario_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_usuario_fecha ON public.historial_ruta USING btree (id_usuario, fecha_consulta DESC);


--
-- TOC entry 5015 (class 1259 OID 17097)
-- Name: idx_ruta_ciudad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ruta_ciudad ON public.ruta_predefinida USING btree (id_ciudad);


--
-- TOC entry 5016 (class 1259 OID 17099)
-- Name: idx_ruta_dificultad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ruta_dificultad ON public.ruta_predefinida USING btree (dificultad);


--
-- TOC entry 5017 (class 1259 OID 17098)
-- Name: idx_ruta_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ruta_tipo ON public.ruta_predefinida USING btree (tipo);


--
-- TOC entry 5011 (class 1259 OID 17080)
-- Name: idx_sugerencia_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sugerencia_estado ON public.sugerencia USING btree (estado);


--
-- TOC entry 5012 (class 1259 OID 17081)
-- Name: idx_sugerencia_usuario_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sugerencia_usuario_fecha ON public.sugerencia USING btree (id_usuario, fecha_sugerencia DESC);


--
-- TOC entry 4987 (class 1259 OID 16988)
-- Name: idx_usuario_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_email ON public.usuario USING btree (email);


--
-- TOC entry 4988 (class 1259 OID 16989)
-- Name: idx_usuario_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_estado ON public.usuario USING btree (estado);


--
-- TOC entry 5034 (class 2620 OID 17012)
-- Name: ciudad ciudad_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER ciudad_touch_updated_at BEFORE UPDATE ON public.ciudad FOR EACH ROW EXECUTE FUNCTION public.touch_ciudad_updated_at();


--
-- TOC entry 5035 (class 2620 OID 17121)
-- Name: comentario comentario_refresh_rating; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER comentario_refresh_rating AFTER INSERT OR DELETE OR UPDATE ON public.comentario FOR EACH ROW EXECUTE FUNCTION public.refresh_ciudad_rating();


--
-- TOC entry 5025 (class 2606 OID 17032)
-- Name: comentario comentario_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudad(id) ON DELETE CASCADE;


--
-- TOC entry 5026 (class 2606 OID 17027)
-- Name: comentario comentario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 17114)
-- Name: favorito favorito_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudad(id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 17109)
-- Name: favorito favorito_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 5027 (class 2606 OID 17053)
-- Name: historial_ruta historial_ruta_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ruta
    ADD CONSTRAINT historial_ruta_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudad(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 17048)
-- Name: historial_ruta historial_ruta_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_ruta
    ADD CONSTRAINT historial_ruta_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 17092)
-- Name: ruta_predefinida ruta_predefinida_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ruta_predefinida
    ADD CONSTRAINT ruta_predefinida_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudad(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 17075)
-- Name: sugerencia sugerencia_id_admin_respuesta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencia
    ADD CONSTRAINT sugerencia_id_admin_respuesta_fkey FOREIGN KEY (id_admin_respuesta) REFERENCES public.usuario(id);


--
-- TOC entry 5030 (class 2606 OID 17070)
-- Name: sugerencia sugerencia_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencia
    ADD CONSTRAINT sugerencia_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE CASCADE;


-- Completed on 2025-11-13 16:01:42

--
-- PostgreSQL database dump complete
--

\unrestrict Psbux8pgfMgAygHTTJ9J50ToBpBD6wnH6zW8fAkIbXVWqscf65drbAqOcbBErbK

