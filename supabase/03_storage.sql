-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.3: Storage
-- Bucket: campito-media
-- Sin RLS | Sin Policies | Sin Auth
-- ============================================================

-- Crear bucket principal
INSERT INTO storage.buckets (id, name, public)
VALUES ('campito-media', 'campito-media', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Carpetas del bucket
-- Las carpetas en Supabase Storage se crean implícitamente
-- al subir el primer archivo. Se documentan aquí como referencia:
--
--   campito-media/club/
--   campito-media/news/
--   campito-media/players/
--   campito-media/staff/
--   campito-media/galleries/
--   campito-media/videos/
-- ============================================================
