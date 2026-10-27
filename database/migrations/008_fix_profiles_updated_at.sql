-- Migrasi 008: Menambahkan kolom updated_at pada tabel profiles dan mengamankan trigger handle_updated_at
-- Jalankan skrip ini di SQL Editor Supabase untuk mengatasi error: record "new" has no field "updated_at"

-- 1. Tambahkan kolom updated_at pada tabel profiles jika belum ada
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Pastikan kolom updated_at juga ada di public.reports
ALTER TABLE public.reports 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Amankan fungsi trigger handle_updated_at agar tidak error jika suatu saat tabel tidak memiliki kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        NEW.updated_at = now();
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Pasang ulang trigger pada tabel profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
