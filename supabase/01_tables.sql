-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.1: Tablas base
-- Supabase PostgreSQL
-- Sin Auth | Sin RLS | Sin Storage | Sin triggers
-- ============================================================

-- ------------------------------------------------------------
-- CLUB
-- Registro único institucional
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  history     text NOT NULL,
  mission     text,
  values      text,
  location    text NOT NULL,
  logo_url    text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PLAYERS
-- Plantel de Primera División
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  surname     text NOT NULL,
  number      integer NOT NULL,
  position    text NOT NULL CHECK (position IN ('Arquero', 'Defensor', 'Mediocampista', 'Delantero')),
  image_url   text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- STAFF
-- Personal vinculado al club
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  role        text NOT NULL,
  category    text NOT NULL CHECK (category IN ('primera', 'infanto', 'directivos')),
  image_url   text,
  active      boolean NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- MATCHES
-- Fixture de partidos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rival         text NOT NULL,
  date          timestamptz NOT NULL,
  competition   text NOT NULL,
  status        text NOT NULL CHECK (status IN ('upcoming', 'finished')),
  goals_for     integer,
  goals_against integer
);

-- ------------------------------------------------------------
-- GALLERIES
-- Momentos Campito — prerequisito de media
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS galleries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  category    text NOT NULL CHECK (category IN ('primera', 'infanto', 'femenino', 'veteranos', 'familias', 'hinchas')),
  match_date  date NOT NULL,
  cover_image text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- NEWS
-- Noticias institucionales y deportivas
-- author_id se agregará en Fase 2.2 junto con la tabla users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  excerpt     text NOT NULL,
  content     text NOT NULL,
  image_url   text NOT NULL,
  published   boolean NOT NULL DEFAULT false,
  author_id   uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- MEDIA
-- Fotos y videos vinculados a una galería
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id    uuid NOT NULL REFERENCES galleries (id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('image', 'video')),
  url           text NOT NULL,
  thumbnail_url text,
  created_at    timestamptz NOT NULL DEFAULT now()
);


