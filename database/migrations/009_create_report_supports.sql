-- Migrasi 009: Membuat tabel report_supports dan menambahkan kolom supports_count pada reports
ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS supports_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.report_supports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_report_support UNIQUE (report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_report_supports_report_id ON public.report_supports (report_id);
CREATE INDEX IF NOT EXISTS idx_report_supports_user_id ON public.report_supports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_supports_count ON public.reports (supports_count DESC);

-- Setup RLS
ALTER TABLE public.report_supports ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.report_supports TO authenticated, anon, service_role, postgres;

DROP POLICY IF EXISTS "Public can view report supports" ON public.report_supports;
CREATE POLICY "Public can view report supports"
    ON public.report_supports FOR SELECT
    TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle support" ON public.report_supports;
CREATE POLICY "Authenticated users can toggle support"
    ON public.report_supports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own support" ON public.report_supports;
CREATE POLICY "Users can delete own support"
    ON public.report_supports FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

