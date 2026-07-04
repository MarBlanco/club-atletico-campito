-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.2: Auth + Users
-- Integración Supabase Auth con public.users
-- Sin RLS | Sin Policies | Sin Storage | Sin datos de prueba
-- ============================================================

-- ------------------------------------------------------------
-- TABLA: public.users
-- Vinculada 1:1 con auth.users mediante el mismo UUID
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  role        text NOT NULL CHECK (role IN ('admin', 'colaborador')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- FK: news.author_id → public.users.id
-- Se agrega aquí porque users no existía en Fase 2.1
-- Idempotente: solo crea la constraint si no existe
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_news_author'
      AND conrelid = 'public.news'::regclass
  ) THEN
    ALTER TABLE public.news
      ADD CONSTRAINT fk_news_author
      FOREIGN KEY (author_id)
      REFERENCES public.users (id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- FUNCIÓN: handle_new_user
-- Inserta automáticamente en public.users cuando se crea
-- un usuario en auth.users
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'colaborador')
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user()
  IS 'Sincroniza automáticamente auth.users con public.users.';

-- ------------------------------------------------------------
-- TRIGGER: on_auth_user_created
-- Se dispara después de cada INSERT en auth.users
-- PostgreSQL no soporta CREATE OR REPLACE TRIGGER
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
