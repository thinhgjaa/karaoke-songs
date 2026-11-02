import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { TagsProvider } from './context/TagsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'

const ArtistsPage = lazy(() => import('./pages/ArtistsPage'))
const GenresPage = lazy(() => import('./pages/GenresPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MoodsPage = lazy(() => import('./pages/MoodsPage'))
const SongsPage = lazy(() => import('./pages/SongsPage'))

function PageLoader() {
  return (
    <p className="py-24 text-center text-sm text-slate-500 dark:text-slate-400">
      Đang tải…
    </p>
  )
}

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
        <ToastProvider>
          <ConfirmProvider>
            <HashRouter>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/dang-nhap" element={<LoginPage />} />
                          <Route element={<RequireAuth />}>
                            <Route element={<TagsProvider />}>
                              <Route element={<Layout />}>
                                <Route path="/" element={<SongsPage />} />
                                <Route path="/ca-si" element={<ArtistsPage />} />
                                <Route path="/the-loai" element={<GenresPage />} />
                                <Route path="/tam-trang" element={<MoodsPage />} />
                              </Route>
                            </Route>
                          </Route>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </HashRouter>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
        )
}
