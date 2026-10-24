-- Migration 003: Tambahkan kolom image_url pada tabel reports untuk foto bukti laporan
ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.reports.image_url IS 'URL atau data URL base64 foto bukti kondisi yang dilaporkan';

