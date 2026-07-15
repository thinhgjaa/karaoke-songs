import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SongsPage from './pages/SongsPage'
import TagsPage from './pages/TagsPage'

/** Chặn mọi trang khi chưa đăng nhập: redirect về /dang-nhap */
function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) {
    return <p className="py-24 text-center text-sm text-slate-400">Đang kiểm tra đăng nhập…</p>
  }
  if (!session) return <Navigate to="/dang-nhap" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<SongsPage />} />
              <Route path="/the-loai" element={<TagsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
