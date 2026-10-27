-- 1. Buat tabel profiles jika belum ada
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    avatar_url TEXT DEFAULT '',
    leaderboard_visible BOOLEAN DEFAULT false,
    leaderboard_display_type TEXT DEFAULT 'name' CHECK (leaderboard_display_type IN ('name', 'username')),
    leaderboard_username TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Index untuk pencarian cepat profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON public.profiles(leaderboard_visible);

-- 3. Berikan izin akses tabel ke role standar Supabase
GRANT ALL ON TABLE public.profiles TO postgres, service_role, authenticated, anon;

-- 4. Fungsi & Trigger untuk otomatis memperbarui updated_at
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

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Fungsi & Trigger pendaftaran: Otomatis mengisi profiles saat auth.users terdaftar
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Helper Function: Cek apakah user saat ini adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 7. Setup Row Level Security (RLS) Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for auth trigger and service" ON public.profiles;
CREATE POLICY "Enable insert for auth trigger and service"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public can view leaderboard profiles" ON public.profiles;
CREATE POLICY "Public can view leaderboard profiles"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (leaderboard_visible = true OR auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- 8. Tabel Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Infrastruktur', 'Fasilitas Umum', 'Lingkungan', 'Lainnya')),
    description VARCHAR(3000) NOT NULL,
    location VARCHAR(250) NOT NULL,
    image_url TEXT DEFAULT NULL,
    latitude DOUBLE PRECISION DEFAULT NULL,
    longitude DOUBLE PRECISION DEFAULT NULL,
    province TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Laporan Diterima'
        CHECK (status IN (
            'Laporan Diterima',
            'Laporan Diproses',
            'Petugas Dikirim ke Lokasi',
            'Laporan Selesai'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_created_at ON public.reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON public.reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON TABLE public.reports TO authenticated;
GRANT SELECT ON TABLE public.reports TO anon;

DROP POLICY IF EXISTS "Users can submit own reports" ON public.reports;
CREATE POLICY "Users can submit own reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND status = 'Laporan Diterima');

DROP POLICY IF EXISTS "Public reports viewable by everyone" ON public.reports;
CREATE POLICY "Public reports viewable by everyone"
    ON public.reports FOR SELECT
    TO anon, authenticated
    USING (true);

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

-- 9. Tabel Testimonials
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
