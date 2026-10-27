-- Migrasi 005: Menambahkan koordinat peta (latitude, longitude) dan provinsi pada tabel reports
ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS province TEXT DEFAULT '';

-- Index untuk percepat query koordinat
CREATE INDEX IF NOT EXISTS idx_reports_coords ON public.reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);

-- Izinkan pembacaan publik untuk titik sebaran laporan di peta
GRANT SELECT ON TABLE public.reports TO anon, authenticated;
DROP POLICY IF EXISTS "Public reports viewable by everyone" ON public.reports;
CREATE POLICY "Public reports viewable by everyone"
    ON public.reports FOR SELECT
    TO anon, authenticated
    USING (true);

