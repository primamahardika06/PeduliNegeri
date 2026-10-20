CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Infrastruktur', 'Fasilitas Umum', 'Lingkungan', 'Lainnya')),
    description VARCHAR(3000) NOT NULL,
    location VARCHAR(250) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Sedang Diproses'
        CHECK (status IN ('Sedang Diproses', 'Diverifikasi', 'Selesai')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_created_at
    ON public.reports (user_id, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.reports TO authenticated;
REVOKE ALL ON TABLE public.reports FROM anon;

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit own reports" ON public.reports;
CREATE POLICY "Users can submit own reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'Sedang Diproses');