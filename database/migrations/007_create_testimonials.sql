-- Migrasi 007: Membuat tabel testimonials untuk ulasan laporan yang selesai
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content VARCHAR(1000) NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_report_id ON public.testimonials (report_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials (user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials (created_at DESC);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.testimonials TO authenticated;
GRANT SELECT ON TABLE public.testimonials TO anon;

DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials"
    ON public.testimonials FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can submit testimonials for own reports" ON public.testimonials;
CREATE POLICY "Users can submit testimonials for own reports"
    ON public.testimonials FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

