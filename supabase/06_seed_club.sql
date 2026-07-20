-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Seed: Registro institucional
-- Tabla: club
-- Registro único (id fijo para garantir singleton)
-- ============================================================
-- history y logo_url son NOT NULL en el schema (01_tables.sql).
-- Se insertan placeholders editables desde el CMS.

INSERT INTO public.club (id, history, mission, values, location, logo_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Historia del Club Atlético Campito. Editar desde el panel de administración.',
  'Misión del club. Editar desde el panel de administración.',
  'Valores del club. Editar desde el panel de administración.',
  'Colón, Entre Ríos, Argentina',
  'logo-placeholder'
)
ON CONFLICT (id) DO NOTHING;

