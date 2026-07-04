-- ============================================================
-- CLUB ATLÉTICO CAMPITO — Fase 2.1: Índices
-- ============================================================

-- players
CREATE INDEX IF NOT EXISTS idx_players_active       ON players (active);

-- staff
CREATE INDEX IF NOT EXISTS idx_staff_category       ON staff (category);
CREATE INDEX IF NOT EXISTS idx_staff_active         ON staff (active);

-- matches
CREATE INDEX IF NOT EXISTS idx_matches_status       ON matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_date         ON matches (date);

-- galleries
CREATE INDEX IF NOT EXISTS idx_galleries_category   ON galleries (category);

-- news
CREATE INDEX IF NOT EXISTS idx_news_published       ON news (published);
CREATE INDEX IF NOT EXISTS idx_news_created_at      ON news (created_at);

-- media
CREATE INDEX IF NOT EXISTS idx_media_gallery_id     ON media (gallery_id);
