-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.4: RLS Policies
-- Bucket: campito-media
-- Tablas: storage.objects
-- Roles: admin / colaborador (authenticated)
-- Público: lectura de contenido publicado
-- ============================================================

-- ------------------------------------------------------------
-- storage.objects — políticas para el bucket campito-media
-- Bucket marcado como public=true → SELECT público vía URL
-- Escritura sólo para usuarios autenticados (admin/colaborador)
-- ------------------------------------------------------------

-- Lectura pública (cualquiera puede leer objetos del bucket público)
CREATE POLICY "public_read_campito_media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campito-media');

-- INSERT sólo para autenticados
CREATE POLICY "authenticated_insert_campito_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campito-media');

-- UPDATE sólo para autenticados
CREATE POLICY "authenticated_update_campito_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campito-media')
WITH CHECK (bucket_id = 'campito-media');

-- DELETE sólo para autenticados
CREATE POLICY "authenticated_delete_campito_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campito-media');

-- ============================================================
-- Tablas de negocio — Row Level Security
-- Roles: admin / colaborador (ambos son 'authenticated')
-- Público (anon): lectura de contenido publicado
-- Colaborador (authenticated): gestión de contenido
-- Admin (authenticated + role='admin' en public.users): acceso total
-- ============================================================

-- Función helper: ¿el usuario autenticado es admin?
-- SECURITY DEFINER para leer public.users evitando recursión por su propio RLS.
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

-- ------------------------------------------------------------
-- CLUB (identidad institucional) — lectura pública, escritura admin
-- ------------------------------------------------------------
ALTER TABLE public.club ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_select_public" ON public.club FOR SELECT TO public USING (true);
CREATE POLICY "club_write_admin"   ON public.club FOR ALL    TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- PLAYERS — lectura pública, escritura autenticados
-- ------------------------------------------------------------
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_public" ON public.players FOR SELECT TO public USING (true);
CREATE POLICY "players_write_auth"    ON public.players FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- STAFF — lectura pública, escritura autenticados
-- ------------------------------------------------------------
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_public" ON public.staff FOR SELECT TO public USING (true);
CREATE POLICY "staff_write_auth"    ON public.staff FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- MATCHES — lectura pública, escritura autenticados
-- ------------------------------------------------------------
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_public" ON public.matches FOR SELECT TO public USING (true);
CREATE POLICY "matches_write_auth"    ON public.matches FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- GALLERIES — lectura pública, escritura autenticados
-- ------------------------------------------------------------
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "galleries_select_public" ON public.galleries FOR SELECT TO public USING (true);
CREATE POLICY "galleries_write_auth"    ON public.galleries FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- MEDIA — lectura pública, escritura autenticados
-- ------------------------------------------------------------
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select_public" ON public.media FOR SELECT TO public USING (true);
CREATE POLICY "media_write_auth"    ON public.media FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- NEWS — público sólo noticias publicadas; autenticados gestión total
-- ------------------------------------------------------------
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_select_public" ON public.news FOR SELECT TO anon USING (published = true);
CREATE POLICY "news_select_auth"   ON public.news FOR SELECT TO authenticated USING (true);
CREATE POLICY "news_write_auth"    ON public.news FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- USERS — sólo admin (sin lectura pública)
-- ------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
