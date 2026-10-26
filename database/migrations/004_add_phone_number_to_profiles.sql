-- Migration 004: Menambahkan kolom phone_number ke public.profiles
-- Supaya nomor HP user tersimpan dan user bisa masuk (login) menggunakan Email atau Nomor HP

-- 1. Tambahkan kolom phone_number jika belum ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '';

-- 2. Tambahkan index untuk pencarian cepat saat login menggunakan nomor HP
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);

-- 3. Perbarui fungsi trigger handle_new_user agar menyertakan phone_number dari metadata auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        updated_at = now();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$;

