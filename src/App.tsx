import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import ArtistsPage from './pages/ArtistsPage'
import GenresPage from './pages/GenresPage'
import LoginPage from './pages/LoginPage'
import MoodsPage from './pages/MoodsPage'
import SongsPage from './pages/SongsPage'

/** Chặn mọi trang khi chưa đăng nhập: redirect về /dang-nhap */
function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-slate-500 dark:text-slate-400">
        Đang kiểm tra đăng nhập…
      </p>
    )
  }
  if (!session) return <Navigate to="/dang-nhap" replace />
  return <Outlet />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<SongsPage />} />
                <Route path="/ca-si" element={<ArtistsPage />} />
                <Route path="/the-loai" element={<GenresPage />} />
                <Route path="/tam-trang" element={<MoodsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
