import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
  }`

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 pb-16">
      <header className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎤</span>
            <span className="hidden text-sm font-bold sm:block">Kho bài hát Karaoke</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Bài hát
            </NavLink>
            <NavLink to="/the-loai" className={navLinkClass}>
              Thể loại &amp; Tâm trạng
            </NavLink>
          </nav>
          <button
            onClick={() => void signOut()}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-rose-500/40 hover:text-rose-300"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
