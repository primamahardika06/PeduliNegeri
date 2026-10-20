ALTER TABLE public.reports
    DROP CONSTRAINT IF EXISTS reports_status_check;

UPDATE public.reports
SET status = CASE status
    WHEN 'Sedang Diproses' THEN 'Laporan Diproses'
    WHEN 'Diverifikasi' THEN 'Laporan Diterima'
    WHEN 'Selesai' THEN 'Laporan Selesai'
    ELSE status
END;

ALTER TABLE public.reports
    ALTER COLUMN status SET DEFAULT 'Laporan Diterima',
    ADD CONSTRAINT reports_status_check CHECK (
        status IN (
            'Laporan Diterima',
            'Laporan Diproses',
            'Petugas Dikirim ke Lokasi',
            'Laporan Selesai'
        )
    ),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

GRANT UPDATE ON TABLE public.reports TO authenticated;

DROP POLICY IF EXISTS "Users can submit own reports" ON public.reports;
CREATE POLICY "Users can submit own reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'Laporan Diterima');

DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update report statuses" ON public.reports;
CREATE POLICY "Admins can update report statuses"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();