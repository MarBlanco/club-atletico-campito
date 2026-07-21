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
