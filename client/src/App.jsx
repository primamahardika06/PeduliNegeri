import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPages from "./pages/public_pages/LoginPages";
import ReportPages from "./pages/public_pages/ReportPages";
import FormLaporan from "./pages/public_pages/FormLaporan";
import RiwayatLaporan from "./pages/public_pages/RiwayatLaporan";
import ResetPassword from "./pages/public_pages/ResetPassword";
import LandingPage from "./pages/public_pages/LandingPage";
import PetaLaporan from "./pages/public_pages/PetaLaporan";
import AdminDashboard from "./components/admin/adminDashboard";
import { authService } from "./services/authService";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    authService.getCurrentUser(),
  );

  useEffect(() => {
    // Fungsi untuk cek validitas sesi
    const checkAuthSession = () => {
      if (currentUser && authService.isSessionExpired()) {
        setCurrentUser(null);
        authService.handleSessionExpired();
      }
    };

    // Dengarkan event internal jika token/sesi kadaluarsa
    const onSessionExpired = () => {
      setCurrentUser(null);
    };

    window.addEventListener("pn_session_expired", onSessionExpired);
    window.addEventListener("focus", checkAuthSession);

    // Cek berkala setiap 30 detik
    const timer = setInterval(checkAuthSession, 30000);

    return () => {
      window.removeEventListener("pn_session_expired", onSessionExpired);
      window.removeEventListener("focus", checkAuthSession);
      clearInterval(timer);
    };
  }, [currentUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login & Registrasi */}
        <Route
          path="/login"
          element={
            currentUser ? (
              currentUser.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/reportPage" replace />
              )
            ) : (
              <LoginPages onLoginSuccess={(user) => setCurrentUser(user)} />
            )
          }
        />

        {/* Halaman Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Halaman Beranda Pengguna Biasa (User) */}
        <Route
          path="/reportPage"
          element={
            currentUser ? (
              <ReportPages
                currentUser={currentUser}
                onLogout={() => setCurrentUser(null)}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Alias /home diarahkan ke /reportPage */}
        <Route path="/home" element={<Navigate to="/reportPage" replace />} />

        <Route
          path="/laporan/baru"
          element={
            currentUser && currentUser.role !== "admin" ? (
              <FormLaporan currentUser={currentUser} />
            ) : currentUser ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/laporan"
          element={
            currentUser && currentUser.role !== "admin" ? (
              <RiwayatLaporan currentUser={currentUser} />
            ) : currentUser ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Halaman Dashboard Khusus Administrator */}
        <Route
          path="/admin"
          element={
            currentUser ? (
              currentUser.role === "admin" ? (
                <AdminDashboard
                  currentUser={currentUser}
                  onLogout={() => setCurrentUser(null)}
                />
              ) : (
                // Jika user biasa mencoba masuk ke admin, arahkan ke beranda user
                <Navigate to="/reportPage" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Halaman Peta Interaktif (publik) */}
        <Route path="/peta" element={<PetaLaporan />} />

        {/* Halaman pertama */}
        <Route path="/" element={<LandingPage />} />

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
