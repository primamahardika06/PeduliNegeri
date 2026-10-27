-- Migrasi 006: Menambahkan pengaturan privasi leaderboard pada tabel profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS leaderboard_display_type TEXT DEFAULT 'name'
        CHECK (leaderboard_display_type IN ('name', 'username')),
    ADD COLUMN IF NOT EXISTS leaderboard_username TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON public.profiles (leaderboard_visible);

-- Izinkan publik membaca profil yang bersedia tampil di leaderboard
DROP POLICY IF EXISTS "Public can view leaderboard profiles" ON public.profiles;
CREATE POLICY "Public can view leaderboard profiles"
    ON public.profiles FOR SELECT
    TO anon, authenticated
    USING (leaderboard_visible = true OR auth.uid() = id OR public.is_admin());

