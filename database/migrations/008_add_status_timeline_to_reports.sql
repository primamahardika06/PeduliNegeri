-- Migrasi 008: Menambahkan status_timeline (JSONB) pada tabel reports untuk mencatat tanggal dan waktu setiap perubahan status
ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS status_timeline JSONB DEFAULT '[]'::jsonb;

-- Inisialisasi status_timeline untuk laporan yang sudah ada menggunakan created_at dan updated_at
UPDATE public.reports
SET status_timeline = jsonb_build_array(
    jsonb_build_object('status', 'Laporan Diterima', 'timestamp', created_at),
    CASE 
        WHEN status <> 'Laporan Diterima' THEN jsonb_build_object('status', status, 'timestamp', updated_at)
        ELSE NULL
    END
) - 'null'
WHERE status_timeline IS NULL OR status_timeline = '[]'::jsonb;
