import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900'
  }`

function Logo() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 text-base shadow-md shadow-brand-500/30">
      🎤
    </span>
  )
}

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar kiểu ClickUp — chỉ hiện từ md trở lên */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-4">
          <Logo />
          <span className="text-sm font-bold text-slate-900">
            Kho bài hát <span className="text-gradient">Karaoke</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/" end className={navLinkClass}>
            <span aria-hidden="true">🎵</span> Bài hát
          </NavLink>
          <NavLink to="/the-loai" className={navLinkClass}>
            <span aria-hidden="true">🏷️</span> Ca sĩ, Thể loại &amp; Tâm trạng
          </NavLink>
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <span aria-hidden="true">↩</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={mobileNavLinkClass}>
                Bài hát
              </NavLink>
              <NavLink to="/the-loai" className={mobileNavLinkClass}>
                Thể loại
              </NavLink>
            </nav>
          </div>
          <button
            onClick={() => void signOut()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
          >
            Đăng xuất
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
