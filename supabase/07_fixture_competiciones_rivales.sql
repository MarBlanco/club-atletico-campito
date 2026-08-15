-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Migración: Competiciones y Rivales
-- Tablas: competitions, rivals
-- Tabla alterada: matches (referencias reales + estado 'suspended')
-- RLS: competiciones y rivales — lectura pública, escritura admin
-- ============================================================

-- Helpers de rol (idénticos a los de 05_rls.sql).
-- Se recrean con CREATE OR REPLACE para que esta migración sea
-- aplicable de forma independiente, incluso si 05_rls.sql aún no
-- se ejecutó en la instancia.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role IN ('admin', 'colaborador')
  )
$$;

-- ------------------------------------------------------------
-- COMPETITIONS
-- Competiciones administrables (liga, copa, amistoso, ...)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- RIVALS
-- Rivales administrables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rivals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- MATCHES — referencias reales
-- Se agregan FKs a competitions/rivals (RESTRICT: no se puede
-- eliminar una entidad utilizada por partidos → preserva historial).
-- ------------------------------------------------------------
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions (id) ON DELETE RESTRICT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS rival_id       uuid REFERENCES public.rivals (id)       ON DELETE RESTRICT;

-- Backfill desde los valores de texto históricos (si existieran).
-- Las condiciones verifican que la columna de texto exista todavía,
-- para que la migración pueda re-ejecutarse sin romperse.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'competition'
  ) THEN
    INSERT INTO public.competitions (name)
    SELECT DISTINCT competition FROM public.matches
    WHERE competition IS NOT NULL AND competition <> ''
    ON CONFLICT (name) DO NOTHING;

    UPDATE public.matches m
       SET competition_id = c.id
      FROM public.competitions c
     WHERE m.competition = c.name
       AND m.competition_id IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'rival'
  ) THEN
    INSERT INTO public.rivals (name)
    SELECT DISTINCT rival FROM public.matches
    WHERE rival IS NOT NULL AND rival <> ''
    ON CONFLICT (name) DO NOTHING;

    UPDATE public.matches m
       SET rival_id = r.id
      FROM public.rivals r
     WHERE m.rival = r.name
       AND m.rival_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.matches ALTER COLUMN competition_id SET NOT NULL;
ALTER TABLE public.matches ALTER COLUMN rival_id       SET NOT NULL;

-- Se eliminan las columnas de texto libre; el nombre se resuelve por relación.
ALTER TABLE public.matches DROP COLUMN IF EXISTS competition;
ALTER TABLE public.matches DROP COLUMN IF EXISTS rival;

-- Nuevo estado 'suspended'
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_status_check CHECK (status IN ('upcoming', 'finished', 'suspended'));

-- Índices de soporte
CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON public.matches (competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_rival_id       ON public.matches (rival_id);

-- ------------------------------------------------------------
-- RLS — competiciones y rivales
-- Lectura pública (necesaria para selects y web pública).
-- Escritura SOLO admin (is_admin): el colaborador sólo selecciona.
-- ------------------------------------------------------------
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitions_select_public" ON public.competitions FOR SELECT TO public USING (true);
CREATE POLICY "competitions_write_admin"   ON public.competitions FOR ALL    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.rivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rivals_select_public" ON public.rivals FOR SELECT TO public USING (true);
CREATE POLICY "rivals_write_admin"   ON public.rivals FOR ALL    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());